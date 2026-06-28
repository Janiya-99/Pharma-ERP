package service

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// AuditService logs all sensitive actions for compliance.
// All finance create/update/delete/approve actions MUST be audit-logged.
type AuditService struct {
	repo   *repository.AuditRepository
	logger *zap.Logger
}

func NewAuditService(repo *repository.AuditRepository, logger *zap.Logger) *AuditService {
	return &AuditService{repo: repo, logger: logger}
}

// LogAction creates an audit log entry from the Gin context.
// Can operate within a transaction (pass tx) or standalone (pass nil).
func (s *AuditService) LogAction(c *gin.Context, tx *gorm.DB, params AuditParams) {
	var uid, cid, bid uint64
	if v, ok := c.Get("user_id"); ok && v != nil {
		if val, ok := v.(uint64); ok {
			uid = val
		}
	}
	if v, ok := c.Get("company_id"); ok && v != nil {
		if val, ok := v.(uint64); ok {
			cid = val
		}
	}
	if v, ok := c.Get("branch_id"); ok && v != nil {
		if val, ok := v.(uint64); ok {
			bid = val
		}
	}

	var oldJSON, newJSON json.RawMessage
	if params.OldValues != nil {
		data, _ := json.Marshal(params.OldValues)
		oldJSON = data
	}
	if params.NewValues != nil {
		data, _ := json.Marshal(params.NewValues)
		newJSON = data
	}

	log := &model.AuditLog{
		UserID:     uid,
		CompanyID:  cid,
		BranchID:   bid,
		Module:     params.Module,
		Action:     params.Action,
		EntityType: params.EntityType,
		EntityID:   params.EntityID,
		OldValues:  oldJSON,
		NewValues:  newJSON,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
	}

	if err := s.repo.Create(tx, log); err != nil {
		// Log the error but don't fail the parent operation
		s.logger.Error("failed to create audit log",
			zap.String("module", params.Module),
			zap.String("action", params.Action),
			zap.String("entity_type", params.EntityType),
			zap.Uint64("entity_id", params.EntityID),
			zap.Error(err),
		)
	}
}

// AuditParams holds the parameters for creating an audit log entry.
type AuditParams struct {
	Module     string
	Action     string
	EntityType string
	EntityID   uint64
	OldValues  interface{}
	NewValues  interface{}
}
