package services

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"github.com/pixandco/erp-phrma/internal/service"
	"gorm.io/gorm"
	"time"
)

type ProductBatchService struct {
	repo         *repositories.ProductBatchRepository
	productRepo  *repositories.ProductRepository
	stockRepo    *repositories.StockRepository
	auditService *service.AuditService
}

func NewProductBatchService(repo *repositories.ProductBatchRepository, productRepo *repositories.ProductRepository, stockRepo *repositories.StockRepository, auditService *service.AuditService) *ProductBatchService {
	return &ProductBatchService{repo: repo, productRepo: productRepo, stockRepo: stockRepo, auditService: auditService}
}

func (s *ProductBatchService) ListProductBatches(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ProductBatch, int64, error) {
	return s.repo.List(db, companyID, filters, search, page, limit)
}

func (s *ProductBatchService) GetProductBatchByID(db *gorm.DB, companyID, id uint64) (*models.ProductBatch, error) {
	return s.repo.GetByID(db, companyID, id)
}

func parseDate(d *string) *time.Time {
	if d == nil {
		return nil
	}
	t, err := time.Parse("2006-01-02", *d)
	if err != nil {
		return nil
	}
	return &t
}

func (s *ProductBatchService) CreateProductBatch(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateProductBatchRequest) (*models.ProductBatch, error) {
	p, err := s.productRepo.GetByID(db, companyID, req.ProductID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if existing, _ := s.repo.GetByNumber(db, companyID, req.ProductID, req.BatchNumber); existing != nil {
		return nil, errors.New("batch_number already exists for this product")
	}

	exp := parseDate(req.ExpiryDate)
	if p.RequiresExpiryTracking && exp == nil {
		return nil, errors.New("expiry_date is required for this product")
	}

	mfg := parseDate(req.ManufactureDate)
	if mfg != nil && exp != nil && exp.Before(*mfg) {
		return nil, errors.New("expiry_date must be after manufacture_date")
	}

	batch := &models.ProductBatch{
		CompanyID:       companyID,
		ProductID:       req.ProductID,
		BatchNumber:     req.BatchNumber,
		ManufactureDate: mfg,
		ExpiryDate:      exp,
		SupplierID:      req.SupplierID,
		ManufacturerID:  req.ManufacturerID,
		PurchaseRate:    req.PurchaseRate,
		SellingPrice:    req.SellingPrice,
		MRP:             req.MRP,
		BatchStatus:     req.BatchStatus,
		IsBlocked:       false,
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, batch); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_BATCH_CREATED",
			EntityType: "ProductBatch",
			EntityID:   batch.ID,
			NewValues:  batch,
		})
		return nil
	})
	return batch, err
}

func (s *ProductBatchService) UpdateProductBatch(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateProductBatchRequest) (*models.ProductBatch, error) {
	batch, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	p, _ := s.productRepo.GetByID(db, companyID, batch.ProductID)

	if batch.BatchNumber != req.BatchNumber {
		if existing, _ := s.repo.GetByNumber(db, companyID, batch.ProductID, req.BatchNumber); existing != nil {
			return nil, errors.New("batch_number already exists for this product")
		}
		hasLedger, _ := s.stockRepo.CheckBatchHasLedger(db, id)
		if hasLedger {
			return nil, errors.New("cannot edit batch_number because stock ledger entries exist")
		}
	}

	exp := parseDate(req.ExpiryDate)
	if p.RequiresExpiryTracking && exp == nil {
		return nil, errors.New("expiry_date cannot be removed for an expiry-tracked product")
	}

	mfg := parseDate(req.ManufactureDate)
	if mfg != nil && exp != nil && exp.Before(*mfg) {
		return nil, errors.New("expiry_date must be after manufacture_date")
	}

	old := *batch
	batch.BatchNumber = req.BatchNumber
	batch.ManufactureDate = mfg
	batch.ExpiryDate = exp
	batch.SupplierID = req.SupplierID
	batch.ManufacturerID = req.ManufacturerID
	batch.PurchaseRate = req.PurchaseRate
	batch.SellingPrice = req.SellingPrice
	batch.MRP = req.MRP
	batch.BatchStatus = req.BatchStatus

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, batch); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_BATCH_UPDATED",
			EntityType: "ProductBatch",
			EntityID:   batch.ID,
			OldValues:  old,
			NewValues:  batch,
		})
		return nil
	})
	return batch, err
}

func (s *ProductBatchService) BlockProductBatch(c *gin.Context, db *gorm.DB, companyID, id uint64, blockReason string) error {
	batch, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return err
	}

	old := *batch
	batch.IsBlocked = true
	batch.BlockReason = blockReason
	batch.BatchStatus = "blocked"

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, batch); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_BATCH_BLOCKED",
			EntityType: "ProductBatch",
			EntityID:   batch.ID,
			OldValues:  old,
			NewValues:  batch,
		})
		return nil
	})
}

func (s *ProductBatchService) UnblockProductBatch(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	batch, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return err
	}

	if !batch.IsBlocked {
		return errors.New("batch is not blocked")
	}

	old := *batch
	batch.IsBlocked = false
	batch.BlockReason = ""

	// Determine status (expired check would normally go here)
	status := "active"
	if batch.ExpiryDate != nil && batch.ExpiryDate.Before(time.Now()) {
		status = "expired"
	}
	batch.BatchStatus = status

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, batch); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_BATCH_UNBLOCKED",
			EntityType: "ProductBatch",
			EntityID:   batch.ID,
			OldValues:  old,
			NewValues:  batch,
		})
		return nil
	})
}
