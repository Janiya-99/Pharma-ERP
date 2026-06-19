.PHONY: build run dev test lint migrate-up migrate-down migrate-create clean

# Variables
APP_NAME=erp-phrma
BUILD_DIR=./bin
MAIN_FILE=./cmd/server/main.go
MIGRATE_DIR=./database/migrations
DB_DSN?=mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)

# Include .env if it exists
-include .env
export

# ==================== Build ====================

build:
	@echo "Building $(APP_NAME)..."
	@go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_FILE)
	@echo "Build complete: $(BUILD_DIR)/$(APP_NAME)"

run: build
	@echo "Starting $(APP_NAME)..."
	@$(BUILD_DIR)/$(APP_NAME)

dev:
	@echo "Starting $(APP_NAME) in development mode..."
	@go run $(MAIN_FILE)

# ==================== Testing ====================

test:
	@echo "Running tests..."
	@go test ./... -v -cover -count=1

test-coverage:
	@go test ./... -coverprofile=coverage.out
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# ==================== Linting ====================

lint:
	@echo "Running linter..."
	@go vet ./...
	@echo "Lint passed."

# ==================== Migrations ====================

GOOSE_DBSTRING ?= $(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)?parseTime=true

migrate-up:
	@echo "Running migrations with goose..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(MIGRATE_DIR) up
	@echo "Migrations complete."

migrate-down:
	@echo "Rolling back last migration with goose..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(MIGRATE_DIR) down

migrate-down-all:
	@echo "Rolling back all migrations with goose..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(MIGRATE_DIR) down-to 0

migrate-create:
	@read -p "Enter migration name: " name; \
	GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(MIGRATE_DIR) create $$name sql

migrate-status:
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(MIGRATE_DIR) status

seed:
	@echo "Running database seeders..."
	@go run ./cmd/seeder/main.go

# ==================== Cleanup ====================

clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html
	@echo "Clean complete."

# ==================== Security Audit ====================

security-check:
	@echo "Checking for raw SQL injection vectors..."
	@grep -rn 'fmt.Sprintf.*SELECT\|fmt.Sprintf.*INSERT\|fmt.Sprintf.*UPDATE\|fmt.Sprintf.*DELETE\|\.Raw(' internal/ || echo "✅ No raw SQL found."
	@echo ""
	@echo "Checking for hardcoded secrets..."
	@grep -rn 'password.*=.*"\|secret.*=.*"' internal/ --include='*.go' | grep -v 'Getenv\|config\.\|Hash\|Check\|binding\|json\|gorm\|form\|validate\|Password string' || echo "✅ No hardcoded secrets found."
