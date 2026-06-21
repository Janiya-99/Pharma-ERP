package main

import (
	"fmt"
	"log"

	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/database"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewDevelopment()
	cfg, _ := config.Load()
	db, _ := database.NewMySQL(&cfg.Database, logger)

	var logs []models.LoginLog
	db.Find(&logs)
	for _, l := range logs {
		fmt.Printf("Login Status: %s, Email: %s\n", l.LoginStatus, l.Email)
	}
}
