package services

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type FixedAssetService struct {
	repo         *repositories.FixedAssetRepository
	categoryRepo *repositories.FixedAssetCategoryRepository
	auditService *AuditLogService
	chartRepo    *repositories.ChartOfAccountRepository
}

func NewFixedAssetService(repo *repositories.FixedAssetRepository, categoryRepo *repositories.FixedAssetCategoryRepository, auditService *AuditLogService, chartRepo *repositories.ChartOfAccountRepository) *FixedAssetService {
	return &FixedAssetService{
		repo:         repo,
		categoryRepo: categoryRepo,
		auditService: auditService,
		chartRepo:    chartRepo,
	}
}

func (s *FixedAssetService) ListFixedAssets(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAsset, int64, error) {
	return s.repo.FindFixedAssets(companyID, branchAccess, filters, page, limit)
}

func (s *FixedAssetService) GetFixedAssetByID(id uint64, companyID uint64) (*models.FixedAsset, error) {
	return s.repo.FindFixedAssetByID(id, companyID)
}

func (s *FixedAssetService) ValidateFixedAssetAccounts(companyID uint64, req *dto.CreateFixedAssetRequest) error {
	accountIDs := []uint64{
		req.AssetAccountID,
		req.AccumulatedDepreciationAccountID,
		req.DepreciationExpenseAccountID,
	}
	if req.GainOnDisposalAccountID != nil {
		accountIDs = append(accountIDs, *req.GainOnDisposalAccountID)
	}
	if req.LossOnDisposalAccountID != nil {
		accountIDs = append(accountIDs, *req.LossOnDisposalAccountID)
	}

	for _, accID := range accountIDs {
		account, err := s.chartRepo.FindByID(companyID, accID)
		if err != nil {
			return fmt.Errorf("invalid chart of account: %v", err)
		}
		if account.Status != "active" {
			return fmt.Errorf("chart of account %s is not active", account.AccountCode)
		}
	}
	return nil
}

func (s *FixedAssetService) CalculateDepreciableAmount(acquisitionCost, residualValue float64) float64 {
	amount := acquisitionCost - residualValue
	if amount < 0 {
		return 0
	}
	return amount
}

func (s *FixedAssetService) CalculateNetBookValue(acquisitionCost, accumulatedDepreciation float64) float64 {
	return acquisitionCost - accumulatedDepreciation
}

func (s *FixedAssetService) parseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *FixedAssetService) CreateFixedAsset(companyID uint64, userID uint64, req *dto.CreateFixedAssetRequest) (*models.FixedAsset, error) {
	if err := s.ValidateFixedAssetAccounts(companyID, req); err != nil {
		return nil, err
	}

	category, err := s.categoryRepo.FindFixedAssetCategoryByID(req.FixedAssetCategoryID, companyID)
	if err != nil {
		return nil, fmt.Errorf("invalid fixed asset category: %v", err)
	}
	if category.Status != "active" {
		return nil, fmt.Errorf("fixed asset category is not active")
	}

	purchaseDate, err := s.parseDate(req.PurchaseDate)
	if err != nil {
		return nil, fmt.Errorf("invalid purchase_date format")
	}
	acquisitionDate, err := s.parseDate(req.AcquisitionDate)
	if err != nil {
		return nil, fmt.Errorf("invalid acquisition_date format")
	}
	depreciationStartDate, err := s.parseDate(req.DepreciationStartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_start_date format")
	}

	if depreciationStartDate.Before(*acquisitionDate) {
		return nil, fmt.Errorf("depreciation_start_date must be on or after acquisition_date")
	}

	depMethod := req.DepreciationMethod
	if depMethod == "" {
		depMethod = "straight_line"
	}

	depreciableAmount := s.CalculateDepreciableAmount(req.AcquisitionCost, req.ResidualValue)
	netBookValue := s.CalculateNetBookValue(req.AcquisitionCost, 0)

	asset := &models.FixedAsset{
		CompanyID:                        companyID,
		BranchID:                         req.BranchID,
		FixedAssetCategoryID:             req.FixedAssetCategoryID,
		AssetCode:                        req.AssetCode,
		AssetName:                        req.AssetName,
		Description:                      req.Description,
		SerialNumber:                     req.SerialNumber,
		ModelNumber:                      req.ModelNumber,
		Manufacturer:                     req.Manufacturer,
		PurchaseDate:                     purchaseDate,
		AcquisitionDate:                  acquisitionDate,
		SupplierName:                     req.SupplierName,
		InvoiceNumber:                    req.InvoiceNumber,
		AcquisitionCost:                  req.AcquisitionCost,
		ResidualValue:                    req.ResidualValue,
		DepreciableAmount:                depreciableAmount,
		UsefulLifeMonths:                 req.UsefulLifeMonths,
		DepreciationMethod:               depMethod,
		DepreciationStartDate:            depreciationStartDate,
		AssetAccountID:                   req.AssetAccountID,
		AccumulatedDepreciationAccountID: req.AccumulatedDepreciationAccountID,
		DepreciationExpenseAccountID:     req.DepreciationExpenseAccountID,
		GainOnDisposalAccountID:          req.GainOnDisposalAccountID,
		LossOnDisposalAccountID:          req.LossOnDisposalAccountID,
		AccumulatedDepreciation:          0,
		NetBookValue:                     netBookValue,
		AssetStatus:                      "active",
		Status:                           req.Status,
		CreatedBy:                        &userID,
	}

	if err := s.repo.CreateFixedAsset(asset); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_CREATED", "Created Fixed Asset", asset.ID)

	return asset, nil
}

func (s *FixedAssetService) UpdateFixedAsset(id uint64, companyID uint64, userID uint64, req *dto.UpdateFixedAssetRequest) (*models.FixedAsset, error) {
	asset, err := s.repo.FindFixedAssetByID(id, companyID)
	if err != nil {
		return nil, err
	}

	if asset.AssetStatus != "active" {
		return nil, fmt.Errorf("only active assets can be updated")
	}

	if asset.AccumulatedDepreciation > 0 {
		if asset.AcquisitionCost != req.AcquisitionCost {
			return nil, fmt.Errorf("cannot change acquisition_cost after depreciation has started")
		}
		if asset.AssetAccountID != req.AssetAccountID ||
			asset.AccumulatedDepreciationAccountID != req.AccumulatedDepreciationAccountID ||
			asset.DepreciationExpenseAccountID != req.DepreciationExpenseAccountID {
			return nil, fmt.Errorf("cannot change accounts after depreciation has started")
		}
	}

	// Validate accounts mapping via dummy request
	dummyReq := &dto.CreateFixedAssetRequest{
		AssetAccountID:                   req.AssetAccountID,
		AccumulatedDepreciationAccountID: req.AccumulatedDepreciationAccountID,
		DepreciationExpenseAccountID:     req.DepreciationExpenseAccountID,
		GainOnDisposalAccountID:          req.GainOnDisposalAccountID,
		LossOnDisposalAccountID:          req.LossOnDisposalAccountID,
	}
	if err := s.ValidateFixedAssetAccounts(companyID, dummyReq); err != nil {
		return nil, err
	}

	purchaseDate, err := s.parseDate(req.PurchaseDate)
	if err != nil {
		return nil, fmt.Errorf("invalid purchase_date format")
	}
	acquisitionDate, err := s.parseDate(req.AcquisitionDate)
	if err != nil {
		return nil, fmt.Errorf("invalid acquisition_date format")
	}
	depreciationStartDate, err := s.parseDate(req.DepreciationStartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid depreciation_start_date format")
	}

	if depreciationStartDate.Before(*acquisitionDate) {
		return nil, fmt.Errorf("depreciation_start_date must be on or after acquisition_date")
	}

	depMethod := req.DepreciationMethod
	if depMethod == "" {
		depMethod = "straight_line"
	}

	depreciableAmount := s.CalculateDepreciableAmount(req.AcquisitionCost, req.ResidualValue)
	netBookValue := s.CalculateNetBookValue(req.AcquisitionCost, asset.AccumulatedDepreciation)

	asset.AssetName = req.AssetName
	asset.Description = req.Description
	asset.SerialNumber = req.SerialNumber
	asset.ModelNumber = req.ModelNumber
	asset.Manufacturer = req.Manufacturer
	asset.PurchaseDate = purchaseDate
	asset.AcquisitionDate = acquisitionDate
	asset.SupplierName = req.SupplierName
	asset.InvoiceNumber = req.InvoiceNumber
	asset.AcquisitionCost = req.AcquisitionCost
	asset.ResidualValue = req.ResidualValue
	asset.DepreciableAmount = depreciableAmount
	asset.UsefulLifeMonths = req.UsefulLifeMonths
	asset.DepreciationMethod = depMethod
	asset.DepreciationStartDate = depreciationStartDate
	asset.AssetAccountID = req.AssetAccountID
	asset.AccumulatedDepreciationAccountID = req.AccumulatedDepreciationAccountID
	asset.DepreciationExpenseAccountID = req.DepreciationExpenseAccountID
	asset.GainOnDisposalAccountID = req.GainOnDisposalAccountID
	asset.LossOnDisposalAccountID = req.LossOnDisposalAccountID
	asset.NetBookValue = netBookValue
	asset.Status = req.Status
	asset.UpdatedBy = &userID

	if err := s.repo.UpdateFixedAsset(asset); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_UPDATED", "Updated Fixed Asset", asset.ID)

	return asset, nil
}

func (s *FixedAssetService) DeleteFixedAsset(id uint64, companyID uint64, userID uint64) error {
	asset, err := s.repo.FindFixedAssetByID(id, companyID)
	if err != nil {
		return err
	}

	if asset.AssetStatus != "active" {
		return fmt.Errorf("only active assets can be deleted")
	}

	if asset.AccumulatedDepreciation > 0 {
		return fmt.Errorf("cannot delete asset with depreciation history")
	}

	if err := s.repo.SoftDeleteFixedAsset(id, companyID); err != nil {
		return fmt.Errorf("could not delete asset, ensure no disposals are linked: %v", err)
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DELETED", "Deleted Fixed Asset", asset.ID)

	return nil
}
