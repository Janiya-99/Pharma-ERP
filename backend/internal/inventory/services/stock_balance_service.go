package services

import (
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type StockBalanceService struct {
	repo *repositories.StockRepository
}

func NewStockBalanceService(repo *repositories.StockRepository) *StockBalanceService {
	return &StockBalanceService{repo: repo}
}

func (s *StockBalanceService) ListStockBalances(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.StockBalance, int64, error) {
	return s.repo.ListBalances(db, companyID, filters, search, page, limit)
}
