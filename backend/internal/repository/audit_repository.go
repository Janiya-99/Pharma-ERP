package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// AuditRepository handles audit log data access.
// Audit logs are INSERT-ONLY — never update or delete.
type AuditRepository struct {
	db *gorm.DB
}

func NewAuditRepository(db *gorm.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

// Create inserts a new audit log entry.
func (r *AuditRepository) Create(db *gorm.DB, log *model.AuditLog) error {
	if db == nil {
		db = r.db
	}
	return db.Create(log).Error
}

// List returns paginated audit logs scoped by company.
func (r *AuditRepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.AuditLog, int64, error) {
	var logs []model.AuditLog
	var total int64

	query := r.db.Model(&model.AuditLog{}).
		Where("company_id = ?", companyID).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, full_name, email")
		})

	if req.Search != "" {
		query = query.Where("module LIKE ? OR action LIKE ? OR entity_type LIKE ?",
			"%"+req.Search+"%", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &logs, &total)
	return logs, total, err
}

// ListByEntity returns audit logs for a specific entity.
func (r *AuditRepository) ListByEntity(entityType string, entityID uint64) ([]model.AuditLog, error) {
	var logs []model.AuditLog
	err := r.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, full_name, email")
		}).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}
