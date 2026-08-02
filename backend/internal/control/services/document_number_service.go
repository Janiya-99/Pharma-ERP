package services

import (
	"fmt"
	"strings"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DocumentNumberService struct {
	repo         *repositories.DocumentNumberingRepository
	auditService *AuditService
	logger       *zap.Logger
}

func NewDocumentNumberService(repo *repositories.DocumentNumberingRepository, auditService *AuditService, logger *zap.Logger) *DocumentNumberService {
	return &DocumentNumberService{
		repo:         repo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *DocumentNumberService) ListRules(companyID uint64, module string, status string) ([]models.DocumentNumberingRule, error) {
	return s.repo.ListRules(companyID, module, status)
}

func (s *DocumentNumberService) SaveRule(rule *models.DocumentNumberingRule, activeUserID uint64, ipAddress, userAgent string) (*models.DocumentNumberingRule, error) {
	now := time.Now()
	var oldVal interface{}
	if rule.ID != 0 {
		oldRule, _ := s.repo.GetByID(rule.ID)
		if oldRule != nil {
			oldVal = *oldRule
		}
		rule.UpdatedBy = activeUserID
		rule.UpdatedAt = now
	} else {
		rule.CreatedBy = activeUserID
		rule.UpdatedBy = activeUserID
		rule.CreatedAt = now
		rule.UpdatedAt = now
		rule.VersionNumber = 1
	}

	if rule.Status == "published" {
		rule.PublishedBy = &activeUserID
		rule.PublishedAt = &now
	}

	if err := s.repo.SaveRule(rule); err != nil {
		return nil, err
	}

	s.auditService.LogAction(
		rule.CompanyID,
		rule.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"DOCUMENT_NUMBERING_RULE_SAVED",
		"document_numbering_rules",
		&rule.ID,
		oldVal,
		rule,
		ipAddress,
		userAgent,
	)

	return rule, nil
}

func (s *DocumentNumberService) DeleteRule(id uint64, activeUserID uint64, ipAddress, userAgent string) error {
	rule, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteRule(id); err != nil {
		return err
	}
	s.auditService.LogAction(
		rule.CompanyID,
		rule.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"DOCUMENT_NUMBERING_RULE_DELETED",
		"document_numbering_rules",
		&id,
		rule,
		nil,
		ipAddress,
		userAgent,
	)
	return nil
}

// GenerateNextDocumentNumber generates an atomic sequential number based on rule and frequency
func (s *DocumentNumberService) GenerateNextDocumentNumber(companyID uint64, branchID uint64, module string, docType string, docDate time.Time, financialYearKey string) (string, error) {
	rule, err := s.repo.GetRuleForDocument(companyID, &branchID, module, docType)
	if err != nil {
		// Fallback default format if no published rule exists
		prefix := fmt.Sprintf("%s-", strings.ToUpper(docType[:3]))
		return fmt.Sprintf("%s%d", prefix, time.Now().UnixNano()%1000000), nil
	}

	periodKey := "ALL"
	switch rule.ResetFrequency {
	case "daily":
		periodKey = docDate.Format("2006-01-02")
	case "monthly":
		periodKey = docDate.Format("2006-01")
	case "yearly":
		periodKey = docDate.Format("2006")
	case "financial_year":
		if financialYearKey != "" {
			periodKey = financialYearKey
		} else {
			// default FY based on April-March corporate year
			year := docDate.Year()
			if docDate.Month() < time.April {
				year--
			}
			periodKey = fmt.Sprintf("FY%d", year)
		}
	}

	var nextNum int64
	err = s.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		var txErr error
		nextNum, txErr = s.repo.GetAndIncrementSequence(tx, companyID, branchID, rule.ID, module, docType, periodKey)
		return txErr
	})
	if err != nil {
		return "", err
	}

	padding := rule.Padding
	if padding < 1 {
		padding = 6
	}

	formatStr := fmt.Sprintf("%%s%%0%dd%%s", padding)
	return fmt.Sprintf(formatStr, rule.Prefix, nextNum, rule.Suffix), nil
}

func (s *DocumentNumberService) PreviewDocumentNumber(rule models.DocumentNumberingRule, docDate time.Time) string {
	padding := rule.Padding
	if padding < 1 {
		padding = 6
	}
	formatStr := fmt.Sprintf("%%s%%0%dd%%s", padding)
	return fmt.Sprintf(formatStr, rule.Prefix, 1, rule.Suffix)
}
