package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type JournalEntryService interface {
	ListJournalEntries(companyID uint64, filter map[string]interface{}, page, limit int, search string) ([]models.JournalEntry, int64, error)
	GetJournalEntryByID(companyID, journalID uint64) (*models.JournalEntry, error)
	CreateJournalEntry(companyID, branchID, userID uint64, req dto.CreateJournalEntryRequest, ip, userAgent string) (*models.JournalEntry, error)
	UpdateJournalEntry(companyID, branchID, journalID, userID uint64, req dto.UpdateJournalEntryRequest, ip, userAgent string) (*models.JournalEntry, error)
	DeleteJournalEntry(companyID, journalID, userID uint64, ip, userAgent string) error
	SubmitJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error
	ApproveJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error
	RejectJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error
	PostJournalEntry(companyID, journalID, userID uint64, ip, userAgent string) error
	ReverseJournalEntry(companyID, journalID, userID uint64, req dto.ReverseJournalRequest, ip, userAgent string) error
}

type journalEntryService struct {
	repo         repositories.JournalEntryRepository
	fyRepo       *repositories.FinancialYearRepository
	apRepo       *repositories.AccountingPeriodRepository
	coaRepo      *repositories.ChartOfAccountRepository
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewJournalEntryService(
	repo repositories.JournalEntryRepository,
	fyRepo *repositories.FinancialYearRepository,
	apRepo *repositories.AccountingPeriodRepository,
	coaRepo *repositories.ChartOfAccountRepository,
	auditService *services.AuditService,
	logger *zap.Logger,
) JournalEntryService {
	return &journalEntryService{
		repo:         repo,
		fyRepo:       fyRepo,
		apRepo:       apRepo,
		coaRepo:      coaRepo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *journalEntryService) ListJournalEntries(companyID uint64, filter map[string]interface{}, page, limit int, search string) ([]models.JournalEntry, int64, error) {
	return s.repo.FindJournalEntries(companyID, filter, page, limit, search)
}

func (s *journalEntryService) GetJournalEntryByID(companyID, journalID uint64) (*models.JournalEntry, error) {
	return s.repo.FindJournalEntryByID(companyID, journalID)
}

func (s *journalEntryService) GenerateJournalNumber(companyID uint64) string {
	lastNum, err := s.repo.GetLastJournalNumber(companyID)
	if err != nil || lastNum == "" {
		return "JV-000001"
	}
	var num int
	fmt.Sscanf(lastNum, "JV-%06d", &num)
	return fmt.Sprintf("JV-%06d", num+1)
}

func (s *journalEntryService) validateJournalLines(companyID uint64, lines []dto.JournalEntryLineDTO) (float64, float64, []models.JournalEntryLine, error) {
	var totalDebit, totalCredit float64
	var modelLines []models.JournalEntryLine

	if len(lines) < 2 {
		return 0, 0, nil, errors.New("journal entry must have at least 2 lines")
	}

	for i, line := range lines {
		if line.DebitAmount < 0 || line.CreditAmount < 0 {
			return 0, 0, nil, errors.New("debit and credit amounts cannot be negative")
		}
		if line.DebitAmount > 0 && line.CreditAmount > 0 {
			return 0, 0, nil, errors.New("a single line cannot have both debit and credit amounts greater than zero")
		}
		if line.DebitAmount == 0 && line.CreditAmount == 0 {
			return 0, 0, nil, errors.New("each line must have either debit or credit amount greater than zero")
		}

		account, err := s.coaRepo.FindByID(companyID, line.AccountID)
		if err != nil {
			return 0, 0, nil, fmt.Errorf("invalid account ID %d", line.AccountID)
		}
		if account.Status != "active" {
			return 0, 0, nil, fmt.Errorf("account %s is not active", account.AccountCode)
		}

		totalDebit += line.DebitAmount
		totalCredit += line.CreditAmount

		modelLines = append(modelLines, models.JournalEntryLine{
			AccountID:       line.AccountID,
			LineDescription: line.LineDescription,
			DebitAmount:     line.DebitAmount,
			CreditAmount:    line.CreditAmount,
			LineOrder:       i + 1,
		})
	}

	if totalDebit != totalCredit {
		return 0, 0, nil, errors.New("total debit must equal total credit")
	}

	return totalDebit, totalCredit, modelLines, nil
}

func (s *journalEntryService) validateDates(companyID, fyID, apID uint64, journalDateStr string) (*models.AccountingPeriod, error) {
	fy, err := s.fyRepo.FindByID(companyID, fyID)
	if err != nil {
		return nil, errors.New("invalid financial year")
	}
	if fy.Status != "active" {
		return nil, errors.New("financial year is not active")
	}

	ap, err := s.apRepo.FindByID(companyID, apID)
	if err != nil {
		return nil, errors.New("invalid accounting period")
	}
	if ap.IsClosed {
		return nil, errors.New("accounting period is closed")
	}
	if ap.FinancialYearID != fyID {
		return nil, errors.New("accounting period does not belong to the financial year")
	}

	jDate, err := time.Parse("2006-01-02", journalDateStr)
	if err != nil {
		return nil, errors.New("invalid journal date format")
	}

	if jDate.Before(time.Time(ap.StartDate)) || jDate.After(time.Time(ap.EndDate)) {
		return nil, errors.New("journal date must be within the accounting period")
	}

	return ap, nil
}

func (s *journalEntryService) CreateJournalEntry(companyID, branchID, userID uint64, req dto.CreateJournalEntryRequest, ip, userAgent string) (*models.JournalEntry, error) {
	_, err := s.validateDates(companyID, req.FinancialYearID, req.AccountingPeriodID, req.JournalDate)
	if err != nil {
		return nil, err
	}

	totalDebit, totalCredit, lines, err := s.validateJournalLines(companyID, req.Lines)
	if err != nil {
		return nil, err
	}

	jDate, _ := time.Parse("2006-01-02", req.JournalDate)
	journalNumber := s.GenerateJournalNumber(companyID)

	journal := &models.JournalEntry{
		CompanyID:          companyID,
		BranchID:           branchID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		JournalNumber:      journalNumber,
		JournalDate:        jDate,
		ReferenceNumber:    req.ReferenceNumber,
		Description:        req.Description,
		TotalDebit:         totalDebit,
		TotalCredit:        totalCredit,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		Lines:              lines,
	}

	if err := s.repo.CreateJournalEntryWithLines(journal); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "JOURNAL_ENTRY_CREATED", "JournalEntry", &journal.ID, nil, journal, ip, userAgent)

	return journal, nil
}

func (s *journalEntryService) UpdateJournalEntry(companyID, branchID, journalID, userID uint64, req dto.UpdateJournalEntryRequest, ip, userAgent string) (*models.JournalEntry, error) {
	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return nil, err
	}

	if journal.ApprovalStatus != "draft" && journal.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected journal entries can be updated")
	}

	_, err = s.validateDates(companyID, req.FinancialYearID, req.AccountingPeriodID, req.JournalDate)
	if err != nil {
		return nil, err
	}

	totalDebit, totalCredit, lines, err := s.validateJournalLines(companyID, req.Lines)
	if err != nil {
		return nil, err
	}

	jDate, _ := time.Parse("2006-01-02", req.JournalDate)

	oldJournal := *journal

	journal.BranchID = branchID
	journal.FinancialYearID = req.FinancialYearID
	journal.AccountingPeriodID = req.AccountingPeriodID
	journal.JournalDate = jDate
	journal.ReferenceNumber = req.ReferenceNumber
	journal.Description = req.Description
	journal.TotalDebit = totalDebit
	journal.TotalCredit = totalCredit
	journal.Lines = lines
	journal.UpdatedBy = &userID

	if err := s.repo.UpdateJournalEntryWithLines(journal); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "JOURNAL_ENTRY_UPDATED", "JournalEntry", &journal.ID, oldJournal, journal, ip, userAgent)

	return journal, nil
}

func (s *journalEntryService) DeleteJournalEntry(companyID, journalID, userID uint64, ip, userAgent string) error {
	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if journal.ApprovalStatus != "draft" && journal.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected journal entries can be deleted")
	}

	if err := s.repo.SoftDeleteJournalEntry(companyID, journalID); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &journal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_DELETED", "JournalEntry", &journal.ID, journal, nil, ip, userAgent)

	return nil
}

func (s *journalEntryService) SubmitJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error {
	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if journal.ApprovalStatus != "draft" && journal.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected journal entries can be submitted")
	}

	if journal.TotalDebit != journal.TotalCredit {
		return errors.New("total debit must equal total credit")
	}

	now := time.Now()
	approval := models.JournalEntryApproval{
		JournalEntryID: journal.ID,
		Action:         "submitted",
		Remarks:        req.Remarks,
		ActionBy:       userID,
		ActionAt:       &now,
	}

	if err := s.repo.CreateApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateJournalStatus(journal.ID, map[string]interface{}{"approval_status": "pending"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &journal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_SUBMITTED", "JournalEntry", &journal.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *journalEntryService) ApproveJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error {
	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if journal.ApprovalStatus != "pending" {
		return errors.New("only pending journal entries can be approved")
	}

	now := time.Now()
	approval := models.JournalEntryApproval{
		JournalEntryID: journal.ID,
		Action:         "approved",
		Remarks:        req.Remarks,
		ActionBy:       userID,
		ActionAt:       &now,
	}

	if err := s.repo.CreateApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateJournalStatus(journal.ID, map[string]interface{}{
		"approval_status": "approved",
		"approved_by":     userID,
		"approved_at":     now,
	}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &journal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_APPROVED", "JournalEntry", &journal.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *journalEntryService) RejectJournalEntry(companyID, journalID, userID uint64, req dto.JournalActionRequest, ip, userAgent string) error {
	if req.Remarks == "" {
		return errors.New("remarks are required when rejecting")
	}

	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if journal.ApprovalStatus != "pending" {
		return errors.New("only pending journal entries can be rejected")
	}

	now := time.Now()
	approval := models.JournalEntryApproval{
		JournalEntryID: journal.ID,
		Action:         "rejected",
		Remarks:        req.Remarks,
		ActionBy:       userID,
		ActionAt:       &now,
	}

	if err := s.repo.CreateApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateJournalStatus(journal.ID, map[string]interface{}{"approval_status": "rejected"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &journal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_REJECTED", "JournalEntry", &journal.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *journalEntryService) PostJournalEntry(companyID, journalID, userID uint64, ip, userAgent string) error {
	journal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if journal.ApprovalStatus != "approved" {
		return errors.New("only approved journal entries can be posted")
	}
	if journal.PostedStatus != "unposted" {
		return errors.New("journal entry is already posted")
	}

	ap, err := s.apRepo.FindByID(companyID, journal.AccountingPeriodID)
	if err != nil || ap.IsClosed {
		return errors.New("accounting period is closed or invalid")
	}

	now := time.Now()

	err = s.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		// Update header
		if err := tx.Model(&models.JournalEntry{}).Where("id = ?", journal.ID).Updates(map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}).Error; err != nil {
			return err
		}

		// Update balances
		for _, line := range journal.Lines {
			if line.DebitAmount > 0 {
				if err := s.repo.UpdateAccountBalance(tx, line.AccountID, line.DebitAmount, true); err != nil {
					return err
				}
			}
			if line.CreditAmount > 0 {
				if err := s.repo.UpdateAccountBalance(tx, line.AccountID, line.CreditAmount, false); err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &journal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_POSTED", "JournalEntry", &journal.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *journalEntryService) ReverseJournalEntry(companyID, journalID, userID uint64, req dto.ReverseJournalRequest, ip, userAgent string) error {
	originalJournal, err := s.repo.FindJournalEntryByID(companyID, journalID)
	if err != nil {
		return err
	}

	if originalJournal.PostedStatus != "posted" {
		return errors.New("only posted journal entries can be reversed")
	}
	if originalJournal.IsReversed {
		return errors.New("journal entry is already reversed")
	}

	revDate, err := time.Parse("2006-01-02", req.ReversalDate)
	if err != nil {
		return errors.New("invalid reversal date format")
	}

	// Assume we use the same accounting period as original unless the reversal date warrants a different one.
	// But according to requirements, we should check if reversal date is inside an open accounting period.
	// We should fetch the period for the reversal date. Since we don't have a specific period ID in request,
	// let's assume it belongs to the same period, or we must look up the period.
	// The requirement: "Reversal date must be inside an open accounting period."
	ap, err := s.apRepo.FindByID(companyID, originalJournal.AccountingPeriodID)
	if err != nil || ap.IsClosed {
		return errors.New("accounting period is closed or invalid for reversal")
	}
	if revDate.Before(time.Time(ap.StartDate)) || revDate.After(time.Time(ap.EndDate)) {
		return errors.New("reversal date must be inside an open accounting period")
	}

	now := time.Now()

	err = s.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		// 1. Create Reversal Journal
		reversalNumber := s.GenerateJournalNumber(companyID)
		reversalJournal := models.JournalEntry{
			CompanyID:          companyID,
			BranchID:           originalJournal.BranchID,
			FinancialYearID:    originalJournal.FinancialYearID,
			AccountingPeriodID: originalJournal.AccountingPeriodID,
			JournalNumber:      reversalNumber,
			JournalDate:        revDate,
			ReferenceNumber:    "REV-" + originalJournal.JournalNumber,
			Description:        "Reversal of " + originalJournal.JournalNumber + ": " + req.Reason,
			TotalDebit:         originalJournal.TotalDebit,
			TotalCredit:        originalJournal.TotalCredit,
			ApprovalStatus:     "approved", // directly approved
			ApprovedBy:         &userID,
			ApprovedAt:         &now,
			PostedStatus:       "posted", // directly posted
			PostedBy:           &userID,
			PostedAt:           &now,
			Status:             "active",
			CreatedBy:          &userID,
		}

		if err := tx.Create(&reversalJournal).Error; err != nil {
			return err
		}

		// 2. Create Reversed Lines (swap debit/credit)
		for _, line := range originalJournal.Lines {
			revLine := models.JournalEntryLine{
				JournalEntryID:  reversalJournal.ID,
				AccountID:       line.AccountID,
				LineDescription: "Reversal: " + line.LineDescription,
				DebitAmount:     line.CreditAmount, // SWAP
				CreditAmount:    line.DebitAmount,  // SWAP
				LineOrder:       line.LineOrder,
			}
			if err := tx.Create(&revLine).Error; err != nil {
				return err
			}

			// 3. Update balances for the reversal
			if revLine.DebitAmount > 0 {
				if err := s.repo.UpdateAccountBalance(tx, revLine.AccountID, revLine.DebitAmount, true); err != nil {
					return err
				}
			}
			if revLine.CreditAmount > 0 {
				if err := s.repo.UpdateAccountBalance(tx, revLine.AccountID, revLine.CreditAmount, false); err != nil {
					return err
				}
			}
		}

		// 4. Update Original Journal
		if err := tx.Model(&models.JournalEntry{}).Where("id = ?", originalJournal.ID).Updates(map[string]interface{}{
			"is_reversed":         true,
			"reversed_journal_id": reversalJournal.ID,
			"posted_status":       "reversed",
		}).Error; err != nil {
			return err
		}

		// 5. Create Reversal Record
		revRecord := models.JournalEntryReversal{
			OriginalJournalEntryID: originalJournal.ID,
			ReversalJournalEntryID: reversalJournal.ID,
			ReversalDate:           revDate,
			Reason:                 req.Reason,
			CreatedBy:              &userID,
		}
		if err := tx.Create(&revRecord).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &originalJournal.BranchID, &userID, "FINANCE", "JOURNAL_ENTRY_REVERSED", "JournalEntry", &originalJournal.ID, nil, nil, ip, userAgent)

	return nil
}
