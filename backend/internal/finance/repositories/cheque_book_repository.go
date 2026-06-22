package repositories

import (
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type ChequeBookRepository struct {
	db *gorm.DB
}

func NewChequeBookRepository(db *gorm.DB) *ChequeBookRepository {
	return &ChequeBookRepository{db: db}
}

func (r *ChequeBookRepository) FindChequeBooks(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.ChequeBook, int64, error) {
	var books []models.ChequeBook
	var total int64

	query := r.db.Model(&models.ChequeBook{}).Where("company_id = ?", companyID)

	if accountID, ok := filters["bank_account_id"]; ok {
		query = query.Where("bank_account_id = ?", accountID)
	}

	if status, ok := filters["status"]; ok && status != "" {
		query = query.Where("status = ?", status)
	}

	if search, ok := filters["search"]; ok && search != "" {
		searchStr := "%" + search.(string) + "%"
		query = query.Where("(cheque_book_number LIKE ?)", searchStr)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Preload("BankAccount").Limit(limit).Offset(offset).Order("id desc").Find(&books).Error

	return books, total, err
}

func (r *ChequeBookRepository) FindChequeBookByID(companyID, bookID uint64) (*models.ChequeBook, error) {
	var book models.ChequeBook
	err := r.db.Preload("BankAccount").Preload("ChequeLeaves").Where("company_id = ? AND id = ?", companyID, bookID).First(&book).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *ChequeBookRepository) CreateChequeBookWithLeaves(book *models.ChequeBook) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(book).Error; err != nil {
			return err
		}

		for i := range book.ChequeLeaves {
			book.ChequeLeaves[i].ChequeBookID = book.ID
			if err := tx.Create(&book.ChequeLeaves[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *ChequeBookRepository) UpdateChequeBook(book *models.ChequeBook) error {
	return r.db.Save(book).Error
}

func (r *ChequeBookRepository) SoftDeleteChequeBook(book *models.ChequeBook) error {
	return r.db.Delete(book).Error
}

func (r *ChequeBookRepository) UpdateChequeLeafStatus(leaf *models.ChequeLeaf) error {
	return r.db.Save(leaf).Error
}

func (r *ChequeBookRepository) FindChequeLeafByID(companyID, leafID uint64) (*models.ChequeLeaf, error) {
	var leaf models.ChequeLeaf
	err := r.db.Where("company_id = ? AND id = ?", companyID, leafID).First(&leaf).Error
	if err != nil {
		return nil, err
	}
	return &leaf, nil
}
