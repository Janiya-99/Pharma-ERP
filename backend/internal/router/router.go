package router

import (
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/controller"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"github.com/pixandco/erp-phrma/internal/service"
)

// Setup configures the Gin engine with middlewares and routes.
func Setup(
	authCtrl *controller.AuthController,
	userCtrl *controller.UserController,
	roleCtrl *controller.RoleController,
	coaCtrl *controller.CoAController,
	journalCtrl *controller.JournalController,
	desCtrl *controller.DesignationController,
	compCtrl *controller.CompanyController,
	branchCtrl *controller.BranchController,
	authService *service.AuthService,
	allowedOrigins []string,
) *gin.Engine {
	r := gin.Default()

	// Configure CORS for frontend
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Always allow localhost and 127.0.0.1 dev origins
			if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") {
				return true
			}
			for _, o := range allowedOrigins {
				if o == origin {
					return true
				}
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API Version 1 group
	v1 := r.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Public Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authCtrl.Login)
			auth.POST("/refresh", authCtrl.Refresh)
		}

		// Admin & Access Management routes
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(authService))
		{
			// Users
			users := admin.Group("/users")
			{
				users.GET("", userCtrl.List)
				users.POST("", userCtrl.Create)
				users.GET("/:id", userCtrl.Get)
				users.PUT("/:id", userCtrl.Update)
				users.DELETE("/:id", userCtrl.Delete)
			}

			// Roles
			roles := admin.Group("/roles")
			{
				roles.GET("", roleCtrl.List)
				roles.POST("", roleCtrl.Create)
				roles.GET("/:id", roleCtrl.Get)
				roles.PUT("/:id", roleCtrl.Update)
				roles.DELETE("/:id", roleCtrl.Delete)
				roles.GET("/permissions", roleCtrl.ListPermissions)
			}

			// Designations
			designations := admin.Group("/designations")
			{
				designations.GET("", desCtrl.List)
				designations.POST("", desCtrl.Create)
				designations.GET("/:id", desCtrl.Get)
				designations.PUT("/:id", desCtrl.Update)
				designations.DELETE("/:id", desCtrl.Delete)
			}

			// Companies
			companies := admin.Group("/companies")
			{
				companies.GET("", compCtrl.List)
				companies.POST("", compCtrl.Create)
				companies.GET("/:id", compCtrl.Get)
				companies.PUT("/:id", compCtrl.Update)
				companies.DELETE("/:id", compCtrl.Delete)
			}

			// Branches
			branches := admin.Group("/branches")
			{
				branches.GET("", branchCtrl.List)
				branches.POST("", branchCtrl.Create)
				branches.GET("/:id", branchCtrl.Get)
				branches.PUT("/:id", branchCtrl.Update)
				branches.DELETE("/:id", branchCtrl.Delete)
			}
		}

		// Finance routes
		finance := v1.Group("/finance")
		finance.Use(middleware.AuthMiddleware(authService))
		{
			// Chart of Accounts
			coa := finance.Group("/accounts")
			{
				coa.GET("", coaCtrl.List)
				coa.GET("/tree", coaCtrl.ListTree)
				coa.POST("", coaCtrl.Create)
				coa.GET("/:id", coaCtrl.Get)
				coa.PUT("/:id", coaCtrl.Update)
				coa.DELETE("/:id", coaCtrl.Delete)
			}

			// Journal Entries
			journal := finance.Group("/journals")
			{
				journal.GET("", journalCtrl.List)
				journal.POST("", journalCtrl.Create)
				journal.GET("/:id", journalCtrl.Get)
				journal.POST("/:id/submit", journalCtrl.Submit)
				journal.POST("/:id/approve", journalCtrl.Approve)
				journal.POST("/:id/post", journalCtrl.Post)
			}
		}
	}

	return r
}
