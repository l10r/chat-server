package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/l10r/embedspa"
)

//go:embed frontend/dist
var reactAppEmbed embed.FS

const (
	MsgTypeLogin    = "login"
	MsgTypeMessage  = "message"
	MsgTypeUserList = "userlist"
	MsgTypeTyping   = "typing"
	MsgTypeNewMsg   = "new-msg"
)

type Message struct {
	ID   string      `json:"id"`
	From string      `json:"f"`
	Time int64       `json:"t"`
	Data interface{} `json:"m"`
}

type Client struct {
	conn    *websocket.Conn
	send    chan []byte
	nick    string
	channel string
	hub     *Hub
}

type Hub struct {
	clients    map[*Client]bool
	channels   map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mutex      sync.RWMutex
	msgID      int
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		channels:   make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			if h.channels[client.channel] == nil {
				h.channels[client.channel] = make(map[*Client]bool)
			}
			h.channels[client.channel][client] = true
			h.mutex.Unlock()

			log.Printf("User %s joined channel %s", client.nick, client.channel)
			h.sendUserList(client.channel)

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				log.Printf("Unregistering user %s from channel %s", client.nick, client.channel)
				delete(h.clients, client)
				if h.channels[client.channel] != nil {
					delete(h.channels[client.channel], client)
				}
				close(client.send)
				log.Printf("User %s left channel %s", client.nick, client.channel)
				// Send user list update in a goroutine to prevent blocking
				go h.sendUserList(client.channel)
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
					if h.channels[client.channel] != nil {
						delete(h.channels[client.channel], client)
					}
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) sendUserList(channel string) {
	if channel == "" {
		return
	}

	h.mutex.RLock()
	users := make([]string, 0)
	if h.channels[channel] != nil {
		for client := range h.channels[channel] {
			if client.nick != "" {
				users = append(users, client.nick)
			}
		}
	}
	h.mutex.RUnlock()

	userListMsg := map[string]interface{}{
		"type":  MsgTypeUserList,
		"users": users,
	}

	data, err := json.Marshal(userListMsg)
	if err != nil {
		log.Printf("Error marshaling user list: %v", err)
		return
	}

	log.Printf("Sending user list to channel %s: %s", channel, string(data))

	h.mutex.RLock()
	if h.channels[channel] != nil {
		for client := range h.channels[channel] {
			select {
			case client.send <- data:
				log.Printf("Sent user list to %s", client.nick)
			default:
				log.Printf("Failed to send user list to %s, removing client", client.nick)
				// Remove the client if we can't send to it
				go func(c *Client) {
					h.unregister <- c
				}(client)
			}
		}
	}
	h.mutex.RUnlock()
}

func (h *Hub) sendToChannel(channel string, message []byte) {
	h.mutex.RLock()
	if h.channels[channel] != nil {
		for client := range h.channels[channel] {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(h.clients, client)
				delete(h.channels[channel], client)
			}
		}
	}
	h.mutex.RUnlock()
}

func (c *Client) readPump() {
	defer func() {
		log.Printf("Client readPump ending for user %s", c.nick)
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(0) // No limit
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	log.Printf("Starting readPump for client")

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			} else {
				log.Printf("WebSocket closed: %v", err)
			}
			break
		}

		log.Printf("Received: %s", string(messageBytes))

		var msg map[string]interface{}
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("Error parsing message: %v", err)
			continue
		}

		c.handleMessage(msg)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		log.Printf("Client writePump ending for user %s", c.nick)
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(30 * time.Second)) // Longer timeout for large files
			if !ok {
				log.Printf("Client send channel closed for user %s", c.nick)
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Error writing message to %s: %v", c.nick, err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping to %s: %v", c.nick, err)
				return
			}
		}
	}
}

func (c *Client) handleMessage(msg map[string]interface{}) {
	msgType, ok := msg["type"].(string)
	if !ok {
		return
	}

	switch msgType {
	case MsgTypeLogin:
		if nick, ok := msg["nick"].(string); ok {
			c.nick = nick
		}
		if channel, ok := msg["channel"].(string); ok {
			c.channel = channel
		}

		if c.nick != "" && c.channel != "" {
			log.Printf("User %s logging into channel %s", c.nick, c.channel)
			c.hub.register <- c
		}

	case MsgTypeMessage:
		if c.nick == "" || c.channel == "" {
			log.Printf("Cannot send message - not logged in (nick: %s, channel: %s)", c.nick, c.channel)
			return
		}

		log.Printf("Processing message from %s: %+v", c.nick, msg["data"])

		c.hub.mutex.Lock()
		c.hub.msgID++
		messageID := c.hub.msgID
		c.hub.mutex.Unlock()

		message := Message{
			ID:   fmt.Sprintf("msg_%d", messageID),
			From: c.nick,
			Time: time.Now().UnixMilli(),
			Data: msg["data"],
		}

		response := map[string]interface{}{
			"type":    MsgTypeNewMsg,
			"message": message,
		}

		data, err := json.Marshal(response)
		if err != nil {
			log.Printf("Error marshaling message response: %v", err)
			return
		}

		log.Printf("Broadcasting message from %s", c.nick)
		c.hub.sendToChannel(c.channel, data)

	case MsgTypeTyping:
		if c.nick == "" || c.channel == "" {
			return
		}

		typingMsg := map[string]interface{}{
			"type":   MsgTypeTyping,
			"user":   c.nick,
			"typing": msg["typing"],
		}

		data, _ := json.Marshal(typingMsg)
		c.hub.sendToChannel(c.channel, data)
	}
}

func serveWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Printf("WebSocket connection attempt from %s", r.RemoteAddr)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	log.Printf("WebSocket connection established")
	client := &Client{
		conn: conn,
		send: make(chan []byte, 1024), // Larger buffer for file uploads
		hub:  hub,
	}

	go client.writePump()
	go client.readPump()
}

func main() {
	hub := newHub()
	go hub.run()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	r.GET("/ws", func(c *gin.Context) {
		serveWS(hub, c.Writer, c.Request)
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	embedFS, _ := fs.Sub(reactAppEmbed, "frontend/dist")
	spaExample := embedspa.NewEmbedSPAHandler(embedFS).
		StripPrefixURL("").
		SetIndexPath("index.html")

	r.Use(spaExample.GIN)
	//	r.GET("/*any", spaExample.GIN)
	log.Println("Starting server on port 8090")
	r.Run(":8090")
}
