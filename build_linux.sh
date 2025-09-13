cd frontend;
npm run build;
cd ../;
GOOS=linux GOARCH=amd64 go build -o ./chatserver server.go