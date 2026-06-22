package services

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"gorm.io/gorm"
)

type FixedAssetDisposalService struct {
	repo         *repositories.FixedAssetDisposalRepository
	assetRepo    *repositories.FixedAssetRepository
	fyRepo       *repositories.FinancialYearRepository
	apRepo       *repositories.AccountingPeriodRepository
	journalRepo  repositories.JournalEntryRepository
	chartRepo    *repositories.ChartOfAccountRepository
	auditService *AuditLogService
	glService    *GeneralLedgerService
	db           *gorm.DB
}

func NewFixedAssetDisposalService(
	repo *repositories.FixedAssetDisposalRepository,
	assetRepo *repositories.FixedAssetRepository,
	fyRepo *repositories.FinancialYearRepository,
	apRepo *repositories.AccountingPeriodRepository,
	journalRepo repositories.JournalEntryRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	auditService *AuditLogService,
	glService *GeneralLedgerService,
	db *gorm.DB,
) *FixedAssetDisposalService {
	return &FixedAssetDisposalService{
		repo:         repo,
		assetRepo:    assetRepo,
		fyRepo:       fyRepo,
		apRepo:       apRepo,
		journalRepo:  journalRepo,
		chartRepo:    chartRepo,
		auditService: auditService,
		glService:    glService,
		db:           db,
	}
}

func (s *FixedAssetDisposalService) ListFixedAssetDisposals(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetDisposal, int64, error) {
	return s.repo.FindFixedAssetDisposals(companyID, branchAccess, filters, page, limit)
}

func (s *FixedAssetDisposalService) GetFixedAssetDisposalByID(id uint64, companyID uint64) (*models.FixedAssetDisposal, error) {
	return s.repo.FindFixedAssetDisposalByID(id, companyID)
}

func (s *FixedAssetDisposalService) parseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *FixedAssetDisposalService) ValidateDisposalPeriod(companyID uint64, financialYearID uint64, accountingPeriodID uint64, disposalDate time.Time) error {
	finYear, err := s.fyRepo.FindByID(companyID, financialYearID)
	if err != nil {
		return fmt.Errorf("invalid financial year")
	}
	if finYear.Status == "closed" {
		return fmt.Errorf("financial year is closed")
	}

	accPeriod, err := s.apRepo.FindByID(companyID, accountingPeriodID)
	if err != nil {
		return fmt.Errorf("invalid accounting period")
	}
	if accPeriod.Status == "closed" {
		return fmt.Errorf("accounting period is closed")
	}
	if accPeriod.FinancialYearID != financialYearID {
		return fmt.Errorf("accounting period does not belong to financial year")
	}

	if disposalDate.Before(accPeriod.StartDate) || disposalDate.After(accPeriod.EndDate) {
		return fmt.Errorf("disposal date must fall within accounting period")
	}

	return nil
}

func (s *FixedAssetDisposalService) GenerateDisposalNumber(companyID uint64) (string, error) {
	lastNumber, err := s.repo.GetLastDisposalNumber(companyID)
	if err != nil {
		return "", err
	}

	if lastNumber == "" {
		return "FADP-000001", nil
	}

	var num int
	fmt.Sscanf(lastNumber, "FADP-%06d", &num)
	return fmt.Sprintf("FADP-%06d", num+1), nil
}

func (s *FixedAssetDisposalService) CreateFixedAssetDisposal(companyID uint64, userID uint64, req *dto.CreateFixedAssetDisposalRequest) (*models.FixedAssetDisposal, error) {
	asset, err := s.assetRepo.FindFixedAssetByID(req.FixedAssetID, companyID)
	if err != nil {
		return nil, fmt.Errorf("invalid fixed asset")
	}

	if asset.AssetStatus != "active" && asset.AssetStatus != "fully_depreciated" {
		return nil, fmt.Errorf("only active or fully_depreciated assets can be disposed")
	}

	disposalDate, err := s.parseDate(req.DisposalDate)
	if err != nil {
		return nil, fmt.Errorf("invalid disposal_date")
	}

	if err := s.ValidateDisposalPeriod(companyID, req.FinancialYearID, req.AccountingPeriodID, *disposalDate); err != nil {
		return nil, err
	}

	if req.DisposalType == "sale" && req.ReceivedToAccountID == nil {
		return nil, fmt.Errorf("received_to_account_id is required for sale")
	}
	if req.DisposalType == "write_off" && req.ProceedsAmount != 0 {
		return nil, fmt.Errorf("proceeds_amount should be zero for write_off")
	}

	disposalNumber, err := s.GenerateDisposalNumber(companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate disposal number: %v", err)
	}

	netBookValue := asset.NetBookValue
	gainLossAmount := req.ProceedsAmount - netBookValue

	disposal := &models.FixedAssetDisposal{
		CompanyID:                     companyID,
		BranchID:                      req.BranchID,
		FixedAssetID:                  req.FixedAssetID,
		FinancialYearID:               req.FinancialYearID,
		AccountingPeriodID:            req.AccountingPeriodID,
		DisposalNumber:                disposalNumber,
		DisposalDate:                  disposalDate,
		DisposalType:                  req.DisposalType,
		ProceedsAmount:                req.ProceedsAmount,
		AccumulatedDepreciationAmount: asset.AccumulatedDepreciation,
		NetBookValue:                  netBookValue,
		GainLossAmount:                gainLossAmount,
		ReceivedToAccountID:           req.ReceivedToAccountID,
		GainOnDisposalAccountID:       req.GainOnDisposalAccountID,
		LossOnDisposalAccountID:       req.LossOnDisposalAccountID,
		Reason:                        req.Reason,
		ApprovalStatus:                "draft",
		PostedStatus:                  "unposted",
		Status:                        "active",
		CreatedBy:                     &userID,
	}

	if err := s.repo.CreateFixedAssetDisposal(disposal); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_CREATED", "Created Fixed Asset Disposal", disposal.ID)

	return disposal, nil
}

func (s *FixedAssetDisposalService) UpdateFixedAssetDisposal(id uint64, companyID uint64, userID uint64, req *dto.UpdateFixedAssetDisposalRequest) (*models.FixedAssetDisposal, error) {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return nil, err
	}

	if disposal.ApprovalStatus != "draft" && disposal.ApprovalStatus != "rejected" {
		return nil, fmt.Errorf("only draft or rejected disposals can be updated")
	}

	disposalDate, err := s.parseDate(req.DisposalDate)
	if err != nil {
		return nil, fmt.Errorf("invalid disposal_date")
	}

	if err := s.ValidateDisposalPeriod(companyID, disposal.FinancialYearID, disposal.AccountingPeriodID, *disposalDate); err != nil {
		return nil, err
	}

	if req.DisposalType == "sale" && req.ReceivedToAccountID == nil {
		return nil, fmt.Errorf("received_to_account_id is required for sale")
	}
	if req.DisposalType == "write_off" && req.ProceedsAmount != 0 {
		return nil, fmt.Errorf("proceeds_amount should be zero for write_off")
	}

	gainLossAmount := req.ProceedsAmount - disposal.NetBookValue

	disposal.DisposalDate = disposalDate
	disposal.DisposalType = req.DisposalType
	disposal.ProceedsAmount = req.ProceedsAmount
	disposal.GainLossAmount = gainLossAmount
	disposal.ReceivedToAccountID = req.ReceivedToAccountID
	disposal.GainOnDisposalAccountID = req.GainOnDisposalAccountID
	disposal.LossOnDisposalAccountID = req.LossOnDisposalAccountID
	disposal.Reason = req.Reason
	disposal.UpdatedBy = &userID

	if err := s.repo.UpdateFixedAssetDisposal(disposal); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_UPDATED", "Updated Fixed Asset Disposal", disposal.ID)

	return disposal, nil
}

func (s *FixedAssetDisposalService) DeleteFixedAssetDisposal(id uint64, companyID uint64, userID uint64) error {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return err
	}

	if disposal.ApprovalStatus != "draft" && disposal.ApprovalStatus != "rejected" {
		return fmt.Errorf("only draft or rejected disposals can be deleted")
	}

	if err := s.repo.SoftDeleteFixedAssetDisposal(id, companyID); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_DELETED", "Deleted Fixed Asset Disposal", disposal.ID)

	return nil
}

func (s *FixedAssetDisposalService) SubmitFixedAssetDisposal(id uint64, companyID uint64, userID uint64, req *dto.ActionFixedAssetDisposalRequest) error {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return err
	}

	if disposal.ApprovalStatus != "draft" && disposal.ApprovalStatus != "rejected" {
		return fmt.Errorf("only draft or rejected disposals can be submitted")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.FixedAssetDisposal{}).Where("id = ? AND company_id = ?", id, companyID).Update("approval_status", "pending").Error; err != nil {
			return err
		}

		approval := &models.FixedAssetDisposalApproval{
			FixedAssetDisposalID: id,
			Action:               "submitted",
			Remarks:              req.Remarks,
			ActionBy:             userID,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_SUBMITTED", "Submitted Fixed Asset Disposal", disposal.ID)
		return nil
	})
}

func (s *FixedAssetDisposalService) ApproveFixedAssetDisposal(id uint64, companyID uint64, userID uint64, req *dto.ActionFixedAssetDisposalRequest) error {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return err
	}

	if disposal.ApprovalStatus != "pending" {
		return fmt.Errorf("only pending disposals can be approved")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := tx.Model(&models.FixedAssetDisposal{}).
			Where("id = ? AND company_id = ?", id, companyID).
			Updates(map[string]interface{}{
				"approval_status": "approved",
				"approved_by":     userID,
				"approved_at":     now,
			}).Error; err != nil {
			return err
		}

		approval := &models.FixedAssetDisposalApproval{
			FixedAssetDisposalID: id,
			Action:               "approved",
			Remarks:              req.Remarks,
			ActionBy:             userID,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_APPROVED", "Approved Fixed Asset Disposal", disposal.ID)
		return nil
	})
}

func (s *FixedAssetDisposalService) RejectFixedAssetDisposal(id uint64, companyID uint64, userID uint64, req *dto.ActionFixedAssetDisposalRequest) error {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return err
	}

	if disposal.ApprovalStatus != "pending" {
		return fmt.Errorf("only pending disposals can be rejected")
	}

	if req.Remarks == "" {
		return fmt.Errorf("remarks are required when rejecting")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.FixedAssetDisposal{}).Where("id = ? AND company_id = ?", id, companyID).Update("approval_status", "rejected").Error; err != nil {
			return err
		}

		approval := &models.FixedAssetDisposalApproval{
			FixedAssetDisposalID: id,
			Action:               "rejected",
			Remarks:              req.Remarks,
			ActionBy:             userID,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_REJECTED", "Rejected Fixed Asset Disposal", disposal.ID)
		return nil
	})
}

func (s *FixedAssetDisposalService) PostFixedAssetDisposal(id uint64, companyID uint64, userID uint64) error {
	disposal, err := s.repo.FindFixedAssetDisposalByID(id, companyID)
	if err != nil {
		return err
	}

	if disposal.ApprovalStatus != "approved" {
		return fmt.Errorf("only approved disposals can be posted")
	}

	if disposal.PostedStatus == "posted" {
		return fmt.Errorf("disposal is already posted")
	}

	if err := s.ValidateDisposalPeriod(companyID, disposal.FinancialYearID, disposal.AccountingPeriodID, *disposal.DisposalDate); err != nil {
		return err
	}

	asset := disposal.FixedAsset
	if asset.AssetStatus == "disposed" || asset.AssetStatus == "written_off" {
		return fmt.Errorf("asset is already disposed or written off")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Update Asset
		newStatus := "disposed"
		if disposal.DisposalType == "write_off" || disposal.DisposalType == "scrap" || disposal.DisposalType == "lost" || disposal.DisposalType == "damaged" {
			newStatus = "written_off"
		}

		if err := tx.Model(&models.FixedAsset{}).Where("id = ?", asset.ID).Update("asset_status", newStatus).Error; err != nil {
			return err
		}

		// Accounting Updates
		if disposal.DisposalType == "sale" {
			// Debit Received Account
			if disposal.ReceivedToAccountID != nil {
				if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, *disposal.ReceivedToAccountID, companyID, "debit", disposal.ProceedsAmount); err != nil {
					return err
				}
			}
			// Debit Accumulated Depreciation
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, asset.AccumulatedDepreciationAccountID, companyID, "debit", disposal.AccumulatedDepreciationAmount); err != nil {
				return err
			}
			// Credit Asset Account
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, asset.AssetAccountID, companyID, "credit", asset.AcquisitionCost); err != nil {
				return err
			}

			if disposal.GainLossAmount > 0 {
				if disposal.GainOnDisposalAccountID == nil {
					return fmt.Errorf("gain_on_disposal_account_id is required")
				}
				if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, *disposal.GainOnDisposalAccountID, companyID, "credit", disposal.GainLossAmount); err != nil {
					return err
				}
			} else if disposal.GainLossAmount < 0 {
				if disposal.LossOnDisposalAccountID == nil {
					return fmt.Errorf("loss_on_disposal_account_id is required")
				}
				// The loss amount here is negative, we need positive for debit
				loss := -disposal.GainLossAmount
				if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, *disposal.LossOnDisposalAccountID, companyID, "debit", loss); err != nil {
					return err
				}
			}
		} else {
			// Write Off logic
			// Debit Accumulated Depreciation
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, asset.AccumulatedDepreciationAccountID, companyID, "debit", disposal.AccumulatedDepreciationAmount); err != nil {
				return err
			}
			// Debit Loss On Disposal by NetBookValue
			if disposal.LossOnDisposalAccountID == nil {
				return fmt.Errorf("loss_on_disposal_account_id is required")
			}
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, *disposal.LossOnDisposalAccountID, companyID, "debit", disposal.NetBookValue); err != nil {
				return err
			}
			// Credit Asset Account
			if err := s.chartRepo.UpdateCurrentBalanceWithTx(tx, asset.AssetAccountID, companyID, "credit", asset.AcquisitionCost); err != nil {
				return err
			}
		}

		// General Ledger Posting
		now := time.Now()
		var glEntries []models.GeneralLedgerEntry

		if disposal.DisposalType == "sale" {
			// Debit Sale Received Account
			if disposal.ReceivedToAccountID != nil {
				glEntries = append(glEntries, models.GeneralLedgerEntry{
					CompanyID:          companyID,
					BranchID:           &asset.BranchID,
					FinancialYearID:    &disposal.FinancialYearID,
					AccountingPeriodID: &disposal.AccountingPeriodID,
					TransactionDate:    *disposal.DisposalDate,
					SourceType:         "asset_disposal",
					SourceID:           disposal.ID,
					SourceNumber:       disposal.DisposalNumber,
					AccountID:          *disposal.ReceivedToAccountID,
					Description:        fmt.Sprintf("Disposal Received for Asset: %s", asset.AssetCode),
					DebitAmount:        disposal.ProceedsAmount,
					CreditAmount:       0,
					PostedBy:           &userID,
					PostedAt:           &now,
					Status:             "posted",
				})
			}

			// Debit Accumulated Depreciation
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &asset.BranchID,
				FinancialYearID:    &disposal.FinancialYearID,
				AccountingPeriodID: &disposal.AccountingPeriodID,
				TransactionDate:    *disposal.DisposalDate,
				SourceType:         "asset_disposal",
				SourceID:           disposal.ID,
				SourceNumber:       disposal.DisposalNumber,
				AccountID:          asset.AccumulatedDepreciationAccountID,
				Description:        fmt.Sprintf("Accumulated Depreciation on Disposal: %s", asset.AssetCode),
				DebitAmount:        disposal.AccumulatedDepreciationAmount,
				CreditAmount:       0,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})

			// Credit Asset Account
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &asset.BranchID,
				FinancialYearID:    &disposal.FinancialYearID,
				AccountingPeriodID: &disposal.AccountingPeriodID,
				TransactionDate:    *disposal.DisposalDate,
				SourceType:         "asset_disposal",
				SourceID:           disposal.ID,
				SourceNumber:       disposal.DisposalNumber,
				AccountID:          asset.AssetAccountID,
				Description:        fmt.Sprintf("Asset Disposed: %s", asset.AssetCode),
				DebitAmount:        0,
				CreditAmount:       asset.AcquisitionCost,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})

			if disposal.GainLossAmount > 0 && disposal.GainOnDisposalAccountID != nil {
				glEntries = append(glEntries, models.GeneralLedgerEntry{
					CompanyID:          companyID,
					BranchID:           &asset.BranchID,
					FinancialYearID:    &disposal.FinancialYearID,
					AccountingPeriodID: &disposal.AccountingPeriodID,
					TransactionDate:    *disposal.DisposalDate,
					SourceType:         "asset_disposal",
					SourceID:           disposal.ID,
					SourceNumber:       disposal.DisposalNumber,
					AccountID:          *disposal.GainOnDisposalAccountID,
					Description:        fmt.Sprintf("Gain on Disposal: %s", asset.AssetCode),
					DebitAmount:        0,
					CreditAmount:       disposal.GainLossAmount,
					PostedBy:           &userID,
					PostedAt:           &now,
					Status:             "posted",
				})
			} else if disposal.GainLossAmount < 0 && disposal.LossOnDisposalAccountID != nil {
				loss := -disposal.GainLossAmount
				glEntries = append(glEntries, models.GeneralLedgerEntry{
					CompanyID:          companyID,
					BranchID:           &asset.BranchID,
					FinancialYearID:    &disposal.FinancialYearID,
					AccountingPeriodID: &disposal.AccountingPeriodID,
					TransactionDate:    *disposal.DisposalDate,
					SourceType:         "asset_disposal",
					SourceID:           disposal.ID,
					SourceNumber:       disposal.DisposalNumber,
					AccountID:          *disposal.LossOnDisposalAccountID,
					Description:        fmt.Sprintf("Loss on Disposal: %s", asset.AssetCode),
					DebitAmount:        loss,
					CreditAmount:       0,
					PostedBy:           &userID,
					PostedAt:           &now,
					Status:             "posted",
				})
			}
		} else {
			// Write Off logic
			// Debit Accumulated Depreciation
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &asset.BranchID,
				FinancialYearID:    &disposal.FinancialYearID,
				AccountingPeriodID: &disposal.AccountingPeriodID,
				TransactionDate:    *disposal.DisposalDate,
				SourceType:         "asset_disposal",
				SourceID:           disposal.ID,
				SourceNumber:       disposal.DisposalNumber,
				AccountID:          asset.AccumulatedDepreciationAccountID,
				Description:        fmt.Sprintf("Accumulated Depreciation on Write-Off: %s", asset.AssetCode),
				DebitAmount:        disposal.AccumulatedDepreciationAmount,
				CreditAmount:       0,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})

			// Debit Loss On Disposal
			if disposal.LossOnDisposalAccountID != nil {
				glEntries = append(glEntries, models.GeneralLedgerEntry{
					CompanyID:          companyID,
					BranchID:           &asset.BranchID,
					FinancialYearID:    &disposal.FinancialYearID,
					AccountingPeriodID: &disposal.AccountingPeriodID,
					TransactionDate:    *disposal.DisposalDate,
					SourceType:         "asset_disposal",
					SourceID:           disposal.ID,
					SourceNumber:       disposal.DisposalNumber,
					AccountID:          *disposal.LossOnDisposalAccountID,
					Description:        fmt.Sprintf("Loss on Write-Off: %s", asset.AssetCode),
					DebitAmount:        disposal.NetBookValue,
					CreditAmount:       0,
					PostedBy:           &userID,
					PostedAt:           &now,
					Status:             "posted",
				})
			}

			// Credit Asset Account
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &asset.BranchID,
				FinancialYearID:    &disposal.FinancialYearID,
				AccountingPeriodID: &disposal.AccountingPeriodID,
				TransactionDate:    *disposal.DisposalDate,
				SourceType:         "asset_disposal",
				SourceID:           disposal.ID,
				SourceNumber:       disposal.DisposalNumber,
				AccountID:          asset.AssetAccountID,
				Description:        fmt.Sprintf("Asset Written-Off: %s", asset.AssetCode),
				DebitAmount:        0,
				CreditAmount:       asset.AcquisitionCost,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})
		}

		if err := s.glService.PostLedgerEntries(tx, glEntries); err != nil {
			return err
		}

		now = time.Now()
		if err := tx.Model(&models.FixedAssetDisposal{}).
			Where("id = ? AND company_id = ?", id, companyID).
			Updates(map[string]interface{}{
				"posted_status": "posted",
				"posted_by":     userID,
				"posted_at":     now,
			}).Error; err != nil {
			return err
		}

		approval := &models.FixedAssetDisposalApproval{
			FixedAssetDisposalID: id,
			Action:               "posted",
			Remarks:              "System posted",
			ActionBy:             userID,
		}
		if err := tx.Create(approval).Error; err != nil {
			return err
		}

		s.auditService.LogAction(companyID, userID, "FIXED_ASSET_DISPOSAL_POSTED", "Posted Fixed Asset Disposal", disposal.ID)

		return nil
	})
}
