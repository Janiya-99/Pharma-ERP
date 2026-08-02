package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CustomerContactRepository struct{}

func NewCustomerContactRepository() *CustomerContactRepository {
	return &CustomerContactRepository{}
}

func (r *CustomerContactRepository) verifyCustomer(db *gorm.DB, companyID, customerID uint64) error {
	var count int64
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND id = ?", companyID, customerID).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return errors.New("customer not found in company")
	}
	return nil
}

func (r *CustomerContactRepository) ListByCustomer(db *gorm.DB, companyID, customerID uint64) ([]models.CustomerContact, error) {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return nil, err
	}
	var contacts []models.CustomerContact
	if err := db.Where("customer_id = ?", customerID).Order("id asc").Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}

func (r *CustomerContactRepository) GetByID(db *gorm.DB, companyID, customerID, contactID uint64) (*models.CustomerContact, error) {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return nil, err
	}
	var contact models.CustomerContact
	if err := db.Where("customer_id = ? AND id = ?", customerID, contactID).First(&contact).Error; err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *CustomerContactRepository) ResetPrimary(db *gorm.DB, customerID uint64) error {
	return db.Model(&models.CustomerContact{}).Where("customer_id = ? AND is_primary = ?", customerID, true).Update("is_primary", false).Error
}

func (r *CustomerContactRepository) Create(db *gorm.DB, contact *models.CustomerContact) error {
	if contact.IsPrimary {
		r.ResetPrimary(db, contact.CustomerID)
	}
	return db.Create(contact).Error
}

func (r *CustomerContactRepository) Update(db *gorm.DB, contact *models.CustomerContact) error {
	if contact.IsPrimary {
		db.Model(&models.CustomerContact{}).Where("customer_id = ? AND id != ?", contact.CustomerID, contact.ID).Update("is_primary", false)
	}
	return db.Save(contact).Error
}

func (r *CustomerContactRepository) Delete(db *gorm.DB, companyID, customerID, contactID uint64) error {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return err
	}
	return db.Where("customer_id = ? AND id = ?", customerID, contactID).Delete(&models.CustomerContact{}).Error
}
