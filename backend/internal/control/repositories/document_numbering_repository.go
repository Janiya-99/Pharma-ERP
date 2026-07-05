package repositories

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DocumentNumberingRepository struct {
	db *gorm.DB
}

func NewDocumentNumberingRepository(db *gorm.DB) *DocumentNumberingRepository {
	return &DocumentNumberingRepository{db: db}
}

// GetDB returns the underlying GORM database
func (r *DocumentNumberingRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *DocumentNumberingRepository) ListRules(companyID uint64, module string, status string) ([]models.DocumentNumberingRule, error) {
	query := r.db.Where("company_id = ?", companyID)
	if module != "" {
		query = query.Where("module = ?", module)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	var rules []models.DocumentNumberingRule
	err := query.Order("module ASC, document_type ASC").Find(&rules).Error
	return rules, err
}

func (r *DocumentNumberingRepository) GetByID(id uint64) (*models.DocumentNumberingRule, error) {
	var rule models.DocumentNumberingRule
	err := r.db.Where("id = ?", id).First(&rule).Error
	if err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *DocumentNumberingRepository) GetRuleForDocument(companyID uint64, branchID *uint64, module string, docType string) (*models.DocumentNumberingRule, error) {
	var rule models.DocumentNumberingRule
	query := r.db.Where("company_id = ? AND module = ? AND document_type = ? AND status = ?", companyID, module, docType, "published")
	
	if branchID != nil && *branchID != 0 {
		// Try branch specific first
		err := query.Session(&gorm.Session{}).Where("branch_id = ?", *branchID).First(&rule).Error
		if err == nil {
			return &rule, nil
		}
	}
	
	// Fallback to company-wide (branch_id IS NULL)
	err := query.Where("branch_id IS NULL").First(&rule).Error
	if err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *DocumentNumberingRepository) SaveRule(rule *models.DocumentNumberingRule) error {
	return r.db.Save(rule).Error
}

func (r *DocumentNumberingRepository) DeleteRule(id uint64) error {
	return r.db.Delete(&models.DocumentNumberingRule{}, id).Error
}

// GetAndIncrementSequence atomically retrieves and increments the sequence number under row lock.
func (r *DocumentNumberingRepository) GetAndIncrementSequence(tx *gorm.DB, companyID uint64, branchID uint64, ruleID uint64, module string, docType string, periodKey string) (int64, error) {
	var seq models.DocumentNumberSequence

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("company_id = ? AND branch_id = ? AND rule_id = ? AND period_key = ?", companyID, branchID, ruleID, periodKey).
		First(&seq).Error

	now := time.Now()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			seq = models.DocumentNumberSequence{
				CompanyID:       companyID,
				BranchID:        branchID,
				RuleID:          ruleID,
				Module:          module,
				DocumentType:    docType,
				PeriodKey:       periodKey,
				CurrentNumber:   1,
				LastGeneratedAt: now,
				UpdatedAt:       now,
			}
			if createErr := tx.Create(&seq).Error; createErr != nil {
				return 0, createErr
			}
			return 1, nil
		}
		return 0, err
	}

	seq.CurrentNumber++
	seq.LastGeneratedAt = now
	seq.UpdatedAt = now

	if updateErr := tx.Save(&seq).Error; updateErr != nil {
		return 0, updateErr
	}

	return seq.CurrentNumber, nil
}
