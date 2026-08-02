package services

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"github.com/pixandco/erp-phrma/internal/service"
	"gorm.io/gorm"
)

type ProductService struct {
	repo         *repositories.ProductRepository
	stockRepo    *repositories.StockRepository
	auditService *service.AuditService
}

func NewProductService(repo *repositories.ProductRepository, stockRepo *repositories.StockRepository, auditService *service.AuditService) *ProductService {
	return &ProductService{repo: repo, stockRepo: stockRepo, auditService: auditService}
}

func (s *ProductService) ListProducts(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.Product, int64, error) {
	return s.repo.List(db, companyID, filters, search, page, limit)
}

func (s *ProductService) GetProductByID(db *gorm.DB, companyID, id uint64) (*models.Product, []models.ProductBarcode, error) {
	p, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, nil, err
	}
	barcodes, _ := s.repo.GetBarcodes(db, id)
	return p, barcodes, nil
}

func (s *ProductService) CreateProduct(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateProductRequest) (*models.Product, error) {
	existing, err := s.repo.GetByCode(db, companyID, req.ProductCode)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("product_code already exists")
	}

	var barcodeModels []models.ProductBarcode
	for _, b := range req.Barcodes {
		eb, err := s.repo.GetBarcode(db, companyID, b.Barcode)
		if err != nil {
			return nil, err
		}
		if eb != nil {
			return nil, errors.New("barcode already exists: " + b.Barcode)
		}
		barcodeModels = append(barcodeModels, models.ProductBarcode{
			CompanyID:   companyID,
			Barcode:     b.Barcode,
			BarcodeType: b.BarcodeType,
			Status:      "active",
		})
	}

	p := &models.Product{
		CompanyID:                companyID,
		ProductCode:              req.ProductCode,
		ProductName:              req.ProductName,
		ProductCategoryID:        req.ProductCategoryID,
		GenericNameID:            req.GenericNameID,
		DosageFormID:             req.DosageFormID,
		ManufacturerID:           req.ManufacturerID,
		BaseUnitID:               req.BaseUnitID,
		Strength:                 req.Strength,
		PackSize:                 req.PackSize,
		ProductType:              req.ProductType,
		RequiresBatchTracking:    req.RequiresBatchTracking,
		RequiresExpiryTracking:   req.RequiresExpiryTracking,
		StorageCondition:         req.StorageCondition,
		ReorderLevel:             req.ReorderLevel,
		ReorderQuantity:          req.ReorderQuantity,
		PurchaseAccountID:        req.PurchaseAccountID,
		SalesAccountID:           req.SalesAccountID,
		InventoryAccountID:       req.InventoryAccountID,
		CostOfGoodsSoldAccountID: req.CostOfGoodsSoldAccountID,
		NMRARegistrationNumber:   req.NMRARegistrationNumber,
		NMRAExpiryDate:           nil, // Parsed later if needed
		Status:                   req.Status,
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, p); err != nil {
			return err
		}
		for i := range barcodeModels {
			barcodeModels[i].ProductID = p.ID
		}
		if err := s.repo.ReplaceBarcodes(tx, p.ID, barcodeModels); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_CREATED",
			EntityType: "Product",
			EntityID:   p.ID,
			NewValues:  p,
		})
		return nil
	})
	return p, err
}

func (s *ProductService) UpdateProduct(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateProductRequest) (*models.Product, error) {
	p, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	if p.ProductCode != req.ProductCode {
		existing, err := s.repo.GetByCode(db, companyID, req.ProductCode)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return nil, errors.New("product_code already exists")
		}
	}

	// Validation for tracking toggles
	var batchCount int64
	db.Model(&models.ProductBatch{}).Where("product_id = ?", id).Count(&batchCount)
	if batchCount > 0 {
		if p.RequiresBatchTracking && !req.RequiresBatchTracking {
			return nil, errors.New("cannot disable batch tracking for product with existing batches")
		}
		if p.RequiresExpiryTracking && !req.RequiresExpiryTracking {
			return nil, errors.New("cannot disable expiry tracking for product with existing batches")
		}
	}

	old := *p
	p.ProductCode = req.ProductCode
	p.ProductName = req.ProductName
	p.ProductCategoryID = req.ProductCategoryID
	p.GenericNameID = req.GenericNameID
	p.DosageFormID = req.DosageFormID
	p.ManufacturerID = req.ManufacturerID
	p.BaseUnitID = req.BaseUnitID
	p.Strength = req.Strength
	p.PackSize = req.PackSize
	p.ProductType = req.ProductType
	p.RequiresBatchTracking = req.RequiresBatchTracking
	p.RequiresExpiryTracking = req.RequiresExpiryTracking
	p.StorageCondition = req.StorageCondition
	p.ReorderLevel = req.ReorderLevel
	p.ReorderQuantity = req.ReorderQuantity
	p.PurchaseAccountID = req.PurchaseAccountID
	p.SalesAccountID = req.SalesAccountID
	p.InventoryAccountID = req.InventoryAccountID
	p.CostOfGoodsSoldAccountID = req.CostOfGoodsSoldAccountID
	p.NMRARegistrationNumber = req.NMRARegistrationNumber
	p.Status = req.Status

	var barcodeModels []models.ProductBarcode
	for _, b := range req.Barcodes {
		eb, err := s.repo.GetBarcode(db, companyID, b.Barcode)
		if err != nil {
			return nil, err
		}
		if eb != nil && eb.ProductID != id {
			return nil, errors.New("barcode already belongs to another product: " + b.Barcode)
		}
		barcodeModels = append(barcodeModels, models.ProductBarcode{
			CompanyID:   companyID,
			ProductID:   id,
			Barcode:     b.Barcode,
			BarcodeType: b.BarcodeType,
			Status:      "active",
		})
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, p); err != nil {
			return err
		}
		if err := s.repo.ReplaceBarcodes(tx, p.ID, barcodeModels); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_UPDATED",
			EntityType: "Product",
			EntityID:   p.ID,
			OldValues:  old,
			NewValues:  p,
		})
		return nil
	})
	return p, err
}

func (s *ProductService) DeleteProduct(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	p, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return err
	}

	var batchCount int64
	db.Model(&models.ProductBatch{}).Where("product_id = ?", id).Count(&batchCount)
	if batchCount > 0 {
		return errors.New("cannot delete product with existing batches")
	}

	hasStock, _ := s.stockRepo.CheckProductHasStock(db, id)
	if hasStock {
		return errors.New("cannot delete product with existing stock balances")
	}

	hasLedger, _ := s.stockRepo.CheckProductHasLedger(db, id)
	if hasLedger {
		return errors.New("cannot delete product with existing stock ledger entries")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, p); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "PRODUCT_DELETED",
			EntityType: "Product",
			EntityID:   id,
			OldValues:  p,
		})
		return nil
	})
}
