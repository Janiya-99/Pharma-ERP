package service

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type ProductService struct {
	repo   repository.ProductRepository
	logger *zap.Logger
}

func NewProductService(repo repository.ProductRepository, logger *zap.Logger) *ProductService {
	return &ProductService{repo: repo, logger: logger}
}

func (s *ProductService) Create(ctx context.Context, req dto.CreateProductReq) (*model.Product, error) {
	product := &model.Product{
		Code:         req.Code,
		Name:         req.Name,
		GenericName:  req.GenericName,
		Brand:        req.Brand,
		CategoryID:   req.CategoryID,
		Manufacturer: req.Manufacturer,
		DosageForm:   req.DosageForm,
		Strength:     req.Strength,
		PackSize:     req.PackSize,
		Unit:         req.Unit,
		ReorderLevel: req.ReorderLevel,
		Status:       "Active",
	}
	if req.Status != "" {
		product.Status = req.Status
	}

	err := s.repo.Create(ctx, product)
	if err != nil {
		s.logger.Error("Failed to create product", zap.Error(err))
		return nil, err
	}
	return product, nil
}

func (s *ProductService) List(ctx context.Context) ([]model.Product, error) {
	return s.repo.List(ctx)
}

func (s *ProductService) GetByID(ctx context.Context, id uint64) (*model.Product, error) {
	return s.repo.GetByID(ctx, id)
}
