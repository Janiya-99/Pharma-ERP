package services

import (
	"math"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"

	"go.uber.org/zap"
)

type FinanceReportService struct {
	repo         *repositories.FinanceReportRepository
	glRepo       *repositories.GeneralLedgerRepository
	coaRepo      *repositories.ChartOfAccountRepository
	auditService *AuditLogService
	logger       *zap.Logger
}

func NewFinanceReportService(
	repo *repositories.FinanceReportRepository,
	glRepo *repositories.GeneralLedgerRepository,
	coaRepo *repositories.ChartOfAccountRepository,
	auditService *AuditLogService,
	logger *zap.Logger,
) *FinanceReportService {
	return &FinanceReportService{
		repo:         repo,
		glRepo:       glRepo,
		coaRepo:      coaRepo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *FinanceReportService) GetTrialBalanceReport(companyID uint64, req dto.TrialBalanceReportRequest) (*dto.TrialBalanceReportResponse, error) {
	rawLines, err := s.repo.GetTrialBalanceReport(companyID, req)
	if err != nil {
		return nil, err
	}

	var response dto.TrialBalanceReportResponse
	response.Lines = make([]dto.TrialBalanceLine, 0)

	for _, raw := range rawLines {
		if raw.OpeningDebit == 0 && raw.OpeningCredit == 0 && raw.PeriodDebit == 0 && raw.PeriodCredit == 0 {
			continue // Skip accounts with zero movement and zero opening
		}

		line := dto.TrialBalanceLine{
			AccountCode:   raw.AccountCode,
			AccountName:   raw.AccountName,
			OpeningDebit:  raw.OpeningDebit,
			OpeningCredit: raw.OpeningCredit,
			PeriodDebit:   raw.PeriodDebit,
			PeriodCredit:  raw.PeriodCredit,
		}

		// Calculate closing balances
		netDebit := raw.OpeningDebit + raw.PeriodDebit
		netCredit := raw.OpeningCredit + raw.PeriodCredit

		if netDebit > netCredit {
			line.ClosingDebit = netDebit - netCredit
			line.ClosingCredit = 0
		} else {
			line.ClosingDebit = 0
			line.ClosingCredit = netCredit - netDebit
		}

		response.TotalOpeningDebit += line.OpeningDebit
		response.TotalOpeningCredit += line.OpeningCredit
		response.TotalPeriodDebit += line.PeriodDebit
		response.TotalPeriodCredit += line.PeriodCredit
		response.TotalClosingDebit += line.ClosingDebit
		response.TotalClosingCredit += line.ClosingCredit

		response.Lines = append(response.Lines, line)
	}

	return &response, nil
}

func (s *FinanceReportService) GetProfitLossReport(companyID uint64, req dto.ProfitLossReportRequest) (*dto.ProfitLossReportResponse, error) {
	tbReq := dto.TrialBalanceReportRequest{
		FinancialYearID: req.FinancialYearID,
		DateFrom:        req.DateFrom,
		DateTo:          req.DateTo,
		BranchID:        req.BranchID,
	}

	rawLines, err := s.repo.GetTrialBalanceReport(companyID, tbReq)
	if err != nil {
		return nil, err
	}

	var response dto.ProfitLossReportResponse
	response.Revenue.Name = "Revenue"
	response.OtherIncome.Name = "Other Income"
	response.DirectExpenses.Name = "Direct Expenses"
	response.AdministrativeExpenses.Name = "Administrative Expenses"
	response.SellingExpenses.Name = "Selling Expenses"
	response.FinanceExpenses.Name = "Finance Expenses"

	for _, raw := range rawLines {
		if raw.ClassificationType != "Profit & Loss" {
			continue
		}

		// For P&L, closing balance calculation
		netDebit := raw.OpeningDebit + raw.PeriodDebit
		netCredit := raw.OpeningCredit + raw.PeriodCredit
		var closingDebit, closingCredit float64

		if netDebit > netCredit {
			closingDebit = netDebit - netCredit
		} else {
			closingCredit = netCredit - netDebit
		}

		line := dto.TrialBalanceLine{
			AccountCode:   raw.AccountCode,
			AccountName:   raw.AccountName,
			OpeningDebit:  raw.OpeningDebit,
			OpeningCredit: raw.OpeningCredit,
			PeriodDebit:   raw.PeriodDebit,
			PeriodCredit:  raw.PeriodCredit,
			ClosingDebit:  closingDebit,
			ClosingCredit: closingCredit,
		}

		// Determine section (hardcoded matching for standard chart of accounts, or by normal balance)
		// A robust system would have a 'pl_section' on the classification.
		// For now we map by typical classification names if present, else by NormalBalance
		val := math.Abs(closingCredit - closingDebit) // use absolute value, P&L conventionally shows positive

		if raw.NormalBalance == "credit" {
			// Income
			// Add logic to separate Revenue vs Other Income based on your COA
			response.Revenue.Lines = append(response.Revenue.Lines, line)
			response.Revenue.Total += val
		} else {
			// Expenses
			response.AdministrativeExpenses.Lines = append(response.AdministrativeExpenses.Lines, line)
			response.AdministrativeExpenses.Total += val
		}
	}

	totalIncome := response.Revenue.Total + response.OtherIncome.Total
	totalExpenses := response.DirectExpenses.Total + response.AdministrativeExpenses.Total + response.SellingExpenses.Total + response.FinanceExpenses.Total
	response.NetProfitLoss = totalIncome - totalExpenses

	return &response, nil
}

func (s *FinanceReportService) GetBalanceSheetReport(companyID uint64, req dto.BalanceSheetReportRequest) (*dto.BalanceSheetReportResponse, error) {
	// A balance sheet is essentially a trial balance up to AsOfDate
	tbReq := dto.TrialBalanceReportRequest{
		FinancialYearID: req.FinancialYearID,
		DateTo:          req.AsOfDate,
		BranchID:        req.BranchID,
	}

	rawLines, err := s.repo.GetTrialBalanceReport(companyID, tbReq)
	if err != nil {
		return nil, err
	}

	var response dto.BalanceSheetReportResponse
	response.Assets.Name = "Assets"
	response.Liabilities.Name = "Liabilities"
	response.Equity.Name = "Equity"

	var netIncome float64

	for _, raw := range rawLines {
		netDebit := raw.OpeningDebit + raw.PeriodDebit
		netCredit := raw.OpeningCredit + raw.PeriodCredit
		var closingDebit, closingCredit float64

		if netDebit > netCredit {
			closingDebit = netDebit - netCredit
		} else {
			closingCredit = netCredit - netDebit
		}

		line := dto.TrialBalanceLine{
			AccountCode:   raw.AccountCode,
			AccountName:   raw.AccountName,
			ClosingDebit:  closingDebit,
			ClosingCredit: closingCredit,
		}

		if raw.ClassificationType == "Profit & Loss" {
			// Accumulate to Net Income
			if raw.NormalBalance == "credit" {
				netIncome += (closingCredit - closingDebit)
			} else {
				netIncome -= (closingDebit - closingCredit)
			}
			continue
		}

		val := math.Abs(closingCredit - closingDebit)

		if raw.NormalBalance == "debit" {
			response.Assets.Lines = append(response.Assets.Lines, line)
			response.Assets.Total += val
		} else {
			if raw.ClassificationType == "Equity" || raw.AccountName == "Retained Earnings" {
				response.Equity.Lines = append(response.Equity.Lines, line)
				response.Equity.Total += val
			} else {
				response.Liabilities.Lines = append(response.Liabilities.Lines, line)
				response.Liabilities.Total += val
			}
		}
	}

	response.NetIncome = netIncome
	// Add net income to equity
	response.Equity.Total += netIncome

	return &response, nil
}

func (s *FinanceReportService) GetAccountLedgerReport(companyID uint64, req dto.AccountLedgerReportRequest) (*dto.AccountLedgerReportResponse, error) {
	// Fetch Account Details
	acc, err := s.coaRepo.FindByID(companyID, req.AccountID)
	if err != nil {
		return nil, err
	}

	// Fetch Opening Balance
	obDebit, obCredit, err := s.repo.GetOpeningBalanceForAccount(companyID, req.AccountID, req.DateFrom)
	if err != nil {
		return nil, err
	}

	var openingBalance float64
	if acc.AccountClassification.NormalBalance == "debit" {
		openingBalance = obDebit - obCredit
	} else {
		openingBalance = obCredit - obDebit
	}

	// Fetch Ledger Lines
	filters := map[string]interface{}{"account_id": req.AccountID}
	if req.FinancialYearID != nil {
		filters["financial_year_id"] = *req.FinancialYearID
	}
	if req.AccountingPeriodID != nil {
		filters["accounting_period_id"] = *req.AccountingPeriodID
	}
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}

	entries, _, err := s.glRepo.List(companyID, filters, "", req.DateFrom, req.DateTo, 1, 10000)
	if err != nil {
		return nil, err
	}

	var response dto.AccountLedgerReportResponse
	response.AccountDetails = map[string]interface{}{
		"account_code":   acc.AccountCode,
		"account_name":   acc.AccountName,
		"normal_balance": acc.AccountClassification.NormalBalance,
	}
	response.OpeningBalance = openingBalance

	var totalDebit, totalCredit float64
	runningBal := openingBalance

	for _, e := range entries {
		if acc.AccountClassification.NormalBalance == "debit" {
			runningBal += (e.DebitAmount - e.CreditAmount)
		} else {
			runningBal += (e.CreditAmount - e.DebitAmount)
		}

		response.LedgerLines = append(response.LedgerLines, dto.GeneralLedgerEntryResponse{
			ID:              e.ID,
			TransactionDate: e.TransactionDate.Format("2006-01-02"),
			SourceType:      e.SourceType,
			SourceNumber:    e.SourceNumber,
			AccountCode:     e.AccountCode,
			AccountName:     e.AccountName,
			Description:     e.Description,
			DebitAmount:     e.DebitAmount,
			CreditAmount:    e.CreditAmount,
			RunningBalance:  runningBal,
		})

		totalDebit += e.DebitAmount
		totalCredit += e.CreditAmount
	}

	response.TotalDebit = totalDebit
	response.TotalCredit = totalCredit
	response.ClosingBalance = runningBal

	return &response, nil
}

func (s *FinanceReportService) GetCashBankBookReport(companyID uint64, req dto.CashBankBookReportRequest) (*dto.CashBankBookReportResponse, error) {
	acc, err := s.coaRepo.FindByID(companyID, req.AccountID)
	if err != nil {
		return nil, err
	}

	obDebit, obCredit, err := s.repo.GetOpeningBalanceForAccount(companyID, req.AccountID, req.DateFrom)
	if err != nil {
		return nil, err
	}

	var openingBalance float64
	if acc.AccountClassification.NormalBalance == "debit" {
		openingBalance = obDebit - obCredit
	} else {
		openingBalance = obCredit - obDebit
	}

	filters := map[string]interface{}{"account_id": req.AccountID}
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}

	entries, _, err := s.glRepo.List(companyID, filters, "", req.DateFrom, req.DateTo, 1, 100000)
	if err != nil {
		return nil, err
	}

	var response dto.CashBankBookReportResponse
	response.AccountDetails = map[string]interface{}{
		"account_code":   acc.AccountCode,
		"account_name":   acc.AccountName,
		"normal_balance": acc.AccountClassification.NormalBalance,
	}
	response.OpeningBalance = openingBalance

	var totalReceipts, totalPayments float64
	runningBal := openingBalance

	for _, e := range entries {
		if acc.AccountClassification.NormalBalance == "debit" {
			runningBal += (e.DebitAmount - e.CreditAmount)
			totalReceipts += e.DebitAmount
			totalPayments += e.CreditAmount
		} else {
			runningBal += (e.CreditAmount - e.DebitAmount)
			totalReceipts += e.CreditAmount
			totalPayments += e.DebitAmount
		}

		response.Transactions = append(response.Transactions, dto.GeneralLedgerEntryResponse{
			ID:              e.ID,
			TransactionDate: e.TransactionDate.Format("2006-01-02"),
			SourceType:      e.SourceType,
			SourceNumber:    e.SourceNumber,
			AccountCode:     e.AccountCode,
			AccountName:     e.AccountName,
			Description:     e.Description,
			DebitAmount:     e.DebitAmount,
			CreditAmount:    e.CreditAmount,
			RunningBalance:  runningBal,
		})
	}

	response.TotalReceipts = totalReceipts
	response.TotalPayments = totalPayments
	response.ClosingBalance = runningBal

	return &response, nil
}

func (s *FinanceReportService) GetDayBookReport(companyID uint64, req dto.DayBookReportRequest) (*dto.DayBookReportResponse, error) {
	filters := map[string]interface{}{}
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}
	if req.SourceType != nil && *req.SourceType != "" {
		filters["source_type"] = *req.SourceType
	}

	entries, _, err := s.glRepo.List(companyID, filters, "", req.DateFrom, req.DateTo, 1, 100000)
	if err != nil {
		return nil, err
	}

	groupsMap := make(map[string]*dto.DayBookGroup)
	var orderedDates []string

	for _, e := range entries {
		dateStr := e.TransactionDate.Format("2006-01-02")
		if _, exists := groupsMap[dateStr]; !exists {
			groupsMap[dateStr] = &dto.DayBookGroup{
				TransactionDate: dateStr,
				Entries:         []dto.GeneralLedgerEntryResponse{},
			}
			orderedDates = append(orderedDates, dateStr)
		}

		group := groupsMap[dateStr]
		group.Entries = append(group.Entries, dto.GeneralLedgerEntryResponse{
			ID:              e.ID,
			TransactionDate: dateStr,
			SourceType:      e.SourceType,
			SourceNumber:    e.SourceNumber,
			AccountCode:     e.AccountCode,
			AccountName:     e.AccountName,
			Description:     e.Description,
			DebitAmount:     e.DebitAmount,
			CreditAmount:    e.CreditAmount,
		})
		group.TotalDebit += e.DebitAmount
		group.TotalCredit += e.CreditAmount
	}

	var response dto.DayBookReportResponse
	for _, dateStr := range orderedDates {
		response.Groups = append(response.Groups, *groupsMap[dateStr])
	}

	return &response, nil
}

func (s *FinanceReportService) GetJournalRegisterReport(companyID uint64, req dto.RegisterReportRequest) ([]models.JournalEntry, error) {
	query := s.repo.DB().Model(&models.JournalEntry{}).Where("company_id = ?", companyID)

	if req.FinancialYearID != nil {
		query = query.Where("financial_year_id = ?", *req.FinancialYearID)
	}
	if req.AccountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *req.AccountingPeriodID)
	}
	if req.ApprovalStatus != nil {
		query = query.Where("approval_status = ?", *req.ApprovalStatus)
	}
	if req.PostedStatus != nil {
		query = query.Where("posted_status = ?", *req.PostedStatus)
	}
	if req.DateFrom != nil {
		query = query.Where("journal_date >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("journal_date <= ?", *req.DateTo)
	}
	if req.Search != nil && *req.Search != "" {
		search := "%" + *req.Search + "%"
		query = query.Where("journal_number LIKE ? OR reference_number LIKE ? OR description LIKE ?", search, search, search)
	}

	var results []models.JournalEntry
	if err := query.Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

func (s *FinanceReportService) GetPaymentRegisterReport(companyID uint64, req dto.RegisterReportRequest) ([]models.PaymentVoucher, error) {
	query := s.repo.DB().Model(&models.PaymentVoucher{}).Where("company_id = ?", companyID)

	if req.FinancialYearID != nil {
		query = query.Where("financial_year_id = ?", *req.FinancialYearID)
	}
	if req.AccountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *req.AccountingPeriodID)
	}
	if req.ApprovalStatus != nil {
		query = query.Where("approval_status = ?", *req.ApprovalStatus)
	}
	if req.PostedStatus != nil {
		query = query.Where("posted_status = ?", *req.PostedStatus)
	}
	if req.DateFrom != nil {
		query = query.Where("voucher_date >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("voucher_date <= ?", *req.DateTo)
	}
	if req.PaymentType != nil && *req.PaymentType != "" {
		query = query.Where("payment_type = ?", *req.PaymentType)
	}
	if req.PaymentMethod != nil && *req.PaymentMethod != "" {
		query = query.Where("payment_method = ?", *req.PaymentMethod)
	}
	if req.Search != nil && *req.Search != "" {
		search := "%" + *req.Search + "%"
		query = query.Where("voucher_number LIKE ? OR reference_number LIKE ? OR description LIKE ? OR payee_name LIKE ?", search, search, search, search)
	}

	var results []models.PaymentVoucher
	if err := query.Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

func (s *FinanceReportService) GetReceiptRegisterReport(companyID uint64, req dto.RegisterReportRequest) ([]models.ReceiptVoucher, error) {
	query := s.repo.DB().Model(&models.ReceiptVoucher{}).Where("company_id = ?", companyID)

	if req.FinancialYearID != nil {
		query = query.Where("financial_year_id = ?", *req.FinancialYearID)
	}
	if req.AccountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *req.AccountingPeriodID)
	}
	if req.ApprovalStatus != nil {
		query = query.Where("approval_status = ?", *req.ApprovalStatus)
	}
	if req.PostedStatus != nil {
		query = query.Where("posted_status = ?", *req.PostedStatus)
	}
	if req.DateFrom != nil {
		query = query.Where("voucher_date >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("voucher_date <= ?", *req.DateTo)
	}
	if req.ReceiptType != nil && *req.ReceiptType != "" {
		query = query.Where("receipt_type = ?", *req.ReceiptType)
	}
	if req.ReceiptMethod != nil && *req.ReceiptMethod != "" {
		query = query.Where("receipt_method = ?", *req.ReceiptMethod)
	}
	if req.Search != nil && *req.Search != "" {
		search := "%" + *req.Search + "%"
		query = query.Where("voucher_number LIKE ? OR reference_number LIKE ? OR description LIKE ? OR payer_name LIKE ?", search, search, search, search)
	}

	var results []models.ReceiptVoucher
	if err := query.Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

func (s *FinanceReportService) AuditLog(companyID uint64, userID uint64, action string, details string) {
	s.auditService.LogAction(companyID, userID, action, details, 0)
}
