package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserAccessPreviewHandler struct {
	logger *zap.Logger
}

func NewUserAccessPreviewHandler(logger *zap.Logger) *UserAccessPreviewHandler {
	return &UserAccessPreviewHandler{logger: logger}
}

func (h *UserAccessPreviewHandler) GetAccessPreview(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
		return
	}

	// 1. Fetch user's assigned software modules
	modules := make([]string, 0)
	db.Table("user_software_access usa").
		Joins("JOIN software_modules sm ON sm.id = usa.software_id").
		Where("usa.user_id = ? AND usa.can_access = ? AND usa.status = 'active'", userID, true).
		Pluck("sm.software_name", &modules)

	// 2. Fetch user's access by branch and role
	type branchAccessRow struct {
		BranchName string `gorm:"column:branch_name"`
		RoleName   string `gorm:"column:role_name"`
	}
	var rows []branchAccessRow
	db.Table("user_access_matrix uam").
		Joins("JOIN branches b ON b.id = uam.branch_id").
		Joins("JOIN roles r ON r.id = uam.role_id").
		Where("uam.user_id = ? AND uam.status = 'active'", userID).
		Select("b.branch_name, r.role_name").
		Scan(&rows)

	branchMap := make(map[string][]string)
	for _, r := range rows {
		branchMap[r.BranchName] = append(branchMap[r.BranchName], r.RoleName)
	}

	accessByBranch := make([]gin.H, 0)
	for bName, roles := range branchMap {
		accessByBranch = append(accessByBranch, gin.H{
			"branch_name": bName,
			"roles":       roles,
		})
	}

	// 3. Count distinct permissions granted via user's assigned roles
	var permCount int64
	db.Table("user_access_matrix uam").
		Joins("JOIN role_permissions rp ON rp.role_id = uam.role_id").
		Where("uam.user_id = ? AND uam.status = 'active'", userID).
		Distinct("rp.permission_id").
		Count(&permCount)

	c.JSON(http.StatusOK, gin.H{
		"effective_modules": modules,
		"permission_count":  permCount,
		"warnings":          []string{},
		"access_by_branch":  accessByBranch,
	})
}

func (h *UserAccessPreviewHandler) GetEffectiveAccess(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
		return
	}

	moduleCodes := make([]string, 0)
	db.Table("user_software_access usa").
		Joins("JOIN software_modules sm ON sm.id = usa.software_id").
		Where("usa.user_id = ? AND usa.can_access = ? AND usa.status = 'active'", userID, true).
		Pluck("sm.software_code", &moduleCodes)

	permissionCodes := make([]string, 0)
	db.Table("user_access_matrix uam").
		Joins("JOIN role_permissions rp ON rp.role_id = uam.role_id").
		Joins("JOIN permissions p ON p.id = rp.permission_id").
		Where("uam.user_id = ? AND uam.status = 'active'", userID).
		Distinct("p.code").
		Pluck("p.code", &permissionCodes)

	c.JSON(http.StatusOK, gin.H{
		"modules":     moduleCodes,
		"permissions": permissionCodes,
	})
}
