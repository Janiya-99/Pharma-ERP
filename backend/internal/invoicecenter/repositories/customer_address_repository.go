package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CustomerAddressRepository struct{}

func NewCustomerAddressRepository() *CustomerAddressRepository {
	return &CustomerAddressRepository{}
}

func (r *CustomerAddressRepository) verifyCustomer(db *gorm.DB, companyID, customerID uint64) error {
	var count int64
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND id = ?", companyID, customerID).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return errors.New("customer not found in company")
	}
	return nil
}

func (r *CustomerAddressRepository) ListByCustomer(db *gorm.DB, companyID, customerID uint64) ([]models.CustomerAddress, error) {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return nil, err
	}
	var addresses []models.CustomerAddress
	if err := db.Where("customer_id = ?", customerID).Order("id asc").Find(&addresses).Error; err != nil {
		return nil, err
	}
	return addresses, nil
}

func (r *CustomerAddressRepository) GetByID(db *gorm.DB, companyID, customerID, addressID uint64) (*models.CustomerAddress, error) {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return nil, err
	}
	var address models.CustomerAddress
	if err := db.Where("customer_id = ? AND id = ?", customerID, addressID).First(&address).Error; err != nil {
		return nil, err
	}
	return &address, nil
}

func (r *CustomerAddressRepository) ResetDefault(db *gorm.DB, customerID uint64) error {
	return db.Model(&models.CustomerAddress{}).Where("customer_id = ? AND is_default = ?", customerID, true).Update("is_default", false).Error
}

func (r *CustomerAddressRepository) Create(db *gorm.DB, address *models.CustomerAddress) error {
	if address.IsDefault {
		r.ResetDefault(db, address.CustomerID)
	}
	return db.Create(address).Error
}

func (r *CustomerAddressRepository) Update(db *gorm.DB, address *models.CustomerAddress) error {
	if address.IsDefault {
		db.Model(&models.CustomerAddress{}).Where("customer_id = ? AND id != ?", address.CustomerID, address.ID).Update("is_default", false)
	}
	return db.Save(address).Error
}

func (r *CustomerAddressRepository) Delete(db *gorm.DB, companyID, customerID, addressID uint64) error {
	if err := r.verifyCustomer(db, companyID, customerID); err != nil {
		return err
	}
	return db.Where("customer_id = ? AND id = ?", customerID, addressID).Delete(&models.CustomerAddress{}).Error
}
