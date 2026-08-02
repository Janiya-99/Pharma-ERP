package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type AccountGroupService struct {
	repo     *repositories.AccountGroupRepository
	auditSvc *AuditLogService
}

func NewAccountGroupService(repo *repositories.AccountGroupRepository, auditSvc *AuditLogService) *AccountGroupService {
	return &AccountGroupService{repo: repo, auditSvc: auditSvc}
}

func (s *AccountGroupService) List(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.AccountGroup, int64, error) {
	return s.repo.List(companyID, filters, page, limit)
}

func (s *AccountGroupService) GetByID(companyID, id uint64) (*models.AccountGroup, error) {
	return s.repo.FindByID(companyID, id)
}

func (s *AccountGroupService) Create(companyID, userID uint64, req dto.CreateAccountGroupRequest) (*models.AccountGroup, error) {
	if err := s.validate(companyID, 0, req.AccountType, req.ParentGroupID); err != nil {
		return nil, err
	}

	group := &models.AccountGroup{
		CompanyID:     companyID,
		GroupCode:     strings.TrimSpace(req.GroupCode),
		GroupName:     strings.TrimSpace(req.GroupName),
		AccountType:   req.AccountType,
		ParentGroupID: req.ParentGroupID,
		Description:   req.Description,
		Status:        req.Status,
		CreatedBy:     &userID,
		UpdatedBy:     &userID,
	}
	if group.Status == "" {
		group.Status = "active"
	}

	if err := s.repo.Create(group); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "ACCOUNT_GROUP_CREATED", fmt.Sprintf("Created account group %s", group.GroupCode), group.ID)
	return group, nil
}

func (s *AccountGroupService) Update(companyID, userID, id uint64, req dto.UpdateAccountGroupRequest) (*models.AccountGroup, error) {
	group, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("account group not found")
	}

	if err := s.validate(companyID, id, req.AccountType, req.ParentGroupID); err != nil {
		return nil, err
	}

	group.GroupCode = strings.TrimSpace(req.GroupCode)
	group.GroupName = strings.TrimSpace(req.GroupName)
	group.AccountType = req.AccountType
	group.ParentGroupID = req.ParentGroupID
	group.Description = req.Description
	group.Status = req.Status
	group.UpdatedBy = &userID

	if err := s.repo.Update(group); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "ACCOUNT_GROUP_UPDATED", fmt.Sprintf("Updated account group %s", group.GroupCode), group.ID)
	return group, nil
}

func (s *AccountGroupService) Deactivate(companyID, userID, id uint64) (*models.AccountGroup, error) {
	group, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("account group not found")
	}

	group.Status = "inactive"
	group.UpdatedBy = &userID

	if err := s.repo.Update(group); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "ACCOUNT_GROUP_DEACTIVATED", fmt.Sprintf("Deactivated account group %s", group.GroupCode), group.ID)
	return group, nil
}

func (s *AccountGroupService) validate(companyID, currentID uint64, accountType string, parentID *uint64) error {
	validTypes := map[string]bool{
		"asset":     true,
		"liability": true,
		"equity":    true,
		"income":    true,
		"expense":   true,
	}
	if !validTypes[accountType] {
		return errors.New("account_type must be asset, liability, equity, income, or expense")
	}

	if parentID == nil {
		return nil
	}
	if currentID > 0 && *parentID == currentID {
		return errors.New("parent group cannot be the same account group")
	}

	parent, err := s.repo.FindByID(companyID, *parentID)
	if err != nil {
		return errors.New("parent account group not found")
	}
	if parent.AccountType != accountType {
		return errors.New("parent account group must use the same account type")
	}
	if parent.Status != "active" {
		return errors.New("parent account group must be active")
	}

	return nil
}
