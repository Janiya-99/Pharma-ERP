//go:build ignore

package main

import (
	"fmt"
	"log"

	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := gorm.Open(mysql.Open(cfg.Database.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}

	fmt.Println("AutoMigrating UserOrganizationAssignment on erp_omacx...")
	err = db.AutoMigrate(&models.UserOrganizationAssignment{})
	if err != nil {
		fmt.Println("FAILED:", err)
	} else {
		fmt.Println("SUCCESS")
	}
}
