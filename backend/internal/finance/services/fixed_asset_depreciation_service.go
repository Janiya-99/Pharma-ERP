package services

import (
	"fmt"
	"math"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"gorm.io/gorm"
)

type FixedAssetDepreciationService struct {
	repo         *repositories.FixedAssetDepreciationRepository
	assetRepo    *repositories.FixedAssetRepository
	fyRepo       *repositories.FinancialYearRepository
	apRepo       *repositories.AccountingPeriodRepository
	journalRepo  repositories.JournalEntryRepository
	chartRepo    *repositories.ChartOfAccountRepository
	auditService *AuditLogService
	glService    *GeneralLedgerService
	db           *gorm.DB
}

func NewFixedAssetDepreciationService(
	repo *repositories.FixedAssetDepreciationRepository,
	assetRepo *repositories.FixedAssetRepository,
	fyRepo *repositories.FinancialYearRepository,
	apRepo *repositories.AccountingPeriodRepository,
	journalRepo repositories.JournalEntryRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	auditService *AuditLogService,
	glService *GeneralLedgerService,
	db *gorm.DB,
) *FixedAssetDepreciationService {
	return &FixedAssetDepreciationService{
		repo:         repo,
		assetRepo:    assetRepo,
		fyRepo:       fyRepo,
		apRepo:       apRepo,
		journalRepo:  journalRepo,
		chartRepo:    chartRepo,
		auditService: auditService,
		glService:    glService,
		db:           db,
	}
}

func (s *FixedAssetDepreciationService) ListDepreciationRuns(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetDepreciationRun, int64, error) {
	return s.repo.FindDepreciationRuns(companyID, branchAccess, filters, page, limit)
}

func (s *FixedAssetDepreciationService) GetDepreciationRunByID(id uint64, companyID uint64) (*models.FixedAssetDepreciationRun, error) {
	return s.repo.FindDepreciationRunByID(id, companyID)
}

func (s *FixedAssetDepreciationService) parseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *FixedAssetDepreciationService) ValidateDepreciationPeriod(companyID uint64, financialYearID uint64, accountingPeriodID uint64, fromDate, toDate time.Time) error {
	finYear, err := s.fyRepo.FindByID(companyID, financialYearID)
	if err != nil {
		return fmt.Errorf("invalid financial year")
	}
	if finYear.Status == "closed" {
		return fmt.Errorf("financial year is closed")
	}

	accPeriod, err := s.apRepo.FindByID(companyID, accountingPeriodID)
	if err != nil {
		return fmt.Errorf("invalid accounting period")
	}
	if accPeriod.Status == "closed" {
		return fmt.Errorf("accounting period is closed")
	}
	if accPeriod.FinancialYearID != financialYearID {
		return fmt.Errorf("accounting period does not belong to financial year")
	}

	if fromDate.Before(accPeriod.StartDate) || toDate.After(accPeriod.EndDate) || fromDate.After(toDate) {
		return fmt.Errorf("depreciation dates must fall within accounting period")
	}

	return nil
}

func (s *FixedAssetDepreciationService) CalculateStraightLineDepreciation(asset *models.FixedAsset, fromDate, toDate time.Time) float64 {
	if asset.DepreciableAmount <= 0 || asset.UsefulLifeMonths <= 0 || asset.AssetStatus != "active" {
		return 0
	}

	if toDate.Before(*asset.DepreciationStartDate) {
		return 0
	}

	// Simplistic monthly depreciation amount calculation
	monthlyDepreciation := asset.DepreciableAmount / float64(asset.UsefulLifeMonths)

	// Ensure we do not depreciate below residual value
	if asset.AccumulatedDepreciation+monthlyDepreciation > asset.DepreciableAmount {
		monthlyDepreciation = asset.DepreciableAmount - asset.AccumulatedDepreciation
	}

	// Round to 2 decimal places
	return math.Round(monthlyDepreciation*100) / 100
}

func (s *FixedAssetDepreciationService) PreviewDepreciation(companyID uint64, req *dto.PreviewDepreciationRequest) ([]models.FixedAssetDepreciationLine, error) {
	fromDate, err := s.parseDate(req.DepreciationFromDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_from_date")
	}
	toDate, err := s.parseDate(req.DepreciationToDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_to_date")
	}

	if err := s.ValidateDepreciationPeriod(companyID, req.FinancialYearID, req.AccountingPeriodID, *fromDate, *toDate); err != nil {
		return nil, err
	}

	eligibleAssets, err := s.repo.GetAssetsEligibleForDepreciation(companyID, req.BranchID, *toDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get eligible assets: %v", err)
	}

	var lines []models.FixedAssetDepreciationLine
	for _, asset := range eligibleAssets {
		// Calculate depreciation amount
		depAmount := s.CalculateStraightLineDepreciation(&asset, *fromDate, *toDate)

		if depAmount > 0 {
			line := models.FixedAssetDepreciationLine{
				FixedAssetID:                     asset.ID,
				AssetCode:                        asset.AssetCode,
				AssetName:                        asset.AssetName,
				DepreciationAmount:               depAmount,
				AccumulatedDepreciationBefore:    asset.AccumulatedDepreciation,
				AccumulatedDepreciationAfter:     asset.AccumulatedDepreciation + depAmount,
				NetBookValueBefore:               asset.NetBookValue,
				NetBookValueAfter:                asset.NetBookValue - depAmount,
				DepreciationExpenseAccountID:     asset.DepreciationExpenseAccountID,
				AccumulatedDepreciationAccountID: asset.AccumulatedDepreciationAccountID,
			}
			lines = append(lines, line)
		}
	}

	return lines, nil
}

func (s *FixedAssetDepreciationService) GenerateDepreciationRunNumber(companyID uint64) (string, error) {
	lastNumber, err := s.repo.GetLastDepreciationRunNumber(companyID)
	if err != nil {
		return "", err
	}

	if lastNumber == "" {
		return "FAD-000001", nil
	}

	var num int
	fmt.Sscanf(lastNumber, "FAD-%06d", &num)
	return fmt.Sprintf("FAD-%06d", num+1), nil
}

func (s *FixedAssetDepreciationService) CreateDepreciationRun(companyID uint64, userID uint64, req *dto.CreateDepreciationRunRequest) (*models.FixedAssetDepreciationRun, error) {
	fromDate, err := s.parseDate(req.DepreciationFromDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_from_date")
	}
	toDate, err := s.parseDate(req.DepreciationToDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_to_date")
	}
	runDate, err := s.parseDate(req.RunDate)
	if err != nil {
		return nil, fmt.Errorf("invalid run_date")
	}

	if err := s.ValidateDepreciationPeriod(companyID, req.FinancialYearID, req.AccountingPeriodID, *fromDate, *toDate); err != nil {
		return nil, err
	}

	previewReq := &dto.PreviewDepreciationRequest{
		BranchID:             req.BranchID,
		FinancialYearID:      req.FinancialYearID,
		AccountingPeriodID:   req.AccountingPeriodID,
		DepreciationFromDate: req.DepreciationFromDate,
		DepreciationToDate:   req.DepreciationToDate,
	}

	lines, err := s.PreviewDepreciation(companyID, previewReq)
	if err != nil {
		return nil, err
	}

	if len(lines) == 0 {
		return nil, fmt.Errorf("no assets eligible for depreciation in this period")
	}

	var totalAmount float64
	for _, l := range lines {
		totalAmount += l.DepreciationAmount
	}

	runNumber, err := s.GenerateDepreciationRunNumber(companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate run number: %v", err)
	}

	run := &models.FixedAssetDepreciationRun{
		CompanyID:               companyID,
		BranchID:                req.BranchID,
		FinancialYearID:         req.FinancialYearID,
		AccountingPeriodID:      req.AccountingPeriodID,
		RunNumber:               runNumber,
		RunDate:                 runDate,
		DepreciationFromDate:    fromDate,
		DepreciationToDate:      toDate,
		TotalDepreciationAmount: totalAmount,
		PostedStatus:            "draft",
		Remarks:                 req.Remarks,
		Status:                  "active",
		CreatedBy:               &userID,
		Lines:                   lines,
	}

	if err := s.repo.CreateDepreciationRunWithLines(run); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DEPRECIATION_RUN_CREATED", "Created Depreciation Run", run.ID)

	return run, nil
}

func (s *FixedAssetDepreciationService) PostDepreciationRun(id uint64, companyID uint64, userID uint64) error {
	run, err := s.repo.FindDepreciationRunByID(id, companyID)
	if err != nil {
		return err
	}

	if run.PostedStatus != "draft" {
		return fmt.Errorf("only draft runs can be posted")
	}

	if err := s.ValidateDepreciationPeriod(companyID, run.FinancialYearID, run.AccountingPeriodID, *run.DepreciationFromDate, *run.DepreciationToDate); err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, line := range run.Lines {
			asset := line.FixedAsset

			// Update Asset Balances
			asset.AccumulatedDepreciation = line.AccumulatedDepreciationAfter
			asset.NetBookValue = line.NetBookValueAfter
			asset.LastDepreciationDate = run.DepreciationToDate

			if asset.NetBookValue <= asset.ResidualValue {
				asset.AssetStatus = "fully_depreciated"
			}

			if err := tx.Save(asset).Error; err != nil {
				return fmt.Errorf("failed to update asset %s: %v", asset.AssetCode, err)
			}

			// Update Chart Accounts
			// Debit Depreciation Expense
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, line.DepreciationExpenseAccountID, companyID, "debit", line.DepreciationAmount); err != nil {
				return err
			}
			// Credit Accumulated Depreciation
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, line.AccumulatedDepreciationAccountID, companyID, "credit", line.DepreciationAmount); err != nil {
				return err
			}
		}

		// General Ledger Posting
		now := time.Now()
		var glEntries []models.GeneralLedgerEntry
		for _, line := range run.Lines {
			// Debit Depreciation Expense
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &line.FixedAsset.BranchID,
				FinancialYearID:    &run.FinancialYearID,
				AccountingPeriodID: &run.AccountingPeriodID,
				TransactionDate:    *run.DepreciationToDate,
				SourceType:         "depreciation_run",
				SourceID:           run.ID,
				SourceNumber:       run.RunNumber,
				AccountID:          line.DepreciationExpenseAccountID,
				Description:        fmt.Sprintf("Depreciation Expense for Asset: %s", line.FixedAsset.AssetCode),
				DebitAmount:        line.DepreciationAmount,
				CreditAmount:       0,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})

			// Credit Accumulated Depreciation
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &line.FixedAsset.BranchID,
				FinancialYearID:    &run.FinancialYearID,
				AccountingPeriodID: &run.AccountingPeriodID,
				TransactionDate:    *run.DepreciationToDate,
				SourceType:         "depreciation_run",
				SourceID:           run.ID,
				SourceNumber:       run.RunNumber,
				AccountID:          line.AccumulatedDepreciationAccountID,
				Description:        fmt.Sprintf("Accumulated Depreciation for Asset: %s", line.FixedAsset.AssetCode),
				DebitAmount:        0,
				CreditAmount:       line.DepreciationAmount,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})
		}

		if err := s.glService.PostLedgerEntries(tx, glEntries); err != nil {
			return err
		}

		now = time.Now()
		if err := tx.Model(&models.FixedAssetDepreciationRun{}).
			Where("id = ? AND company_id = ?", id, companyID).
			Updates(map[string]interface{}{
				"posted_status": "posted",
				"posted_by":     userID,
				"posted_at":     now,
			}).Error; err != nil {
			return err
		}

		s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DEPRECIATION_RUN_POSTED", "Posted Depreciation Run", run.ID)

		return nil
	})
}

func (s *FixedAssetDepreciationService) DeleteDepreciationRun(id uint64, companyID uint64, userID uint64) error {
	run, err := s.repo.FindDepreciationRunByID(id, companyID)
	if err != nil {
		return err
	}

	if run.PostedStatus != "draft" {
		return fmt.Errorf("only draft runs can be deleted")
	}

	if err := s.repo.SoftDeleteDepreciationRun(id, companyID); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DEPRECIATION_RUN_DELETED", "Deleted Depreciation Run", run.ID)

	return nil
}
