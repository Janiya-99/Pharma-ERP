package service

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/database"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"github.com/shopspring/decimal"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// JournalService handles journal entry business logic.
type JournalService struct {
	journalRepo *repository.JournalRepository
	glTransRepo *repository.GlTransactionRepository
	audit       *AuditService
	db          *gorm.DB
	logger      *zap.Logger
}

func NewJournalService(
	journalRepo *repository.JournalRepository,
	glTransRepo *repository.GlTransactionRepository,
	audit *AuditService,
	db *gorm.DB,
	logger *zap.Logger,
) *JournalService {
	return &JournalService{
		journalRepo: journalRepo,
		glTransRepo: glTransRepo,
		audit:       audit,
		db:          db,
		logger:      logger,
	}
}

func (s *JournalService) GetByID(branchID, id uint64) (*model.JournalEntry, error) {
	entry, err := s.journalRepo.FindByID(id, branchID)
	if err != nil {
		return nil, errs.ErrNotFound("Journal entry")
	}
	return entry, nil
}

func (s *JournalService) List(branchID uint64, req *dto.PaginationRequest) ([]model.JournalEntry, int64, error) {
	return s.journalRepo.List(branchID, req)
}

func (s *JournalService) Create(c *gin.Context, branchID, userID uint64, req *request.CreateJournalEntryRequest) (*model.JournalEntry, error) {
	totalDebit := decimal.Zero
	totalCredit := decimal.Zero
	var details []model.JournalEntryDetail

	for i, lineReq := range req.Details {
		debit, err := decimal.NewFromString(lineReq.DebitAmount)
		if err != nil {
			return nil, errs.ErrValidation("Invalid debit amount on line " + string(rune(i+1)))
		}
		credit, err := decimal.NewFromString(lineReq.CreditAmount)
		if err != nil {
			return nil, errs.ErrValidation("Invalid credit amount on line " + string(rune(i+1)))
		}

		if debit.IsNegative() || credit.IsNegative() {
			return nil, errs.ErrValidation("Amounts cannot be negative")
		}

		if debit.IsZero() && credit.IsZero() {
			return nil, errs.ErrValidation("Each line must have either a debit or credit amount")
		}

		totalDebit = totalDebit.Add(debit)
		totalCredit = totalCredit.Add(credit)

		details = append(details, model.JournalEntryDetail{
			GlID:         lineReq.GlID,
			BranchID:     branchID,
			DebitAmount:  debit,
			CreditAmount: credit,
			Remarks:      lineReq.Remarks,
		})
	}

	// Double-entry validation
	if !totalDebit.Equal(totalCredit) {
		return nil, errs.ErrBusinessLogic("Total debits must equal total credits. " +
			"Debit: " + totalDebit.StringFixed(2) + ", Credit: " + totalCredit.StringFixed(2))
	}

	var entry *model.JournalEntry

	err := database.WithTransaction(s.db, func(tx *gorm.DB) error {
		entry = &model.JournalEntry{
			BranchID:           branchID,
			RefNo:              req.RefNo,
			TotalAmount:        totalDebit,
			Description:        req.Description,
			FirstApproveStatus: model.FirstApprovePending,
		}

		// Create journal entry header
		if err := s.journalRepo.Create(tx, entry); err != nil {
			return err
		}

		// Set journal_entry_id on all details
		for i := range details {
			details[i].JournalEntryID = entry.ID
		}

		// Create journal entry details
		if err := s.journalRepo.CreateDetails(tx, details); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, errs.ErrDatabase(err)
	}

	// Audit log
	s.audit.LogAction(c, nil, AuditParams{
		Module:     "finance",
		Action:     "create",
		EntityType: "journal_entry",
		EntityID:   entry.ID,
		NewValues:  entry,
	})

	return entry, nil
}

func (s *JournalService) SubmitForApproval(c *gin.Context, branchID, entryID, userID uint64, comment string) error {
	entry, err := s.journalRepo.FindByID(entryID, branchID)
	if err != nil {
		return errs.ErrNotFound("Journal entry")
	}

	if entry.FirstApproveStatus != model.FirstApprovePending {
		return errs.ErrBusinessLogic("Only pending entries can be submitted/approved")
	}

	return database.WithTransaction(s.db, func(tx *gorm.DB) error {
		// Update status
		if err := s.journalRepo.UpdateStatus(tx, entryID, model.FirstApproveApproved, nil); err != nil {
			return err
		}

		// Create approval record
		approval := &model.JournalEntryApproval{
			JournalEntryID: entryID,
			UserID:         userID,
			ApprovedStatus: 1, // Approved
			Approval:       1, // First Approval
			Comment:        &comment,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		// Audit log
		s.audit.LogAction(c, tx, AuditParams{
			Module:     "finance",
			Action:     "approve",
			EntityType: "journal_entry",
			EntityID:   entryID,
			NewValues:  map[string]string{"status": "approved"},
		})

		return nil
	})
}

func (s *JournalService) PostToLedger(c *gin.Context, branchID, entryID, posterID uint64) error {
	entry, err := s.journalRepo.FindByID(entryID, branchID)
	if err != nil {
		return errs.ErrNotFound("Journal entry")
	}

	if entry.FirstApproveStatus != model.FirstApproveApproved {
		return errs.ErrBusinessLogic("Only approved entries can be posted to ledger")
	}

	return database.WithTransaction(s.db, func(tx *gorm.DB) error {
		var transactions []model.GlTransaction
		for _, detail := range entry.Details {
			// For debit
			if !detail.DebitAmount.IsZero() {
				transactions = append(transactions, model.GlTransaction{
					GlID:              detail.GlID,
					BranchID:          detail.BranchID,
					ReferenceNo:       entry.RefNo,
					ReferenceType:     "JournalEntry",
					ReferenceID:       entry.ID,
					TransactionType:   "DR",
					TransactionAmount: detail.DebitAmount,
					TransactionDate:   entry.CreatedAt,
					Status:            model.GlTransactionPosted,
					Description:       &entry.Description,
				})
			}
			// For credit
			if !detail.CreditAmount.IsZero() {
				transactions = append(transactions, model.GlTransaction{
					GlID:              detail.GlID,
					BranchID:          detail.BranchID,
					ReferenceNo:       entry.RefNo,
					ReferenceType:     "JournalEntry",
					ReferenceID:       entry.ID,
					TransactionType:   "CR",
					TransactionAmount: detail.CreditAmount,
					TransactionDate:   entry.CreatedAt,
					Status:            model.GlTransactionPosted,
					Description:       &entry.Description,
				})
			}
		}

		if err := s.glTransRepo.CreateEntries(tx, transactions); err != nil {
			return err
		}

		// Update status to approved/posted
		updates := map[string]interface{}{
			"first_approve_status": model.FirstApproveApproved,
		}
		if err := s.journalRepo.UpdateStatus(tx, entryID, model.FirstApproveApproved, updates); err != nil {
			return err
		}

		// Audit log
		s.audit.LogAction(c, tx, AuditParams{
			Module:     "finance",
			Action:     "post",
			EntityType: "journal_entry",
			EntityID:   entryID,
			NewValues:  map[string]string{"status": "posted"},
		})

		return nil
	})
}

func (s *JournalService) VoidEntry(c *gin.Context, branchID, entryID, userID uint64, reason string) error {
	_, err := s.journalRepo.FindByID(entryID, branchID)
	if err != nil {
		return errs.ErrNotFound("Journal entry")
	}

	return database.WithTransaction(s.db, func(tx *gorm.DB) error {
		// Delete GL transactions for this journal entry
		if err := s.glTransRepo.DeleteByReference(tx, "JournalEntry", entryID); err != nil {
			return err
		}

		// Update status to rejected
		if err := s.journalRepo.UpdateStatus(tx, entryID, model.FirstApproveRejected, map[string]interface{}{
			"reject_reason": reason,
		}); err != nil {
			return err
		}

		// Audit log
		s.audit.LogAction(c, tx, AuditParams{
			Module:     "finance",
			Action:     "void",
			EntityType: "journal_entry",
			EntityID:   entryID,
			NewValues:  map[string]string{"status": "voided", "reason": reason},
		})

		return nil
	})
}
