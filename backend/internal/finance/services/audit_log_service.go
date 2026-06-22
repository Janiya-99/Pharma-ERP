package services

import (
	"encoding/json"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// AuditLogService is a lightweight audit helper for the finance/services package.
// It uses a simpler signature than the control/services.AuditService so bank,
// cheque-book, and reconciliation services don't need the full control import.
type AuditLogService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewAuditLogService(db *gorm.DB, logger *zap.Logger) *AuditLogService {
	return &AuditLogService{db: db, logger: logger}
}

// LogAction writes a single audit log row.
// action      – e.g. "BANK_ACCOUNT_CREATED"
// description – human-readable description
// entityID    – primary key of the affected row
func (s *AuditLogService) LogAction(companyID, userID uint64, action, description string, entityID uint64) {
	detail, _ := json.Marshal(map[string]interface{}{
		"description": description,
		"entity_id":   entityID,
	})
	detailStr := string(detail)

	audit := models.AuditLog{
		CompanyID:    companyID,
		UserID:       &userID,
		SoftwareCode: "FINANCE",
		Action:       action,
		EntityName:   description,
		EntityID:     &entityID,
		NewValues:    &detailStr,
	}

	if err := s.db.Create(&audit).Error; err != nil {
		s.logger.Error("Failed to write audit log",
			zap.String("action", action),
			zap.Uint64("entity_id", entityID),
			zap.Error(err),
		)
	}
}
