package repositories

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"gorm.io/gorm"
)

type FinanceReportRepository struct {
	db *gorm.DB
}

func NewFinanceReportRepository(db *gorm.DB) *FinanceReportRepository {
	return &FinanceReportRepository{db: db}
}

type TrialBalanceRawLine struct {
	AccountID          uint64  `gorm:"column:account_id"`
	AccountCode        string  `gorm:"column:account_code"`
	AccountName        string  `gorm:"column:account_name"`
	ClassificationID   uint64  `gorm:"column:classification_id"`
	ClassificationType string  `gorm:"column:classification_type"`
	NormalBalance      string  `gorm:"column:normal_balance"`
	OpeningDebit       float64 `gorm:"column:opening_debit"`
	OpeningCredit      float64 `gorm:"column:opening_credit"`
	PeriodDebit        float64 `gorm:"column:period_debit"`
	PeriodCredit       float64 `gorm:"column:period_credit"`
}

func (r *FinanceReportRepository) GetTrialBalanceReport(
	companyID uint64, req dto.TrialBalanceReportRequest,
) ([]TrialBalanceRawLine, error) {

	// If DateFrom is nil, we treat all transactions as period transactions, and opening as 0.
	// But usually DateFrom is the start of the financial year.
	hasDateFrom := req.DateFrom != nil
	hasDateTo := req.DateTo != nil

	query := r.db.Table("general_ledger_entries gl").
		Select(`
			gl.account_id,
			coa.account_code,
			coa.account_name,
			coa.classification_id,
			c.type as classification_type,
			c.normal_balance,
			SUM(CASE WHEN ? AND gl.transaction_date < ? THEN gl.debit_amount ELSE 0 END) as opening_debit,
			SUM(CASE WHEN ? AND gl.transaction_date < ? THEN gl.credit_amount ELSE 0 END) as opening_credit,
			SUM(CASE WHEN (NOT ? OR gl.transaction_date >= ?) AND (NOT ? OR gl.transaction_date <= ?) THEN gl.debit_amount ELSE 0 END) as period_debit,
			SUM(CASE WHEN (NOT ? OR gl.transaction_date >= ?) AND (NOT ? OR gl.transaction_date <= ?) THEN gl.credit_amount ELSE 0 END) as period_credit
		`,
			hasDateFrom, req.DateFrom,
			hasDateFrom, req.DateFrom,
			hasDateFrom, req.DateFrom, hasDateTo, req.DateTo,
			hasDateFrom, req.DateFrom, hasDateTo, req.DateTo).
		Joins("JOIN chart_of_accounts coa ON gl.account_id = coa.id").
		Joins("JOIN account_classifications c ON coa.classification_id = c.id").
		Where("gl.company_id = ? AND gl.financial_year_id = ?", companyID, req.FinancialYearID)

	if req.BranchID != nil {
		query = query.Where("gl.branch_id = ?", *req.BranchID)
	}

	query = query.Group("gl.account_id, coa.account_code, coa.account_name, coa.classification_id, c.type, c.normal_balance")

	var results []TrialBalanceRawLine
	if err := query.Find(&results).Error; err != nil {
		return nil, err
	}

	return results, nil
}

func (r *FinanceReportRepository) GetOpeningBalanceForAccount(
	companyID uint64, accountID uint64, dateFrom *time.Time,
) (float64, float64, error) {
	if dateFrom == nil {
		return 0, 0, nil
	}

	var result struct {
		TotalDebit  float64
		TotalCredit float64
	}

	err := r.db.Table("general_ledger_entries").
		Select("SUM(debit_amount) as total_debit, SUM(credit_amount) as total_credit").
		Where("company_id = ? AND account_id = ? AND transaction_date < ?", companyID, accountID, *dateFrom).
		Scan(&result).Error

	return result.TotalDebit, result.TotalCredit, err
}

func (r *FinanceReportRepository) DB() *gorm.DB {
	return r.db
}
