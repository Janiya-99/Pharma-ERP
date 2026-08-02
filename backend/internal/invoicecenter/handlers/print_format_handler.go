package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"gorm.io/gorm"
)

type PrintFormatHandler struct {
	svc *services.PrintFormatService
}

func NewPrintFormatHandler(svc *services.PrintFormatService) *PrintFormatHandler {
	return &PrintFormatHandler{svc: svc}
}

func printFormatContext(c *gin.Context) (*gorm.DB, uint64, uint64, bool) {
	dbRaw, dbOK := c.Get("companyDB")
	companyRaw, companyOK := c.Get("company_id")
	userRaw, userOK := c.Get("user_id")
	if !dbOK || !companyOK || !userOK {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Context missing"})
		return nil, 0, 0, false
	}
	return dbRaw.(*gorm.DB), companyRaw.(uint64), userRaw.(uint64), true
}

func (h *PrintFormatHandler) List(c *gin.Context) {
	db, companyID, _, ok := printFormatContext(c)
	if !ok {
		return
	}
	data, err := h.svc.List(db, companyID, c.Query("document_type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load print formats", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *PrintFormatHandler) Get(c *gin.Context) {
	db, companyID, _, ok := printFormatContext(c)
	if !ok {
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}
	data, err := h.svc.Get(db, companyID, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load print format", "error": err.Error()})
		return
	}
	if data == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Print format not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *PrintFormatHandler) Create(c *gin.Context) {
	db, companyID, userID, ok := printFormatContext(c)
	if !ok {
		return
	}
	var req dto.PrintFormatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}
	data, err := h.svc.Create(db, companyID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to create print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": data})
}

func (h *PrintFormatHandler) Update(c *gin.Context) {
	db, companyID, userID, ok := printFormatContext(c)
	if !ok {
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}
	var req dto.PrintFormatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}
	data, err := h.svc.Update(db, companyID, userID, id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to update print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func (h *PrintFormatHandler) Delete(c *gin.Context) {
	db, companyID, _, ok := printFormatContext(c)
	if !ok {
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}
	if err := h.svc.Delete(db, companyID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to delete print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *PrintFormatHandler) SetDefault(c *gin.Context) {
	db, companyID, _, ok := printFormatContext(c)
	if !ok {
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}
	if err := h.svc.SetDefault(db, companyID, id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to set default print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *PrintFormatHandler) Duplicate(c *gin.Context) {
	db, companyID, userID, ok := printFormatContext(c)
	if !ok {
		return
	}
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid ID"})
		return
	}
	data, err := h.svc.Duplicate(db, companyID, userID, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to duplicate print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": data})
}

func (h *PrintFormatHandler) Default(c *gin.Context) {
	db, companyID, _, ok := printFormatContext(c)
	if !ok {
		return
	}
	var branchID *uint64
	if raw := c.Query("branch_id"); raw != "" {
		parsed, err := strconv.ParseUint(raw, 10, 64)
		if err == nil {
			branchID = &parsed
		}
	}
	data, err := h.svc.Default(db, companyID, branchID, c.Query("document_type"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Failed to load default print format", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}
