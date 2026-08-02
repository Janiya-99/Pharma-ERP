package service

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type WarehouseService struct {
	repo   repository.WarehouseRepository
	logger *zap.Logger
}

func NewWarehouseService(repo repository.WarehouseRepository, logger *zap.Logger) *WarehouseService {
	return &WarehouseService{repo: repo, logger: logger}
}

func (s *WarehouseService) Create(ctx context.Context, req dto.CreateWarehouseReq) (*model.Warehouse, error) {
	wh := &model.Warehouse{
		Name:     req.Name,
		Code:     req.Code,
		BranchID: req.BranchID,
		Address:  req.Address,
		Status:   "Active",
	}
	if req.Status != "" {
		wh.Status = req.Status
	}

	err := s.repo.Create(ctx, wh)
	if err != nil {
		s.logger.Error("Failed to create warehouse", zap.Error(err))
		return nil, err
	}
	return wh, nil
}

func (s *WarehouseService) List(ctx context.Context) ([]model.Warehouse, error) {
	return s.repo.List(ctx)
}

func (s *WarehouseService) GetByID(ctx context.Context, id uint64) (*model.Warehouse, error) {
	return s.repo.GetByID(ctx, id)
}
