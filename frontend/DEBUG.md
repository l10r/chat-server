# Debug Logging

This application uses the `debug` package for logging instead of `console.log` to prevent console spam for end users.

## Enabling Debug Logs

### In Development
Debug logs are automatically enabled in development mode (`import.meta.env.DEV`).

### In Production
Debug logs are disabled by default in production. To enable them, you can:

1. **In Browser Console:**
   ```javascript
   localStorage.debug = 'chat:*'
   // Then refresh the page
   ```

2. **For Specific Modules:**
   ```javascript
   localStorage.debug = 'chat:audio-player,chat:voice-memo'
   // Then refresh the page
   ```

3. **Available Debug Namespaces:**
   - `chat:audio-player` - Audio player functionality
   - `chat:voice-memo` - Voice memo recording and playback
   - `chat:notifications` - Notification sounds and throttling
   - `chat:message-input` - Message input and emoji picker
   - `chat:websocket` - WebSocket connection and messages
   - `chat:*` - All chat-related debug logs

## Disabling Debug Logs

To disable debug logs:
```javascript
localStorage.removeItem('debug')
// Then refresh the page
```

## Benefits

- **Clean Console**: No debug spam for regular users
- **Selective Logging**: Enable only the modules you need to debug
- **Performance**: Debug logs are compiled out in production builds
- **Flexibility**: Easy to enable/disable without code changes
