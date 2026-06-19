package repository

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// CoARepository handles chart of accounts data access.
type CoARepository struct {
	db *gorm.DB
}

func NewCoARepository(db *gorm.DB) *CoARepository {
	return &CoARepository{db: db}
}

func (r *CoARepository) FindByID(id uint64, companyID uint64) (*model.ChartOfAccounts, error) {
	var account model.ChartOfAccounts
	err := r.db.
		Preload("Category").
		Preload("Category.SubCategory").
		Preload("Category.SubCategory.MainCategory").
		Preload("Category.SubCategory.MainCategory.MainCategoryType").
		First(&account, id).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *CoARepository) List(companyID uint64, req *dto.PaginationRequest) ([]model.ChartOfAccounts, int64, error) {
	var accounts []model.ChartOfAccounts
	var total int64

	query := r.db.Model(&model.ChartOfAccounts{}).
		Preload("Category").
		Preload("Category.SubCategory").
		Preload("Category.SubCategory.MainCategory").
		Preload("Category.SubCategory.MainCategory.MainCategoryType")

	if req.Search != "" {
		query = query.Where("gl_code LIKE ? OR name LIKE ?",
			"%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &accounts, &total)
	return accounts, total, err
}

// ListTree returns accounts sorted by gl_code.
func (r *CoARepository) ListTree(companyID uint64) ([]model.ChartOfAccounts, error) {
	var accounts []model.ChartOfAccounts
	err := r.db.
		Preload("Category").
		Preload("Category.SubCategory").
		Preload("Category.SubCategory.MainCategory").
		Preload("Category.SubCategory.MainCategory.MainCategoryType").
		Order("gl_code ASC").
		Find(&accounts).Error
	return accounts, err
}

func (r *CoARepository) Create(db *gorm.DB, account *model.ChartOfAccounts) error {
	if db == nil {
		db = r.db
	}
	return db.Create(account).Error
}

func (r *CoARepository) Update(db *gorm.DB, account *model.ChartOfAccounts) error {
	if db == nil {
		db = r.db
	}
	return db.Save(account).Error
}

func (r *CoARepository) Delete(id uint64) error {
	return r.db.Delete(&model.ChartOfAccounts{}, id).Error
}

// AccountCodeExists checks if an account GL code exists.
func (r *CoARepository) AccountCodeExists(companyID uint64, code string, excludeID uint64) (bool, error) {
	var count int64
	query := r.db.Model(&model.ChartOfAccounts{}).
		Where("gl_code = ?", code)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}

// FindByAccountCode returns an account by its GL code.
func (r *CoARepository) FindByAccountCode(companyID uint64, code string) (*model.ChartOfAccounts, error) {
	var account model.ChartOfAccounts
	err := r.db.Where("gl_code = ?", code).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}
