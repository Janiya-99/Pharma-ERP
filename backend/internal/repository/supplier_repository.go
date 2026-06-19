package repository

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type SupplierRepository interface {
	Create(ctx context.Context, supplier *model.InventorySupplier) error
	GetByID(ctx context.Context, id uint64) (*model.InventorySupplier, error)
	List(ctx context.Context) ([]model.InventorySupplier, error)
	Update(ctx context.Context, supplier *model.InventorySupplier) error
	Delete(ctx context.Context, id uint64) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) Create(ctx context.Context, supplier *model.InventorySupplier) error {
	return r.db.WithContext(ctx).Create(supplier).Error
}

func (r *supplierRepository) GetByID(ctx context.Context, id uint64) (*model.InventorySupplier, error) {
	var supplier model.InventorySupplier
	err := r.db.WithContext(ctx).First(&supplier, id).Error
	return &supplier, err
}

func (r *supplierRepository) List(ctx context.Context) ([]model.InventorySupplier, error) {
	var suppliers []model.InventorySupplier
	err := r.db.WithContext(ctx).Find(&suppliers).Error
	return suppliers, err
}

func (r *supplierRepository) Update(ctx context.Context, supplier *model.InventorySupplier) error {
	return r.db.WithContext(ctx).Save(supplier).Error
}

func (r *supplierRepository) Delete(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&model.InventorySupplier{}, id).Error
}
