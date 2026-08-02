package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"gorm.io/gorm"
)

type PurchaseReturnRepository interface {
	FindAll(db *gorm.DB, companyID uint64, branchID *uint64) ([]models.PurchaseReturn, error)
	FindByID(db *gorm.DB, companyID uint64, returnID uint64) (*models.PurchaseReturn, error)
	Create(db *gorm.DB, purchaseReturn *models.PurchaseReturn) error
	Update(db *gorm.DB, purchaseReturn *models.PurchaseReturn) error
	Delete(db *gorm.DB, companyID uint64, returnID uint64, deletedBy uint64) error
	UpdateApprovalStatus(db *gorm.DB, returnID uint64, status string, userID uint64) error
	UpdatePostedStatus(db *gorm.DB, returnID uint64, status string, userID uint64) error
	CreateApprovalRecord(db *gorm.DB, record *models.PurchaseReturnApproval) error
	DeleteLines(db *gorm.DB, returnID uint64) error
}

type purchaseReturnRepository struct{}

func NewPurchaseReturnRepository() PurchaseReturnRepository {
	return &purchaseReturnRepository{}
}

func (r *purchaseReturnRepository) FindAll(db *gorm.DB, companyID uint64, branchID *uint64) ([]models.PurchaseReturn, error) {
	var returns []models.PurchaseReturn
	query := db.Where("company_id = ?", companyID)

	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	}

	err := query.Preload("Warehouse").Preload("Supplier").Preload("GoodsReceiptNote").Find(&returns).Error
	return returns, err
}

func (r *purchaseReturnRepository) FindByID(db *gorm.DB, companyID uint64, returnID uint64) (*models.PurchaseReturn, error) {
	var purchaseReturn models.PurchaseReturn
	err := db.Where("company_id = ? AND id = ?", companyID, returnID).
		Preload("Warehouse").
		Preload("Supplier").
		Preload("GoodsReceiptNote").
		Preload("Lines.Product").
		Preload("Lines.ProductBatch").
		Preload("Lines.WarehouseLocation").
		Preload("Lines.GoodsReceiptNoteLine").
		Preload("Approvals").
		First(&purchaseReturn).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &purchaseReturn, nil
}

func (r *purchaseReturnRepository) Create(db *gorm.DB, purchaseReturn *models.PurchaseReturn) error {
	return db.Create(purchaseReturn).Error
}

func (r *purchaseReturnRepository) Update(db *gorm.DB, purchaseReturn *models.PurchaseReturn) error {
	return db.Save(purchaseReturn).Error
}

func (r *purchaseReturnRepository) Delete(db *gorm.DB, companyID uint64, returnID uint64, deletedBy uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var pr models.PurchaseReturn
		if err := tx.Where("company_id = ? AND id = ?", companyID, returnID).First(&pr).Error; err != nil {
			return err
		}

		if pr.PostedStatus == "posted" {
			return errors.New("cannot delete a posted purchase return")
		}

		if err := tx.Model(&pr).Update("updated_by", deletedBy).Error; err != nil {
			return err
		}

		if err := tx.Where("purchase_return_id = ?", returnID).Delete(&models.PurchaseReturnLine{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&pr).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *purchaseReturnRepository) UpdateApprovalStatus(db *gorm.DB, returnID uint64, status string, userID uint64) error {
	return db.Model(&models.PurchaseReturn{}).
		Where("id = ?", returnID).
		Updates(map[string]interface{}{
			"approval_status": status,
			"approved_by":     userID,
			"approved_at":     gorm.Expr("CURRENT_TIMESTAMP"),
			"updated_by":      userID,
		}).Error
}

func (r *purchaseReturnRepository) UpdatePostedStatus(db *gorm.DB, returnID uint64, status string, userID uint64) error {
	return db.Model(&models.PurchaseReturn{}).
		Where("id = ?", returnID).
		Updates(map[string]interface{}{
			"posted_status": status,
			"posted_by":     userID,
			"posted_at":     gorm.Expr("CURRENT_TIMESTAMP"),
			"updated_by":    userID,
		}).Error
}

func (r *purchaseReturnRepository) CreateApprovalRecord(db *gorm.DB, record *models.PurchaseReturnApproval) error {
	return db.Create(record).Error
}

func (r *purchaseReturnRepository) DeleteLines(db *gorm.DB, returnID uint64) error {
	return db.Where("purchase_return_id = ?", returnID).Delete(&models.PurchaseReturnLine{}).Error
}
