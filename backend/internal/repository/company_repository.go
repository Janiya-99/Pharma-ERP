package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type CompanyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) FindByID(id uint64) (*model.Company, error) {
	var company model.Company
	err := r.db.Preload("Branches").First(&company, id).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

func (r *CompanyRepository) List(req *dto.PaginationRequest) ([]model.Company, int64, error) {
	var list []model.Company
	var total int64

	query := r.db.Model(&model.Company{})

	if req.Search != "" {
		query = query.Where("name LIKE ? OR code LIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &list, &total)
	return list, total, err
}

func (r *CompanyRepository) Create(db *gorm.DB, company *model.Company) error {
	if db == nil {
		db = r.db
	}
	return db.Create(company).Error
}

func (r *CompanyRepository) Update(db *gorm.DB, company *model.Company) error {
	if db == nil {
		db = r.db
	}
	return db.Save(company).Error
}

func (r *CompanyRepository) Delete(id uint64) error {
	return r.db.Delete(&model.Company{}, id).Error
}
