package services

import (
	"errors"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"go.uber.org/zap"
)

type AccountClassificationService struct {
	repo         *repositories.AccountClassificationRepository
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewAccountClassificationService(repo *repositories.AccountClassificationRepository, auditService *services.AuditService, logger *zap.Logger) *AccountClassificationService {
	return &AccountClassificationService{repo: repo, auditService: auditService, logger: logger}
}

func (s *AccountClassificationService) ListTree(companyID uint64) ([]models.AccountClassification, error) {
	return s.repo.ListTree(companyID)
}

func (s *AccountClassificationService) List(companyID uint64, filters map[string]interface{}) ([]models.AccountClassification, error) {
	return s.repo.List(companyID, filters)
}

func (s *AccountClassificationService) Create(companyID, userID uint64, req *dto.CreateAccountClassificationRequest) (*models.AccountClassification, error) {
	if req.Level == 1 && req.ParentID != nil {
		return nil, errors.New("level 1 classifications cannot have a parent")
	}
	if (req.Level == 2 || req.Level == 3) && req.ParentID == nil {
		return nil, errors.New("level 2 and 3 classifications must have a parent")
	}
	if req.NormalBalance != "Debit" && req.NormalBalance != "Credit" {
		return nil, errors.New("normal_balance must be Debit or Credit")
	}

	if req.ParentID != nil {
		parent, err := s.repo.FindByID(companyID, *req.ParentID)
		if err != nil {
			return nil, errors.New("parent classification not found")
		}
		if parent.Level != req.Level-1 {
			return nil, errors.New("parent level must be exactly one level above child level")
		}
	}

	ac := &models.AccountClassification{
		CompanyID:     companyID,
		Type:          req.Type,
		Name:          req.Name,
		ParentID:      req.ParentID,
		Level:         req.Level,
		NormalBalance: req.NormalBalance,
		ReportSection: req.ReportSection,
		SortOrder:     req.SortOrder,
		Status:        req.Status,
		CreatedBy:     &userID,
	}

	if err := s.repo.Create(ac); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "ACCOUNT_CLASSIFICATION_CREATED", "account_classifications", ac.ID, fmt.Sprintf("Created account classification %s", ac.Name))

	return ac, nil
}

func (s *AccountClassificationService) Update(companyID, id, userID uint64, req *dto.UpdateAccountClassificationRequest) (*models.AccountClassification, error) {
	ac, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("account classification not found")
	}

	if req.Level == 1 && req.ParentID != nil {
		return nil, errors.New("level 1 classifications cannot have a parent")
	}
	if (req.Level == 2 || req.Level == 3) && req.ParentID == nil {
		return nil, errors.New("level 2 and 3 classifications must have a parent")
	}
	if req.NormalBalance != "Debit" && req.NormalBalance != "Credit" {
		return nil, errors.New("normal_balance must be Debit or Credit")
	}

	if req.ParentID != nil {
		if *req.ParentID == ac.ID {
			return nil, errors.New("cannot set self as parent")
		}
		parent, err := s.repo.FindByID(companyID, *req.ParentID)
		if err != nil {
			return nil, errors.New("parent classification not found")
		}
		if parent.Level != req.Level-1 {
			return nil, errors.New("parent level must be exactly one level above child level")
		}
	}

	ac.Type = req.Type
	ac.Name = req.Name
	ac.ParentID = req.ParentID
	ac.Level = req.Level
	ac.NormalBalance = req.NormalBalance
	ac.ReportSection = req.ReportSection
	ac.SortOrder = req.SortOrder
	ac.Status = req.Status
	ac.UpdatedBy = &userID

	if err := s.repo.Update(ac); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "ACCOUNT_CLASSIFICATION_UPDATED", "account_classifications", ac.ID, fmt.Sprintf("Updated account classification %s", ac.Name))

	return ac, nil
}

func (s *AccountClassificationService) Delete(companyID, id, userID uint64) error {
	ac, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return errors.New("account classification not found")
	}

	count, err := s.repo.CountChildren(companyID, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cannot delete classification with child classifications")
	}

	ac.UpdatedBy = &userID
	s.repo.Update(ac)

	if err := s.repo.Delete(ac); err != nil {
		return err
	}

	s.logAudit(companyID, userID, "ACCOUNT_CLASSIFICATION_DELETED", "account_classifications", ac.ID, fmt.Sprintf("Deleted account classification %s", ac.Name))

	return nil
}

func (s *AccountClassificationService) logAudit(companyID, userID uint64, action, entityName string, entityID uint64, description string) {
	s.auditService.LogAction(companyID, nil, &userID, "FINANCE", action, entityName, &entityID, nil, description, "", "")
}
