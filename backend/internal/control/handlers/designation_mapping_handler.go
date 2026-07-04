package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DesignationMappingHandler struct {
	logger *zap.Logger
}

func NewDesignationMappingHandler(logger *zap.Logger) *DesignationMappingHandler {
	return &DesignationMappingHandler{logger: logger}
}

// GetDesignationsForDepartment lists all designations available in a department
func (h *DesignationMappingHandler) GetDesignationsForDepartment(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	deptID := c.Param("id")

	var desigDepts []models.DesignationDepartment
	if err := companyDB.Preload("Designation").Where("department_id = ?", deptID).Find(&desigDepts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch designations"})
		return
	}

	var designations []models.Designation
	for _, dd := range desigDepts {
		designations = append(designations, dd.Designation)
	}

	c.JSON(http.StatusOK, designations)
}

// GetDefaultRolesForDesignation lists all default roles for a designation
func (h *DesignationMappingHandler) GetDefaultRolesForDesignation(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	desigID := c.Param("id")

	var defaultRoles []models.DesignationDefaultRole
	if err := companyDB.Preload("Role").Where("designation_id = ?", desigID).Find(&defaultRoles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch default roles"})
		return
	}

	c.JSON(http.StatusOK, defaultRoles)
}

// SetDefaultRolesForDesignation sets the default roles for a designation
func (h *DesignationMappingHandler) SetDefaultRolesForDesignation(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)
	companyID, _ := c.Get("companyID")
	reqUserID, _ := c.Get("userID")

	desigIDStr := c.Param("id")
	desigID, err := strconv.ParseUint(desigIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid designation ID"})
		return
	}

	var req struct {
		RoleIDs []uint64 `json:"role_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = companyDB.Transaction(func(tx *gorm.DB) error {
		// Delete existing
		if err := tx.Where("designation_id = ?", desigID).Delete(&models.DesignationDefaultRole{}).Error; err != nil {
			return err
		}

		// Insert new
		for _, roleID := range req.RoleIDs {
			dr := models.DesignationDefaultRole{
				CompanyID:     companyID.(uint64),
				DesignationID: desigID,
				RoleID:        roleID,
				IsDefault:     true,
			}
			if err := tx.Create(&dr).Error; err != nil {
				return err
			}
		}

		middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "DESIGNATION_DEFAULT_ROLE_UPDATED", "Designation", desigID, map[string]interface{}{"role_ids": req.RoleIDs})
		return nil
	})

	if err != nil {
		h.logger.Error("Failed to update designation default roles", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update default roles"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Default roles updated successfully"})
}

// GetDepartmentsForDesignation lists departments a designation belongs to
func (h *DesignationMappingHandler) GetDepartmentsForDesignation(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	desigID := c.Param("id")

	var desigDepts []models.DesignationDepartment
	if err := companyDB.Preload("Department").Where("designation_id = ?", desigID).Find(&desigDepts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch departments"})
		return
	}

	c.JSON(http.StatusOK, desigDepts)
}

// SetDepartmentsForDesignation sets the allowed departments for a designation
func (h *DesignationMappingHandler) SetDepartmentsForDesignation(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)
	companyID, _ := c.Get("companyID")
	reqUserID, _ := c.Get("userID")

	desigIDStr := c.Param("id")
	desigID, err := strconv.ParseUint(desigIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid designation ID"})
		return
	}

	var req struct {
		DepartmentIDs []uint64 `json:"department_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = companyDB.Transaction(func(tx *gorm.DB) error {
		// Delete existing
		if err := tx.Where("designation_id = ?", desigID).Delete(&models.DesignationDepartment{}).Error; err != nil {
			return err
		}

		// Insert new
		for _, deptID := range req.DepartmentIDs {
			dd := models.DesignationDepartment{
				CompanyID:     companyID.(uint64),
				DesignationID: desigID,
				DepartmentID:  deptID,
			}
			if err := tx.Create(&dd).Error; err != nil {
				return err
			}
		}

		middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "DESIGNATION_DEPARTMENT_UPDATED", "Designation", desigID, map[string]interface{}{"department_ids": req.DepartmentIDs})
		return nil
	})

	if err != nil {
		h.logger.Error("Failed to update designation departments", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update departments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Departments updated successfully"})
}
