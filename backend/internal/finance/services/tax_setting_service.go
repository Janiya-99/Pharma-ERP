package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type TaxSettingService struct {
	repo     *repositories.TaxSettingRepository
	coaRepo  *repositories.ChartOfAccountRepository
	auditSvc *AuditLogService
}

func NewTaxSettingService(repo *repositories.TaxSettingRepository, coaRepo *repositories.ChartOfAccountRepository, auditSvc *AuditLogService) *TaxSettingService {
	return &TaxSettingService{repo: repo, coaRepo: coaRepo, auditSvc: auditSvc}
}

func (s *TaxSettingService) List(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.TaxSetting, int64, error) {
	return s.repo.List(companyID, filters, page, limit)
}

func (s *TaxSettingService) GetByID(companyID, id uint64) (*models.TaxSetting, error) {
	return s.repo.FindByID(companyID, id)
}

func (s *TaxSettingService) Create(companyID, userID uint64, req dto.CreateTaxSettingRequest) (*models.TaxSetting, error) {
	if err := s.validateAccount(companyID, req.TaxAccountID); err != nil {
		return nil, err
	}

	setting := &models.TaxSetting{
		CompanyID:    companyID,
		TaxCode:      strings.TrimSpace(req.TaxCode),
		TaxName:      strings.TrimSpace(req.TaxName),
		TaxRate:      req.TaxRate,
		TaxAccountID: req.TaxAccountID,
		Description:  req.Description,
		Status:       req.Status,
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
	}
	if setting.Status == "" {
		setting.Status = "active"
	}

	if err := s.repo.Create(setting); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "TAX_SETTING_CREATED", fmt.Sprintf("Created tax setting %s", setting.TaxCode), setting.ID)
	return setting, nil
}

func (s *TaxSettingService) Update(companyID, userID, id uint64, req dto.UpdateTaxSettingRequest) (*models.TaxSetting, error) {
	setting, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("tax setting not found")
	}
	if err := s.validateAccount(companyID, req.TaxAccountID); err != nil {
		return nil, err
	}

	setting.TaxCode = strings.TrimSpace(req.TaxCode)
	setting.TaxName = strings.TrimSpace(req.TaxName)
	setting.TaxRate = req.TaxRate
	setting.TaxAccountID = req.TaxAccountID
	setting.Description = req.Description
	setting.Status = req.Status
	setting.UpdatedBy = &userID

	if err := s.repo.Update(setting); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "TAX_SETTING_UPDATED", fmt.Sprintf("Updated tax setting %s", setting.TaxCode), setting.ID)
	return setting, nil
}

func (s *TaxSettingService) Deactivate(companyID, userID, id uint64) (*models.TaxSetting, error) {
	setting, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("tax setting not found")
	}

	setting.Status = "inactive"
	setting.UpdatedBy = &userID

	if err := s.repo.Update(setting); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "TAX_SETTING_DEACTIVATED", fmt.Sprintf("Deactivated tax setting %s", setting.TaxCode), setting.ID)
	return setting, nil
}

func (s *TaxSettingService) validateAccount(companyID uint64, accountID *uint64) error {
	if accountID == nil || *accountID == 0 {
		return nil
	}
	account, err := s.coaRepo.FindByID(companyID, *accountID)
	if err != nil || account.Status != "active" {
		return errors.New("tax account must be an active chart of account")
	}
	return nil
}
