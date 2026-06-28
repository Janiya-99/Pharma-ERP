package services

import (
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InvoiceDashboardService struct {
	repo   *repositories.InvoiceDashboardRepository
	logger *zap.Logger
}

func NewInvoiceDashboardService(repo *repositories.InvoiceDashboardRepository, logger *zap.Logger) *InvoiceDashboardService {
	return &InvoiceDashboardService{repo: repo, logger: logger}
}

func (s *InvoiceDashboardService) GetSummary(db *gorm.DB, companyID uint64) (*dto.DashboardSummaryResponse, error) {
	return s.repo.GetSummary(db, companyID)
}
