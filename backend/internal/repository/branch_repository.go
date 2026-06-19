package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

type BranchRepository struct {
	db *gorm.DB
}

func NewBranchRepository(db *gorm.DB) *BranchRepository {
	return &BranchRepository{db: db}
}

func (r *BranchRepository) FindByID(id uint64) (*model.Branch, error) {
	var branch model.Branch
	err := r.db.First(&branch, id).Error
	if err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *BranchRepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.Branch, int64, error) {
	var list []model.Branch
	var total int64

	query := r.db.Model(&model.Branch{}).
		Scopes(model.ScopeByCompany(companyID))

	if req.Search != "" {
		query = query.Where("name LIKE ? OR code LIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &list, &total)
	return list, total, err
}

func (r *BranchRepository) Create(db *gorm.DB, branch *model.Branch) error {
	if db == nil {
		db = r.db
	}
	return db.Create(branch).Error
}

func (r *BranchRepository) Update(db *gorm.DB, branch *model.Branch) error {
	if db == nil {
		db = r.db
	}
	return db.Save(branch).Error
}

func (r *BranchRepository) Delete(id uint64) error {
	return r.db.Delete(&model.Branch{}, id).Error
}
