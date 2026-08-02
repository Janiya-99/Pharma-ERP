package services

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type BankReconciliationService struct {
	reconRepo *repositories.BankReconciliationRepository
	transRepo *repositories.BankTransactionRepository
	bankRepo  *repositories.BankAccountRepository
	auditSvc  *AuditLogService
}

func NewBankReconciliationService(reconRepo *repositories.BankReconciliationRepository, transRepo *repositories.BankTransactionRepository, bankRepo *repositories.BankAccountRepository, auditSvc *AuditLogService) *BankReconciliationService {
	return &BankReconciliationService{
		reconRepo: reconRepo,
		transRepo: transRepo,
		bankRepo:  bankRepo,
		auditSvc:  auditSvc,
	}
}

func (s *BankReconciliationService) ListBankReconciliations(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankReconciliation, int64, error) {
	return s.reconRepo.FindBankReconciliations(companyID, filters, page, limit)
}

func (s *BankReconciliationService) GetBankReconciliationByID(companyID, id uint64) (*models.BankReconciliation, error) {
	return s.reconRepo.FindBankReconciliationByID(companyID, id)
}

func (s *BankReconciliationService) GetUnreconciledTransactions(companyID, accountID uint64, filters map[string]interface{}) ([]models.BankTransaction, error) {
	return s.transRepo.FindUnreconciledTransactions(companyID, accountID, filters)
}

func (s *BankReconciliationService) CreateBankReconciliation(companyID, userID uint64, req dto.CreateBankReconciliationRequest) (*models.BankReconciliation, error) {
	account, err := s.bankRepo.FindBankAccountByID(companyID, req.BankAccountID)
	if err != nil || account.Status != "active" {
		return nil, errors.New("invalid or inactive bank account")
	}

	startDate, err := time.Parse("2006-01-02", req.StatementStartDate)
	if err != nil {
		return nil, errors.New("invalid statement_start_date")
	}

	endDate, err := time.Parse("2006-01-02", req.StatementEndDate)
	if err != nil {
		return nil, errors.New("invalid statement_end_date")
	}

	if startDate.After(endDate) {
		return nil, errors.New("statement_start_date must be before statement_end_date")
	}

	number, err := s.reconRepo.GenerateReconciliationNumber(companyID)
	if err != nil {
		return nil, err
	}

	var totalDeposits, totalWithdrawals float64
	var lines []models.BankReconciliationLine

	for _, txID := range req.TransactionIDs {
		tx, err := s.transRepo.FindBankTransactionByID(companyID, txID)
		if err != nil || tx.BankAccountID != req.BankAccountID || tx.IsReconciled {
			return nil, errors.New("invalid or already reconciled transaction selected")
		}

		totalDeposits += tx.DebitAmount
		totalWithdrawals += tx.CreditAmount

		lines = append(lines, models.BankReconciliationLine{
			BankTransactionID: tx.ID,
		})
	}

	diffAmount := (req.StatementOpeningBalance + totalDeposits - totalWithdrawals) - req.StatementClosingBalance

	recon := &models.BankReconciliation{
		CompanyID:                  companyID,
		BranchID:                   req.BranchID,
		BankAccountID:              req.BankAccountID,
		ReconciliationNumber:       number,
		StatementStartDate:         startDate,
		StatementEndDate:           endDate,
		StatementOpeningBalance:    req.StatementOpeningBalance,
		StatementClosingBalance:    req.StatementClosingBalance,
		TotalDeposits:              totalDeposits,
		TotalWithdrawals:           totalWithdrawals,
		TotalReconciledDeposits:    totalDeposits,
		TotalReconciledWithdrawals: totalWithdrawals,
		DifferenceAmount:           diffAmount,
		ReconciliationStatus:       "draft",
		Remarks:                    req.Remarks,
		Status:                     "active",
		CreatedBy:                  &userID,
		UpdatedBy:                  &userID,
		Lines:                      lines,
	}

	if err := s.reconRepo.CreateBankReconciliationWithLines(recon); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_RECONCILIATION_CREATED", "Bank reconciliation created", recon.ID)

	return recon, nil
}

func (s *BankReconciliationService) UpdateBankReconciliation(companyID, userID, id uint64, req dto.UpdateBankReconciliationRequest) (*models.BankReconciliation, error) {
	recon, err := s.reconRepo.FindBankReconciliationByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if recon.ReconciliationStatus != "draft" {
		return nil, errors.New("only draft reconciliations can be updated")
	}

	startDate, err := time.Parse("2006-01-02", req.StatementStartDate)
	if err != nil {
		return nil, errors.New("invalid statement_start_date")
	}

	endDate, err := time.Parse("2006-01-02", req.StatementEndDate)
	if err != nil {
		return nil, errors.New("invalid statement_end_date")
	}

	if startDate.After(endDate) {
		return nil, errors.New("statement_start_date must be before statement_end_date")
	}

	var totalDeposits, totalWithdrawals float64
	var lines []models.BankReconciliationLine

	for _, txID := range req.TransactionIDs {
		tx, err := s.transRepo.FindBankTransactionByID(companyID, txID)
		if err != nil || tx.BankAccountID != recon.BankAccountID || tx.IsReconciled {
			return nil, errors.New("invalid or already reconciled transaction selected")
		}

		totalDeposits += tx.DebitAmount
		totalWithdrawals += tx.CreditAmount

		lines = append(lines, models.BankReconciliationLine{
			BankTransactionID: tx.ID,
		})
	}

	diffAmount := (req.StatementOpeningBalance + totalDeposits - totalWithdrawals) - req.StatementClosingBalance

	recon.StatementStartDate = startDate
	recon.StatementEndDate = endDate
	recon.StatementOpeningBalance = req.StatementOpeningBalance
	recon.StatementClosingBalance = req.StatementClosingBalance
	recon.TotalDeposits = totalDeposits
	recon.TotalWithdrawals = totalWithdrawals
	recon.TotalReconciledDeposits = totalDeposits
	recon.TotalReconciledWithdrawals = totalWithdrawals
	recon.DifferenceAmount = diffAmount
	recon.Remarks = req.Remarks
	recon.UpdatedBy = &userID

	if err := s.reconRepo.UpdateBankReconciliationWithLines(recon, lines); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_RECONCILIATION_UPDATED", "Bank reconciliation updated", recon.ID)

	return recon, nil
}

func (s *BankReconciliationService) CompleteBankReconciliation(companyID, userID, id uint64) error {
	recon, err := s.reconRepo.FindBankReconciliationByID(companyID, id)
	if err != nil {
		return err
	}

	if recon.ReconciliationStatus != "draft" {
		return errors.New("only draft reconciliations can be completed")
	}

	if recon.DifferenceAmount != 0 {
		return errors.New("difference amount must be zero to complete reconciliation")
	}

	now := time.Now()
	recon.ReconciliationStatus = "completed"
	recon.CompletedBy = &userID
	recon.CompletedAt = &now
	recon.UpdatedBy = &userID

	if err := s.reconRepo.CompleteBankReconciliation(recon); err != nil {
		return err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_RECONCILIATION_COMPLETED", "Bank reconciliation completed", recon.ID)
	return nil
}

func (s *BankReconciliationService) CancelBankReconciliation(companyID, userID, id uint64, req dto.CancelBankReconciliationRequest) error {
	recon, err := s.reconRepo.FindBankReconciliationByID(companyID, id)
	if err != nil {
		return err
	}

	if recon.ReconciliationStatus != "completed" {
		return errors.New("only completed reconciliations can be cancelled")
	}

	recon.ReconciliationStatus = "cancelled"
	recon.Remarks = recon.Remarks + "\nCancellation Reason: " + req.Remarks
	recon.UpdatedBy = &userID

	if err := s.reconRepo.CancelBankReconciliation(recon); err != nil {
		return err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_RECONCILIATION_CANCELLED", "Bank reconciliation cancelled", recon.ID)
	return nil
}

func (s *BankReconciliationService) DeleteBankReconciliation(companyID, userID, id uint64) error {
	recon, err := s.reconRepo.FindBankReconciliationByID(companyID, id)
	if err != nil {
		return err
	}

	if recon.ReconciliationStatus == "completed" {
		return errors.New("completed reconciliations cannot be deleted")
	}

	if err := s.reconRepo.SoftDeleteBankReconciliation(recon); err != nil {
		return err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_RECONCILIATION_DELETED", "Bank reconciliation deleted", recon.ID)
	return nil
}
