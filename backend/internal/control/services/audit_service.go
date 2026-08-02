package services

import (
	"encoding/json"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AuditService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewAuditService(db *gorm.DB, logger *zap.Logger) *AuditService {
	return &AuditService{db: db, logger: logger}
}

func (s *AuditService) LogAction(companyID uint64, branchID, userID *uint64, softwareCode, action, entityName string, entityID *uint64, oldValues, newValues interface{}, ipAddress, userAgent string) {
	var oldStr, newStr *string

	if oldValues != nil {
		if b, err := json.Marshal(oldValues); err == nil {
			str := string(b)
			oldStr = &str
		}
	}

	if newValues != nil {
		if b, err := json.Marshal(newValues); err == nil {
			str := string(b)
			newStr = &str
		}
	}

	audit := models.AuditLog{
		CompanyID:    companyID,
		BranchID:     branchID,
		UserID:       userID,
		SoftwareCode: softwareCode,
		Action:       action,
		EntityName:   entityName,
		EntityID:     entityID,
		OldValues:    oldStr,
		NewValues:    newStr,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
	}

	if err := s.db.Create(&audit).Error; err != nil {
		s.logger.Error("Failed to write audit log", zap.Error(err), zap.String("action", action))
	}
}
