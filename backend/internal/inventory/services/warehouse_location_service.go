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

type WarehouseLocationService struct {
	repo          *repositories.WarehouseLocationRepository
	warehouseRepo *repositories.WarehouseRepository
	stockRepo     *repositories.StockRepository
	auditService  *service.AuditService
}

func NewWarehouseLocationService(repo *repositories.WarehouseLocationRepository, whRepo *repositories.WarehouseRepository, stockRepo *repositories.StockRepository, auditService *service.AuditService) *WarehouseLocationService {
	return &WarehouseLocationService{repo: repo, warehouseRepo: whRepo, stockRepo: stockRepo, auditService: auditService}
}

func (s *WarehouseLocationService) ListWarehouseLocations(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.WarehouseLocation, int64, error) {
	return s.repo.List(db, companyID, filters, search, page, limit)
}

func (s *WarehouseLocationService) GetWarehouseLocationByID(db *gorm.DB, companyID, id uint64) (*models.WarehouseLocation, error) {
	return s.repo.GetByID(db, companyID, id)
}

func (s *WarehouseLocationService) CreateWarehouseLocation(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateWarehouseLocationRequest) (*models.WarehouseLocation, error) {
	wh, err := s.warehouseRepo.GetByID(db, companyID, req.WarehouseID)
	if err != nil || wh.Status != "active" {
		return nil, errors.New("valid active warehouse required")
	}

	existing, err := s.repo.GetByCode(db, companyID, req.WarehouseID, req.LocationCode)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("location_code already exists in this warehouse")
	}

	loc := &models.WarehouseLocation{
		CompanyID:        companyID,
		WarehouseID:      req.WarehouseID,
		LocationCode:     req.LocationCode,
		LocationName:     req.LocationName,
		Rack:             req.Rack,
		Shelf:            req.Shelf,
		Bin:              req.Bin,
		StorageCondition: req.StorageCondition,
		Status:           req.Status,
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, loc); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_LOCATION_CREATED",
			EntityType: "WarehouseLocation",
			EntityID:   loc.ID,
			NewValues:  loc,
		})
		return nil
	})
	return loc, err
}

func (s *WarehouseLocationService) UpdateWarehouseLocation(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateWarehouseLocationRequest) (*models.WarehouseLocation, error) {
	loc, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	if loc.LocationCode != req.LocationCode {
		existing, err := s.repo.GetByCode(db, companyID, loc.WarehouseID, req.LocationCode)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return nil, errors.New("location_code already exists in this warehouse")
		}
	}

	oldLoc := *loc
	loc.LocationCode = req.LocationCode
	loc.LocationName = req.LocationName
	loc.Rack = req.Rack
	loc.Shelf = req.Shelf
	loc.Bin = req.Bin
	loc.StorageCondition = req.StorageCondition
	loc.Status = req.Status

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, loc); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_LOCATION_UPDATED",
			EntityType: "WarehouseLocation",
			EntityID:   loc.ID,
			OldValues:  oldLoc,
			NewValues:  loc,
		})
		return nil
	})
	return loc, err
}

func (s *WarehouseLocationService) DeleteWarehouseLocation(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	loc, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return err
	}

	hasStock, _ := s.stockRepo.CheckLocationHasStock(db, id)
	if hasStock {
		return errors.New("cannot delete location with existing stock balances")
	}

	hasLedger, _ := s.stockRepo.CheckLocationHasLedger(db, id)
	if hasLedger {
		return errors.New("cannot delete location with existing stock ledger entries")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, loc); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{
			Module:     "Inventory",
			Action:     "WAREHOUSE_LOCATION_DELETED",
			EntityType: "WarehouseLocation",
			EntityID:   id,
			OldValues:  loc,
		})
		return nil
	})
}
