package repository

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type GRNRepository interface {
	Create(ctx context.Context, grn *model.GRN) error
	GetByID(ctx context.Context, id uint64) (*model.GRN, error)
	List(ctx context.Context) ([]model.GRN, error)
	Update(ctx context.Context, grn *model.GRN) error
}

type grnRepository struct {
	db *gorm.DB
}

func NewGRNRepository(db *gorm.DB) GRNRepository {
	return &grnRepository{db: db}
}

func (r *grnRepository) Create(ctx context.Context, grn *model.GRN) error {
	return r.db.WithContext(ctx).Create(grn).Error
}

func (r *grnRepository) GetByID(ctx context.Context, id uint64) (*model.GRN, error) {
	var grn model.GRN
	err := r.db.WithContext(ctx).Preload("Items").Preload("Supplier").First(&grn, id).Error
	return &grn, err
}

func (r *grnRepository) List(ctx context.Context) ([]model.GRN, error) {
	var grns []model.GRN
	err := r.db.WithContext(ctx).Preload("Supplier").Find(&grns).Error
	return grns, err
}

func (r *grnRepository) Update(ctx context.Context, grn *model.GRN) error {
	return r.db.WithContext(ctx).Save(grn).Error
}
