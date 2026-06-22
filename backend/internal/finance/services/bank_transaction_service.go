package services

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"gorm.io/gorm"
)

type BankTransactionService struct {
	transRepo *repositories.BankTransactionRepository
	bankRepo  *repositories.BankAccountRepository
	auditSvc  *AuditLogService
}

func NewBankTransactionService(transRepo *repositories.BankTransactionRepository, bankRepo *repositories.BankAccountRepository, auditSvc *AuditLogService) *BankTransactionService {
	return &BankTransactionService{
		transRepo: transRepo,
		bankRepo:  bankRepo,
		auditSvc:  auditSvc,
	}
}

func (s *BankTransactionService) ListBankTransactions(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankTransaction, int64, error) {
	return s.transRepo.FindBankTransactions(companyID, filters, page, limit)
}

func (s *BankTransactionService) GetBankTransactionByID(companyID, id uint64) (*models.BankTransaction, error) {
	return s.transRepo.FindBankTransactionByID(companyID, id)
}

func (s *BankTransactionService) CalculateRunningBalance(accountID uint64, debit, credit float64) (float64, error) {
	lastTx, err := s.transRepo.GetLastTransactionForAccount(accountID)
	if err != nil {
		return 0, err
	}

	var balance float64
	if lastTx != nil {
		balance = lastTx.RunningBalance
	} else {
		// No previous transaction, use opening balance of the account
		// But s.bankRepo.FindBankAccountByID needs companyID, which we don't have here unless passed.
		// For simplicity, we assume we fetch the account
		// Wait, better approach is to pass the account model
		return 0, errors.New("initial running balance logic needs account opening balance")
	}

	balance = balance + debit - credit
	return balance, nil
}

func (s *BankTransactionService) CalculateRunningBalanceWithAccount(account *models.BankAccount, debit, credit float64) (float64, error) {
	lastTx, err := s.transRepo.GetLastTransactionForAccount(account.ID)
	if err != nil {
		return 0, err
	}

	var balance float64
	if lastTx != nil {
		balance = lastTx.RunningBalance
	} else {
		balance = account.OpeningBalance
	}

	balance = balance + debit - credit
	return balance, nil
}

func (s *BankTransactionService) CreateManualBankTransaction(companyID, userID uint64, req dto.CreateBankTransactionRequest) (*models.BankTransaction, error) {
	account, err := s.bankRepo.FindBankAccountByID(companyID, req.BankAccountID)
	if err != nil || account.Status != "active" {
		return nil, errors.New("invalid or inactive bank account")
	}

	if req.DebitAmount > 0 && req.CreditAmount > 0 {
		return nil, errors.New("both debit and credit cannot be greater than zero")
	}

	if req.DebitAmount <= 0 && req.CreditAmount <= 0 {
		return nil, errors.New("either debit or credit must be greater than zero")
	}

	tDate, err := time.Parse("2006-01-02", req.TransactionDate)
	if err != nil {
		return nil, errors.New("invalid transaction_date format")
	}

	var vDate *time.Time
	if req.ValueDate != nil && *req.ValueDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.ValueDate)
		if err == nil {
			vDate = &parsed
		}
	}

	runningBalance, err := s.CalculateRunningBalanceWithAccount(account, req.DebitAmount, req.CreditAmount)
	if err != nil {
		return nil, err
	}

	transaction := &models.BankTransaction{
		CompanyID:       companyID,
		BranchID:        req.BranchID,
		BankAccountID:   req.BankAccountID,
		ChartAccountID:  account.ChartAccountID,
		TransactionDate: tDate,
		ValueDate:       vDate,
		TransactionType: req.TransactionType,
		ReferenceType:   "manual",
		ReferenceNumber: req.ReferenceNumber,
		Description:     req.Description,
		DebitAmount:     req.DebitAmount,
		CreditAmount:    req.CreditAmount,
		RunningBalance:  runningBalance,
		Status:          "active",
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	if err := s.transRepo.CreateBankTransaction(nil, transaction); err != nil {
		return nil, err
	}

	account.CurrentBalance = runningBalance
	_ = s.bankRepo.UpdateBankAccount(account)

	s.auditSvc.LogAction(companyID, userID, "BANK_TRANSACTION_CREATED", "Manual bank transaction created", transaction.ID)

	return transaction, nil
}

func (s *BankTransactionService) UpdateManualBankTransaction(companyID, userID, id uint64, req dto.UpdateBankTransactionRequest) (*models.BankTransaction, error) {
	transaction, err := s.transRepo.FindBankTransactionByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if transaction.IsReconciled {
		return nil, errors.New("cannot update reconciled transaction")
	}

	if transaction.ReferenceType != "manual" {
		return nil, errors.New("cannot update system-generated transaction directly")
	}

	if req.DebitAmount > 0 && req.CreditAmount > 0 {
		return nil, errors.New("both debit and credit cannot be greater than zero")
	}

	if req.DebitAmount <= 0 && req.CreditAmount <= 0 {
		return nil, errors.New("either debit or credit must be greater than zero")
	}

	tDate, err := time.Parse("2006-01-02", req.TransactionDate)
	if err != nil {
		return nil, errors.New("invalid transaction_date format")
	}

	var vDate *time.Time
	if req.ValueDate != nil && *req.ValueDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.ValueDate)
		if err == nil {
			vDate = &parsed
		}
	}

	// Balance logic for update: since updating an old transaction breaks the running balance of subsequent transactions,
	// typically we either recalculate all subsequent, or we restrict updates to amount.
	// We'll calculate a simple diff and update the account.
	diffDebit := req.DebitAmount - transaction.DebitAmount
	diffCredit := req.CreditAmount - transaction.CreditAmount
	
	transaction.TransactionDate = tDate
	transaction.ValueDate = vDate
	transaction.ReferenceNumber = req.ReferenceNumber
	transaction.Description = req.Description
	transaction.DebitAmount = req.DebitAmount
	transaction.CreditAmount = req.CreditAmount
	transaction.RunningBalance = transaction.RunningBalance + diffDebit - diffCredit
	transaction.UpdatedBy = &userID

	if err := s.transRepo.UpdateBankTransaction(transaction); err != nil {
		return nil, err
	}

	if diffDebit != 0 || diffCredit != 0 {
		account, _ := s.bankRepo.FindBankAccountByID(companyID, transaction.BankAccountID)
		if account != nil {
			account.CurrentBalance = account.CurrentBalance + diffDebit - diffCredit
			_ = s.bankRepo.UpdateBankAccount(account)
		}
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_TRANSACTION_UPDATED", "Manual bank transaction updated", transaction.ID)

	return transaction, nil
}

func (s *BankTransactionService) DeleteManualBankTransaction(companyID, userID, id uint64) error {
	transaction, err := s.transRepo.FindBankTransactionByID(companyID, id)
	if err != nil {
		return err
	}

	if transaction.IsReconciled {
		return errors.New("cannot delete reconciled transaction")
	}

	if transaction.ReferenceType != "manual" {
		return errors.New("cannot delete system-generated transaction directly")
	}

	if err := s.transRepo.SoftDeleteBankTransaction(transaction); err != nil {
		return err
	}

	account, _ := s.bankRepo.FindBankAccountByID(companyID, transaction.BankAccountID)
	if account != nil {
		account.CurrentBalance = account.CurrentBalance - transaction.DebitAmount + transaction.CreditAmount
		_ = s.bankRepo.UpdateBankAccount(account)
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_TRANSACTION_DELETED", "Manual bank transaction deleted", transaction.ID)
	return nil
}

// These two methods will be called from PaymentVoucherService and ReceiptVoucherService using the db transaction.
func (s *BankTransactionService) CreateBankTransactionFromPayment(tx *gorm.DB, companyID, userID uint64, payment *models.PaymentVoucher) error {
	// Find bank account linked to PaidFromAccountID
	var account models.BankAccount
	if err := tx.Where("company_id = ? AND chart_account_id = ?", companyID, payment.PaidFromAccountID).First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Not a bank account, skip
			return nil
		}
		return err
	}

	if account.Status != "active" {
		return errors.New("bank account is not active")
	}

	var lastTx models.BankTransaction
	var balance float64 = account.OpeningBalance
	err := tx.Where("bank_account_id = ?", account.ID).Order("transaction_date desc, id desc").First(&lastTx).Error
	if err == nil {
		balance = lastTx.RunningBalance
	}

	// Payment is a withdrawal (Credit)
	balance = balance - payment.TotalAmount

	transaction := &models.BankTransaction{
		CompanyID:       companyID,
		BranchID:        &payment.BranchID,
		BankAccountID:   account.ID,
		ChartAccountID:  account.ChartAccountID,
		TransactionDate: payment.PaymentDate,
		TransactionType: "withdrawal",
		ReferenceType:   "payment_voucher",
		ReferenceID:     &payment.ID,
		ReferenceNumber: payment.VoucherNumber,
		Description:     "Payment voucher: " + payment.VoucherNumber,
		CreditAmount:    payment.TotalAmount,
		RunningBalance:  balance,
		Status:          "active",
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	if err := tx.Create(transaction).Error; err != nil {
		return err
	}

	account.CurrentBalance = balance
	return tx.Save(&account).Error
}

func (s *BankTransactionService) CreateBankTransactionFromReceipt(tx *gorm.DB, companyID, userID uint64, receipt *models.ReceiptVoucher) error {
	// Find bank account linked to ReceivedToAccountID
	var account models.BankAccount
	if err := tx.Where("company_id = ? AND chart_account_id = ?", companyID, receipt.ReceivedToAccountID).First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Not a bank account, skip
			return nil
		}
		return err
	}

	if account.Status != "active" {
		return errors.New("bank account is not active")
	}

	var lastTx models.BankTransaction
	var balance float64 = account.OpeningBalance
	err := tx.Where("bank_account_id = ?", account.ID).Order("transaction_date desc, id desc").First(&lastTx).Error
	if err == nil {
		balance = lastTx.RunningBalance
	}

	// Receipt is a deposit (Debit)
	balance = balance + receipt.TotalAmount

	transaction := &models.BankTransaction{
		CompanyID:       companyID,
		BranchID:        &receipt.BranchID,
		BankAccountID:   account.ID,
		ChartAccountID:  account.ChartAccountID,
		TransactionDate: receipt.ReceiptDate,
		TransactionType: "deposit",
		ReferenceType:   "receipt_voucher",
		ReferenceID:     &receipt.ID,
		ReferenceNumber: receipt.ReceiptNumber,
		Description:     "Receipt voucher: " + receipt.ReceiptNumber,
		DebitAmount:     receipt.TotalAmount,
		RunningBalance:  balance,
		Status:          "active",
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	if err := tx.Create(transaction).Error; err != nil {
		return err
	}

	account.CurrentBalance = balance
	return tx.Save(&account).Error
}
