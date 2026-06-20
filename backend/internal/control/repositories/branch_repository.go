package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type BranchRepository struct {
	db *gorm.DB
}

func NewBranchRepository(db *gorm.DB) *BranchRepository {
	return &BranchRepository{db: db}
}

func (r *BranchRepository) List(status, branchType, search string, offset, limit int) ([]models.Branch, int64, error) {
	var branches []models.Branch
	var count int64

	query := r.db.Model(&models.Branch{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if branchType != "" {
		query = query.Where("branch_type = ?", branchType)
	}
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("branch_code LIKE ? OR branch_name LIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&count).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&branches).Error; err != nil {
		return nil, 0, err
	}

	return branches, count, nil
}

func (r *BranchRepository) GetByID(id uint64) (*models.Branch, error) {
	var branch models.Branch
	if err := r.db.First(&branch, id).Error; err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *BranchRepository) GetByCode(code string) (*models.Branch, error) {
	var branch models.Branch
	if err := r.db.Where("branch_code = ?", code).First(&branch).Error; err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *BranchRepository) Create(branch *models.Branch) error {
	return r.db.Create(branch).Error
}

func (r *BranchRepository) Update(branch *models.Branch) error {
	return r.db.Save(branch).Error
}

func (r *BranchRepository) UnsetMainBranches(excludeID uint64) error {
	query := r.db.Model(&models.Branch{}).Where("is_main_branch = ?", true)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	return query.Update("is_main_branch", false).Error
}

func (r *BranchRepository) SoftDelete(id uint64) error {
	return r.db.Delete(&models.Branch{}, id).Error
}

func (r *BranchRepository) CountActiveBranches() (int64, error) {
	var count int64
	err := r.db.Model(&models.Branch{}).Where("status = ?", "active").Count(&count).Error
	return count, err
}

func (r *BranchRepository) HasActiveUsers(branchID uint64) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBranchAccess{}).Where("branch_id = ? AND status = ?", branchID, "active").Count(&count).Error
	return count > 0, err
}
