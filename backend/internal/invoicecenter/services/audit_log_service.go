package services

import (
	"encoding/json"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AuditLogService struct {
	logger *zap.Logger
}

func NewAuditLogService(logger *zap.Logger) *AuditLogService {
	return &AuditLogService{logger: logger}
}

func (s *AuditLogService) LogAction(db *gorm.DB, companyID, userID uint64, action, description string, entityID uint64) {
	detail, _ := json.Marshal(map[string]interface{}{
		"description": description,
		"entity_id":   entityID,
	})
	detailStr := string(detail)

	audit := models.AuditLog{
		CompanyID:    companyID,
		UserID:       &userID,
		SoftwareCode: "INVOICE_CENTER",
		Action:       action,
		EntityName:   description,
		EntityID:     &entityID,
		NewValues:    &detailStr,
	}

	if err := db.Create(&audit).Error; err != nil {
		s.logger.Error("Failed to write invoice center audit log",
			zap.String("action", action),
			zap.Uint64("entity_id", entityID),
			zap.Error(err),
		)
	}
}
