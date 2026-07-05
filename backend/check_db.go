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

	fmt.Println("Connected to company DB:", cfg.Database.Name)

	var designations []models.Designation
	if err := db.Find(&designations).Error; err != nil {
		log.Fatalf("failed to find designations: %v", err)
	}

	fmt.Println("\nDesignations:")
	for _, d := range designations {
		fmt.Printf("ID: %d, Name: %s, CompanyID: %d\n", d.ID, d.DesignationName, d.CompanyID)
	}

	var depts []models.Department
	if err := db.Find(&depts).Error; err != nil {
		log.Fatalf("failed to find departments: %v", err)
	}

	fmt.Println("\nDepartments:")
	for _, dept := range depts {
		fmt.Printf("ID: %d, Name: %s, CompanyID: %d\n", dept.ID, dept.DepartmentName, dept.CompanyID)
	}

	var roles []models.Role
	if err := db.Find(&roles).Error; err != nil {
		log.Fatalf("failed to find roles: %v", err)
	}

	fmt.Println("\nRoles:")
	for _, r := range roles {
		fmt.Printf("ID: %d, Name: %s, Code: %s\n", r.ID, r.RoleName, r.RoleCode)
	}
}
