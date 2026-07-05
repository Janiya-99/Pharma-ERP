//go:build ignore

package main

import (
	"fmt"
	"log"

	"github.com/pixandco/erp-phrma/internal/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := gorm.Open(mysql.Open(cfg.Database.DSNWithoutDB()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}

	var databases []string
	if err := db.Raw("SHOW DATABASES").Scan(&databases).Error; err != nil {
		log.Fatalf("failed to show databases: %v", err)
	}

	fmt.Println("Databases:")
	for _, d := range databases {
		fmt.Println("-", d)
	}
}
