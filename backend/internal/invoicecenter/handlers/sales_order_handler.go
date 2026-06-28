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

type SalesOrderHandler struct {
	service *services.SalesOrderService
	logger  *zap.Logger
}

func NewSalesOrderHandler(s *services.SalesOrderService, logger *zap.Logger) *SalesOrderHandler {
	return &SalesOrderHandler{service: s, logger: logger}
}

func getIDParam(c *gin.Context) (uint64, error) {
	v := c.Param("id")
	return strconv.ParseUint(v, 10, 64)
}

func (h *SalesOrderHandler) List(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	filters := map[string]interface{}{}
	if v := c.Query("branch_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil {
			filters["branch_id"] = id
		}
	}
	if v := c.Query("customer_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil {
			filters["customer_id"] = id
		}
	}
	if v := c.Query("financial_year_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil {
			filters["financial_year_id"] = id
		}
	}
	if v := c.Query("accounting_period_id"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 64); err == nil {
			filters["accounting_period_id"] = id
		}
	}
	if v := c.Query("approval_status"); v != "" {
		filters["approval_status"] = v
	}
	if v := c.Query("order_status"); v != "" {
		filters["order_status"] = v
	}
	if v := c.Query("sales_order_date_from"); v != "" {
		filters["sales_order_date_from"] = v
	}
	if v := c.Query("sales_order_date_to"); v != "" {
		filters["sales_order_date_to"] = v
	}
	if v := c.Query("expected_delivery_date_from"); v != "" {
		filters["expected_delivery_date_from"] = v
	}
	if v := c.Query("expected_delivery_date_to"); v != "" {
		filters["expected_delivery_date_to"] = v
	}

	res, total, err := h.service.ListSalesOrders(db, companyID.(uint64), filters, search, page, limit)
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
		"message": "Sales orders loaded successfully",
		"data":    res,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *SalesOrderHandler) Get(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	res, err := h.service.GetSalesOrderByID(db, companyID.(uint64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order loaded successfully",
		"data":    res,
	})
}

func (h *SalesOrderHandler) Create(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	var req dto.CreateSalesOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	order, err := h.service.CreateSalesOrder(db, companyID.(uint64), userID.(uint64), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetSalesOrderByID(db, companyID.(uint64), order.ID)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Sales order created successfully",
		"data":    res,
	})
}

func (h *SalesOrderHandler) Update(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.CreateSalesOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	order, err := h.service.UpdateSalesOrder(db, companyID.(uint64), userID.(uint64), id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	res, _ := h.service.GetSalesOrderByID(db, companyID.(uint64), order.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order updated successfully",
		"data":    res,
	})
}

func (h *SalesOrderHandler) Delete(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	if err := h.service.DeleteSalesOrder(db, companyID.(uint64), userID.(uint64), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order deleted successfully",
	})
}

func (h *SalesOrderHandler) Submit(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesOrderRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.service.SubmitSalesOrder(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order submitted successfully",
	})
}

func (h *SalesOrderHandler) Approve(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesOrderRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.service.ApproveSalesOrder(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order approved successfully",
	})
}

func (h *SalesOrderHandler) Reject(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesOrderRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.service.RejectSalesOrder(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order rejected successfully",
	})
}

func (h *SalesOrderHandler) Close(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesOrderRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.service.CloseSalesOrder(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order closed successfully",
	})
}

func (h *SalesOrderHandler) Cancel(c *gin.Context) {
	companyID, _ := c.Get("company_id")
	userID, _ := c.Get("user_id")
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	id, err := getIDParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID", "errors": []string{}})
		return
	}

	var req dto.ActionSalesOrderRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.service.CancelSalesOrder(db, companyID.(uint64), userID.(uint64), id, req.Remarks); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error(), "errors": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sales order cancelled successfully",
	})
}
