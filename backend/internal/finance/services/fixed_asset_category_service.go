package services

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type FixedAssetCategoryService struct {
	repo         *repositories.FixedAssetCategoryRepository
	auditService *AuditLogService
	chartRepo    *repositories.ChartOfAccountRepository
}

func NewFixedAssetCategoryService(repo *repositories.FixedAssetCategoryRepository, auditService *AuditLogService, chartRepo *repositories.ChartOfAccountRepository) *FixedAssetCategoryService {
	return &FixedAssetCategoryService{
		repo:         repo,
		auditService: auditService,
		chartRepo:    chartRepo,
	}
}

func (s *FixedAssetCategoryService) ListFixedAssetCategories(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetCategory, int64, error) {
	return s.repo.FindFixedAssetCategories(companyID, filters, page, limit)
}

func (s *FixedAssetCategoryService) GetFixedAssetCategoryByID(id uint64, companyID uint64) (*models.FixedAssetCategory, error) {
	return s.repo.FindFixedAssetCategoryByID(id, companyID)
}

func (s *FixedAssetCategoryService) ValidateFixedAssetCategoryAccounts(companyID uint64, req *dto.CreateFixedAssetCategoryRequest) error {
	accountIDs := []uint64{
		req.DefaultAssetAccountID,
		req.DefaultAccumulatedDepreciationAccountID,
		req.DefaultDepreciationExpenseAccountID,
	}
	if req.DefaultGainOnDisposalAccountID != nil {
		accountIDs = append(accountIDs, *req.DefaultGainOnDisposalAccountID)
	}
	if req.DefaultLossOnDisposalAccountID != nil {
		accountIDs = append(accountIDs, *req.DefaultLossOnDisposalAccountID)
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

func (s *FixedAssetCategoryService) CreateFixedAssetCategory(companyID uint64, userID uint64, req *dto.CreateFixedAssetCategoryRequest) (*models.FixedAssetCategory, error) {
	if err := s.ValidateFixedAssetCategoryAccounts(companyID, req); err != nil {
		return nil, err
	}

	depMethod := req.DefaultDepreciationMethod
	if depMethod == "" {
		depMethod = "straight_line"
	}

	category := &models.FixedAssetCategory{
		CompanyID:                               companyID,
		CategoryCode:                            req.CategoryCode,
		CategoryName:                            req.CategoryName,
		Description:                             req.Description,
		DefaultAssetAccountID:                   req.DefaultAssetAccountID,
		DefaultAccumulatedDepreciationAccountID: req.DefaultAccumulatedDepreciationAccountID,
		DefaultDepreciationExpenseAccountID:     req.DefaultDepreciationExpenseAccountID,
		DefaultGainOnDisposalAccountID:          req.DefaultGainOnDisposalAccountID,
		DefaultLossOnDisposalAccountID:          req.DefaultLossOnDisposalAccountID,
		DefaultUsefulLifeMonths:                 req.DefaultUsefulLifeMonths,
		DefaultDepreciationMethod:               depMethod,
		Status:                                  req.Status,
		CreatedBy:                               &userID,
	}

	if err := s.repo.CreateFixedAssetCategory(category); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_CATEGORY_CREATED", "Created Fixed Asset Category", category.ID)

	return category, nil
}

func (s *FixedAssetCategoryService) UpdateFixedAssetCategory(id uint64, companyID uint64, userID uint64, req *dto.UpdateFixedAssetCategoryRequest) (*models.FixedAssetCategory, error) {
	category, err := s.repo.FindFixedAssetCategoryByID(id, companyID)
	if err != nil {
		return nil, err
	}

	// Validate accounts mapping via dummy request
	dummyReq := &dto.CreateFixedAssetCategoryRequest{
		DefaultAssetAccountID:                   req.DefaultAssetAccountID,
		DefaultAccumulatedDepreciationAccountID: req.DefaultAccumulatedDepreciationAccountID,
		DefaultDepreciationExpenseAccountID:     req.DefaultDepreciationExpenseAccountID,
		DefaultGainOnDisposalAccountID:          req.DefaultGainOnDisposalAccountID,
		DefaultLossOnDisposalAccountID:          req.DefaultLossOnDisposalAccountID,
	}
	if err := s.ValidateFixedAssetCategoryAccounts(companyID, dummyReq); err != nil {
		return nil, err
	}

	depMethod := req.DefaultDepreciationMethod
	if depMethod == "" {
		depMethod = "straight_line"
	}

	category.CategoryName = req.CategoryName
	category.Description = req.Description
	category.DefaultAssetAccountID = req.DefaultAssetAccountID
	category.DefaultAccumulatedDepreciationAccountID = req.DefaultAccumulatedDepreciationAccountID
	category.DefaultDepreciationExpenseAccountID = req.DefaultDepreciationExpenseAccountID
	category.DefaultGainOnDisposalAccountID = req.DefaultGainOnDisposalAccountID
	category.DefaultLossOnDisposalAccountID = req.DefaultLossOnDisposalAccountID
	category.DefaultUsefulLifeMonths = req.DefaultUsefulLifeMonths
	category.DefaultDepreciationMethod = depMethod
	category.Status = req.Status
	category.UpdatedBy = &userID

	if err := s.repo.UpdateFixedAssetCategory(category); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_CATEGORY_UPDATED", "Updated Fixed Asset Category", category.ID)

	return category, nil
}

func (s *FixedAssetCategoryService) DeleteFixedAssetCategory(id uint64, companyID uint64, userID uint64) error {
	category, err := s.repo.FindFixedAssetCategoryByID(id, companyID)
	if err != nil {
		return err
	}

	if err := s.repo.SoftDeleteFixedAssetCategory(id, companyID); err != nil {
		// Will fail due to foreign key if fixed assets exist
		return fmt.Errorf("could not delete category, ensure no assets are linked: %v", err)
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_CATEGORY_DELETED", "Deleted Fixed Asset Category", category.ID)

	return nil
}
