package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalesInvoiceHandler struct {
	service *services.SalesInvoiceService
	logger  *zap.Logger
}

func NewSalesInvoiceHandler(service *services.SalesInvoiceService, logger *zap.Logger) *SalesInvoiceHandler {
	return &SalesInvoiceHandler{service: service, logger: logger}
}

func (h *SalesInvoiceHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	filters := map[string]interface{}{}
	for _, key := range []string{"branch_id", "customer_id", "sales_order_id", "warehouse_id", "financial_year_id", "accounting_period_id"} {
		if value := c.Query(key); value != "" {
			if id, err := strconv.ParseUint(value, 10, 64); err == nil {
				filters[key] = id
			}
		}
	}
	for _, key := range []string{"approval_status", "posted_status", "payment_status", "invoice_date_from", "invoice_date_to", "due_date_from", "due_date_to"} {
		if value := c.Query(key); value != "" {
			filters[key] = value
		}
	}

	res, total, err := h.service.ListSalesInvoices(db, companyID.(uint64), filters, search, page, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales invoices loaded successfully",
		"data":    res,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *SalesInvoiceHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	res, err := h.service.GetSalesInvoiceByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales invoice loaded successfully",
		"data":    res,
	})
}

func (h *SalesInvoiceHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	branchID, _ := c.Get("branch_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateSalesInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	invoice, err := h.service.CreateSalesInvoice(db, companyID.(uint64), userID.(uint64), branchID.(uint64), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetSalesInvoiceByID(db, companyID.(uint64), invoice.ID)
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Sales invoice created successfully", "data": res})
}

func (h *SalesInvoiceHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	branchID, _ := c.Get("branch_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.CreateSalesInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	invoice, err := h.service.UpdateSalesInvoice(db, companyID.(uint64), userID.(uint64), branchID.(uint64), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetSalesInvoiceByID(db, companyID.(uint64), invoice.ID)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales invoice updated successfully", "data": res})
}

func (h *SalesInvoiceHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	if err := h.service.DeleteSalesInvoice(db, companyID.(uint64), userID.(uint64), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales invoice deleted successfully"})
}

func (h *SalesInvoiceHandler) Submit(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
		return h.service.SubmitSalesInvoice(db, companyID, userID, id, remarks)
	}, "Sales invoice submitted successfully")
}

func (h *SalesInvoiceHandler) Approve(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
		return h.service.ApproveSalesInvoice(db, companyID, userID, id, remarks)
	}, "Sales invoice approved successfully")
}

func (h *SalesInvoiceHandler) Reject(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
		return h.service.RejectSalesInvoice(db, companyID, userID, id, remarks)
	}, "Sales invoice rejected successfully")
}

func (h *SalesInvoiceHandler) Post(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	if err := h.service.PostSalesInvoice(db, companyID.(uint64), userID.(uint64), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sales invoice posted successfully"})
}

func (h *SalesInvoiceHandler) Cancel(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
		return h.service.CancelSalesInvoice(db, companyID, userID, id, remarks)
	}, "Sales invoice cancelled successfully")
}

func (h *SalesInvoiceHandler) action(c *gin.Context, fn func(db *gorm.DB, companyID, userID, id uint64, remarks string) error, successMessage string) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesInvoiceRequest
	_ = c.ShouldBindJSON(&req)

	if err := fn(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": successMessage})
}
