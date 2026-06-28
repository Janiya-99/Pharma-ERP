package repositories

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CustomerRepository struct{}

func NewCustomerRepository() *CustomerRepository {
	return &CustomerRepository{}
}

func (r *CustomerRepository) GenerateCode(db *gorm.DB, companyID uint64) (string, error) {
	var codes []string
	if err := db.Model(&models.Customer{}).Unscoped().Where("company_id = ? AND customer_code LIKE ?", companyID, "CUST-%").Pluck("customer_code", &codes).Error; err != nil {
		return "", err
	}

	maxSeq := 0
	for _, c := range codes {
		parts := strings.Split(c, "CUST-")
		if len(parts) == 2 {
			if num, err := strconv.Atoi(parts[1]); err == nil {
				if num > maxSeq {
					maxSeq = num
				}
			}
		}
	}

	return fmt.Sprintf("CUST-%06d", maxSeq+1), nil
}

func (r *CustomerRepository) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.Customer, int64, error) {
	var customers []models.Customer
	var total int64

	query := db.Model(&models.Customer{}).Preload("Category").Where("company_id = ?", companyID)

	if v, ok := filters["customer_category_id"]; ok && v != "" {
		query = query.Where("customer_category_id = ?", v)
	}
	if v, ok := filters["customer_type"]; ok && v != "" {
		query = query.Where("customer_type = ?", v)
	}
	if v, ok := filters["status"]; ok && v != "" {
		query = query.Where("status = ?", v)
	}

	if search != "" {
		s := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(customer_code) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(primary_contact_person) LIKE ? OR LOWER(primary_contact_number) LIKE ? OR LOWER(primary_email) LIKE ?", s, s, s, s, s)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit > 0 {
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	if err := query.Order("id desc").Find(&customers).Error; err != nil {
		return nil, 0, err
	}

	return customers, total, nil
}

func (r *CustomerRepository) GetByID(db *gorm.DB, companyID uint64, id uint64) (*models.Customer, error) {
	var customer models.Customer
	if err := db.Preload("Category").Preload("Addresses").Preload("Contacts").Where("company_id = ? AND id = ?", companyID, id).First(&customer).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *CustomerRepository) GetByCode(db *gorm.DB, companyID uint64, code string) (*models.Customer, error) {
	var customer models.Customer
	if err := db.Where("company_id = ? AND LOWER(customer_code) = ?", companyID, strings.ToLower(code)).First(&customer).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *CustomerRepository) Create(db *gorm.DB, customer *models.Customer) error {
	return db.Create(customer).Error
}

func (r *CustomerRepository) Update(db *gorm.DB, customer *models.Customer) error {
	return db.Save(customer).Error
}

func (r *CustomerRepository) UpdateStatus(db *gorm.DB, companyID, id uint64, status string) error {
	return db.Model(&models.Customer{}).Where("company_id = ? AND id = ?", companyID, id).Update("status", status).Error
}

func (r *CustomerRepository) Delete(db *gorm.DB, companyID uint64, id uint64) error {
	var customer models.Customer
	if err := db.Where("company_id = ? AND id = ?", companyID, id).First(&customer).Error; err != nil {
		return err
	}

	// Check transactions
	var count int64
	db.Model(&models.SalesOrder{}).Where("customer_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete customer linked to sales orders")
	}

	db.Model(&models.SalesInvoice{}).Where("customer_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete customer linked to sales invoices")
	}

	db.Model(&models.CreditNote{}).Where("customer_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete customer linked to credit notes")
	}

	db.Model(&models.DebitNote{}).Where("customer_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete customer linked to debit notes")
	}

	db.Model(&models.CustomerReceipt{}).Where("customer_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete customer linked to customer receipts")
	}

	// Delete addresses & contacts associated
	db.Where("customer_id = ?", id).Delete(&models.CustomerAddress{})
	db.Where("customer_id = ?", id).Delete(&models.CustomerContact{})

	return db.Delete(&customer).Error
}
