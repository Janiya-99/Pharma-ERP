package services

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type StockLedgerService struct {
	repo *repositories.StockRepository
}

func NewStockLedgerService(repo *repositories.StockRepository) *StockLedgerService {
	return &StockLedgerService{repo: repo}
}

func (s *StockLedgerService) ListStockLedgerEntries(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockLedgerEntry, int64, error) {
	return s.repo.ListLedgerEntries(db, companyID, filters, search, page, limit)
}
