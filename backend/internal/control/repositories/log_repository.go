package repositories

import (
	"math"

	"github.com/pixandco/erp-phrma/internal/control/dto"
	"gorm.io/gorm"
)

type LogRepository struct {
	db *gorm.DB
}

func NewLogRepository(db *gorm.DB) *LogRepository {
	return &LogRepository{db: db}
}

func normalizePageLimit(page, limit int) (int, int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return page, limit, (page - 1) * limit
}

func pagination(page, limit int, total int64) *dto.Pagination {
	return &dto.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: int(math.Ceil(float64(total) / float64(limit))),
	}
}

func (r *LogRepository) ListLoginLogs(filter dto.LoginLogFilter) ([]dto.LoginLogResponse, *dto.Pagination, error) {
	page, limit, offset := normalizePageLimit(filter.Page, filter.Limit)

	query := r.db.Table("login_logs AS l").
		Select(`
			l.id,
			l.user_id,
			COALESCE(u.name, '') AS user_name,
			l.email,
			l.login_status AS status,
			l.login_status,
			l.failure_reason,
			l.ip_address,
			l.user_agent,
			l.logged_at AS created_at,
			l.logged_at
		`).
		Joins("LEFT JOIN users AS u ON u.id = l.user_id")

	if filter.Search != "" {
		search := "%" + filter.Search + "%"
		query = query.Where("u.name LIKE ? OR l.email LIKE ? OR l.ip_address LIKE ?", search, search, search)
	}
	if filter.UserID != "" {
		query = query.Where("l.user_id = ?", filter.UserID)
	}
	if filter.Email != "" {
		query = query.Where("l.email LIKE ?", "%"+filter.Email+"%")
	}
	if filter.Status != "" {
		query = query.Where("l.login_status = ?", filter.Status)
	}
	if filter.DateFrom != "" {
		query = query.Where("DATE(l.logged_at) >= ?", filter.DateFrom)
	}
	if filter.DateTo != "" {
		query = query.Where("DATE(l.logged_at) <= ?", filter.DateTo)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, err
	}

	var logs []dto.LoginLogResponse
	if err := query.Order("l.logged_at DESC, l.id DESC").Offset(offset).Limit(limit).Scan(&logs).Error; err != nil {
		return nil, nil, err
	}

	return logs, pagination(page, limit, total), nil
}

func (r *LogRepository) ListAuditLogs(filter dto.AuditLogFilter) ([]dto.AuditLogResponse, *dto.Pagination, error) {
	page, limit, offset := normalizePageLimit(filter.Page, filter.Limit)

	query := r.db.Table("audit_logs AS a").
		Select(`
			a.id,
			a.company_id,
			a.branch_id,
			COALESCE(b.branch_name, '') AS branch_name,
			a.user_id,
			COALESCE(u.name, '') AS user_name,
			a.software_code,
			COALESCE(sm.software_name, a.software_code, '') AS software_name,
			a.action,
			a.entity_name,
			a.entity_id,
			a.old_values,
			a.new_values,
			a.ip_address,
			a.user_agent,
			a.created_at
		`).
		Joins("LEFT JOIN users AS u ON u.id = a.user_id").
		Joins("LEFT JOIN branches AS b ON b.id = a.branch_id").
		Joins("LEFT JOIN software_modules AS sm ON sm.software_code = a.software_code")

	if filter.Search != "" {
		search := "%" + filter.Search + "%"
		query = query.Where("u.name LIKE ? OR a.action LIKE ? OR a.entity_name LIKE ? OR a.ip_address LIKE ?", search, search, search, search)
	}
	if filter.UserID != "" {
		query = query.Where("a.user_id = ?", filter.UserID)
	}
	if filter.BranchID != "" {
		query = query.Where("a.branch_id = ?", filter.BranchID)
	}
	if filter.SoftwareID != "" {
		query = query.Where("sm.id = ?", filter.SoftwareID)
	}
	if filter.Action != "" {
		query = query.Where("a.action LIKE ?", "%"+filter.Action+"%")
	}
	if filter.EntityName != "" {
		query = query.Where("a.entity_name LIKE ?", "%"+filter.EntityName+"%")
	}
	if filter.DateFrom != "" {
		query = query.Where("DATE(a.created_at) >= ?", filter.DateFrom)
	}
	if filter.DateTo != "" {
		query = query.Where("DATE(a.created_at) <= ?", filter.DateTo)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, err
	}

	var logs []dto.AuditLogResponse
	if err := query.Order("a.created_at DESC, a.id DESC").Offset(offset).Limit(limit).Scan(&logs).Error; err != nil {
		return nil, nil, err
	}

	return logs, pagination(page, limit, total), nil
}
