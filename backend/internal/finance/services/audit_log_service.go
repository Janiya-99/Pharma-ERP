package services

import (
	"encoding/json"
	"time"

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
	s.LogActionWithContext(companyID, nil, userID, action, description, entityID, "", "")
}

// LogActionWithContext writes a single audit log row with full enterprise context (branch, IP, user agent).
func (s *AuditLogService) LogActionWithContext(companyID uint64, branchID *uint64, userID uint64, action, description string, entityID uint64, ipAddress, userAgent string) {
	if branchID == nil || *branchID == 0 {
		var u models.User
		if err := s.db.Where("id = ?", userID).First(&u).Error; err == nil && u.DefaultBranchID != nil && *u.DefaultBranchID != 0 {
			branchID = u.DefaultBranchID
		}
		if branchID == nil || *branchID == 0 {
			var b models.Branch
			if err := s.db.Where("company_id = ?", companyID).Order("id ASC").First(&b).Error; err == nil && b.ID != 0 {
				defaultBid := b.ID
				branchID = &defaultBid
			}
		}
	}
	if ipAddress == "" {
		ipAddress = "127.0.0.1"
	}
	if entityID == 0 {
		entityID = uint64(time.Now().Unix())
	}

	detail, _ := json.Marshal(map[string]interface{}{
		"description": description,
		"entity_id":   entityID,
	})
	detailStr := string(detail)

	audit := models.AuditLog{
		CompanyID:    companyID,
		BranchID:     branchID,
		UserID:       &userID,
		SoftwareCode: "FINANCE",
		Action:       action,
		EntityName:   description,
		EntityID:     &entityID,
		NewValues:    &detailStr,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
	}

	if err := s.db.Create(&audit).Error; err != nil {
		s.logger.Error("Failed to write audit log",
			zap.String("action", action),
			zap.Uint64("entity_id", entityID),
			zap.Error(err),
		)
	}
}

