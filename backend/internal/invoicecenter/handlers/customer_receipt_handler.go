package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"gorm.io/gorm"
)

type CustomerReceiptHandler struct {
	customerReceiptService *services.CustomerReceiptService
}

func NewCustomerReceiptHandler(customerReceiptService *services.CustomerReceiptService) *CustomerReceiptHandler {
	return &CustomerReceiptHandler{
		customerReceiptService: customerReceiptService,
	}
}

func (h *CustomerReceiptHandler) ListCustomerReceipts(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	companyID, _ := c.Get("company_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	filters := make(map[string]interface{})
	if branchID, err := strconv.ParseUint(c.Query("branch_id"), 10, 64); err == nil {
		filters["branch_id"] = branchID
	}
	if customerID, err := strconv.ParseUint(c.Query("customer_id"), 10, 64); err == nil {
		filters["customer_id"] = customerID
	}
	if paymentMethod := c.Query("payment_method"); paymentMethod != "" {
		filters["payment_method"] = paymentMethod
	}
	if approvalStatus := c.Query("approval_status"); approvalStatus != "" {
		filters["approval_status"] = approvalStatus
	}
	if postedStatus := c.Query("posted_status"); postedStatus != "" {
		filters["posted_status"] = postedStatus
	}
	if receiptStatus := c.Query("receipt_status"); receiptStatus != "" {
		filters["receipt_status"] = receiptStatus
	}
	if receiptDateFrom := c.Query("receipt_date_from"); receiptDateFrom != "" {
		filters["receipt_date_from"] = receiptDateFrom
	}
	if receiptDateTo := c.Query("receipt_date_to"); receiptDateTo != "" {
		filters["receipt_date_to"] = receiptDateTo
	}

	receipts, total, err := h.customerReceiptService.ListCustomerReceipts(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load customer receipts", "errors": []string{err.Error()}})
		return
	}

	var responseData []dto.CustomerReceiptResponse
	for _, r := range receipts {
		resp := dto.CustomerReceiptResponse{
			ID:                  r.ID,
			ReceiptNumber:       r.ReceiptNumber,
			ReceiptDate:         r.ReceiptDate,
			BranchID:            r.BranchID,
			CustomerID:          r.CustomerID,
			PaymentMethod:       r.PaymentMethod,
			ReferenceNumber:     r.ReferenceNumber,
			BankReferenceNumber: r.BankReferenceNumber,
			ChequeNumber:        r.ChequeNumber,
			ReceiptAmount:       r.ReceivedAmount,
			AllocatedAmount:     r.AllocatedAmount,
			UnallocatedAmount:   r.UnallocatedAmount,
			ApprovalStatus:      r.ApprovalStatus,
			PostedStatus:        r.PostedStatus,
			ReceiptStatus:       r.ReceiptStatus,
			CreatedBy:           r.CreatedBy,
			CreatedAt:           r.CreatedAt,
			CustomerCode:        r.Customer.CustomerCode,
			CustomerName:        r.Customer.CustomerName,
		}
		responseData = append(responseData, resp)
	}

	if responseData == nil {
		responseData = []dto.CustomerReceiptResponse{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipts loaded successfully",
		"data":    responseData,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	})
}

func (h *CustomerReceiptHandler) GetCustomerReceiptByID(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	companyID, _ := c.Get("company_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	receipt, err := h.customerReceiptService.GetCustomerReceiptByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Customer receipt not found", "errors": []string{err.Error()}})
		return
	}

	var allocs []dto.CustomerReceiptAllocationDetailResponse
	for _, a := range receipt.Allocations {
		alloc := dto.CustomerReceiptAllocationDetailResponse{
			ID:              a.ID,
			AllocatedAmount: a.AllocatedAmount,
			Remarks:         a.Remarks,
		}
		if a.SalesInvoiceID != nil {
			alloc.SalesInvoiceID = *a.SalesInvoiceID
			if a.SalesInvoice != nil {
				alloc.SalesInvoiceDetail = map[string]interface{}{
					"invoice_number": a.SalesInvoice.InvoiceNumber,
					"invoice_date":   a.SalesInvoice.InvoiceDate,
					"total_amount":   a.SalesInvoice.TotalAmount,
					"paid_amount":    a.SalesInvoice.PaidAmount,
					"balance_amount": a.SalesInvoice.BalanceAmount,
					"payment_status": a.SalesInvoice.PaymentStatus,
				}
			}
		}
		allocs = append(allocs, alloc)
	}

	if allocs == nil {
		allocs = []dto.CustomerReceiptAllocationDetailResponse{}
	}

	resp := dto.CustomerReceiptDetailResponse{
		CustomerReceiptResponse: dto.CustomerReceiptResponse{
			ID:                  receipt.ID,
			ReceiptNumber:       receipt.ReceiptNumber,
			ReceiptDate:         receipt.ReceiptDate,
			BranchID:            receipt.BranchID,
			CustomerID:          receipt.CustomerID,
			PaymentMethod:       receipt.PaymentMethod,
			ReferenceNumber:     receipt.ReferenceNumber,
			BankReferenceNumber: receipt.BankReferenceNumber,
			ChequeNumber:        receipt.ChequeNumber,
			ReceiptAmount:       receipt.ReceivedAmount,
			AllocatedAmount:     receipt.AllocatedAmount,
			UnallocatedAmount:   receipt.UnallocatedAmount,
			ApprovalStatus:      receipt.ApprovalStatus,
			PostedStatus:        receipt.PostedStatus,
			ReceiptStatus:       receipt.ReceiptStatus,
			CreatedBy:           receipt.CreatedBy,
			CreatedAt:           receipt.CreatedAt,
			CustomerCode:        receipt.Customer.CustomerCode,
			CustomerName:        receipt.Customer.CustomerName,
		},
		Allocations: allocs,
		AllocationSummary: map[string]interface{}{
			"receipt_amount":     receipt.ReceivedAmount,
			"allocated_amount":   receipt.AllocatedAmount,
			"unallocated_amount": receipt.UnallocatedAmount,
			"allocation_count":   len(allocs),
		},
		CustomerBalanceImpact: map[string]interface{}{
			"customer_current_balance_before_posting": receipt.Customer.CurrentBalance,
			"allocated_amount":                        receipt.AllocatedAmount,
			"unallocated_amount":                      receipt.UnallocatedAmount,
			"customer_balance_after_posting_preview":  receipt.Customer.CurrentBalance - receipt.AllocatedAmount,
		},
		ApprovalHistory: []dto.CustomerReceiptApprovalResponse{}, // Can be populated if needed
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt loaded successfully",
		"data":    resp,
	})
}

func (h *CustomerReceiptHandler) CreateCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateCustomerReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	receipt, err := h.customerReceiptService.CreateCustomerReceipt(db, companyID.(uint64), req.BranchID, userID.(uint64), req, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Customer receipt created successfully",
		"data": map[string]interface{}{
			"id":             receipt.ID,
			"receipt_number": receipt.ReceiptNumber,
		},
	})
}

func (h *CustomerReceiptHandler) UpdateCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	var req dto.UpdateCustomerReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	receipt, err := h.customerReceiptService.UpdateCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), req, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt updated successfully",
		"data": map[string]interface{}{
			"id":             receipt.ID,
			"receipt_number": receipt.ReceiptNumber,
		},
	})
}

func (h *CustomerReceiptHandler) DeleteCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.DeleteCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt deleted successfully",
		"data":    nil,
	})
}

func (h *CustomerReceiptHandler) SubmitCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	var req dto.CustomerReceiptActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.SubmitCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), req.Remarks, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt submitted successfully",
		"data":    nil,
	})
}

func (h *CustomerReceiptHandler) ApproveCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	var req dto.CustomerReceiptActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.ApproveCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), req.Remarks, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt approved successfully",
		"data":    nil,
	})
}

func (h *CustomerReceiptHandler) RejectCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	var req dto.CustomerReceiptActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.RejectCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), req.Remarks, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt rejected successfully",
		"data":    nil,
	})
}

func (h *CustomerReceiptHandler) PostCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.PostCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt posted successfully",
		"data":    nil,
	})
}

func (h *CustomerReceiptHandler) CancelCustomerReceipt(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	var req dto.CustomerReceiptActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request payload", "errors": []string{err.Error()}})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	if err := h.customerReceiptService.CancelCustomerReceipt(db, companyID.(uint64), id, userID.(uint64), req.Remarks, ipAddress, userAgent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt cancelled successfully",
		"data":    nil,
	})
}
