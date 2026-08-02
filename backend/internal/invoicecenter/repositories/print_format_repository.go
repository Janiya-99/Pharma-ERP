package repositories

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type PrintFormatRepository struct{}

func NewPrintFormatRepository() *PrintFormatRepository {
	return &PrintFormatRepository{}
}

func (r *PrintFormatRepository) List(db *gorm.DB, companyID uint64, documentType string) ([]models.InvoicePrintFormat, error) {
	var formats []models.InvoicePrintFormat
	query := db.Where("company_id = ?", companyID).Preload("Fields", func(db *gorm.DB) *gorm.DB {
		return db.Order("display_order asc")
	})
	if documentType != "" {
		query = query.Where("document_type = ?", documentType)
	}
	err := query.Order("document_type asc, is_default desc, format_name asc").Find(&formats).Error
	return formats, err
}

func (r *PrintFormatRepository) Get(db *gorm.DB, companyID, id uint64) (*models.InvoicePrintFormat, error) {
	var format models.InvoicePrintFormat
	err := db.Where("company_id = ? AND id = ?", companyID, id).
		Preload("Fields", func(db *gorm.DB) *gorm.DB { return db.Order("display_order asc") }).
		First(&format).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &format, err
}

func (r *PrintFormatRepository) SaveWithFields(db *gorm.DB, format *models.InvoicePrintFormat) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if format.IsDefault {
			if err := r.unsetDefaults(tx, format.CompanyID, format.BranchID, format.DocumentType, format.ID); err != nil {
				return err
			}
		}
		if err := tx.Save(format).Error; err != nil {
			return err
		}
		if err := tx.Where("print_format_id = ?", format.ID).Delete(&models.InvoicePrintFormatField{}).Error; err != nil {
			return err
		}
		for idx := range format.Fields {
			format.Fields[idx].PrintFormatID = format.ID
		}
		if len(format.Fields) > 0 {
			return tx.Create(&format.Fields).Error
		}
		return nil
	})
}

func (r *PrintFormatRepository) SoftDelete(db *gorm.DB, companyID, id uint64) error {
	return db.Model(&models.InvoicePrintFormat{}).
		Where("company_id = ? AND id = ?", companyID, id).
		Updates(map[string]interface{}{"is_active": false, "deleted_at": time.Now()}).Error
}

func (r *PrintFormatRepository) SetDefault(db *gorm.DB, companyID, id uint64) error {
	format, err := r.Get(db, companyID, id)
	if err != nil {
		return err
	}
	if format == nil {
		return gorm.ErrRecordNotFound
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := r.unsetDefaults(tx, companyID, format.BranchID, format.DocumentType, id); err != nil {
			return err
		}
		return tx.Model(&models.InvoicePrintFormat{}).Where("id = ?", id).Updates(map[string]interface{}{"is_default": true, "is_active": true}).Error
	})
}

func (r *PrintFormatRepository) FindDefault(db *gorm.DB, companyID uint64, branchID *uint64, documentType string) (*models.InvoicePrintFormat, error) {
	var format models.InvoicePrintFormat
	query := db.Where("company_id = ? AND document_type = ? AND is_default = ? AND is_active = ?", companyID, documentType, true, true).
		Preload("Fields", func(db *gorm.DB) *gorm.DB { return db.Order("display_order asc") })
	if branchID != nil {
		err := query.Where("branch_id = ?", *branchID).First(&format).Error
		if err == nil {
			return &format, nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	err := query.Session(&gorm.Session{}).Where("branch_id IS NULL").First(&format).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &format, err
}

func (r *PrintFormatRepository) unsetDefaults(db *gorm.DB, companyID uint64, branchID *uint64, documentType string, exceptID uint64) error {
	query := db.Model(&models.InvoicePrintFormat{}).
		Where("company_id = ? AND document_type = ?", companyID, documentType)
	if branchID == nil {
		query = query.Where("branch_id IS NULL")
	} else {
		query = query.Where("branch_id = ?", *branchID)
	}
	if exceptID > 0 {
		query = query.Where("id <> ?", exceptID)
	}
	return query.Update("is_default", false).Error
}
