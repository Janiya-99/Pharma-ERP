package seeders

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	financeModels "github.com/pixandco/erp-phrma/internal/finance/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedFinancialYear inserts a default financial year and its accounting periods.
func SeedFinancialYear(db *gorm.DB, logger *zap.Logger) error {
	var company models.Company
	if err := db.Where("company_code = ?", "OMACX").First(&company).Error; err != nil {
		logger.Warn("Company OMACX not found, skipping financial year seeder", zap.Error(err))
		return nil
	}

	companyID := company.ID

	// Define Financial Year
	fyStartDate := time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)
	fyEndDate := time.Date(2027, 3, 31, 23, 59, 59, 0, time.UTC)

	fy := financeModels.FinancialYear{
		CompanyID: companyID,
		YearName:  "2026/2027",
		StartDate: fyStartDate,
		EndDate:   fyEndDate,
		IsActive:  true,
		IsClosed:  false,
		Status:    "active",
	}

	if err := db.Where("company_id = ? AND year_name = ?", companyID, fy.YearName).FirstOrCreate(&fy).Error; err != nil {
		logger.Error("Failed to seed financial year", zap.Error(err))
		return err
	}

	// Define Accounting Periods
	periods := []struct {
		Name  string
		Start time.Time
		End   time.Time
	}{
		{"April 2026", time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 4, 30, 23, 59, 59, 0, time.UTC)},
		{"May 2026", time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 5, 31, 23, 59, 59, 0, time.UTC)},
		{"June 2026", time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 6, 30, 23, 59, 59, 0, time.UTC)},
		{"July 2026", time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 7, 31, 23, 59, 59, 0, time.UTC)},
		{"August 2026", time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 8, 31, 23, 59, 59, 0, time.UTC)},
		{"September 2026", time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 9, 30, 23, 59, 59, 0, time.UTC)},
		{"October 2026", time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 10, 31, 23, 59, 59, 0, time.UTC)},
		{"November 2026", time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 11, 30, 23, 59, 59, 0, time.UTC)},
		{"December 2026", time.Date(2026, 12, 1, 0, 0, 0, 0, time.UTC), time.Date(2026, 12, 31, 23, 59, 59, 0, time.UTC)},
		{"January 2027", time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC), time.Date(2027, 1, 31, 23, 59, 59, 0, time.UTC)},
		{"February 2027", time.Date(2027, 2, 1, 0, 0, 0, 0, time.UTC), time.Date(2027, 2, 28, 23, 59, 59, 0, time.UTC)},
		{"March 2027", time.Date(2027, 3, 1, 0, 0, 0, 0, time.UTC), time.Date(2027, 3, 31, 23, 59, 59, 0, time.UTC)},
	}

	for _, p := range periods {
		ap := financeModels.AccountingPeriod{
			CompanyID:       companyID,
			FinancialYearID: fy.ID,
			PeriodName:      p.Name,
			StartDate:       p.Start,
			EndDate:         p.End,
			IsClosed:        false,
			Status:          "active",
		}

		db.Where("company_id = ? AND financial_year_id = ? AND period_name = ?", companyID, fy.ID, p.Name).FirstOrCreate(&ap)
	}

	logger.Info("Financial year and accounting periods seeding completed")
	return nil
}
