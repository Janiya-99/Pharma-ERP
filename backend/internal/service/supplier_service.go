package service

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type SupplierService struct {
	repo   repository.SupplierRepository
	logger *zap.Logger
}

func NewSupplierService(repo repository.SupplierRepository, logger *zap.Logger) *SupplierService {
	return &SupplierService{repo: repo, logger: logger}
}

func (s *SupplierService) Create(ctx context.Context, req dto.CreateSupplierReq) (*model.InventorySupplier, error) {
	supplier := &model.InventorySupplier{
		Code:        req.Code,
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		CreditTerms: req.CreditTerms,
		Status:      "Active",
	}
	if req.Status != "" {
		supplier.Status = req.Status
	}

	err := s.repo.Create(ctx, supplier)
	if err != nil {
		s.logger.Error("Failed to create supplier", zap.Error(err))
		return nil, err
	}
	return supplier, nil
}

func (s *SupplierService) List(ctx context.Context) ([]model.InventorySupplier, error) {
	return s.repo.List(ctx)
}

func (s *SupplierService) GetByID(ctx context.Context, id uint64) (*model.InventorySupplier, error) {
	return s.repo.GetByID(ctx, id)
}
