require('dotenv').config()
const express = require('express')
const app = express()

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const path = require('path')
const html = path.join(__dirname, '/html');
const viteBuild = path.join(__dirname, '/frontend/dist');

// Serve Vite build in production, HTML in development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(viteBuild));
} else {
  app.use(express.static(html));
}

// Serve static assets from both locations
app.use('/static', express.static(path.join(__dirname, 'html/static')));
app.use('/static', express.static(path.join(__dirname, 'frontend/public/static')));

// Fallback for React Router - serve React app for all routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(viteBuild, 'index.html'));
  });
} else {
  // In development, serve React app for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(html, 'index.html'));
  });
}

const port = process.argv[2] || 8090;
const http = require("http").Server(app);

const maxHttpBufferSizeInMb = parseInt(process.env.MAX_HTTP_BUFFER_SIZE_MB || '1');
const io = require("socket.io")(http, {
  maxHttpBufferSize: maxHttpBufferSizeInMb * 1024 * 1024,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});
// default cache size to zero. override in environment
let cache_size = process.env.CACHE_SIZE ?? 0

http.listen(port, function(){
	console.log("Starting server on port %s", port);
});

// Channel management
const channels = {
  main: {
    users: [],
    messages: [],
    msg_id: 1
  }
};

// Helper function to get or create channel
function getChannel(channelId) {
  if (!channels[channelId]) {
    channels[channelId] = {
      users: [],
      messages: [],
      msg_id: 1
    };
  }
  return channels[channelId];
}
io.sockets.on("connection", function(socket){
	console.log("New connection!");

	var nick = null;
	var currentChannel = "main";

	socket.on("login", function(data){
		// Security checks
		data.nick = data.nick.trim();
		const channelId = data.channel || "main";

		// If is empty
		if(data.nick == ""){
			socket.emit("force-login", "Nick can't be empty.");
			nick = null;
			return;
		}

		// Get the channel
		const channel = getChannel(channelId);

		// If is already in this channel
		if(channel.users.indexOf(data.nick) != -1){
			socket.emit("force-login", "This nick is already in this channel.");
			nick = null;
			return;
		}

		// Save nick and channel
		nick = data.nick;
		currentChannel = channelId;
		channel.users.push(data.nick);

		console.log("User %s joined channel %s.", nick.replace(/(<([^>]+)>)/ig, ""), channelId);
		socket.join(channelId);

		// Tell everyone in this channel, that user joined
		io.to(channelId).emit("ue", {
			"nick": nick
		});

		// Tell this user who is already in this channel
		socket.emit("start", {
			"users": channel.users,
			"channel": channelId
		});

		// Send the message cache to the new user
		console.log(`going to send cache to ${nick} in channel ${channelId}`)
		socket.emit("previous-msg", {
			"msgs": channel.messages
		});
	});

	socket.on("send-msg", function(data){
		// If is logged in
		if(nick == null){
			socket.emit("force-login", "You need to be logged in to send message.");
			return;
		}

		const channel = getChannel(currentChannel);
		const msg = {
			"f": nick,
			"m": data.m, // This can be a string or an object for file attachments
			"t": Date.now(),
			"id": "msg_" + (channel.msg_id++)
		}

		channel.messages.push(msg);
		if(channel.messages.length > cache_size){
			channel.messages.shift(); // Remove the oldest message
		}

		// Send everyone in this channel the message
		io.to(currentChannel).emit("new-msg", msg);

		console.log("User %s sent message in channel %s.", nick.replace(/(<([^>]+)>)/ig, ""), currentChannel);
	});

	socket.on("typing", function(typing){
		// Only logged in users
		if(nick != null){
			socket.broadcast.to(currentChannel).emit("typing", {
				status: typing,
				nick: nick
			});

			console.log("%s %s typing in channel %s.", nick.replace(/(<([^>]+)>)/ig, ""), typing ? "is" : "is not", currentChannel);
		}
	});

	socket.on("disconnect", function(){
		console.log("Got disconnect!");

		if(nick != null){
			// Remove user from channel users
			const channel = getChannel(currentChannel);
			const userIndex = channel.users.indexOf(nick);
			if(userIndex !== -1) {
				channel.users.splice(userIndex, 1);
			}

			// Tell everyone in this channel user left
			io.to(currentChannel).emit("ul", {
				"nick": nick
			});

			console.log("User %s left channel %s.", nick.replace(/(<([^>]+)>)/ig, ""), currentChannel);
			socket.leave(currentChannel);
			nick = null;
		}
	});
});
