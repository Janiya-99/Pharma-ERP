package router

import (
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/auth/handlers"
	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/control"
	"github.com/pixandco/erp-phrma/internal/controller"
	"github.com/pixandco/erp-phrma/internal/database"
	financeModule "github.com/pixandco/erp-phrma/internal/finance"
	inventoryModule "github.com/pixandco/erp-phrma/internal/inventory"
	invoiceCenterRoutes "github.com/pixandco/erp-phrma/internal/invoicecenter/routes"
	"github.com/pixandco/erp-phrma/internal/middleware"
	platformAdmin "github.com/pixandco/erp-phrma/internal/platform/admin"
	"github.com/pixandco/erp-phrma/internal/service"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Setup configures the Gin engine with middlewares and routes.
func Setup(
	newAuthHandler *handlers.AuthHandler,
	resolver *database.CompanyResolver,
	authCtrl *controller.AuthController,
	userCtrl *controller.UserController,
	roleCtrl *controller.RoleController,
	coaCtrl *controller.CoAController,
	journalCtrl *controller.JournalController,
	desCtrl *controller.DesignationController,
	compCtrl *controller.CompanyController,
	branchCtrl *controller.BranchController,
	whCtrl *controller.WarehouseController,
	prodCtrl *controller.ProductController,
	suppCtrl *controller.SupplierController,
	grnCtrl *controller.GRNController,
	authService *service.AuthService,
	cfg *config.Config,
	platformDB *gorm.DB,
	logger *zap.Logger,
) *gin.Engine {
	r := gin.Default()

	// Configure CORS for frontend
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Always allow localhost and 127.0.0.1 dev origins
			if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") {
				return true
			}
			for _, o := range cfg.CORS.AllowedOrigins {
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
		// Platform Admin routes
		platformAdminGrp := v1.Group("/platform-admin")
		platformAdmin.SetupRoutes(platformAdminGrp, platformDB, logger)

		// Health check — returns service name from config
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"service": cfg.App.Name + " Backend",
			})
		})

		commonCtrl := controller.NewCommonController()
		v1.GET("/countries", commonCtrl.GetCountries)
		v1.GET("/common/countries", commonCtrl.GetCountries)
		platformAdminGrp.GET("/countries", commonCtrl.GetCountries)

		// Public Auth routes
		auth := v1.Group("/auth")
		{
			// New Step 7 login
			auth.POST("/login", newAuthHandler.Login)
			auth.POST("/refresh", authCtrl.Refresh) // Legacy fallback

			// New Step 7 auth me & context
			authMe := auth.Group("")
			authMe.Use(middleware.CompanyAuthMiddleware(resolver))
			authMe.Use(middleware.BranchAccessMiddleware())
			authMe.Use(middleware.SoftwareAccessMiddleware())

			authMe.GET("/me", newAuthHandler.AuthMe)
			authMe.GET("/context", newAuthHandler.AuthContext)
			authMe.POST("/switch-branch", newAuthHandler.SwitchBranch)
			authMe.POST("/switch-software", newAuthHandler.SwitchSoftware)
		}

		// Control Center routes
		controlGrp := v1.Group("/control")
		controlGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		controlGrp.Use(middleware.BranchAccessMiddleware())
		controlGrp.Use(middleware.SoftwareAccessMiddleware())
		control.SetupRoutes(controlGrp, logger)
		controlGrp.GET("/countries", commonCtrl.GetCountries)

		// Admin & Access Management routes
		admin := v1.Group("/admin")
		admin.Use(middleware.CompanyAuthMiddleware(resolver))
		admin.Use(middleware.BranchAccessMiddleware())
		admin.Use(middleware.SoftwareAccessMiddleware())
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

		// Finance routes (new module)
		financeGrp := v1.Group("/finance")
		financeGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		financeGrp.Use(middleware.BranchAccessMiddleware())
		financeGrp.Use(middleware.SoftwareAccessMiddleware())
		financeModule.SetupRoutes(financeGrp, logger)
		financeGrp.GET("/countries", commonCtrl.GetCountries)

		// Inventory routes
		inventoryGrp := v1.Group("/inventory")
		inventoryGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		inventoryGrp.Use(middleware.BranchAccessMiddleware())
		inventoryGrp.Use(middleware.SoftwareAccessMiddleware())

		// Initialize the audit log service to pass down to inventory routes
		inventoryModule.SetupRoutes(inventoryGrp, service.NewAuditService(nil, logger), logger)
		inventoryGrp.GET("/countries", commonCtrl.GetCountries)

		// Invoice Center routes
		invoiceCenterGrp := v1.Group("/invoice-center")
		invoiceCenterGrp.Use(middleware.CompanyAuthMiddleware(resolver))
		invoiceCenterGrp.Use(middleware.BranchAccessMiddleware())
		invoiceCenterGrp.Use(middleware.SoftwareAccessMiddleware())
		invoiceCenterRoutes.SetupRoutes(invoiceCenterGrp, logger)
		invoiceCenterGrp.GET("/countries", commonCtrl.GetCountries)
	}

	return r
}
