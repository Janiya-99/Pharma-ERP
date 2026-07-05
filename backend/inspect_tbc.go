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

	fmt.Println("Connected to erp_tbc")

	var depts []models.Department
	db.Find(&depts)
	fmt.Println("\nDepartments:")
	for _, d := range depts {
		fmt.Printf("  ID: %d, Name: %s, CompanyID: %d\n", d.ID, d.DepartmentName, d.CompanyID)
	}

	var roles []models.Role
	db.Find(&roles)
	fmt.Println("\nRoles:")
	for _, r := range roles {
		fmt.Printf("  ID: %d, Name: %s, Code: %s\n", r.ID, r.RoleName, r.RoleCode)
	}

	var desigDepts []models.DesignationDepartment
	db.Find(&desigDepts)
	fmt.Println("\nDesignation Departments Mapping:")
	for _, dd := range desigDepts {
		fmt.Printf("  ID: %d, DesigID: %d, DeptID: %d, CompanyID: %d\n", dd.ID, dd.DesignationID, dd.DepartmentID, dd.CompanyID)
	}

	var desigRoles []models.DesignationDefaultRole
	db.Find(&desigRoles)
	fmt.Println("\nDesignation Default Roles Mapping:")
	for _, dr := range desigRoles {
		fmt.Printf("  ID: %d, DesigID: %d, RoleID: %d, CompanyID: %d\n", dr.ID, dr.DesignationID, dr.RoleID, dr.CompanyID)
	}
}
