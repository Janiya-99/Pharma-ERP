package service

import (
	"context"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/repository"
	"github.com/shopspring/decimal"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type GRNService struct {
	grnRepo   repository.GRNRepository
	batchRepo repository.ProductBatchRepository
	db        *gorm.DB
	logger    *zap.Logger
}

func NewGRNService(grnRepo repository.GRNRepository, batchRepo repository.ProductBatchRepository, db *gorm.DB, logger *zap.Logger) *GRNService {
	return &GRNService{grnRepo: grnRepo, batchRepo: batchRepo, db: db, logger: logger}
}

func (s *GRNService) Create(ctx context.Context, req dto.CreateGRNReq) (*model.GRN, error) {
	var totalCost decimal.Decimal
	items := make([]model.GRNItem, len(req.Items))

	for i, itemReq := range req.Items {
		cost := itemReq.UnitCost.Mul(decimal.NewFromInt(int64(itemReq.Qty)))
		totalCost = totalCost.Add(cost)

		items[i] = model.GRNItem{
			ProductID:   itemReq.ProductID,
			BatchNo:     itemReq.BatchNo,
			MfgDate:     itemReq.MfgDate,
			ExpiryDate:  itemReq.ExpiryDate,
			WarehouseID: itemReq.WarehouseID,
			BinLocation: itemReq.BinLocation,
			Qty:         itemReq.Qty,
			UnitCost:    itemReq.UnitCost,
			TotalCost:   cost,
		}
	}

	grn := &model.GRN{
		RefNo:      req.RefNo,
		Date:       req.Date,
		SupplierID: req.SupplierID,
		PORef:      req.PORef,
		ReceivedBy: req.ReceivedBy,
		TotalCost:  totalCost,
		Status:     "Draft",
		Items:      items,
	}

	err := s.grnRepo.Create(ctx, grn)
	if err != nil {
		s.logger.Error("Failed to create GRN", zap.Error(err))
		return nil, err
	}
	return grn, nil
}

func (s *GRNService) Post(ctx context.Context, grnID uint64) error {
	// Post a GRN and update batch quantities in a transaction
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var grn model.GRN
		if err := tx.Preload("Items").First(&grn, grnID).Error; err != nil {
			return err
		}

		if grn.Status != "Draft" {
			return gorm.ErrInvalidData // Only Draft can be posted
		}

		// Process items and update batches
		for _, item := range grn.Items {
			var batch model.ProductBatch
			err := tx.Where("product_id = ? AND batch_no = ? AND warehouse_id = ?", item.ProductID, item.BatchNo, item.WarehouseID).First(&batch).Error
			
			if err == gorm.ErrRecordNotFound {
				// Create new batch
				batch = model.ProductBatch{
					ProductID:    item.ProductID,
					BatchNo:      item.BatchNo,
					MfgDate:      item.MfgDate,
					ExpiryDate:   item.ExpiryDate,
					WarehouseID:  item.WarehouseID,
					BinLocation:  item.BinLocation,
					AvailableQty: item.Qty,
					Status:       "Available",
				}
				if err := tx.Create(&batch).Error; err != nil {
					return err
				}
			} else if err != nil {
				return err
			} else {
				// Update existing batch
				batch.AvailableQty += item.Qty
				if err := tx.Save(&batch).Error; err != nil {
					return err
				}
			}
		}

		// Update GRN status
		grn.Status = "Posted"
		return tx.Save(&grn).Error
	})
}

func (s *GRNService) List(ctx context.Context) ([]model.GRN, error) {
	return s.grnRepo.List(ctx)
}

func (s *GRNService) GetByID(ctx context.Context, id uint64) (*model.GRN, error) {
	return s.grnRepo.GetByID(ctx, id)
}
