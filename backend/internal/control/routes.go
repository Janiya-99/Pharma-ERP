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
	logHandler := handlers.NewLogHandler(logger)
	userOrgHandler := handlers.NewUserOrganizationHandler(logger)
	desigMappingHandler := handlers.NewDesignationMappingHandler(logger)
	accessPreviewHandler := handlers.NewUserAccessPreviewHandler(logger)
	settingsHandler := handlers.NewSettingsHandler(logger)
	workflowHandler := handlers.NewApprovalWorkflowHandler(logger)
	docNumHandler := handlers.NewDocumentNumberingHandler(logger)
	secSettingsHandler := handlers.NewSecuritySettingsHandler(logger)

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
	router.GET("/departments/:id/designations", middleware.RequirePermission("control.designation.view"), desigMappingHandler.GetDesignationsForDepartment)

	// --- Designations ---
	router.GET("/designations", middleware.RequirePermission("control.designation.view"), desigHandler.List)
	router.POST("/designations", middleware.RequirePermission("control.designation.create"), desigHandler.Create)
	router.GET("/designations/:id", middleware.RequirePermission("control.designation.view"), desigHandler.Get)
	router.PUT("/designations/:id", middleware.RequirePermission("control.designation.update"), desigHandler.Update)
	router.DELETE("/designations/:id", middleware.RequirePermission("control.designation.delete"), desigHandler.Delete)
	
	router.GET("/designations/:id/default-roles", middleware.RequirePermission("control.designation.view"), desigMappingHandler.GetDefaultRolesForDesignation)
	router.PUT("/designations/:id/default-roles", middleware.RequirePermission("control.designation.update"), desigMappingHandler.SetDefaultRolesForDesignation)
	router.GET("/designations/:id/departments", middleware.RequirePermission("control.designation.view"), desigMappingHandler.GetDepartmentsForDesignation)
	router.PUT("/designations/:id/departments", middleware.RequirePermission("control.designation.update"), desigMappingHandler.SetDepartmentsForDesignation)

	// --- Software Modules ---
	router.GET("/software-modules", middleware.RequirePermission("control.permission.view"), moduleHandler.List)

	// --- Logs ---
	router.GET("/audit-logs", middleware.RequirePermission("control.audit.view"), logHandler.ListAuditLogs)
	router.GET("/login-logs", middleware.RequirePermission("control.login_logs.view"), logHandler.ListLoginLogs)

	// --- Users ---
	userHandler := handlers.NewUserHandler(logger)
	accessHandler := handlers.NewUserAccessHandler(logger)
	matrixHandler := handlers.NewUserAccessMatrixHandler(logger)

	usersGrp := router.Group("/users")
	{
		usersGrp.GET("", middleware.RequirePermission("control.user.view"), userHandler.List)
		usersGrp.POST("", middleware.RequirePermission("control.user.create"), userHandler.Create)
		usersGrp.GET("/:id", middleware.RequirePermission("control.user.view"), userHandler.Get)
		usersGrp.PUT("/:id", middleware.RequirePermission("control.user.update"), userHandler.Update)
		usersGrp.DELETE("/:id", middleware.RequirePermission("control.user.delete"), userHandler.Delete)

		usersGrp.POST("/:id/change-status", middleware.RequirePermission("control.user.change_status"), userHandler.ChangeStatus)
		usersGrp.POST("/:id/reset-password", middleware.RequirePermission("control.user.reset_password"), userHandler.ResetPassword)

		usersGrp.GET("/:id/organization-assignments", middleware.RequirePermission("control.user.view"), userOrgHandler.ListAssignments)
		usersGrp.POST("/:id/organization-assignments", middleware.RequirePermission("control.user.update"), userOrgHandler.CreateAssignment)
		usersGrp.PUT("/:id/organization-assignments/:assignmentId", middleware.RequirePermission("control.user.update"), userOrgHandler.UpdateAssignment)
		usersGrp.DELETE("/:id/organization-assignments/:assignmentId", middleware.RequirePermission("control.user.update"), userOrgHandler.DeleteAssignment)

		usersGrp.GET("/:id/access-preview", middleware.RequirePermission("control.user.view"), accessPreviewHandler.GetAccessPreview)
		usersGrp.GET("/:id/effective-access", middleware.RequirePermission("control.user.view"), accessPreviewHandler.GetEffectiveAccess)

		usersGrp.GET("/:id/branches", middleware.RequirePermission("control.access.branch.view"), accessHandler.GetBranches)
		usersGrp.POST("/:id/branches", middleware.RequirePermission("control.access.branch.assign"), accessHandler.AssignBranches)
		usersGrp.DELETE("/:id/branches/:branch_id", middleware.RequirePermission("control.access.branch.remove"), accessHandler.RemoveBranch)

		usersGrp.GET("/:id/software", middleware.RequirePermission("control.access.software.view"), accessHandler.GetSoftware)
		usersGrp.POST("/:id/software", middleware.RequirePermission("control.access.software.assign"), accessHandler.AssignSoftware)
		usersGrp.DELETE("/:id/software/:software_id", middleware.RequirePermission("control.access.software.remove"), accessHandler.RemoveSoftware)

		usersGrp.GET("/:id/access-matrix", middleware.RequirePermission("control.access_matrix.view"), matrixHandler.GetMatrix)
		usersGrp.POST("/:id/access-matrix", middleware.RequirePermission("control.access_matrix.assign"), matrixHandler.Assign)
		usersGrp.DELETE("/:id/access-matrix/:access_id", middleware.RequirePermission("control.access_matrix.remove"), matrixHandler.Remove)
	}

	// --- Roles & Permissions ---
	roleHandler := handlers.NewRoleHandler(logger)
	permHandler := handlers.NewPermissionHandler(logger)
	rolePermHandler := handlers.NewRolePermissionHandler(logger)

	router.GET("/permissions", middleware.RequirePermission("control.permission.view"), permHandler.List)
	router.GET("/permissions/grouped", middleware.RequirePermission("control.permission.view"), permHandler.ListGrouped)

	rolesGrp := router.Group("/roles")
	{
		rolesGrp.GET("", middleware.RequirePermission("control.role.view"), roleHandler.List)
		rolesGrp.POST("", middleware.RequirePermission("control.role.create"), roleHandler.Create)
		rolesGrp.GET("/:id", middleware.RequirePermission("control.role.view"), roleHandler.Get)
		rolesGrp.PUT("/:id", middleware.RequirePermission("control.role.update"), roleHandler.Update)
		rolesGrp.DELETE("/:id", middleware.RequirePermission("control.role.delete"), roleHandler.Delete)

		rolesGrp.GET("/:id/permissions", middleware.RequirePermission("control.permission.view"), rolePermHandler.GetMatrix)
		rolesGrp.POST("/:id/permissions", middleware.RequirePermission("control.permission.assign"), rolePermHandler.Assign)
	}

	router.GET("/software-modules/:software_id/roles", middleware.RequirePermission("control.role.view"), roleHandler.GetAvailableRolesForSoftware)

	// --- System Settings & Configuration (Step 71) ---
	router.GET("/settings/groups", middleware.RequirePermission("control.settings.view"), settingsHandler.ListGroups)
	router.GET("/settings", middleware.RequirePermission("control.settings.view"), settingsHandler.ListSettings)
	router.POST("/settings", middleware.RequirePermission("control.settings.update"), settingsHandler.SaveSetting)
	router.POST("/settings/publish", middleware.RequirePermission("control.settings.publish"), settingsHandler.PublishSetting)
	router.POST("/settings/branch-override", middleware.RequirePermission("control.settings.update"), settingsHandler.SaveBranchOverride)
	router.POST("/settings/impact-preview", middleware.RequirePermission("control.settings.view"), settingsHandler.GetImpactPreview)

	// --- Approval Workflows ---
	router.GET("/approval-workflows", middleware.RequirePermission("control.approval_workflow.view"), workflowHandler.ListWorkflows)
	router.GET("/approval-workflows/:id", middleware.RequirePermission("control.approval_workflow.view"), workflowHandler.GetWorkflow)
	router.POST("/approval-workflows", middleware.RequirePermission("control.approval_workflow.create"), workflowHandler.SaveWorkflow)
	router.POST("/approval-workflows/:id/publish", middleware.RequirePermission("control.approval_workflow.publish"), workflowHandler.PublishWorkflow)
	router.DELETE("/approval-workflows/:id", middleware.RequirePermission("control.approval_workflow.delete"), workflowHandler.DeleteWorkflow)
	router.GET("/approval-workflows/:id/versions", middleware.RequirePermission("control.approval_workflow.view"), workflowHandler.ListVersions)

	// --- Document Numbering ---
	router.GET("/document-numbering", middleware.RequirePermission("control.document_numbering.view"), docNumHandler.ListRules)
	router.POST("/document-numbering", middleware.RequirePermission("control.document_numbering.update"), docNumHandler.SaveRule)
	router.POST("/document-numbering/:id/publish", middleware.RequirePermission("control.document_numbering.publish"), docNumHandler.PublishRule)
	router.DELETE("/document-numbering/:id", middleware.RequirePermission("control.document_numbering.update"), docNumHandler.DeleteRule)
	router.POST("/document-numbering/preview", middleware.RequirePermission("control.document_numbering.view"), docNumHandler.PreviewNumber)

	// --- Security Settings & Backups ---
	router.GET("/security/policy", middleware.RequirePermission("control.security_settings.view"), secSettingsHandler.GetPolicy)
	router.POST("/security/policy", middleware.RequirePermission("control.security_settings.update"), secSettingsHandler.SavePolicy)
	router.POST("/security/policy/publish", middleware.RequirePermission("control.security_settings.publish"), secSettingsHandler.PublishPolicy)

	router.GET("/security/trusted-ips", middleware.RequirePermission("control.security_settings.view"), secSettingsHandler.ListTrustedIPRules)
	router.POST("/security/trusted-ips", middleware.RequirePermission("control.security_settings.update"), secSettingsHandler.SaveTrustedIPRule)
	router.DELETE("/security/trusted-ips/:id", middleware.RequirePermission("control.security_settings.update"), secSettingsHandler.DeleteTrustedIPRule)

	router.GET("/security/backups/policies", middleware.RequirePermission("control.security_settings.view"), secSettingsHandler.ListBackupPolicies)
	router.POST("/security/backups/policies", middleware.RequirePermission("control.security_settings.update"), secSettingsHandler.SaveBackupPolicy)
	router.GET("/security/backups/logs", middleware.RequirePermission("control.security_settings.view"), secSettingsHandler.ListBackupLogs)
	router.POST("/security/backups/trigger", middleware.RequirePermission("control.security_settings.update"), secSettingsHandler.TriggerManualBackup)

	router.GET("/security/sessions", middleware.RequirePermission("control.security_sessions.manage"), secSettingsHandler.ListActiveSessions)
	router.DELETE("/security/sessions/:id", middleware.RequirePermission("control.security_sessions.manage"), secSettingsHandler.TerminateSession)
	router.DELETE("/security/sessions/terminate-all", middleware.RequirePermission("control.security_sessions.manage"), secSettingsHandler.TerminateAllSessions)
}

