package repositories

import (
	"errors"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type JournalEntryRepository interface {
	GetDB() *gorm.DB
	FindJournalEntries(companyID uint64, filter map[string]interface{}, page, limit int, search string) ([]models.JournalEntry, int64, error)
	FindJournalEntryByID(companyID, journalID uint64) (*models.JournalEntry, error)
	CreateJournalEntryWithLines(journal *models.JournalEntry) error
	UpdateJournalEntryWithLines(journal *models.JournalEntry) error
	SoftDeleteJournalEntry(companyID, journalID uint64) error
	UpdateJournalStatus(journalID uint64, updates map[string]interface{}) error
	CreateApprovalRecord(approval *models.JournalEntryApproval) error
	CreateReversalRecord(reversal *models.JournalEntryReversal) error
	GetLastJournalNumber(companyID uint64) (string, error)
	UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error
}

type journalEntryRepository struct {
	db *gorm.DB
}

func NewJournalEntryRepository(db *gorm.DB) JournalEntryRepository {
	return &journalEntryRepository{db: db}
}

func (r *journalEntryRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *journalEntryRepository) FindJournalEntries(companyID uint64, filter map[string]interface{}, page, limit int, search string) ([]models.JournalEntry, int64, error) {
	var journals []models.JournalEntry
	var total int64

	query := r.db.Model(&models.JournalEntry{}).Where("company_id = ?", companyID)

	if fy, ok := filter["financial_year_id"]; ok && fy != "" {
		query = query.Where("financial_year_id = ?", fy)
	}
	if ap, ok := filter["accounting_period_id"]; ok && ap != "" {
		query = query.Where("accounting_period_id = ?", ap)
	}
	if status, ok := filter["approval_status"]; ok && status != "" {
		query = query.Where("approval_status = ?", status)
	}
	if posted, ok := filter["posted_status"]; ok && posted != "" {
		query = query.Where("posted_status = ?", posted)
	}
	if from, ok := filter["journal_date_from"]; ok && from != "" {
		query = query.Where("journal_date >= ?", from)
	}
	if to, ok := filter["journal_date_to"]; ok && to != "" {
		query = query.Where("journal_date <= ?", to)
	}

	if search != "" {
		query = query.Where("journal_number LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("Lines").Offset(offset).Limit(limit).Order("journal_date DESC, id DESC").Find(&journals).Error; err != nil {
		return nil, 0, err
	}

	return journals, total, nil
}

func (r *journalEntryRepository) FindJournalEntryByID(companyID, journalID uint64) (*models.JournalEntry, error) {
	var journal models.JournalEntry
	err := r.db.Preload("Lines").
		Preload("Lines.Account").
		Preload("Approvals").
		Preload("Reversals").
		Where("company_id = ? AND id = ?", companyID, journalID).
		First(&journal).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("journal entry not found")
		}
		return nil, err
	}
	return &journal, nil
}

func (r *journalEntryRepository) CreateJournalEntryWithLines(journal *models.JournalEntry) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(journal).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *journalEntryRepository) UpdateJournalEntryWithLines(journal *models.JournalEntry) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// First delete existing lines
		if err := tx.Where("journal_entry_id = ?", journal.ID).Delete(&models.JournalEntryLine{}).Error; err != nil {
			return err
		}

		// Update header
		if err := tx.Save(journal).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *journalEntryRepository) SoftDeleteJournalEntry(companyID, journalID uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, journalID).Delete(&models.JournalEntry{}).Error
}

func (r *journalEntryRepository) UpdateJournalStatus(journalID uint64, updates map[string]interface{}) error {
	return r.db.Model(&models.JournalEntry{}).Where("id = ?", journalID).Updates(updates).Error
}

func (r *journalEntryRepository) CreateApprovalRecord(approval *models.JournalEntryApproval) error {
	return r.db.Create(approval).Error
}

func (r *journalEntryRepository) CreateReversalRecord(reversal *models.JournalEntryReversal) error {
	return r.db.Create(reversal).Error
}

func (r *journalEntryRepository) GetLastJournalNumber(companyID uint64) (string, error) {
	var journal models.JournalEntry
	err := r.db.Where("company_id = ?", companyID).Order("id DESC").First(&journal).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		return "", err
	}
	return journal.JournalNumber, nil
}

func (r *journalEntryRepository) UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error {
	var account models.ChartOfAccount
	if err := tx.Where("id = ?", accountID).First(&account).Error; err != nil {
		return fmt.Errorf("account not found: %d", accountID)
	}

	if amount == 0 {
		return nil
	}

	// Balance logic:
	// For Debit normal balance accounts: Debit increases balance, Credit decreases balance
	// For Credit normal balance accounts: Credit increases balance, Debit decreases balance

	balanceChange := amount
	if account.NormalBalance == "Debit" {
		if !isDebit {
			balanceChange = -amount
		}
	} else if account.NormalBalance == "Credit" {
		if isDebit {
			balanceChange = -amount
		}
	}

	newBalance := account.CurrentBalance + balanceChange

	if err := tx.Model(&account).Update("current_balance", newBalance).Error; err != nil {
		return err
	}

	return nil
}
