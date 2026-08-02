package repositories

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type BankReconciliationRepository struct {
	db *gorm.DB
}

func NewBankReconciliationRepository(db *gorm.DB) *BankReconciliationRepository {
	return &BankReconciliationRepository{db: db}
}

func (r *BankReconciliationRepository) FindBankReconciliations(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankReconciliation, int64, error) {
	var reconciliations []models.BankReconciliation
	var total int64

	query := r.db.Model(&models.BankReconciliation{}).Where("company_id = ?", companyID)

	if accountID, ok := filters["bank_account_id"]; ok {
		query = query.Where("bank_account_id = ?", accountID)
	}

	if status, ok := filters["reconciliation_status"]; ok && status != "" {
		query = query.Where("reconciliation_status = ?", status)
	}

	if dateFrom, ok := filters["statement_date_from"]; ok && dateFrom != "" {
		query = query.Where("statement_start_date >= ?", dateFrom)
	}

	if dateTo, ok := filters["statement_date_to"]; ok && dateTo != "" {
		query = query.Where("statement_end_date <= ?", dateTo)
	}

	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("(reconciliation_number LIKE ?)", searchStr)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Preload("BankAccount").Limit(limit).Offset(offset).Order("id desc").Find(&reconciliations).Error

	return reconciliations, total, err
}

func (r *BankReconciliationRepository) FindBankReconciliationByID(companyID, reconciliationID uint64) (*models.BankReconciliation, error) {
	var reconciliation models.BankReconciliation
	err := r.db.Preload("BankAccount").
		Preload("Lines").
		Preload("Lines.BankTransaction").
		Where("company_id = ? AND id = ?", companyID, reconciliationID).
		First(&reconciliation).Error
	if err != nil {
		return nil, err
	}
	return &reconciliation, nil
}

func (r *BankReconciliationRepository) CreateBankReconciliationWithLines(reconciliation *models.BankReconciliation) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(reconciliation).Error; err != nil {
			return err
		}

		for i := range reconciliation.Lines {
			reconciliation.Lines[i].BankReconciliationID = reconciliation.ID
			if err := tx.Create(&reconciliation.Lines[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *BankReconciliationRepository) UpdateBankReconciliationWithLines(reconciliation *models.BankReconciliation, newLines []models.BankReconciliationLine) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete existing lines
		if err := tx.Where("bank_reconciliation_id = ?", reconciliation.ID).Delete(&models.BankReconciliationLine{}).Error; err != nil {
			return err
		}

		// Update header
		if err := tx.Save(reconciliation).Error; err != nil {
			return err
		}

		// Insert new lines
		for i := range newLines {
			newLines[i].BankReconciliationID = reconciliation.ID
			if err := tx.Create(&newLines[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *BankReconciliationRepository) CompleteBankReconciliation(reconciliation *models.BankReconciliation) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Update header
		if err := tx.Save(reconciliation).Error; err != nil {
			return err
		}

		// Mark lines as reconciled
		if err := tx.Model(&models.BankReconciliationLine{}).
			Where("bank_reconciliation_id = ?", reconciliation.ID).
			Updates(map[string]interface{}{
				"is_reconciled":   true,
				"reconciled_date": time.Now(),
			}).Error; err != nil {
			return err
		}

		// Mark transactions as reconciled
		var lines []models.BankReconciliationLine
		if err := tx.Where("bank_reconciliation_id = ?", reconciliation.ID).Find(&lines).Error; err != nil {
			return err
		}

		for _, line := range lines {
			if err := tx.Model(&models.BankTransaction{}).
				Where("id = ?", line.BankTransactionID).
				Updates(map[string]interface{}{
					"is_reconciled": true,
					"reconciled_at": time.Now(),
					"reconciled_by": reconciliation.CompletedBy,
				}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *BankReconciliationRepository) CancelBankReconciliation(reconciliation *models.BankReconciliation) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Update header
		if err := tx.Save(reconciliation).Error; err != nil {
			return err
		}

		// Mark lines as unreconciled
		if err := tx.Model(&models.BankReconciliationLine{}).
			Where("bank_reconciliation_id = ?", reconciliation.ID).
			Updates(map[string]interface{}{
				"is_reconciled":   false,
				"reconciled_date": nil,
			}).Error; err != nil {
			return err
		}

		// Mark transactions as unreconciled
		var lines []models.BankReconciliationLine
		if err := tx.Where("bank_reconciliation_id = ?", reconciliation.ID).Find(&lines).Error; err != nil {
			return err
		}

		for _, line := range lines {
			if err := tx.Model(&models.BankTransaction{}).
				Where("id = ?", line.BankTransactionID).
				Updates(map[string]interface{}{
					"is_reconciled": false,
					"reconciled_at": nil,
					"reconciled_by": nil,
				}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *BankReconciliationRepository) SoftDeleteBankReconciliation(reconciliation *models.BankReconciliation) error {
	return r.db.Delete(reconciliation).Error
}

func (r *BankReconciliationRepository) GetLastReconciliationNumber(companyID uint64) (string, error) {
	var reconciliation models.BankReconciliation
	err := r.db.Where("company_id = ?", companyID).Order("id desc").First(&reconciliation).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "BR-000000", nil
		}
		return "", err
	}
	return reconciliation.ReconciliationNumber, nil
}

func (r *BankReconciliationRepository) GenerateReconciliationNumber(companyID uint64) (string, error) {
	lastNumber, err := r.GetLastReconciliationNumber(companyID)
	if err != nil {
		return "", err
	}

	var seq int
	fmt.Sscanf(lastNumber, "BR-%06d", &seq)
	seq++

	return fmt.Sprintf("BR-%06d", seq), nil
}
