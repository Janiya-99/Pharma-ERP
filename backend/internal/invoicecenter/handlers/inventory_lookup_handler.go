package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"gorm.io/gorm"
)

type InventoryLookupHandler struct {
	svc *services.InventoryLookupService
}

func NewInventoryLookupHandler(svc *services.InventoryLookupService) *InventoryLookupHandler {
	return &InventoryLookupHandler{svc: svc}
}

func lookupContext(c *gin.Context) (*gorm.DB, uint64, uint64, bool) {
	dbRaw, dbOK := c.Get("companyDB")
	companyRaw, companyOK := c.Get("company_id")
	branchRaw, branchOK := c.Get("branch_id")
	if !dbOK || !companyOK || !branchOK {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Company or branch context missing"})
		return nil, 0, 0, false
	}
	return dbRaw.(*gorm.DB), companyRaw.(uint64), branchRaw.(uint64), true
}

func optionalUintQuery(c *gin.Context, key string) *uint64 {
	value := c.Query(key)
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseUint(value, 10, 64)
	if err != nil {
		return nil
	}
	return &parsed
}

func (h *InventoryLookupHandler) Products(c *gin.Context) {
	db, companyID, _, ok := lookupContext(c)
	if !ok {
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	data, err := h.svc.Products(db, companyID, c.Query("search"), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load products", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *InventoryLookupHandler) ProductBatches(c *gin.Context) {
	db, companyID, _, ok := lookupContext(c)
	if !ok {
		return
	}
	data, err := h.svc.ProductBatches(db, companyID, optionalUintQuery(c, "product_id"), c.Query("allow_expired") == "true")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load product batches", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *InventoryLookupHandler) StockAvailability(c *gin.Context) {
	db, companyID, branchID, ok := lookupContext(c)
	if !ok {
		return
	}
	data, err := h.svc.StockAvailability(
		db,
		companyID,
		branchID,
		optionalUintQuery(c, "product_id"),
		optionalUintQuery(c, "warehouse_id"),
		optionalUintQuery(c, "warehouse_location_id"),
		optionalUintQuery(c, "product_batch_id"),
		c.Query("allow_expired") == "true",
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load stock availability", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *InventoryLookupHandler) Warehouses(c *gin.Context) {
	db, companyID, branchID, ok := lookupContext(c)
	if !ok {
		return
	}
	data, err := h.svc.Warehouses(db, companyID, branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load warehouses", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *InventoryLookupHandler) WarehouseLocations(c *gin.Context) {
	db, companyID, _, ok := lookupContext(c)
	if !ok {
		return
	}
	data, err := h.svc.WarehouseLocations(db, companyID, optionalUintQuery(c, "warehouse_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load warehouse locations", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *InventoryLookupHandler) ChartOfAccounts(c *gin.Context) {
	db, companyID, _, ok := lookupContext(c)
	if !ok {
		return
	}

	type accountOption struct {
		ID          uint64 `json:"id"`
		AccountCode string `json:"account_code"`
		AccountName string `json:"account_name"`
		AccountType string `json:"account_type"`
		Status      string `json:"status"`
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if limit <= 0 || limit > 500 {
		limit = 100
	}

	query := db.Table("chart_of_accounts").
		Select("id, account_code, account_name, account_type, status").
		Where("company_id = ? AND status = ?", companyID, "active")

	if search := c.Query("search"); search != "" {
		like := "%" + search + "%"
		query = query.Where("account_code LIKE ? OR account_name LIKE ?", like, like)
	}
	if accountType := c.Query("account_type"); accountType != "" {
		query = query.Where("account_type = ?", accountType)
	}

	var data []accountOption
	if err := query.Order("account_code ASC").Limit(limit).Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load chart of accounts", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}
