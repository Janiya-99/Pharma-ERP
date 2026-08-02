.PHONY: build run dev test lint platform-migrate-up platform-migrate-down company-migrate-up company-migrate-down seed clean

# Variables
APP_NAME=pharma-erp
BUILD_DIR=./bin
MAIN_FILE=./cmd/server/main.go

# Migration directories
PLATFORM_MIGRATE_DIR=./database/platform_migrations
COMPANY_MIGRATE_DIR=./database/company_migrations

# Include .env if it exists
-include .env
export

# Platform DB DSN (for goose)
PLATFORM_GOOSE_DBSTRING ?= $(PLATFORM_DB_USER):$(PLATFORM_DB_PASSWORD)@tcp($(PLATFORM_DB_HOST):$(PLATFORM_DB_PORT))/$(PLATFORM_DB_NAME)?parseTime=true

# Company DB DSN (for goose — legacy/default company)
GOOSE_DBSTRING ?= $(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)?parseTime=true

# ==================== Build ====================

build:
	@echo "Building $(APP_NAME)..."
	@go build -o "$(BUILD_DIR)/$(APP_NAME)" $(MAIN_FILE)
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

# ==================== Platform Migrations ====================

platform-migrate-up:
	@echo "Running platform database migrations..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(PLATFORM_GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(PLATFORM_MIGRATE_DIR) up
	@echo "Platform migrations complete."

platform-migrate-down:
	@echo "Rolling back last platform migration..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(PLATFORM_GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(PLATFORM_MIGRATE_DIR) down

platform-migrate-down-all:
	@echo "Rolling back all platform migrations..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(PLATFORM_GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(PLATFORM_MIGRATE_DIR) down-to 0

platform-migrate-status:
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(PLATFORM_GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(PLATFORM_MIGRATE_DIR) status

platform-migrate-create:
	@read -p "Enter migration name: " name; \
	GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(PLATFORM_GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(PLATFORM_MIGRATE_DIR) create $$name sql

# ==================== Company Migrations ====================

company-migrate-up:
	@echo "Running company database migrations..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(COMPANY_MIGRATE_DIR) up
	@echo "Company migrations complete."

company-migrate-down:
	@echo "Rolling back last company migration..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(COMPANY_MIGRATE_DIR) down

company-migrate-down-all:
	@echo "Rolling back all company migrations..."
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(COMPANY_MIGRATE_DIR) down-to 0

company-migrate-status:
	@GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(COMPANY_MIGRATE_DIR) status

company-migrate-create:
	@read -p "Enter migration name: " name; \
	GOOSE_DRIVER=mysql GOOSE_DBSTRING="$(GOOSE_DBSTRING)" go run github.com/pressly/goose/v3/cmd/goose@latest -dir $(COMPANY_MIGRATE_DIR) create $$name sql

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
