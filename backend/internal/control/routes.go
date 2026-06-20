package control

import (
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/handlers"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
)

func SetupRoutes(router *gin.RouterGroup, logger *zap.Logger) {
	companyHandler := handlers.NewCompanyHandler(logger)
	branchHandler := handlers.NewBranchHandler(logger)
	deptHandler := handlers.NewDepartmentHandler(logger)
	desigHandler := handlers.NewDesignationHandler(logger)
	moduleHandler := handlers.NewSoftwareModuleHandler(logger)

	// --- Company Profile ---
	router.GET("/company", middleware.RequirePermission("control.company.view"), companyHandler.GetCompanyProfile)
	router.PUT("/company", middleware.RequirePermission("control.company.update"), companyHandler.UpdateCompanyProfile)

	// --- Branches ---
	router.GET("/branches", middleware.RequirePermission("control.branch.view"), branchHandler.List)
	router.POST("/branches", middleware.RequirePermission("control.branch.create"), branchHandler.Create)
	router.GET("/branches/:id", middleware.RequirePermission("control.branch.view"), branchHandler.Get)
	router.PUT("/branches/:id", middleware.RequirePermission("control.branch.update"), branchHandler.Update)
	router.DELETE("/branches/:id", middleware.RequirePermission("control.branch.delete"), branchHandler.Delete)

	// --- Departments ---
	router.GET("/departments", middleware.RequirePermission("control.department.view"), deptHandler.List)
	router.POST("/departments", middleware.RequirePermission("control.department.create"), deptHandler.Create)
	router.GET("/departments/:id", middleware.RequirePermission("control.department.view"), deptHandler.Get)
	router.PUT("/departments/:id", middleware.RequirePermission("control.department.update"), deptHandler.Update)
	router.DELETE("/departments/:id", middleware.RequirePermission("control.department.delete"), deptHandler.Delete)

	// --- Designations ---
	router.GET("/designations", middleware.RequirePermission("control.designation.view"), desigHandler.List)
	router.POST("/designations", middleware.RequirePermission("control.designation.create"), desigHandler.Create)
	router.GET("/designations/:id", middleware.RequirePermission("control.designation.view"), desigHandler.Get)
	router.PUT("/designations/:id", middleware.RequirePermission("control.designation.update"), desigHandler.Update)
	router.DELETE("/designations/:id", middleware.RequirePermission("control.designation.delete"), desigHandler.Delete)

	// --- Software Modules ---
	router.GET("/software-modules", middleware.RequirePermission("control.permission.view"), moduleHandler.List)

	// --- Users ---
	userHandler := handlers.NewUserHandler(logger)
	accessHandler := handlers.NewUserAccessHandler(logger)

	usersGrp := router.Group("/users")
	{
		usersGrp.GET("", middleware.RequirePermission("control.user.view"), userHandler.List)
		usersGrp.POST("", middleware.RequirePermission("control.user.create"), userHandler.Create)
		usersGrp.GET("/:id", middleware.RequirePermission("control.user.view"), userHandler.Get)
		usersGrp.PUT("/:id", middleware.RequirePermission("control.user.update"), userHandler.Update)
		usersGrp.DELETE("/:id", middleware.RequirePermission("control.user.delete"), userHandler.Delete)

		usersGrp.POST("/:id/change-status", middleware.RequirePermission("control.user.change_status"), userHandler.ChangeStatus)
		usersGrp.POST("/:id/reset-password", middleware.RequirePermission("control.user.reset_password"), userHandler.ResetPassword)

		usersGrp.GET("/:id/branches", middleware.RequirePermission("control.access.branch.view"), accessHandler.GetBranches)
		usersGrp.POST("/:id/branches", middleware.RequirePermission("control.access.branch.assign"), accessHandler.AssignBranches)
		usersGrp.DELETE("/:id/branches/:branch_id", middleware.RequirePermission("control.access.branch.remove"), accessHandler.RemoveBranch)

		usersGrp.GET("/:id/software", middleware.RequirePermission("control.access.software.view"), accessHandler.GetSoftware)
		usersGrp.POST("/:id/software", middleware.RequirePermission("control.access.software.assign"), accessHandler.AssignSoftware)
		usersGrp.DELETE("/:id/software/:software_id", middleware.RequirePermission("control.access.software.remove"), accessHandler.RemoveSoftware)
	}
}
