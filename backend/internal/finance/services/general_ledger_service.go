package services

import (
	"errors"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type GeneralLedgerService struct {
	repo         *repositories.GeneralLedgerRepository
	coaRepo      *repositories.ChartOfAccountRepository
	fyRepo       *repositories.FinancialYearRepository
	auditService *AuditLogService
	logger       *zap.Logger
}

func NewGeneralLedgerService(
	repo *repositories.GeneralLedgerRepository,
	coaRepo *repositories.ChartOfAccountRepository,
	fyRepo *repositories.FinancialYearRepository,
	auditService *AuditLogService,
	logger *zap.Logger,
) *GeneralLedgerService {
	return &GeneralLedgerService{
		repo:         repo,
		coaRepo:      coaRepo,
		fyRepo:       fyRepo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *GeneralLedgerService) PostLedgerEntries(tx *gorm.DB, entries []models.GeneralLedgerEntry) error {
	if len(entries) == 0 {
		return nil
	}

	companyID := entries[0].CompanyID
	sourceType := entries[0].SourceType
	sourceID := entries[0].SourceID
	financialYearID := entries[0].FinancialYearID

	// Verify entries are balanced for this source
	var totalDebit, totalCredit float64
	for _, entry := range entries {
		totalDebit += entry.DebitAmount
		totalCredit += entry.CreditAmount
	}

	if fmt.Sprintf("%.2f", totalDebit) != fmt.Sprintf("%.2f", totalCredit) {
		return errors.New("ledger entries are not balanced")
	}

	// Delete any existing entries for this source (e.g., if updating/re-posting)
	if err := s.repo.DeleteLedgerEntriesBySourceTx(tx, companyID, sourceType, sourceID); err != nil {
		return err
	}

	// Fetch full account info to populate AccountCode/AccountName/NormalBalance
	accountMap := make(map[uint64]*models.ChartOfAccount)
	for i, entry := range entries {
		if entry.DebitAmount < 0 || entry.CreditAmount < 0 {
			return errors.New("ledger entries cannot have negative debit or credit amounts")
		}
		if entry.DebitAmount > 0 && entry.CreditAmount > 0 {
			return errors.New("ledger entry cannot have both debit and credit amounts greater than zero")
		}

		acc, ok := accountMap[entry.AccountID]
		if !ok {
			fetchedAcc, err := s.coaRepo.FindByID(companyID, entry.AccountID)
			if err != nil {
				return fmt.Errorf("account id %d not found", entry.AccountID)
			}
			accountMap[entry.AccountID] = fetchedAcc
			acc = fetchedAcc
		}

		entries[i].AccountCode = acc.AccountCode
		entries[i].AccountName = acc.AccountName
		entries[i].NormalBalance = "debit"
		if acc.AccountClassification.NormalBalance != "" {
			entries[i].NormalBalance = acc.AccountClassification.NormalBalance
		}
	}

	// Create entries
	if err := s.repo.CreateLedgerEntriesTx(tx, entries); err != nil {
		return err
	}

	// Recalculate running balances for the affected accounts in the financial year
	if financialYearID != nil {
		for accID := range accountMap {
			if err := s.CalculateRunningBalanceTx(tx, companyID, accID, *financialYearID); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *GeneralLedgerService) CalculateRunningBalanceTx(tx *gorm.DB, companyID, accountID, financialYearID uint64) error {
	entries, err := s.repo.GetLedgerEntriesByAccountAndFinancialYearTx(tx, companyID, accountID, financialYearID)
	if err != nil {
		return err
	}

	var runningBalance float64 = 0
	for _, entry := range entries {
		if entry.NormalBalance == "debit" {
			runningBalance += entry.DebitAmount - entry.CreditAmount
		} else {
			runningBalance += entry.CreditAmount - entry.DebitAmount
		}

		entry.RunningBalance = runningBalance
		if err := s.repo.UpdateLedgerEntryTx(tx, &entry); err != nil {
			return err
		}
	}

	return nil
}

func (s *GeneralLedgerService) ListEntries(companyID uint64, req dto.GetLedgerEntriesRequest) ([]dto.GeneralLedgerEntryResponse, int64, error) {
	filters := make(map[string]interface{})
	if req.FinancialYearID != nil {
		filters["financial_year_id"] = *req.FinancialYearID
	}
	if req.AccountingPeriodID != nil {
		filters["accounting_period_id"] = *req.AccountingPeriodID
	}
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}
	if req.AccountID != nil {
		filters["account_id"] = *req.AccountID
	}
	if req.SourceType != nil {
		filters["source_type"] = *req.SourceType
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}
	search := ""
	if req.Search != nil {
		search = *req.Search
	}

	entries, total, err := s.repo.List(companyID, filters, search, req.TransactionDateFrom, req.TransactionDateTo, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var dtos []dto.GeneralLedgerEntryResponse
	for _, e := range entries {
		dtos = append(dtos, dto.GeneralLedgerEntryResponse{
			ID:              e.ID,
			TransactionDate: e.TransactionDate.Format("2006-01-02"),
			SourceType:      e.SourceType,
			SourceNumber:    e.SourceNumber,
			AccountCode:     e.AccountCode,
			AccountName:     e.AccountName,
			Description:     e.Description,
			DebitAmount:     e.DebitAmount,
			CreditAmount:    e.CreditAmount,
			RunningBalance:  e.RunningBalance,
		})
	}

	return dtos, total, nil
}

func (s *GeneralLedgerService) RebuildLedger(companyID, financialYearID, userID uint64) error {
	err := s.repo.DB().Transaction(func(tx *gorm.DB) error {
		// Clear existing entries for the given financial year
		if err := tx.Exec("DELETE FROM general_ledger_entries WHERE company_id = ? AND financial_year_id = ?", companyID, financialYearID).Error; err != nil {
			return err
		}

		// Re-post Opening Balances
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, financial_year_id, transaction_date, source_type, source_id, source_number, account_id, debit_amount, credit_amount, normal_balance, status, created_at, updated_at)
			SELECT ob.company_id, ob.financial_year_id, fy.start_date, 'opening_balance', ob.id, CONCAT('OB-', ob.id), ob.account_id, ob.debit_amount, ob.credit_amount, coa.normal_balance, 'posted', NOW(), NOW()
			FROM opening_balances ob
			JOIN financial_years fy ON ob.financial_year_id = fy.id
			JOIN chart_of_accounts coa ON ob.account_id = coa.id
			WHERE ob.company_id = ? AND ob.financial_year_id = ? AND ob.status = 'active'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		// Re-post Journal Entries (Debits and Credits)
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT je.company_id, je.branch_id, je.financial_year_id, je.accounting_period_id, je.journal_date, 'journal_entry', je.id, je.journal_number, jl.account_id, jl.description, jl.debit_amount, jl.credit_amount, coa.normal_balance, je.reference_number, je.posted_by, je.posted_at, 'posted', NOW(), NOW()
			FROM journal_entries je
			JOIN journal_entry_lines jl ON je.id = jl.journal_entry_id
			JOIN chart_of_accounts coa ON jl.account_id = coa.id
			WHERE je.company_id = ? AND je.financial_year_id = ? AND je.posted_status = 'posted' AND je.is_reversed = 0
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		// Re-post Payment Vouchers
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT pv.company_id, pv.branch_id, pv.financial_year_id, pv.accounting_period_id, pv.voucher_date, 'payment_voucher', pv.id, pv.voucher_number, pvl.account_id, pvl.description, pvl.amount, 0, coa.normal_balance, pv.reference_number, pv.posted_by, pv.posted_at, 'posted', NOW(), NOW()
			FROM payment_vouchers pv
			JOIN payment_voucher_lines pvl ON pv.id = pvl.payment_voucher_id
			JOIN chart_of_accounts coa ON pvl.account_id = coa.id
			WHERE pv.company_id = ? AND pv.financial_year_id = ? AND pv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT pv.company_id, pv.branch_id, pv.financial_year_id, pv.accounting_period_id, pv.voucher_date, 'payment_voucher', pv.id, pv.voucher_number, pv.paid_from_account_id, pv.description, 0, pv.total_amount, coa.normal_balance, pv.reference_number, pv.posted_by, pv.posted_at, 'posted', NOW(), NOW()
			FROM payment_vouchers pv
			JOIN chart_of_accounts coa ON pv.paid_from_account_id = coa.id
			WHERE pv.company_id = ? AND pv.financial_year_id = ? AND pv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		// Re-post Receipt Vouchers
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT rv.company_id, rv.branch_id, rv.financial_year_id, rv.accounting_period_id, rv.voucher_date, 'receipt_voucher', rv.id, rv.voucher_number, rv.received_to_account_id, rv.description, rv.total_amount, 0, coa.normal_balance, rv.reference_number, rv.posted_by, rv.posted_at, 'posted', NOW(), NOW()
			FROM receipt_vouchers rv
			JOIN chart_of_accounts coa ON rv.received_to_account_id = coa.id
			WHERE rv.company_id = ? AND rv.financial_year_id = ? AND rv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT rv.company_id, rv.branch_id, rv.financial_year_id, rv.accounting_period_id, rv.voucher_date, 'receipt_voucher', rv.id, rv.voucher_number, rvl.account_id, rvl.description, 0, rvl.amount, coa.normal_balance, rv.reference_number, rv.posted_by, rv.posted_at, 'posted', NOW(), NOW()
			FROM receipt_vouchers rv
			JOIN receipt_voucher_lines rvl ON rv.id = rvl.receipt_voucher_id
			JOIN chart_of_accounts coa ON rvl.account_id = coa.id
			WHERE rv.company_id = ? AND rv.financial_year_id = ? AND rv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		// Re-post Petty Cash Vouchers
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT pcv.company_id, pcv.branch_id, pcv.financial_year_id, pcv.accounting_period_id, pcv.voucher_date, 'petty_cash_voucher', pcv.id, pcv.voucher_number, pcvl.account_id, pcvl.description, CASE WHEN pcv.voucher_type = 'refund' THEN 0 ELSE pcvl.amount END, CASE WHEN pcv.voucher_type = 'refund' THEN pcvl.amount ELSE 0 END, coa.normal_balance, pcv.reference_number, pcv.posted_by, pcv.posted_at, 'posted', NOW(), NOW()
			FROM petty_cash_vouchers pcv
			JOIN petty_cash_voucher_lines pcvl ON pcv.id = pcvl.petty_cash_voucher_id
			JOIN chart_of_accounts coa ON pcvl.account_id = coa.id
			WHERE pcv.company_id = ? AND pcv.financial_year_id = ? AND pcv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`
			INSERT INTO general_ledger_entries (company_id, branch_id, financial_year_id, accounting_period_id, transaction_date, source_type, source_id, source_number, account_id, description, debit_amount, credit_amount, normal_balance, reference_number, posted_by, posted_at, status, created_at, updated_at)
			SELECT pcv.company_id, pcv.branch_id, pcv.financial_year_id, pcv.accounting_period_id, pcv.voucher_date, 'petty_cash_voucher', pcv.id, pcv.voucher_number, pcf.chart_account_id, pcv.description, CASE WHEN pcv.voucher_type = 'refund' THEN pcv.total_amount ELSE 0 END, CASE WHEN pcv.voucher_type = 'refund' THEN 0 ELSE pcv.total_amount END, coa.normal_balance, pcv.reference_number, pcv.posted_by, pcv.posted_at, 'posted', NOW(), NOW()
			FROM petty_cash_vouchers pcv
			JOIN petty_cash_funds pcf ON pcv.petty_cash_fund_id = pcf.id
			JOIN chart_of_accounts coa ON pcf.chart_account_id = coa.id
			WHERE pcv.company_id = ? AND pcv.financial_year_id = ? AND pcv.posted_status = 'posted'
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		// Update AccountCode and AccountName for all newly inserted entries
		if err := tx.Exec(`
			UPDATE general_ledger_entries gl
			JOIN chart_of_accounts coa ON gl.account_id = coa.id
			SET gl.account_code = coa.account_code, gl.account_name = coa.account_name
			WHERE gl.company_id = ? AND gl.financial_year_id = ?
		`, companyID, financialYearID).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	// Calculate running balances for all accounts that were affected
	var accountIDs []uint64
	s.repo.DB().Table("general_ledger_entries").Where("company_id = ? AND financial_year_id = ?", companyID, financialYearID).Select("DISTINCT(account_id)").Pluck("account_id", &accountIDs)
	for _, accID := range accountIDs {
		s.CalculateRunningBalanceTx(s.repo.DB(), companyID, accID, financialYearID)
	}

	s.auditService.LogAction(companyID, userID, "GENERAL_LEDGER_REBUILT", "Rebuilt general ledger for financial year", financialYearID)
	return nil
}
