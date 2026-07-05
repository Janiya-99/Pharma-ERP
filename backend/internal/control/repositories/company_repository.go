package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type CompanyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) GetByCode(companyCode string) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("company_code = ?", companyCode).First(&company).Error
	if err != nil {
		if err := r.db.First(&company).Error; err != nil {
			return nil, err
		}
	}
	return &company, nil
}

func (r *CompanyRepository) Update(company *models.Company) error {
	// Only update specific fields to prevent overwriting critical ones
	return r.db.Model(company).Select(
		"CompanyName", "RegistrationNumber", "TaxNumber",
		"Address", "Phone", "Email", "LogoURL",
	).Updates(company).Error
}
