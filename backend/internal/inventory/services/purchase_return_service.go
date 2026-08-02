package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"gorm.io/gorm"
)

type PurchaseReturnService interface {
	FetchAll(db *gorm.DB, companyID uint64, branchID *uint64) ([]models.PurchaseReturn, error)
	FetchByID(db *gorm.DB, companyID uint64, returnID uint64) (*models.PurchaseReturn, error)
	Create(db *gorm.DB, companyID, branchID, userID uint64, req *dto.PurchaseReturnCreateRequest) (*models.PurchaseReturn, error)
	Update(db *gorm.DB, companyID, returnID, userID uint64, req *dto.PurchaseReturnUpdateRequest) (*models.PurchaseReturn, error)
	Delete(db *gorm.DB, companyID uint64, returnID uint64, userID uint64) error
	SubmitForApproval(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error
	Approve(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error
	Reject(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error
	Post(db *gorm.DB, companyID uint64, returnID uint64, userID uint64) error
}

type purchaseReturnService struct {
	repo            repositories.PurchaseReturnRepository
	movementService InventoryStockMovementService
}

func NewPurchaseReturnService(repo repositories.PurchaseReturnRepository, movementService InventoryStockMovementService) PurchaseReturnService {
	return &purchaseReturnService{repo: repo, movementService: movementService}
}

func (s *purchaseReturnService) FetchAll(db *gorm.DB, companyID uint64, branchID *uint64) ([]models.PurchaseReturn, error) {
	return s.repo.FindAll(db, companyID, branchID)
}

func (s *purchaseReturnService) FetchByID(db *gorm.DB, companyID uint64, returnID uint64) (*models.PurchaseReturn, error) {
	return s.repo.FindByID(db, companyID, returnID)
}

func (s *purchaseReturnService) Create(db *gorm.DB, companyID, branchID, userID uint64, req *dto.PurchaseReturnCreateRequest) (*models.PurchaseReturn, error) {
	parsedDate, err := time.Parse("2006-01-02", req.ReturnDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	returnNumber := fmt.Sprintf("PR-%d-%d", companyID, time.Now().Unix())

	var totalQuantity, subtotal, totalTax, totalAmount float64

	var lines []models.PurchaseReturnLine
	for i, l := range req.Lines {
		lineTotal := l.ReturnQuantity * l.UnitCost
		lines = append(lines, models.PurchaseReturnLine{
			GoodsReceiptNoteLineID: l.GoodsReceiptNoteLineID,
			WarehouseLocationID:    l.WarehouseLocationID,
			ProductID:              l.ProductID,
			ProductBatchID:         l.ProductBatchID,
			ReturnQuantity:         l.ReturnQuantity,
			UnitCost:               l.UnitCost,
			TaxAmount:              l.TaxAmount,
			LineTotal:              lineTotal,
			ReturnReason:           l.ReturnReason,
			LineRemarks:            l.LineRemarks,
			LineOrder:              i + 1,
		})

		totalQuantity += l.ReturnQuantity
		subtotal += lineTotal
		totalTax += l.TaxAmount
		totalAmount += (lineTotal + l.TaxAmount)
	}

	purchaseReturn := &models.PurchaseReturn{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		SupplierID:         req.SupplierID,
		WarehouseID:        req.WarehouseID,
		GoodsReceiptNoteID: req.GoodsReceiptNoteID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		ReturnNumber:       returnNumber,
		ReturnDate:         parsedDate,
		ReferenceNumber:    req.ReferenceNumber,
		Remarks:            req.Remarks,
		TotalQuantity:      totalQuantity,
		SubtotalAmount:     subtotal,
		TaxAmount:          totalTax,
		TotalAmount:        totalAmount,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          userID,
		UpdatedBy:          userID,
		Lines:              lines,
	}

	if err := s.repo.Create(db, purchaseReturn); err != nil {
		return nil, err
	}

	return s.FetchByID(db, companyID, purchaseReturn.ID)
}

func (s *purchaseReturnService) Update(db *gorm.DB, companyID, returnID, userID uint64, req *dto.PurchaseReturnUpdateRequest) (*models.PurchaseReturn, error) {
	pr, err := s.repo.FindByID(db, companyID, returnID)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase return not found")
	}
	if pr.ApprovalStatus != "draft" && pr.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected returns can be updated")
	}

	parsedDate, err := time.Parse("2006-01-02", req.ReturnDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// Delete existing lines
	if err := s.repo.DeleteLines(db, returnID); err != nil {
		return nil, err
	}

	var totalQuantity, subtotal, totalTax, totalAmount float64
	var lines []models.PurchaseReturnLine
	for i, l := range req.Lines {
		lineTotal := l.ReturnQuantity * l.UnitCost
		lines = append(lines, models.PurchaseReturnLine{
			PurchaseReturnID:       returnID,
			GoodsReceiptNoteLineID: l.GoodsReceiptNoteLineID,
			WarehouseLocationID:    l.WarehouseLocationID,
			ProductID:              l.ProductID,
			ProductBatchID:         l.ProductBatchID,
			ReturnQuantity:         l.ReturnQuantity,
			UnitCost:               l.UnitCost,
			TaxAmount:              l.TaxAmount,
			LineTotal:              lineTotal,
			ReturnReason:           l.ReturnReason,
			LineRemarks:            l.LineRemarks,
			LineOrder:              i + 1,
		})
		totalQuantity += l.ReturnQuantity
		subtotal += lineTotal
		totalTax += l.TaxAmount
		totalAmount += (lineTotal + l.TaxAmount)
	}

	pr.BranchID = req.BranchID
	pr.SupplierID = req.SupplierID
	pr.WarehouseID = req.WarehouseID
	pr.GoodsReceiptNoteID = req.GoodsReceiptNoteID
	pr.FinancialYearID = req.FinancialYearID
	pr.AccountingPeriodID = req.AccountingPeriodID
	pr.ReturnDate = parsedDate
	pr.ReferenceNumber = req.ReferenceNumber
	pr.Remarks = req.Remarks
	pr.TotalQuantity = totalQuantity
	pr.SubtotalAmount = subtotal
	pr.TaxAmount = totalTax
	pr.TotalAmount = totalAmount
	pr.UpdatedBy = userID
	pr.Lines = lines
	pr.ApprovalStatus = "draft" // Reset to draft if updated

	if err := s.repo.Update(db, pr); err != nil {
		return nil, err
	}

	return s.FetchByID(db, companyID, returnID)
}

func (s *purchaseReturnService) Delete(db *gorm.DB, companyID uint64, returnID uint64, userID uint64) error {
	return s.repo.Delete(db, companyID, returnID, userID)
}

func (s *purchaseReturnService) SubmitForApproval(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error {
	pr, err := s.repo.FindByID(db, companyID, returnID)
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase return not found")
	}
	if pr.ApprovalStatus != "draft" && pr.ApprovalStatus != "rejected" {
		return errors.New("purchase return must be in draft or rejected status to submit")
	}

	err = s.repo.UpdateApprovalStatus(db, returnID, "pending_approval", userID)
	if err != nil {
		return err
	}

	record := &models.PurchaseReturnApproval{
		PurchaseReturnID: returnID,
		ApproverID:       userID,
		Action:           "submit",
		Remarks:          remarks,
		ApprovalDate:     time.Now(),
	}
	return s.repo.CreateApprovalRecord(db, record)
}

func (s *purchaseReturnService) Approve(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error {
	pr, err := s.repo.FindByID(db, companyID, returnID)
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase return not found")
	}
	if pr.ApprovalStatus != "pending_approval" {
		return errors.New("purchase return must be in pending_approval status to approve")
	}

	err = s.repo.UpdateApprovalStatus(db, returnID, "approved", userID)
	if err != nil {
		return err
	}

	record := &models.PurchaseReturnApproval{
		PurchaseReturnID: returnID,
		ApproverID:       userID,
		Action:           "approve",
		Remarks:          remarks,
		ApprovalDate:     time.Now(),
	}
	return s.repo.CreateApprovalRecord(db, record)
}

func (s *purchaseReturnService) Reject(db *gorm.DB, companyID uint64, returnID uint64, userID uint64, remarks string) error {
	pr, err := s.repo.FindByID(db, companyID, returnID)
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase return not found")
	}
	if pr.ApprovalStatus != "pending_approval" {
		return errors.New("purchase return must be in pending_approval status to reject")
	}

	err = s.repo.UpdateApprovalStatus(db, returnID, "rejected", userID)
	if err != nil {
		return err
	}

	record := &models.PurchaseReturnApproval{
		PurchaseReturnID: returnID,
		ApproverID:       userID,
		Action:           "reject",
		Remarks:          remarks,
		ApprovalDate:     time.Now(),
	}
	return s.repo.CreateApprovalRecord(db, record)
}

func (s *purchaseReturnService) Post(db *gorm.DB, companyID uint64, returnID uint64, userID uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		pr, err := s.repo.FindByID(tx, companyID, returnID)
		if err != nil {
			return err
		}
		if pr == nil {
			return errors.New("purchase return not found")
		}

		if pr.ApprovalStatus != "approved" {
			return errors.New("purchase return must be approved before posting")
		}
		if pr.PostedStatus == "posted" {
			return errors.New("purchase return is already posted")
		}

		// Deduct stock balance
		for _, line := range pr.Lines {
			payload := dto.StockOutPayload{
				CompanyID:           companyID,
				BranchID:            pr.BranchID,
				WarehouseID:         pr.WarehouseID,
				WarehouseLocationID: line.WarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				Quantity:            line.ReturnQuantity,
				TransactionDate:     time.Now(),
				SourceType:          "purchase_return",
				SourceID:            returnID,
				SourceNumber:        pr.ReturnNumber,
				Remarks:             "Purchase Return",
				CreatedBy:           userID,
			}
			if err := s.movementService.ProcessStockOut(tx, payload); err != nil {
				return err
			}
		}

		err = s.repo.UpdatePostedStatus(tx, returnID, "posted", userID)
		if err != nil {
			return err
		}

		return nil
	})
}
