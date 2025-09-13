#!/bin/bash

# Test script for the chat server with different configurations

echo "=== Chat Server Test Script ==="
echo

# Test 1: HTTP server on default port
echo "1. Testing HTTP server on default port 8090..."
./chatserver -port 8090 &
SERVER_PID=$!
sleep 3
echo "   Health check:"
curl -s http://localhost:8090/health
echo
echo "   Server running on: http://localhost:8090"
echo "   Press Ctrl+C to stop this server and continue to next test"
echo
wait $SERVER_PID

echo
echo "2. Testing HTTPS server with auto-generated certificates..."
./chatserver -port 8443 -secure &
SERVER_PID=$!
sleep 3
echo "   Health check (with -k flag for self-signed cert):"
curl -k -s https://localhost:8443/health
echo
echo "   Server running on: https://localhost:8443"
echo "   Note: Browser will show security warning for self-signed certificate"
echo "   Press Ctrl+C to stop this server and continue to next test"
echo
wait $SERVER_PID

echo
echo "3. Testing custom port..."
./chatserver -port 3000 &
SERVER_PID=$!
sleep 3
echo "   Health check:"
curl -s http://localhost:3000/health
echo
echo "   Server running on: http://localhost:3000"
echo "   Press Ctrl+C to stop this server"
echo
wait $SERVER_PID

echo
echo "=== All tests completed ==="
