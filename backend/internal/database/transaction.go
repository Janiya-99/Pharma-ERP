package database

import (
	"fmt"

	"gorm.io/gorm"
)

// WithTransaction wraps a function in a database transaction.
// If the function returns an error or panics, the transaction is rolled back.
// If the function succeeds, the transaction is committed.
//
// Usage (in service layer):
//
//	err := database.WithTransaction(db, func(tx *gorm.DB) error {
//	    if err := journalRepo.Create(tx, entry); err != nil {
//	        return err
//	    }
//	    for _, line := range lines {
//	        if err := lineRepo.Create(tx, line); err != nil {
//	            return err
//	        }
//	    }
//	    if err := ledgerRepo.PostEntries(tx, ledgerEntries); err != nil {
//	        return err
//	    }
//	    return nil // commit
//	})
func WithTransaction(db *gorm.DB, fn func(tx *gorm.DB) error) (err error) {
	tx := db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			err = fmt.Errorf("transaction panicked: %v", r)
		}
	}()

	if err = fn(tx); err != nil {
		if rbErr := tx.Rollback().Error; rbErr != nil {
			return fmt.Errorf("tx error: %w, rollback error: %v", err, rbErr)
		}
		return err
	}

	if err = tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
