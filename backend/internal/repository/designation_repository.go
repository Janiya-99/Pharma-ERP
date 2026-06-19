package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type DesignationRepository struct {
	db *gorm.DB
}

func NewDesignationRepository(db *gorm.DB) *DesignationRepository {
	return &DesignationRepository{db: db}
}

func (r *DesignationRepository) FindByID(id uint64) (*model.Designation, error) {
	var des model.Designation
	err := r.db.First(&des, id).Error
	if err != nil {
		return nil, err
	}
	return &des, nil
}

func (r *DesignationRepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.Designation, int64, error) {
	var list []model.Designation
	var total int64

	query := r.db.Model(&model.Designation{}).
		Scopes(model.ScopeByCompany(companyID))

	if req.Search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &list, &total)
	return list, total, err
}

func (r *DesignationRepository) Create(db *gorm.DB, des *model.Designation) error {
	if db == nil {
		db = r.db
	}
	return db.Create(des).Error
}

func (r *DesignationRepository) Update(db *gorm.DB, des *model.Designation) error {
	if db == nil {
		db = r.db
	}
	return db.Save(des).Error
}

func (r *DesignationRepository) Delete(id uint64) error {
	return r.db.Delete(&model.Designation{}, id).Error
}
