package repository

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type ProductBatchRepository interface {
	Create(ctx context.Context, batch *model.ProductBatch) error
	GetByID(ctx context.Context, id uint64) (*model.ProductBatch, error)
	GetByProductAndBatch(ctx context.Context, productID uint64, batchNo string) (*model.ProductBatch, error)
	List(ctx context.Context) ([]model.ProductBatch, error)
	Update(ctx context.Context, batch *model.ProductBatch) error
}

type productBatchRepository struct {
	db *gorm.DB
}

func NewProductBatchRepository(db *gorm.DB) ProductBatchRepository {
	return &productBatchRepository{db: db}
}

func (r *productBatchRepository) Create(ctx context.Context, batch *model.ProductBatch) error {
	return r.db.WithContext(ctx).Create(batch).Error
}

func (r *productBatchRepository) GetByID(ctx context.Context, id uint64) (*model.ProductBatch, error) {
	var batch model.ProductBatch
	err := r.db.WithContext(ctx).First(&batch, id).Error
	return &batch, err
}

func (r *productBatchRepository) GetByProductAndBatch(ctx context.Context, productID uint64, batchNo string) (*model.ProductBatch, error) {
	var batch model.ProductBatch
	err := r.db.WithContext(ctx).Where("product_id = ? AND batch_no = ?", productID, batchNo).First(&batch).Error
	return &batch, err
}

func (r *productBatchRepository) List(ctx context.Context) ([]model.ProductBatch, error) {
	var batches []model.ProductBatch
	err := r.db.WithContext(ctx).Find(&batches).Error
	return batches, err
}

func (r *productBatchRepository) Update(ctx context.Context, batch *model.ProductBatch) error {
	return r.db.WithContext(ctx).Save(batch).Error
}
