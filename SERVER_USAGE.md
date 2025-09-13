# Chat Server Usage

## Command Line Arguments

The Go chat server now supports the following command line arguments:

### `-port` (int)
- **Description**: Port to run the server on
- **Default**: 8090
- **Example**: `./chatserver -port 3000`

### `-secure` (boolean)
- **Description**: Enable HTTPS with auto-generated certificates if not found
- **Default**: false
- **Example**: `./chatserver -secure`

## Usage Examples

### Basic HTTP Server
```bash
# Run on default port 8090
./chatserver

# Run on custom port
./chatserver -port 3000
```

### HTTPS Server
```bash
# Run HTTPS with auto-generated certificates
./chatserver -secure

# Run HTTPS on custom port
./chatserver -port 8443 -secure
```

## Certificate Management

When using the `-secure` flag:

1. **Existing Certificates**: If `server.crt` and `server.key` exist in the current directory, they will be used
2. **Auto-Generation**: If certificates don't exist, self-signed certificates will be automatically generated
3. **Certificate Details**:
   - Valid for 1 year
   - Self-signed
   - Works with localhost (127.0.0.1 and ::1)
   - 2048-bit RSA key

## Generated Files

When using HTTPS mode, the following files may be created:
- `server.crt` - SSL certificate
- `server.key` - Private key

## Security Notes

- Self-signed certificates will show security warnings in browsers
- For production use, replace with proper certificates from a CA
- The generated certificates are for development/testing purposes only

## TLS Configuration

When using the `-secure` flag, the server automatically configures:

- **Insecure Skip Verify**: Enabled for self-signed certificates
- **HTTP Client**: Configured to accept self-signed certificates
- **WebSocket**: Automatically uses WSS (secure WebSocket) when HTTPS is enabled
- **Browser Compatibility**: Self-signed certificates will show security warnings that users need to accept

## Browser Security Warnings

When accessing the HTTPS server with self-signed certificates:

1. **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
2. **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
3. **Safari**: Click "Show Details" → "visit this website"

These warnings are normal for self-signed certificates and can be safely bypassed for development purposes.
