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

type WarehouseService struct {
	repo         *repositories.WarehouseRepository
	stockRepo    *repositories.StockRepository
	auditService *service.AuditService
}

func NewWarehouseService(repo *repositories.WarehouseRepository, stockRepo *repositories.StockRepository, auditService *service.AuditService) *WarehouseService {
	return &WarehouseService{repo: repo, stockRepo: stockRepo, auditService: auditService}
}

func (s *WarehouseService) ListWarehouses(db *gorm.DB, companyID uint64, branchID *uint64, filters map[string]interface{}, search string, page, limit int) ([]models.Warehouse, int64, error) {
	return s.repo.List(db, companyID, branchID, filters, search, page, limit)
}

func (s *WarehouseService) GetWarehouseByID(db *gorm.DB, companyID, id uint64) (*models.Warehouse, error) {
	return s.repo.GetByID(db, companyID, id)
}

func (s *WarehouseService) CreateWarehouse(c *gin.Context, db *gorm.DB, companyID uint64, userID uint64, req dto.CreateWarehouseRequest) (*models.Warehouse, error) {
	existing, _ := s.repo.GetByCode(db, companyID, req.WarehouseCode)
	if existing != nil {
		return nil, errors.New("warehouse_code already exists")
	}

	wh := &models.Warehouse{
		CompanyID:     companyID,
		BranchID:      req.BranchID,
		WarehouseCode: req.WarehouseCode,
		WarehouseName: req.WarehouseName,
		WarehouseType: req.WarehouseType,
		Address:       req.Address,
		ContactPerson: req.ContactPerson,
		ContactNumber: req.ContactNumber,
		IsDefault:     req.IsDefault,
		Status:        req.Status,
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, wh); err != nil {
			return err
		}
		if req.IsDefault {
			if err := s.repo.UnsetOtherDefaults(tx, companyID, req.BranchID, wh.ID); err != nil {
				return err
			}
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_CREATED",
			EntityType: "Warehouse",
			EntityID:   wh.ID,
			NewValues:  wh,
		})
		return nil
	})
	return wh, err
}

func (s *WarehouseService) UpdateWarehouse(c *gin.Context, db *gorm.DB, companyID uint64, id uint64, req dto.UpdateWarehouseRequest) (*models.Warehouse, error) {
	wh, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	if wh.WarehouseCode != req.WarehouseCode {
		existing, _ := s.repo.GetByCode(db, companyID, req.WarehouseCode)
		if existing != nil {
			return nil, errors.New("warehouse_code already exists")
		}
	}

	oldWh := *wh
	wh.WarehouseCode = req.WarehouseCode
	wh.WarehouseName = req.WarehouseName
	wh.WarehouseType = req.WarehouseType
	wh.Address = req.Address
	wh.ContactPerson = req.ContactPerson
	wh.ContactNumber = req.ContactNumber
	wh.IsDefault = req.IsDefault
	wh.Status = req.Status

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, wh); err != nil {
			return err
		}
		if req.IsDefault {
			if err := s.repo.UnsetOtherDefaults(tx, companyID, wh.BranchID, wh.ID); err != nil {
				return err
			}
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_UPDATED",
			EntityType: "Warehouse",
			EntityID:   wh.ID,
			OldValues:  oldWh,
			NewValues:  wh,
		})
		return nil
	})
	return wh, err
}

func (s *WarehouseService) DeleteWarehouse(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	wh, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return err
	}

	hasStock, err := s.stockRepo.CheckWarehouseHasStock(db, id)
	if err != nil {
		return err
	}
	if hasStock {
		return errors.New("cannot delete warehouse with existing stock balances")
	}

	hasLedger, err := s.stockRepo.CheckWarehouseHasLedger(db, id)
	if err != nil {
		return err
	}
	if hasLedger {
		return errors.New("cannot delete warehouse with existing stock ledger entries")
	}

	var locationCount int64
	db.Model(&models.WarehouseLocation{}).Where("warehouse_id = ?", id).Count(&locationCount)
	if locationCount > 0 {
		return errors.New("cannot delete warehouse containing locations")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, wh); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_DELETED",
			EntityType: "Warehouse",
			EntityID:   id,
			OldValues:  wh,
		})
		return nil
	})
}
