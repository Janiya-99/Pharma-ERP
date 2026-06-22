package services

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type ChequeBookService struct {
	bookRepo *repositories.ChequeBookRepository
	bankRepo *repositories.BankAccountRepository
	auditSvc *AuditLogService
}

func NewChequeBookService(bookRepo *repositories.ChequeBookRepository, bankRepo *repositories.BankAccountRepository, auditSvc *AuditLogService) *ChequeBookService {
	return &ChequeBookService{
		bookRepo: bookRepo,
		bankRepo: bankRepo,
		auditSvc: auditSvc,
	}
}

func (s *ChequeBookService) ListChequeBooks(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.ChequeBook, int64, error) {
	return s.bookRepo.FindChequeBooks(companyID, filters, page, limit)
}

func (s *ChequeBookService) GetChequeBookByID(companyID, id uint64) (*models.ChequeBook, error) {
	return s.bookRepo.FindChequeBookByID(companyID, id)
}

func (s *ChequeBookService) CreateChequeBook(companyID, userID uint64, req dto.CreateChequeBookRequest) (*models.ChequeBook, error) {
	account, err := s.bankRepo.FindBankAccountByID(companyID, req.BankAccountID)
	if err != nil || account.Status != "active" {
		return nil, errors.New("invalid or inactive bank account")
	}

	startLeaf, err := strconv.Atoi(req.StartLeafNumber)
	if err != nil {
		return nil, errors.New("start_leaf_number must be numeric")
	}

	endLeaf, err := strconv.Atoi(req.EndLeafNumber)
	if err != nil {
		return nil, errors.New("end_leaf_number must be numeric")
	}

	if startLeaf > endLeaf {
		return nil, errors.New("start_leaf_number cannot be greater than end_leaf_number")
	}

	totalLeaves := endLeaf - startLeaf + 1

	var issuedDate *time.Time
	if req.IssuedDate != nil && *req.IssuedDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *req.IssuedDate)
		if err == nil {
			issuedDate = &parsedDate
		}
	}

	book := &models.ChequeBook{
		CompanyID:        companyID,
		BranchID:         req.BranchID,
		BankAccountID:    req.BankAccountID,
		ChequeBookNumber: req.ChequeBookNumber,
		StartLeafNumber:  req.StartLeafNumber,
		EndLeafNumber:    req.EndLeafNumber,
		TotalLeaves:      totalLeaves,
		AvailableLeaves:  totalLeaves,
		IssuedDate:       issuedDate,
		Remarks:          req.Remarks,
		Status:           req.Status,
		CreatedBy:        &userID,
		UpdatedBy:        &userID,
	}
	if book.Status == "" {
		book.Status = "active"
	}

	leaves := make([]models.ChequeLeaf, 0, totalLeaves)
	formatStr := fmt.Sprintf("%%0%dd", len(req.StartLeafNumber))

	for i := startLeaf; i <= endLeaf; i++ {
		chequeNumber := fmt.Sprintf(formatStr, i)
		leaves = append(leaves, models.ChequeLeaf{
			CompanyID:     companyID,
			BranchID:      req.BranchID,
			BankAccountID: req.BankAccountID,
			ChequeNumber:  chequeNumber,
			LeafStatus:    "available",
			CreatedBy:     &userID,
			UpdatedBy:     &userID,
		})
	}
	book.ChequeLeaves = leaves

	if err := s.bookRepo.CreateChequeBookWithLeaves(book); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "CHEQUE_BOOK_CREATED", "Cheque book created", book.ID)

	return book, nil
}

func (s *ChequeBookService) UpdateChequeBook(companyID, userID, id uint64, req dto.UpdateChequeBookRequest) (*models.ChequeBook, error) {
	book, err := s.bookRepo.FindChequeBookByID(companyID, id)
	if err != nil {
		return nil, err
	}

	book.Remarks = req.Remarks
	book.Status = req.Status
	book.UpdatedBy = &userID

	if err := s.bookRepo.UpdateChequeBook(book); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "CHEQUE_BOOK_UPDATED", "Cheque book updated", book.ID)

	return book, nil
}

func (s *ChequeBookService) DeleteChequeBook(companyID, userID, id uint64) error {
	book, err := s.bookRepo.FindChequeBookByID(companyID, id)
	if err != nil {
		return err
	}

	if book.UsedLeaves > 0 || book.CancelledLeaves > 0 {
		return errors.New("cannot delete cheque book with used or cancelled leaves")
	}

	if err := s.bookRepo.SoftDeleteChequeBook(book); err != nil {
		return err
	}

	s.auditSvc.LogAction(companyID, userID, "CHEQUE_BOOK_DELETED", "Cheque book deleted", book.ID)
	return nil
}

func (s *ChequeBookService) CancelChequeLeaf(companyID, userID, id uint64, req dto.CancelChequeLeafRequest) error {
	leaf, err := s.bookRepo.FindChequeLeafByID(companyID, id)
	if err != nil {
		return err
	}

	if leaf.LeafStatus != "available" {
		return errors.New("only available cheque leaves can be cancelled")
	}

	now := time.Now()
	leaf.LeafStatus = "cancelled"
	leaf.CancelledDate = &now
	leaf.CancelReason = req.CancelReason
	leaf.UpdatedBy = &userID

	if err := s.bookRepo.UpdateChequeLeafStatus(leaf); err != nil {
		return err
	}

	book, _ := s.bookRepo.FindChequeBookByID(companyID, leaf.ChequeBookID)
	if book != nil {
		book.CancelledLeaves++
		book.AvailableLeaves--
		_ = s.bookRepo.UpdateChequeBook(book)
	}

	s.auditSvc.LogAction(companyID, userID, "CHEQUE_LEAF_CANCELLED", "Cheque leaf cancelled", leaf.ID)
	return nil
}
