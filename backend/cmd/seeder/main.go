package main

import (
	"log"

	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/database"
	"github.com/pixandco/erp-phrma/internal/seeder"
	"go.uber.org/zap"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Init Logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Connect to database
	db, err := database.NewMySQL(&cfg.Database, logger)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run seeders
	if err := seeder.Seed(db); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}
}
