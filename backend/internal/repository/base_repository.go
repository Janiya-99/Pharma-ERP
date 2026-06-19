package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"gorm.io/gorm"
)

// Paginate applies pagination to a GORM query and returns results with total count.
// Usage:
//
//	var accounts []model.ChartOfAccounts
//	var total int64
//	err := repository.Paginate(db, &pagination, &accounts, &total)
func Paginate(db *gorm.DB, req *dto.PaginationRequest, dest interface{}, total *int64) error {
	// Count total records (before pagination)
	if err := db.Count(total).Error; err != nil {
		return err
	}

	// Apply sorting
	orderClause := req.SortBy + " " + req.Order
	if req.SortBy == "" {
		orderClause = "created_at desc"
	}

	// Apply pagination
	return db.Order(orderClause).
		Offset(req.GetOffset()).
		Limit(req.PerPage).
		Find(dest).Error
}
