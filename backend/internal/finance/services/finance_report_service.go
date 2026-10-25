package services

import (
	"errors"
	"math"
	"sort"
	"strings"

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
			AccountID:          raw.AccountID,
			AccountCode:        raw.AccountCode,
			AccountName:        raw.AccountName,
			ClassificationName: raw.ClassificationName,
			Category:           raw.ClassificationType,
			OpeningDebit:       raw.OpeningDebit,
			OpeningCredit:      raw.OpeningCredit,
			PeriodDebit:        raw.PeriodDebit,
			PeriodCredit:       raw.PeriodCredit,
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

		val := math.Abs(closingCredit - closingDebit) // Conventional positive amount on P&L statement

		line := dto.TrialBalanceLine{
			AccountID:     raw.AccountID,
			AccountCode:   raw.AccountCode,
			AccountName:   raw.AccountName,
			Balance:       val,
			OpeningDebit:  raw.OpeningDebit,
			OpeningCredit: raw.OpeningCredit,
			PeriodDebit:   raw.PeriodDebit,
			PeriodCredit:  raw.PeriodCredit,
			ClosingDebit:  closingDebit,
			ClosingCredit: closingCredit,
		}

		// Standard pharmaceutical chart of accounts classification:
		// 40xxxx -> Sales Revenue
		// 41xxxx -> Other Income
		// 5xxxxx -> Cost of Goods Sold / Direct Expenses
		// 6xxxxx -> Administrative Expenses
		// 7xxxxx -> Selling & Distribution Expenses
		// 8xxxxx -> Finance Expenses
		if strings.HasPrefix(raw.AccountCode, "40") {
			response.Revenue.Lines = append(response.Revenue.Lines, line)
			response.Revenue.Total += val
		} else if strings.HasPrefix(raw.AccountCode, "41") {
			response.OtherIncome.Lines = append(response.OtherIncome.Lines, line)
			response.OtherIncome.Total += val
		} else if strings.HasPrefix(raw.AccountCode, "5") {
			response.DirectExpenses.Lines = append(response.DirectExpenses.Lines, line)
			response.DirectExpenses.Total += val
		} else if strings.HasPrefix(raw.AccountCode, "6") {
			response.AdministrativeExpenses.Lines = append(response.AdministrativeExpenses.Lines, line)
			response.AdministrativeExpenses.Total += val
		} else if strings.HasPrefix(raw.AccountCode, "7") {
			response.SellingExpenses.Lines = append(response.SellingExpenses.Lines, line)
			response.SellingExpenses.Total += val
		} else if strings.HasPrefix(raw.AccountCode, "8") {
			response.FinanceExpenses.Lines = append(response.FinanceExpenses.Lines, line)
			response.FinanceExpenses.Total += val
		} else if strings.EqualFold(raw.NormalBalance, "credit") {
			response.Revenue.Lines = append(response.Revenue.Lines, line)
			response.Revenue.Total += val
		} else {
			response.AdministrativeExpenses.Lines = append(response.AdministrativeExpenses.Lines, line)
			response.AdministrativeExpenses.Total += val
		}
	}

	response.TotalIncome = response.Revenue.Total + response.OtherIncome.Total
	response.TotalExpense = response.DirectExpenses.Total + response.AdministrativeExpenses.Total + response.SellingExpenses.Total + response.FinanceExpenses.Total
	response.NetProfit = response.TotalIncome - response.TotalExpense
	response.NetProfitLoss = response.NetProfit

	return &response, nil
}

func (s *FinanceReportService) GetBalanceSheetReport(companyID uint64, req dto.BalanceSheetReportRequest) (*dto.BalanceSheetReportResponse, error) {
	// A balance sheet is essentially a cumulative financial position up to AsOfDate
	tbReq := dto.TrialBalanceReportRequest{
		FinancialYearID: req.FinancialYearID,
		DateTo:          req.AsOfDate,
		BranchID:        req.BranchID,
	}

	rawLines, err := s.repo.GetTrialBalanceReport(companyID, tbReq)
	if err != nil {
		return nil, err
	}

	return s.CalculateBalanceSheet(rawLines), nil
}

func (s *FinanceReportService) CalculateBalanceSheet(rawLines []repositories.TrialBalanceRawLine) *dto.BalanceSheetReportResponse {
	var response dto.BalanceSheetReportResponse
	response.Assets.Name = "Assets"
	response.Assets.Lines = make([]dto.TrialBalanceLine, 0)
	response.Liabilities.Name = "Liabilities"
	response.Liabilities.Lines = make([]dto.TrialBalanceLine, 0)
	response.Equity.Name = "Equity"
	response.Equity.Lines = make([]dto.TrialBalanceLine, 0)

	var netIncome float64
	var currentAssets, nonCurrentAssets float64
	var currentLiabilities, nonCurrentLiabilities float64
	var inventoryAmount float64

	for _, raw := range rawLines {
		netDebit := raw.OpeningDebit + raw.PeriodDebit
		netCredit := raw.OpeningCredit + raw.PeriodCredit
		var closingDebit, closingCredit float64

		if netDebit > netCredit {
			closingDebit = netDebit - netCredit
		} else {
			closingCredit = netCredit - netDebit
		}

		// Skip accounts with zero net movement and balance
		if closingDebit == 0 && closingCredit == 0 {
			continue
		}

		code := strings.TrimSpace(raw.AccountCode)
		name := strings.TrimSpace(raw.AccountName)
		clsType := strings.TrimSpace(raw.ClassificationType)
		clsName := strings.TrimSpace(raw.ClassificationName)
		normBal := strings.ToLower(strings.TrimSpace(raw.NormalBalance))
		if normBal == "" {
			normBal = strings.ToLower(strings.TrimSpace(raw.CoaNormalBalance))
		}

		// 1. Profit & Loss items (Revenues: 4xxxx, Expenses: 5xxxx-8xxxx) accumulate into Net Profit
		isPL := strings.EqualFold(clsType, "Profit & Loss") ||
			strings.HasPrefix(code, "4") ||
			strings.HasPrefix(code, "5") ||
			strings.HasPrefix(code, "6") ||
			strings.HasPrefix(code, "7") ||
			strings.HasPrefix(code, "8")

		if isPL {
			if strings.HasPrefix(code, "4") || normBal == "credit" {
				netIncome += (closingCredit - closingDebit)
			} else {
				netIncome -= (closingDebit - closingCredit)
			}
			continue
		}

		line := dto.TrialBalanceLine{
			AccountID:          raw.AccountID,
			AccountCode:        raw.AccountCode,
			AccountName:        raw.AccountName,
			ClassificationName: raw.ClassificationName,
			OpeningDebit:       raw.OpeningDebit,
			OpeningCredit:      raw.OpeningCredit,
			PeriodDebit:        raw.PeriodDebit,
			PeriodCredit:       raw.PeriodCredit,
			ClosingDebit:       closingDebit,
			ClosingCredit:      closingCredit,
		}

		// 2. Check Asset accounts (1xxxx or classification Assets)
		isAsset := strings.HasPrefix(code, "1") ||
			strings.EqualFold(clsName, "Assets") ||
			strings.Contains(strings.ToLower(clsName), "asset") ||
			strings.Contains(strings.ToLower(clsName), "receivable") ||
			strings.Contains(strings.ToLower(clsName), "inventory") ||
			strings.Contains(strings.ToLower(clsName), "cash")

		// 3. Check Equity accounts (3xxxx or Retained Earnings / Capital)
		isEquity := strings.HasPrefix(code, "3") ||
			strings.Contains(strings.ToLower(clsName), "equity") ||
			strings.Contains(strings.ToLower(clsName), "capital") ||
			strings.Contains(strings.ToLower(name), "retained earnings") ||
			strings.Contains(strings.ToLower(name), "share capital")

		// 4. Check Liability accounts (2xxxx or classification Liabilities)
		isLiability := strings.HasPrefix(code, "2") ||
			strings.Contains(strings.ToLower(clsName), "liabilit") ||
			strings.Contains(strings.ToLower(clsName), "payable")

		if isAsset {
			isContraAsset := strings.Contains(strings.ToLower(name), "accumulated depreciation") ||
				(strings.HasPrefix(code, "15") && normBal == "credit")

			var val float64
			if isContraAsset {
				val = -(closingCredit - closingDebit)
				line.Balance = val
				line.Category = "Non-Current Assets"
				nonCurrentAssets += val
			} else {
				val = closingDebit - closingCredit
				line.Balance = val
				if strings.HasPrefix(code, "15") || strings.Contains(strings.ToLower(clsName), "non current") || strings.Contains(strings.ToLower(clsName), "property") {
					line.Category = "Non-Current Assets"
					nonCurrentAssets += val
				} else {
					line.Category = "Current Assets"
					currentAssets += val
					if strings.HasPrefix(code, "12") || strings.Contains(strings.ToLower(name), "inventory") {
						inventoryAmount += val
					}
				}
			}

			response.Assets.Lines = append(response.Assets.Lines, line)
			response.Assets.Total += val

		} else if isLiability {
			val := closingCredit - closingDebit
			line.Balance = val
			if strings.HasPrefix(code, "25") || strings.Contains(strings.ToLower(clsName), "non current") || strings.Contains(strings.ToLower(name), "long term") {
				line.Category = "Non-Current Liabilities"
				nonCurrentLiabilities += val
			} else {
				line.Category = "Current Liabilities"
				currentLiabilities += val
			}

			response.Liabilities.Lines = append(response.Liabilities.Lines, line)
			response.Liabilities.Total += val

		} else if isEquity {
			val := closingCredit - closingDebit
			line.Balance = val
			line.Category = "Equity"
			response.Equity.Lines = append(response.Equity.Lines, line)
			response.Equity.Total += val

		} else {
			// Fallback by normal balance sign
			if normBal == "debit" {
				val := closingDebit - closingCredit
				line.Balance = val
				line.Category = "Current Assets"
				response.Assets.Lines = append(response.Assets.Lines, line)
				response.Assets.Total += val
				currentAssets += val
			} else {
				val := closingCredit - closingDebit
				line.Balance = val
				line.Category = "Current Liabilities"
				response.Liabilities.Lines = append(response.Liabilities.Lines, line)
				response.Liabilities.Total += val
				currentLiabilities += val
			}
		}
	}

	response.NetIncome = math.Round(netIncome*100) / 100

	// Incorporate Net Profit / (Loss) as a distinct transparent line in Equity
	response.Equity.Lines = append(response.Equity.Lines, dto.TrialBalanceLine{
		AccountCode:   "PL-NET",
		AccountName:   "Net Profit / (Loss) for the Period",
		Category:      "Equity",
		Balance:       response.NetIncome,
		ClosingDebit:  math.Max(0, -response.NetIncome),
		ClosingCredit: math.Max(0, response.NetIncome),
	})
	response.Equity.Total += response.NetIncome

	// Round totals to 2 decimal places
	response.Assets.Total = math.Round(response.Assets.Total*100) / 100
	response.Liabilities.Total = math.Round(response.Liabilities.Total*100) / 100
	response.Equity.Total = math.Round(response.Equity.Total*100) / 100

	response.TotalAssets = response.Assets.Total
	response.TotalLiabilities = response.Liabilities.Total
	response.TotalEquity = response.Equity.Total
	response.TotalLiabilitiesAndEquity = math.Round((response.TotalLiabilities+response.TotalEquity)*100) / 100

	diff := math.Round((response.TotalAssets-response.TotalLiabilitiesAndEquity)*100) / 100
	response.Difference = diff
	response.IsBalanced = math.Abs(diff) < 0.01

	response.CurrentAssets = math.Round(currentAssets*100) / 100
	response.NonCurrentAssets = math.Round(nonCurrentAssets*100) / 100
	response.CurrentLiabilities = math.Round(currentLiabilities*100) / 100
	response.NonCurrentLiabilities = math.Round(nonCurrentLiabilities*100) / 100
	response.WorkingCapital = math.Round((currentAssets-currentLiabilities)*100) / 100

	if currentLiabilities > 0 {
		response.CurrentRatio = math.Round((currentAssets/currentLiabilities)*100) / 100
		quickAssets := currentAssets - inventoryAmount
		response.QuickRatio = math.Round((quickAssets/currentLiabilities)*100) / 100
	}
	if response.TotalEquity > 0 {
		response.DebtToEquityRatio = math.Round((response.TotalLiabilities/response.TotalEquity)*100) / 100
	}

	return &response
}

func (s *FinanceReportService) GetAccountLedgerReport(companyID uint64, req dto.AccountLedgerReportRequest) (*dto.AccountLedgerReportResponse, error) {
	acc, err := s.coaRepo.FindByID(companyID, req.AccountID)
	if err != nil {
		return nil, err
	}

	obDebit, obCredit, err := s.repo.GetOpeningBalanceForAccount(companyID, req.AccountID, req.DateFrom)
	if err != nil {
		return nil, err
	}

	var openingBalance float64
	accNormBal := acc.AccountClassification.NormalBalance
	if accNormBal == "" {
		accNormBal = acc.NormalBalance
	}
	if accNormBal == "" {
		accNormBal = "Debit"
	}

	if strings.EqualFold(accNormBal, "debit") {
		openingBalance = obDebit - obCredit
	} else {
		openingBalance = obCredit - obDebit
	}

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

	entries, _, err := s.glRepo.List(companyID, filters, "", req.DateFrom, req.DateTo, 1, 100000)
	if err != nil {
		return nil, err
	}

	return s.CalculateAccountLedger(acc, openingBalance, entries), nil
}

func (s *FinanceReportService) CalculateAccountLedger(
	acc *models.ChartOfAccount,
	openingBalance float64,
	entries []models.GeneralLedgerEntry,
) *dto.AccountLedgerReportResponse {
	var response dto.AccountLedgerReportResponse

	accNormBal := acc.AccountClassification.NormalBalance
	if accNormBal == "" {
		accNormBal = acc.NormalBalance
	}
	if accNormBal == "" {
		accNormBal = "Debit"
	}

	response.AccountDetails = map[string]interface{}{
		"account_id":     acc.ID,
		"account_code":   acc.AccountCode,
		"account_name":   acc.AccountName,
		"normal_balance": accNormBal,
	}
	response.OpeningBalance = openingBalance

	// Sort entries in chronological order (oldest first) so running balance progresses forward in time
	sortedEntries := make([]models.GeneralLedgerEntry, len(entries))
	copy(sortedEntries, entries)
	sort.Slice(sortedEntries, func(i, j int) bool {
		if sortedEntries[i].TransactionDate.Equal(sortedEntries[j].TransactionDate) {
			return sortedEntries[i].ID < sortedEntries[j].ID
		}
		return sortedEntries[i].TransactionDate.Before(sortedEntries[j].TransactionDate)
	})

	var totalDebit, totalCredit float64
	runningBal := openingBalance
	isDebit := strings.EqualFold(accNormBal, "debit")

	response.LedgerLines = make([]dto.GeneralLedgerEntryResponse, 0, len(sortedEntries))

	for _, e := range sortedEntries {
		if isDebit {
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
			Debit:           e.DebitAmount,
			Credit:          e.CreditAmount,
			RunningBalance:  runningBal,
		})

		totalDebit += e.DebitAmount
		totalCredit += e.CreditAmount
	}

	response.TotalDebit = totalDebit
	response.TotalCredit = totalCredit
	response.ClosingBalance = runningBal

	return &response
}

func (s *FinanceReportService) GetCashBankBookReport(companyID uint64, req dto.CashBankBookReportRequest) (*dto.CashBankBookReportResponse, error) {
	// If account_id is not provided, resolve from bank_account_id or cash_account_id
	if req.AccountID == 0 && req.BankAccountID != nil && *req.BankAccountID > 0 {
		var chartAccID uint64
		if err := s.repo.DB().Table("bank_accounts").Where("company_id = ? AND id = ?", companyID, *req.BankAccountID).Pluck("chart_account_id", &chartAccID).Error; err == nil && chartAccID > 0 {
			req.AccountID = chartAccID
		}
	}
	if req.AccountID == 0 && req.CashAccountID != nil && *req.CashAccountID > 0 {
		var chartAccID uint64
		if err := s.repo.DB().Table("cash_accounts").Where("company_id = ? AND id = ?", companyID, *req.CashAccountID).Pluck("linked_ledger_account_id", &chartAccID).Error; err == nil && chartAccID > 0 {
			req.AccountID = chartAccID
		}
	}

	if req.AccountID == 0 {
		return nil, errors.New("account_id is required")
	}

	acc, err := s.coaRepo.FindByID(companyID, req.AccountID)
	if err != nil {
		return nil, err
	}

	obDebit, obCredit, err := s.repo.GetOpeningBalanceForAccount(companyID, req.AccountID, req.DateFrom)
	if err != nil {
		return nil, err
	}

	var openingBalance float64
	accNormBal := acc.AccountClassification.NormalBalance
	if accNormBal == "" {
		accNormBal = acc.NormalBalance
	}
	if accNormBal == "" {
		accNormBal = "Debit"
	}

	if strings.EqualFold(accNormBal, "debit") {
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

	return s.CalculateCashBankBook(acc, openingBalance, entries), nil
}

func (s *FinanceReportService) CalculateCashBankBook(
	acc *models.ChartOfAccount,
	openingBalance float64,
	entries []models.GeneralLedgerEntry,
) *dto.CashBankBookReportResponse {
	var response dto.CashBankBookReportResponse

	accNormBal := acc.AccountClassification.NormalBalance
	if accNormBal == "" {
		accNormBal = acc.NormalBalance
	}
	if accNormBal == "" {
		accNormBal = "Debit"
	}

	response.AccountDetails = map[string]interface{}{
		"account_id":     acc.ID,
		"account_code":   acc.AccountCode,
		"account_name":   acc.AccountName,
		"normal_balance": accNormBal,
	}
	response.OpeningBalance = openingBalance

	// Sort entries in chronological order (oldest first) so running balance progresses forward in time
	sortedEntries := make([]models.GeneralLedgerEntry, len(entries))
	copy(sortedEntries, entries)
	sort.Slice(sortedEntries, func(i, j int) bool {
		if sortedEntries[i].TransactionDate.Equal(sortedEntries[j].TransactionDate) {
			return sortedEntries[i].ID < sortedEntries[j].ID
		}
		return sortedEntries[i].TransactionDate.Before(sortedEntries[j].TransactionDate)
	})

	var totalReceipts, totalPayments float64
	runningBal := openingBalance
	isDebit := strings.EqualFold(accNormBal, "debit")

	response.Transactions = make([]dto.GeneralLedgerEntryResponse, 0, len(sortedEntries))

	for _, e := range sortedEntries {
		if isDebit {
			// For Bank & Cash (Asset) accounts:
			// Debit = Inflow / Deposit / Receipt (increases cash)
			// Credit = Outflow / Disbursement / Payment (decreases cash)
			runningBal += (e.DebitAmount - e.CreditAmount)
			totalReceipts += e.DebitAmount
			totalPayments += e.CreditAmount
		} else {
			// For credit-normal accounts (e.g. Bank Overdraft)
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
			Debit:           e.DebitAmount,
			Credit:          e.CreditAmount,
			RunningBalance:  runningBal,
		})
	}

	response.TotalReceipts = totalReceipts
	response.TotalPayments = totalPayments
	response.TotalDebit = totalReceipts
	response.TotalCredit = totalPayments
	response.ClosingBalance = runningBal

	return &response
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
		entry := dto.GeneralLedgerEntryResponse{
			ID:              e.ID,
			TransactionDate: dateStr,
			SourceType:      e.SourceType,
			SourceNumber:    e.SourceNumber,
			AccountCode:     e.AccountCode,
			AccountName:     e.AccountName,
			Description:     e.Description,
			DebitAmount:     e.DebitAmount,
			CreditAmount:    e.CreditAmount,
		}
		group.Entries = append(group.Entries, entry)
		group.Lines = append(group.Lines, entry)
		group.Date = dateStr
		group.TotalDebit += e.DebitAmount
		group.TotalCredit += e.CreditAmount
	}

	var response dto.DayBookReportResponse
	response.Groups = make([]dto.DayBookGroup, 0, len(orderedDates))
	response.Days = make([]dto.DayBookGroup, 0, len(orderedDates))

	for _, dateStr := range orderedDates {
		g := *groupsMap[dateStr]
		response.Groups = append(response.Groups, g)
		response.Days = append(response.Days, g)
		response.TotalDebit += g.TotalDebit
		response.TotalCredit += g.TotalCredit
		response.TotalTransactions += len(g.Entries)
	}
	response.TotalDays = len(orderedDates)

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
	if err := query.Order("journal_date DESC, id DESC").Find(&results).Error; err != nil {
		return nil, err
	}

	var userIDs []uint64
	for _, je := range results {
		if je.CreatedBy != nil && *je.CreatedBy > 0 {
			userIDs = append(userIDs, *je.CreatedBy)
		}
	}
	userMap := s.getUserNamesMap(userIDs)
	for i := range results {
		if results[i].CreatedBy != nil {
			results[i].CreatedByName = userMap[*results[i].CreatedBy]
		}
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
		query = query.Where("payment_date >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("payment_date <= ?", *req.DateTo)
	}
	if req.PaymentType != nil && *req.PaymentType != "" {
		query = query.Where("payment_type = ?", *req.PaymentType)
	}
	if req.PaymentMethod != nil && *req.PaymentMethod != "" {
		query = query.Where("payment_method = ?", *req.PaymentMethod)
	}
	if req.Search != nil && *req.Search != "" {
		search := "%" + *req.Search + "%"
		query = query.Where("voucher_number LIKE ? OR reference_number LIKE ? OR description LIKE ?", search, search, search)
	}

	var results []models.PaymentVoucher
	if err := query.Preload("PaidFromAccount").Order("payment_date DESC, id DESC").Find(&results).Error; err != nil {
		return nil, err
	}

	var userIDs []uint64
	for _, pv := range results {
		if pv.CreatedBy != nil && *pv.CreatedBy > 0 {
			userIDs = append(userIDs, *pv.CreatedBy)
		}
	}
	userMap := s.getUserNamesMap(userIDs)

	for i := range results {
		if results[i].CreatedBy != nil {
			results[i].CreatedByName = userMap[*results[i].CreatedBy]
		}
		if results[i].PaidFromAccount != nil && results[i].PaidFromAccount.AccountName != "" {
			results[i].PaidFromAccountName = results[i].PaidFromAccount.AccountName
		}
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
		query = query.Where("receipt_date >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("receipt_date <= ?", *req.DateTo)
	}
	if req.ReceiptType != nil && *req.ReceiptType != "" {
		query = query.Where("receipt_type = ?", *req.ReceiptType)
	}
	if req.ReceiptMethod != nil && *req.ReceiptMethod != "" {
		query = query.Where("receipt_method = ?", *req.ReceiptMethod)
	}
	if req.Search != nil && *req.Search != "" {
		search := "%" + *req.Search + "%"
		query = query.Where("voucher_number LIKE ? OR reference_number LIKE ? OR description LIKE ?", search, search, search)
	}

	var results []models.ReceiptVoucher
	if err := query.Preload("ReceivedToAccount").Order("receipt_date DESC, id DESC").Find(&results).Error; err != nil {
		return nil, err
	}

	var userIDs []uint64
	for _, rv := range results {
		if rv.CreatedBy != nil && *rv.CreatedBy > 0 {
			userIDs = append(userIDs, *rv.CreatedBy)
		}
	}
	userMap := s.getUserNamesMap(userIDs)

	for i := range results {
		if results[i].CreatedBy != nil {
			results[i].CreatedByName = userMap[*results[i].CreatedBy]
		}
		if results[i].ReceivedToAccount != nil && results[i].ReceivedToAccount.AccountName != "" {
			results[i].ReceivedToAccountName = results[i].ReceivedToAccount.AccountName
		}
	}

	return results, nil
}

func (s *FinanceReportService) getUserNamesMap(userIDs []uint64) map[uint64]string {
	userMap := make(map[uint64]string)
	if len(userIDs) == 0 {
		return userMap
	}
	uniqueMap := make(map[uint64]bool)
	var deduped []uint64
	for _, id := range userIDs {
		if id > 0 && !uniqueMap[id] {
			uniqueMap[id] = true
			deduped = append(deduped, id)
		}
	}
	if len(deduped) == 0 {
		return userMap
	}

	type UserSummary struct {
		ID   uint64 `gorm:"column:id"`
		Name string `gorm:"column:name"`
	}
	var users []UserSummary
	if err := s.repo.DB().Table("users").Where("id IN ?", deduped).Select("id, name").Scan(&users).Error; err == nil {
		for _, u := range users {
			userMap[u.ID] = u.Name
		}
	}
	return userMap
}

func (s *FinanceReportService) AuditLog(companyID uint64, userID uint64, action string, details string) {
	s.auditService.LogAction(companyID, userID, action, details, 0)
}

func (s *FinanceReportService) AuditLogWithContext(companyID uint64, branchID *uint64, userID uint64, action string, details string, entityID uint64, ipAddress string, userAgent string) {
	s.auditService.LogActionWithContext(companyID, branchID, userID, action, details, entityID, ipAddress, userAgent)
}
