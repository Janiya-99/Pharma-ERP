package handlers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ChequeBookHandler struct {
	logger *zap.Logger
}

func NewChequeBookHandler(logger *zap.Logger) *ChequeBookHandler {
	return &ChequeBookHandler{logger: logger}
}

func (h *ChequeBookHandler) getService(c *gin.Context) (*financeServices.ChequeBookService, uint64, uint64, error) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		return nil, 0, 0, http.ErrNoCookie
	}
	ctx := authCtx.(*middleware.AuthContext)

	bookRepo := repositories.NewChequeBookRepository(db)
	bankRepo := repositories.NewBankAccountRepository(db)
	auditSvc := financeServices.NewAuditLogService(db, h.logger)
	service := financeServices.NewChequeBookService(bookRepo, bankRepo, auditSvc)

	return service, ctx.CompanyID, ctx.UserID, nil
}

func (h *ChequeBookHandler) ListChequeBooks(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var page, limit int
	filters := map[string]interface{}{}

	if c.Request.Method == "QUERY" {
		var req struct {
			Page          int    `json:"page"`
			Limit         int    `json:"limit"`
			BankAccountID string `json:"bank_account_id"`
			Status        string `json:"status"`
			Search        string `json:"search"`
		}
		if err := c.ShouldBindJSON(&req); err == nil {
			page = req.Page
			limit = req.Limit
			if req.BankAccountID != "" {
				filters["bank_account_id"] = req.BankAccountID
			}
			if req.Status != "" {
				filters["status"] = req.Status
			}
			if req.Search != "" {
				filters["search"] = req.Search
			}
		}
		if page <= 0 {
			page = 1
		}
		if limit <= 0 {
			limit = 10
		}
	} else {
		page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ = strconv.Atoi(c.DefaultQuery("limit", "10"))

		if b := c.Query("bank_account_id"); b != "" {
			filters["bank_account_id"] = b
		}
		if s := c.Query("status"); s != "" {
			filters["status"] = s
		}
		if q := c.Query("search"); q != "" {
			filters["search"] = q
		}
	}

	books, total, err := service.ListChequeBooks(companyID, filters, page, limit)
	if err != nil {
		h.logger.Error("Failed to list cheque books", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load cheque books"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Cheque books loaded successfully",
		"data":    books,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *ChequeBookHandler) GetChequeBookByID(c *gin.Context) {
	service, companyID, _, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	book, err := service.GetChequeBookByID(companyID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Cheque book not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cheque book loaded successfully", "data": book})
}

func (h *ChequeBookHandler) CreateChequeBook(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	var req dto.CreateChequeBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	book, err := service.CreateChequeBook(companyID, userID, req)
	if err != nil {
		h.logger.Error("Failed to create cheque book", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Cheque book created successfully", "data": book})
}

func (h *ChequeBookHandler) UpdateChequeBook(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.UpdateChequeBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	book, err := service.UpdateChequeBook(companyID, userID, id, req)
	if err != nil {
		h.logger.Error("Failed to update cheque book", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cheque book updated successfully", "data": book})
}

func (h *ChequeBookHandler) DeleteChequeBook(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := service.DeleteChequeBook(companyID, userID, id); err != nil {
		h.logger.Error("Failed to delete cheque book", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cheque book deleted successfully"})
}

func (h *ChequeBookHandler) CancelChequeLeaf(c *gin.Context) {
	service, companyID, userID, err := h.getService(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Auth context missing"})
		return
	}

	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req dto.CancelChequeLeafRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body"})
		return
	}

	if err := service.CancelChequeLeaf(companyID, userID, id, req); err != nil {
		h.logger.Error("Failed to cancel cheque leaf", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Cheque leaf cancelled successfully"})
}
