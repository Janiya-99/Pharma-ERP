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

type CreditNoteHandler struct {
	service *services.CreditNoteService
	logger  *zap.Logger
}

func NewCreditNoteHandler(service *services.CreditNoteService, logger *zap.Logger) *CreditNoteHandler {
	return &CreditNoteHandler{service: service, logger: logger}
}

func (h *CreditNoteHandler) List(c *gin.Context) {
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
	for _, key := range []string{"branch_id", "customer_id", "sales_invoice_id", "financial_year_id", "accounting_period_id"} {
		if value := c.Query(key); value != "" {
			if id, err := strconv.ParseUint(value, 10, 64); err == nil {
				filters[key] = id
			}
		}
	}
	for _, key := range []string{"approval_status", "posted_status", "credit_note_type", "credit_note_date_from", "credit_note_date_to"} {
		if value := c.Query(key); value != "" {
			filters[key] = value
		}
	}

	res, total, err := h.service.ListCreditNotes(db, companyID.(uint64), filters, search, page, limit)
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
		"message": "Credit notes loaded successfully",
		"data":    res,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *CreditNoteHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	res, err := h.service.GetCreditNoteByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Credit note loaded successfully",
		"data":    res,
	})
}

func (h *CreditNoteHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateCreditNoteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	note, err := h.service.CreateCreditNote(db, companyID.(uint64), userID.(uint64), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetCreditNoteByID(db, companyID.(uint64), note.ID)
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Credit note created successfully", "data": res})
}

func (h *CreditNoteHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.UpdateCreditNoteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	note, err := h.service.UpdateCreditNote(db, companyID.(uint64), id, userID.(uint64), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetCreditNoteByID(db, companyID.(uint64), note.ID)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Credit note updated successfully", "data": res})
}

func (h *CreditNoteHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	if err := h.service.DeleteCreditNote(db, companyID.(uint64), id, userID.(uint64)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Credit note deleted successfully"})
}

func (h *CreditNoteHandler) Submit(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
		return h.service.SubmitCreditNote(db, companyID, id, userID, remarks)
	}, "Credit note submitted successfully")
}

func (h *CreditNoteHandler) Approve(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
		return h.service.ApproveCreditNote(db, companyID, id, userID, remarks)
	}, "Credit note approved successfully")
}

func (h *CreditNoteHandler) Reject(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
		return h.service.RejectCreditNote(db, companyID, id, userID, remarks)
	}, "Credit note rejected successfully")
}

func (h *CreditNoteHandler) Post(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	if err := h.service.PostCreditNote(db, companyID.(uint64), id, userID.(uint64)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Credit note posted successfully"})
}

func (h *CreditNoteHandler) Cancel(c *gin.Context) {
	h.action(c, func(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
		return h.service.CancelCreditNote(db, companyID, id, userID, remarks)
	}, "Credit note cancelled successfully")
}

func (h *CreditNoteHandler) action(c *gin.Context, fn func(db *gorm.DB, companyID, id, userID uint64, remarks string) error, successMessage string) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionCreditNoteReq
	_ = c.ShouldBindJSON(&req)

	if err := fn(db, companyID.(uint64), id, userID.(uint64), req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": successMessage})
}
