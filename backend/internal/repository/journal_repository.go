package repository

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// JournalRepository handles journal entry data access.
type JournalRepository struct {
	db *gorm.DB
}

func NewJournalRepository(db *gorm.DB) *JournalRepository {
	return &JournalRepository{db: db}
}

func (r *JournalRepository) FindByID(id uint64, branchID uint64) (*model.JournalEntry, error) {
	var entry model.JournalEntry
	err := r.db.
		Where("branch_id = ?", branchID).
		Preload("Details").
		Preload("Details.Account").
		Preload("Details.Account.Category").
		Preload("Details.Account.Category.SubCategory").
		Preload("Details.Account.Category.SubCategory.MainCategory").
		Preload("Details.Account.Category.SubCategory.MainCategory.MainCategoryType").
		Preload("Approvals").
		Preload("Approvals.User").
		First(&entry, id).Error
	if err != nil {
		return nil, err
	}
	return &entry, nil
}

func (r *JournalRepository) List(branchID uint64, req *dto.PaginationRequest) ([]model.JournalEntry, int64, error) {
	var entries []model.JournalEntry
	var total int64

	query := r.db.Model(&model.JournalEntry{}).
		Where("branch_id = ?", branchID)

	if req.Search != "" {
		query = query.Where("ref_no LIKE ? OR description LIKE ?",
			"%"+req.Search+"%", "%"+req.Search+"%")
	}

	err := Paginate(query, req, &entries, &total)
	return entries, total, err
}

// Create creates a journal entry with its details within a transaction.
func (r *JournalRepository) Create(tx *gorm.DB, entry *model.JournalEntry) error {
	return tx.Create(entry).Error
}

// Update updates a journal entry within a transaction.
func (r *JournalRepository) Update(tx *gorm.DB, entry *model.JournalEntry) error {
	return tx.Save(entry).Error
}

// UpdateStatus updates only the status field of a journal entry.
func (r *JournalRepository) UpdateStatus(tx *gorm.DB, id uint64, status model.FirstApproveStatus, updates map[string]interface{}) error {
	if updates == nil {
		updates = make(map[string]interface{})
	}
	updates["first_approve_status"] = status
	return tx.Model(&model.JournalEntry{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft-deletes a journal entry (only if pending).
func (r *JournalRepository) Delete(id uint64) error {
	return r.db.Delete(&model.JournalEntry{}, id).Error
}

// GenerateEntryNumber creates the next sequential entry number for a branch.
// Format: JE-{BRANCH_ID}-{SEQUENCE} e.g., JE-1-000001
func (r *JournalRepository) GenerateEntryNumber(tx *gorm.DB, branchID uint64) (string, error) {
	var count int64
	err := tx.Model(&model.JournalEntry{}).
		Where("branch_id = ?", branchID).
		Count(&count).Error
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("JE-%d-%06d", branchID, count+1), nil
}

// CreateDetails creates journal entry details within a transaction.
func (r *JournalRepository) CreateDetails(tx *gorm.DB, details []model.JournalEntryDetail) error {
	return tx.Create(&details).Error
}

// DeleteDetails removes all details for a journal entry (for updates).
func (r *JournalRepository) DeleteDetails(tx *gorm.DB, journalEntryID uint64) error {
	return tx.Where("journal_entry_id = ?", journalEntryID).
		Delete(&model.JournalEntryDetail{}).Error
}
