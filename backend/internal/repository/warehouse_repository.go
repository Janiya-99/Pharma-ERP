package repository

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type WarehouseRepository interface {
	Create(ctx context.Context, warehouse *model.Warehouse) error
	GetByID(ctx context.Context, id uint64) (*model.Warehouse, error)
	List(ctx context.Context) ([]model.Warehouse, error)
	Update(ctx context.Context, warehouse *model.Warehouse) error
	Delete(ctx context.Context, id uint64) error
}

type warehouseRepository struct {
	db *gorm.DB
}

func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{db: db}
}

func (r *warehouseRepository) Create(ctx context.Context, warehouse *model.Warehouse) error {
	return r.db.WithContext(ctx).Create(warehouse).Error
}

func (r *warehouseRepository) GetByID(ctx context.Context, id uint64) (*model.Warehouse, error) {
	var warehouse model.Warehouse
	err := r.db.WithContext(ctx).First(&warehouse, id).Error
	return &warehouse, err
}

func (r *warehouseRepository) List(ctx context.Context) ([]model.Warehouse, error) {
	var warehouses []model.Warehouse
	err := r.db.WithContext(ctx).Find(&warehouses).Error
	return warehouses, err
}

func (r *warehouseRepository) Update(ctx context.Context, warehouse *model.Warehouse) error {
	return r.db.WithContext(ctx).Save(warehouse).Error
}

func (r *warehouseRepository) Delete(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&model.Warehouse{}, id).Error
}
