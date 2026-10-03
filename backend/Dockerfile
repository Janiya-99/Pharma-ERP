# Build Stage
FROM golang:alpine AS builder

WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache git

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server_bin cmd/server/main.go

# Final Stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS and tzdata for timezone support
RUN apk --no-cache add ca-certificates tzdata

# Copy the binary from the builder stage
COPY --from=builder /app/server_bin .

# Add a default .env file if it doesn't exist, though typically you pass env vars in docker-compose
COPY .env.example .env

# Expose port
EXPOSE 8080

# Run the application
CMD ["./server_bin"]
