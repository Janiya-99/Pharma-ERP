package main

import (
	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/controller"
	"github.com/pixandco/erp-phrma/internal/database"
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

	// 3. Init Database
	db, err := database.NewMySQL(&cfg.Database, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// 4. Setup Repositories
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

	// 5. Setup Services
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

	// 6. Setup Controllers
	authCtrl := controller.NewAuthController(authService)
	userCtrl := controller.NewUserController(userService)
	roleCtrl := controller.NewRoleController(roleService)
	coaCtrl := controller.NewCoAController(coaService)
	journalCtrl := controller.NewJournalController(journalService)
	desCtrl := controller.NewDesignationController(desService)
	compCtrl := controller.NewCompanyController(compService)
	branchCtrl := controller.NewBranchController(branchService)

	// 7. Setup Router
	r := router.Setup(
		authCtrl,
		userCtrl,
		roleCtrl,
		coaCtrl,
		journalCtrl,
		desCtrl,
		compCtrl,
		branchCtrl,
		authService,
		cfg.CORS.AllowedOrigins,
	)

	// 8. Start Server
	logger.Info("Starting API Server", zap.String("port", cfg.App.Port))
	if err := r.Run(":" + cfg.App.Port); err != nil {
		logger.Fatal("Server failed", zap.Error(err))
	}
}
