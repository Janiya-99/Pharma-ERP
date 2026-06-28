package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InvoiceCenterFinanceSettingService struct {
	repo         *repositories.InvoiceCenterFinanceSettingRepository
	auditService *AuditLogService
	logger       *zap.Logger
}

func NewInvoiceCenterFinanceSettingService(
	repo *repositories.InvoiceCenterFinanceSettingRepository,
	auditService *AuditLogService,
	logger *zap.Logger,
) *InvoiceCenterFinanceSettingService {
	return &InvoiceCenterFinanceSettingService{
		repo:         repo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *InvoiceCenterFinanceSettingService) GetFinanceSettings(db *gorm.DB, companyID uint64, branchID *uint64) (*dto.FinanceSettingsResponse, error) {
	setting, err := s.repo.FindFinanceSettingsForBranch(db, companyID, branchID)
	if err != nil {
		return nil, err
	}
	if setting == nil {
		// If branch specific not found, try company-wide
		if branchID != nil {
			setting, err = s.repo.FindFinanceSettingsForBranch(db, companyID, nil)
			if err != nil {
				return nil, err
			}
		}
		if setting == nil {
			return nil, errors.New("finance settings not found")
		}
	}

	return &dto.FinanceSettingsResponse{
		ID:                            setting.ID,
		BranchID:                      setting.BranchID,
		AccountsReceivableAccountID:   setting.AccountsReceivableAccountID,
		SalesRevenueAccountID:         setting.SalesRevenueAccountID,
		SalesDiscountAccountID:        setting.SalesDiscountAccountID,
		OutputTaxAccountID:            setting.OutputTaxAccountID,
		CreditNoteAdjustmentAccountID: setting.CreditNoteAdjustmentAccountID,
		DebitNoteIncomeAccountID:      setting.DebitNoteIncomeAccountID,
		CashAccountID:                 setting.CashAccountID,
		BankTransferAccountID:         setting.BankTransferAccountID,
		ChequeClearingAccountID:       setting.ChequeClearingAccountID,
		CardClearingAccountID:         setting.CardClearingAccountID,
		OnlinePaymentAccountID:        setting.OnlinePaymentAccountID,
		OtherReceiptAccountID:         setting.OtherReceiptAccountID,
		CustomerAdvanceAccountID:      setting.CustomerAdvanceAccountID,
	}, nil
}

func (s *InvoiceCenterFinanceSettingService) SaveFinanceSettings(db *gorm.DB, companyID, userID uint64, req dto.SaveFinanceSettingsRequest) error {
	// Validate required accounts
	if req.AccountsReceivableAccountID == 0 || req.SalesRevenueAccountID == 0 || req.CreditNoteAdjustmentAccountID == 0 || req.DebitNoteIncomeAccountID == 0 {
		return errors.New("required accounts are missing")
	}

	accountsToValidate := []uint64{
		req.AccountsReceivableAccountID,
		req.SalesRevenueAccountID,
		req.CreditNoteAdjustmentAccountID,
		req.DebitNoteIncomeAccountID,
	}

	if req.SalesDiscountAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.SalesDiscountAccountID)
	}
	if req.OutputTaxAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.OutputTaxAccountID)
	}
	if req.CashAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.CashAccountID)
	}
	if req.BankTransferAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.BankTransferAccountID)
	}
	if req.ChequeClearingAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.ChequeClearingAccountID)
	}
	if req.CardClearingAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.CardClearingAccountID)
	}
	if req.OnlinePaymentAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.OnlinePaymentAccountID)
	}
	if req.OtherReceiptAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.OtherReceiptAccountID)
	}
	if req.CustomerAdvanceAccountID != nil {
		accountsToValidate = append(accountsToValidate, *req.CustomerAdvanceAccountID)
	}

	for _, accID := range accountsToValidate {
		isValid, err := s.repo.ValidateChartOfAccount(db, companyID, accID)
		if err != nil {
			return err
		}
		if !isValid {
			return errors.New("one or more provided accounts are invalid or inactive")
		}
	}

	setting := models.InvoiceCenterFinanceSetting{
		CompanyID:                     companyID,
		BranchID:                      req.BranchID,
		AccountsReceivableAccountID:   req.AccountsReceivableAccountID,
		SalesRevenueAccountID:         req.SalesRevenueAccountID,
		SalesDiscountAccountID:        req.SalesDiscountAccountID,
		OutputTaxAccountID:            req.OutputTaxAccountID,
		CreditNoteAdjustmentAccountID: req.CreditNoteAdjustmentAccountID,
		DebitNoteIncomeAccountID:      req.DebitNoteIncomeAccountID,
		CashAccountID:                 req.CashAccountID,
		BankTransferAccountID:         req.BankTransferAccountID,
		ChequeClearingAccountID:       req.ChequeClearingAccountID,
		CardClearingAccountID:         req.CardClearingAccountID,
		OnlinePaymentAccountID:        req.OnlinePaymentAccountID,
		OtherReceiptAccountID:         req.OtherReceiptAccountID,
		CustomerAdvanceAccountID:      req.CustomerAdvanceAccountID,
		IsActive:                      true,
		CreatedBy:                     &userID,
		UpdatedBy:                     &userID,
	}

	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.DeactivatePreviousFinanceSettingsTx(tx, companyID, req.BranchID); err != nil {
			return err
		}
		if err := s.repo.CreateFinanceSettingsTx(tx, &setting); err != nil {
			return err
		}
		
		s.auditService.LogAction(tx, companyID, userID, "INVOICE_CENTER_FINANCE_SETTINGS_UPDATED", "Updated finance settings", setting.ID)
		return nil
	})
}
