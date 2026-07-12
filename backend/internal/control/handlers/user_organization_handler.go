package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserOrganizationHandler struct {
	logger *zap.Logger
}

func NewUserOrganizationHandler(logger *zap.Logger) *UserOrganizationHandler {
	return &UserOrganizationHandler{logger: logger}
}

func (h *UserOrganizationHandler) ListAssignments(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	userID := c.Param("id")

	var assignments []models.UserOrganizationAssignment
	if err := companyDB.Preload("Branch").Preload("Department").Preload("Designation").
		Where("user_id = ?", userID).Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}

	c.JSON(http.StatusOK, assignments)
}

func (h *UserOrganizationHandler) CreateAssignment(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	companyID, _ := c.Get("company_id")
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	reqUserID, _ := c.Get("user_id")

	var req struct {
		BranchID      uint64  `json:"branch_id" binding:"required"`
		DepartmentID  uint64  `json:"department_id" binding:"required"`
		DesignationID uint64  `json:"designation_id" binding:"required"`
		IsPrimary     bool    `json:"is_primary"`
		EffectiveFrom string  `json:"effective_from"`
		EffectiveTo   *string `json:"effective_to"`
		Status        string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment := models.UserOrganizationAssignment{
		CompanyID:     companyID.(uint64),
		UserID:        userID,
		BranchID:      req.BranchID,
		DepartmentID:  req.DepartmentID,
		DesignationID: req.DesignationID,
		IsPrimary:     req.IsPrimary,
		Status:        req.Status,
		CreatedBy:     func() *uint64 { id := reqUserID.(uint64); return &id }(),
	}

	if assignment.Status == "" {
		assignment.Status = "active"
	}

	if req.EffectiveFrom != "" {
		if t, err := time.Parse(time.RFC3339, req.EffectiveFrom); err == nil {
			assignment.EffectiveFrom = t
		}
	} else {
		assignment.EffectiveFrom = time.Now()
	}

	if req.EffectiveTo != nil && *req.EffectiveTo != "" {
		if t, err := time.Parse(time.RFC3339, *req.EffectiveTo); err == nil {
			assignment.EffectiveTo = &t
		}
	}

	// Transaction to handle primary switch
	err = companyDB.Transaction(func(tx *gorm.DB) error {
		if assignment.IsPrimary {
			if err := tx.Model(&models.UserOrganizationAssignment{}).
				Where("user_id = ?", userID).
				Update("is_primary", false).Error; err != nil {
				return err
			}
		}

		if err := tx.Create(&assignment).Error; err != nil {
			return err
		}

		middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "USER_ORGANIZATION_ASSIGNMENT_CREATED", "UserOrganizationAssignment", assignment.ID, map[string]interface{}{
			"user_id":        userID,
			"branch_id":      assignment.BranchID,
			"department_id":  assignment.DepartmentID,
			"designation_id": assignment.DesignationID,
		})
		return nil
	})

	if err != nil {
		h.logger.Error("Failed to create assignment", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
		return
	}

	c.JSON(http.StatusCreated, assignment)
}

func (h *UserOrganizationHandler) UpdateAssignment(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	companyID, _ := c.Get("company_id")
	userIDStr := c.Param("id")
	assignmentIDStr := c.Param("assignmentId")
	reqUserID, _ := c.Get("user_id")

	assignmentID, err := strconv.ParseUint(assignmentIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	var req struct {
		IsPrimary     *bool   `json:"is_primary"`
		EffectiveFrom *string `json:"effective_from"`
		EffectiveTo   *string `json:"effective_to"`
		Status        *string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var assignment models.UserOrganizationAssignment
	if err := companyDB.Where("id = ? AND user_id = ?", assignmentID, userIDStr).First(&assignment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	err = companyDB.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"updated_by": reqUserID.(uint64),
		}

		if req.IsPrimary != nil {
			updates["is_primary"] = *req.IsPrimary
			if *req.IsPrimary {
				if err := tx.Model(&models.UserOrganizationAssignment{}).
					Where("user_id = ? AND id != ?", userIDStr, assignmentID).
					Update("is_primary", false).Error; err != nil {
					return err
				}
				middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "USER_PRIMARY_ASSIGNMENT_CHANGED", "UserOrganizationAssignment", assignment.ID, nil)
			}
		}

		if req.Status != nil {
			updates["status"] = *req.Status
		}

		if req.EffectiveFrom != nil {
			if t, err := time.Parse(time.RFC3339, *req.EffectiveFrom); err == nil {
				updates["effective_from"] = t
			}
		}

		if req.EffectiveTo != nil {
			if *req.EffectiveTo == "" {
				updates["effective_to"] = nil
			} else if t, err := time.Parse(time.RFC3339, *req.EffectiveTo); err == nil {
				updates["effective_to"] = &t
			}
		}

		if err := tx.Model(&assignment).Updates(updates).Error; err != nil {
			return err
		}

		middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "USER_ORGANIZATION_ASSIGNMENT_UPDATED", "UserOrganizationAssignment", assignment.ID, nil)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment updated"})
}

func (h *UserOrganizationHandler) DeleteAssignment(c *gin.Context) {
	db, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}
	companyDB := db.(*gorm.DB)

	companyID, _ := c.Get("company_id")
	userIDStr := c.Param("id")
	assignmentIDStr := c.Param("assignmentId")
	reqUserID, _ := c.Get("user_id")

	var assignment models.UserOrganizationAssignment
	if err := companyDB.Where("id = ? AND user_id = ?", assignmentIDStr, userIDStr).First(&assignment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	err := companyDB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&assignment).Error; err != nil {
			return err
		}
		middleware.LogAuditWithTx(tx, companyID.(uint64), reqUserID.(uint64), "USER_ORGANIZATION_ASSIGNMENT_REMOVED", "UserOrganizationAssignment", assignment.ID, nil)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment deleted"})
}
