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

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/erp_tbc?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port,
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}

	var users []models.User
	db.Find(&users)
	fmt.Println("Users in erp_tbc:")
	for _, u := range users {
		fmt.Printf("ID: %d, Email: %s, UserType: %s\n", u.ID, u.Email, u.UserType)
	}
}
