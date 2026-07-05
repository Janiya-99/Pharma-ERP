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

	dbs := []string{"erp_db", "erp_omacx", "erp_tbc"}
	for _, dbName := range dbs {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, dbName,
		)
		db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			fmt.Printf("Database %s: failed to connect\n", dbName)
			continue
		}

		var count int64
		db.Table("designations").Count(&count)
		fmt.Printf("Database %s: designations count = %d\n", dbName, count)

		var designations []models.Designation
		if count > 0 {
			db.Find(&designations)
			for _, d := range designations {
				fmt.Printf("  ID: %d, Name: %s, CompanyID: %d\n", d.ID, d.DesignationName, d.CompanyID)
			}
		}
	}
}
