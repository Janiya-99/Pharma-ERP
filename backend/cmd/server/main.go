package main

import (
	"os"

	"github.com/pixandco/erp-phrma/internal/auth/handlers"
	companyMigrations "github.com/pixandco/erp-phrma/internal/company/migrations"
	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/controller"
	"github.com/pixandco/erp-phrma/internal/database"
	platformMigrations "github.com/pixandco/erp-phrma/internal/platform/migrations"
	"github.com/pixandco/erp-phrma/internal/repository"
	"github.com/pixandco/erp-phrma/internal/router"
	"github.com/pixandco/erp-phrma/internal/service"
	"go.uber.org/zap"
)

func main() {
	// 1. Init Logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// 2. Load Config
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}

	// 3. Init Platform Database (erp_platform)
	platformDB, err := database.NewPlatformDB(&cfg.PlatformDB, logger)
	if err != nil {
		logger.Fatal("Failed to connect to platform database", zap.Error(err))
	}
	logger.Info("Platform database ready", zap.String("db", cfg.PlatformDB.Name))

	// 3.1. Run Platform AutoMigrate + Seeder
	if os.Getenv("SKIP_MIGRATIONS") != "true" {
		if err := platformMigrations.RunPlatformMigrations(platformDB, logger); err != nil {
			logger.Fatal("Failed to run platform migrations", zap.Error(err))
		}
	} else {
		logger.Info("Skipping platform migrations and seeders (SKIP_MIGRATIONS=true)")
	}

	// 4. Init Company Database (legacy single-company connection)
	db, err := database.NewMySQL(&cfg.Database, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// 4.1. Run Company AutoMigrate + Seeder (Development only)
	if os.Getenv("SKIP_MIGRATIONS") != "true" {
		if err := companyMigrations.RunCompanyMigrations(db, logger); err != nil {
			logger.Fatal("Failed to run company migrations", zap.Error(err))
		}
	} else {
		logger.Info("Skipping company migrations and seeders (SKIP_MIGRATIONS=true)")
	}

	// 5. Setup Repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	auditRepo := repository.NewAuditRepository(db)
	coaRepo := repository.NewCoARepository(db)
	journalRepo := repository.NewJournalRepository(db)
	glTransRepo := repository.NewGlTransactionRepository(db)
	desRepo := repository.NewDesignationRepository(db)
	compRepo := repository.NewCompanyRepository(db)
	branchRepo := repository.NewBranchRepository(db)

	// 6. Setup Services
	authService := service.NewAuthService(userRepo, sessionRepo, &cfg.JWT, logger)
	auditService := service.NewAuditService(auditRepo, logger)
	permService := service.NewPermissionService(roleRepo, nil, logger) // No cache for now
	roleService := service.NewRoleService(roleRepo, permService, logger)
	userService := service.NewUserService(userRepo, db, logger)
	coaService := service.NewCoAService(coaRepo, nil, auditService, logger) // No cache for now
	journalService := service.NewJournalService(journalRepo, glTransRepo, auditService, db, logger)
	desService := service.NewDesignationService(desRepo, logger)
	compService := service.NewCompanyService(compRepo, logger)
	branchService := service.NewBranchService(branchRepo, logger)

	// 7. Setup Controllers
	authCtrl := controller.NewAuthController(authService)
	userCtrl := controller.NewUserController(userService)
	roleCtrl := controller.NewRoleController(roleService)
	coaCtrl := controller.NewCoAController(coaService)
	journalCtrl := controller.NewJournalController(journalService)
	desCtrl := controller.NewDesignationController(desService)
	compCtrl := controller.NewCompanyController(compService)
	branchCtrl := controller.NewBranchController(branchService)

	// --- Inventory Module ---
	whRepo := repository.NewWarehouseRepository(db)
	prodRepo := repository.NewProductRepository(db)
	suppRepo := repository.NewSupplierRepository(db)
	batchRepo := repository.NewProductBatchRepository(db)
	grnRepo := repository.NewGRNRepository(db)

	whService := service.NewWarehouseService(whRepo, logger)
	prodService := service.NewProductService(prodRepo, logger)
	suppService := service.NewSupplierService(suppRepo, logger)
	grnService := service.NewGRNService(grnRepo, batchRepo, db, logger)

	whCtrl := controller.NewWarehouseController(whService)
	prodCtrl := controller.NewProductController(prodService)
	suppCtrl := controller.NewSupplierController(suppService)
	grnCtrl := controller.NewGRNController(grnService)

	// Step 7: New Auth
	companyResolver := database.NewCompanyResolver(platformDB, logger)
	newAuthHandler := handlers.NewAuthHandler(companyResolver)

	// 8. Setup Router
	r := router.Setup(
		newAuthHandler,
		companyResolver,
		authCtrl,
		userCtrl,
		roleCtrl,
		coaCtrl,
		journalCtrl,
		desCtrl,
		compCtrl,
		branchCtrl,
		whCtrl,
		prodCtrl,
		suppCtrl,
		grnCtrl,
		authService,
		cfg,
		platformDB,
		logger,
	)

	// 9. Start Server
	logger.Info("Starting API Server", zap.String("port", cfg.App.Port))
	if err := r.Run("0.0.0.0:" + cfg.App.Port); err != nil {
		logger.Fatal("Server failed", zap.Error(err))
	}
}
