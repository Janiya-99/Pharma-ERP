package handlers

import (
	"context"
	"errors"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/auth/dto"
	"github.com/pixandco/erp-phrma/internal/auth/services"
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/database"
	"github.com/pixandco/erp-phrma/internal/middleware"
	platformModels "github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"gorm.io/gorm"
)

type AuthHandler struct {
	resolver *database.CompanyResolver
}

func NewAuthHandler(resolver *database.CompanyResolver) *AuthHandler {
	return &AuthHandler{resolver: resolver}
}

func (h *AuthHandler) resolveLoginCompany(req dto.LoginRequest) (*gorm.DB, *platformModels.PlatformCompany, error) {
	if req.CompanyCode != "" {
		return h.resolver.ResolveCompanyDB(req.CompanyCode)
	}

	companies, err := h.resolver.FindActiveCompanies()
	if err != nil {
		return nil, nil, err
	}

	type result struct {
		db      *gorm.DB
		company *platformModels.PlatformCompany
	}

	var wg sync.WaitGroup
	resultCh := make(chan result, 1)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for i := range companies {
		wg.Add(1)
		go func(company platformModels.PlatformCompany) {
			defer wg.Done()
			
			db, err := h.resolver.GetOrCreateCompanyDBConnection(company)
			if err != nil {
				return
			}

			var user models.User
			if err := db.WithContext(ctx).Where("email = ?", req.Email).First(&user).Error; err != nil {
				return
			}
			
			if security.CheckPasswordHash(req.Password, user.PasswordHash) {
				select {
				case resultCh <- result{db: db, company: &company}:
					cancel()
				default:
				}
			}
		}(companies[i])
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	res, ok := <-resultCh
	if ok {
		return res.db, res.company, nil
	}

	return nil, nil, errors.New("invalid credentials")
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// 1. Resolve Company DB from the submitted credentials.
	db, platformCompany, err := h.resolveLoginCompany(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	// 2. Perform Login via AuthService in company context
	authService := services.NewAuthService(db)
	resp, err := authService.Login(req, platformCompany)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) AuthMe(c *gin.Context) {
	// The AuthMiddleware has already verified the token and injected companyDB
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Auth context missing"})
		return
	}
	ctx := authCtx.(*middleware.AuthContext)

	// Fetch user details
	var user models.User
	if err := db.Where("id = ?", ctx.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
		return
	}

	// Fetch platform company to build DTO
	_, platformCompany, err := h.resolver.ResolveCompanyDB(ctx.CompanyCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Company not found"})
		return
	}

	// Fetch branches and software
	var branchAccesses []models.UserBranchAccess
	db.Preload("Branch").Where("user_id = ? AND status = ?", user.ID, "active").Find(&branchAccesses)

	var softwareAccesses []models.UserSoftwareAccess
	db.Preload("Software").Where("user_id = ? AND status = ?", user.ID, "active").Find(&softwareAccesses)

	var activeBranch models.Branch
	for _, ba := range branchAccesses {
		if ba.BranchID == ctx.ActiveBranchID {
			activeBranch = ba.Branch
			break
		}
	}

	var activeSoftware models.SoftwareModule
	for _, sa := range softwareAccesses {
		if sa.Software.SoftwareCode == ctx.ActiveSoftwareCode {
			activeSoftware = sa.Software
			break
		}
	}

	authService := services.NewAuthService(db)
	permissions := authService.GetUserPermissionsForActiveContext(user.ID, activeBranch.ID, activeSoftware.ID)

	resp := authService.BuildLoginContext("", user, *platformCompany, activeBranch, activeSoftware, branchAccesses, softwareAccesses, permissions)
	resp.Token = c.GetString("tokenString") // optional: return current token or omit

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) AuthContext(c *gin.Context) {
	h.AuthMe(c) // AuthMe and AuthContext do exactly the same thing.
}

func (h *AuthHandler) SwitchBranch(c *gin.Context) {
	var req dto.SwitchBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Auth context missing"})
		return
	}
	ctx := authCtx.(*middleware.AuthContext)

	_, platformCompany, err := h.resolver.ResolveCompanyDB(ctx.CompanyCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Company not found"})
		return
	}

	authService := services.NewAuthService(db)
	resp, err := authService.SwitchBranch(ctx.UserID, req.BranchID, ctx.ActiveSoftwareCode, *platformCompany)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) SwitchSoftware(c *gin.Context) {
	var req dto.SwitchSoftwareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	authCtx, exists := c.Get("authContext")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Auth context missing"})
		return
	}
	ctx := authCtx.(*middleware.AuthContext)

	_, platformCompany, err := h.resolver.ResolveCompanyDB(ctx.CompanyCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Company not found"})
		return
	}

	authService := services.NewAuthService(db)
	resp, err := authService.SwitchSoftware(ctx.UserID, ctx.ActiveBranchID, req.SoftwareCode, *platformCompany)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
