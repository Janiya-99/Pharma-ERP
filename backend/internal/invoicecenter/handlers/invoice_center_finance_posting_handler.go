package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"gorm.io/gorm"
)

type InvoiceCenterFinancePostingHandler struct {
	service *services.InvoiceCenterFinancePostingService
}

func NewInvoiceCenterFinancePostingHandler(service *services.InvoiceCenterFinancePostingService) *InvoiceCenterFinancePostingHandler {
	return &InvoiceCenterFinancePostingHandler{service: service}
}

func (h *InvoiceCenterFinancePostingHandler) GetPendingFinancePostings(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.GetPendingFinancePostingsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid query parameters", "errors": []string{err.Error()}})
		return
	}

	results, total, err := h.service.GetPendingFinancePostings(db, ctx.CompanyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}
	totalPages := (total + int64(limit) - 1) / int64(limit)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pending finance postings loaded successfully",
		"data":    results,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *InvoiceCenterFinancePostingHandler) GetFinancePostingHistory(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.GetFinancePostingHistoryRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid query parameters", "errors": []string{err.Error()}})
		return
	}

	results, total, err := h.service.GetFinancePostingHistory(db, ctx.CompanyID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}
	totalPages := (total + int64(limit) - 1) / int64(limit)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Finance posting history loaded successfully",
		"data":    results,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *InvoiceCenterFinancePostingHandler) PostSalesInvoiceToFinance(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	invoiceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid sales invoice ID", "errors": []string{err.Error()}})
		return
	}

	res, err := h.service.PostSalesInvoiceToFinance(db, ctx.CompanyID, invoiceID, ctx.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales invoice posted to Finance successfully",
		"data":    res,
	})
}

func (h *InvoiceCenterFinancePostingHandler) PostCreditNoteToFinance(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	noteID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid credit note ID", "errors": []string{err.Error()}})
		return
	}

	res, err := h.service.PostCreditNoteToFinance(db, ctx.CompanyID, noteID, ctx.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Credit note posted to Finance successfully",
		"data":    res,
	})
}

func (h *InvoiceCenterFinancePostingHandler) PostDebitNoteToFinance(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	noteID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid debit note ID", "errors": []string{err.Error()}})
		return
	}

	res, err := h.service.PostDebitNoteToFinance(db, ctx.CompanyID, noteID, ctx.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Debit note posted to Finance successfully",
		"data":    res,
	})
}

func (h *InvoiceCenterFinancePostingHandler) PostCustomerReceiptToFinance(c *gin.Context) {
	authCtx, _ := c.Get("authContext")
	ctx := authCtx.(*middleware.AuthContext)
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	receiptID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid customer receipt ID", "errors": []string{err.Error()}})
		return
	}

	res, err := h.service.PostCustomerReceiptToFinance(db, ctx.CompanyID, receiptID, ctx.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{err.Error()}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Customer receipt posted to Finance successfully",
		"data":    res,
	})
}
