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
	defer logger.Sync()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Must be using erp_omacx
	if cfg.Database.Name != "erp_omacx" {
		log.Fatalf("Expected erp_omacx, got %s", cfg.Database.Name)
	}

	db, err := database.NewMySQL(&cfg.Database, logger)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	// 1. Company
	company := models.Company{
		CompanyCode: "OMACX",
		CompanyName: "OMACX Pharma",
		Status:      "active",
	}
	db.Where("company_code = ?", "OMACX").FirstOrCreate(&company)
	fmt.Printf("Inserted company: %d\n", company.ID)

	// 2. Branch
	branch := models.Branch{
		CompanyID:    company.ID,
		BranchCode:   "CMB",
		BranchName:   "Colombo Main Branch",
		BranchType:   "Main Branch",
		IsMainBranch: true,
		Status:       "active",
	}
	db.Where("branch_code = ?", "CMB").FirstOrCreate(&branch)
	fmt.Printf("Inserted branch: %d\n", branch.ID)

	// 3. Departments
	depts := []string{"Finance", "Inventory", "Sales", "Compliance", "Administration"}
	for _, d := range depts {
		dept := models.Department{
			CompanyID:      company.ID,
			DepartmentName: d,
			Status:         "active",
		}
		db.Where("department_name = ?", d).FirstOrCreate(&dept)
	}
	fmt.Println("Inserted departments")

	// 4. Designations
	desigs := []string{"System Administrator", "Finance Manager", "Warehouse Manager", "Stock Controller", "Compliance Officer"}
	for _, d := range desigs {
		desig := models.Designation{
			CompanyID:       company.ID,
			DesignationName: d,
			Status:          "active",
		}
		db.Where("designation_name = ?", d).FirstOrCreate(&desig)
	}
	fmt.Println("Inserted designations")
}
