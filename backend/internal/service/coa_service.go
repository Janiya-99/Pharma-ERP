package service

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

// CoAService handles chart of accounts business logic with caching.
type CoAService struct {
	coaRepo *repository.CoARepository
	cache   *CacheService
	audit   *AuditService
	logger  *zap.Logger
}

func NewCoAService(
	coaRepo *repository.CoARepository,
	cache *CacheService,
	audit *AuditService,
	logger *zap.Logger,
) *CoAService {
	return &CoAService{
		coaRepo: coaRepo,
		cache:   cache,
		audit:   audit,
		logger:  logger,
	}
}

func (s *CoAService) GetByID(companyID, id uint64) (*model.ChartOfAccounts, error) {
	// Try cache first
	cacheKey := CacheKeyCoAItem(companyID, id)
	var cached model.ChartOfAccounts
	found, _ := s.cache.Get(context.Background(), cacheKey, &cached)
	if found {
		return &cached, nil
	}

	account, err := s.coaRepo.FindByID(id, companyID)
	if err != nil {
		return nil, errs.ErrNotFound("Account")
	}

	// Cache for 15 minutes
	_ = s.cache.Set(context.Background(), cacheKey, account, 15*time.Minute)

	return account, nil
}

func (s *CoAService) List(companyID uint64, req *dto.PaginationRequest) ([]model.ChartOfAccounts, int64, error) {
	return s.coaRepo.List(companyID, req)
}

func (s *CoAService) ListTree(companyID uint64) ([]model.ChartOfAccounts, error) {
	return s.coaRepo.ListTree(companyID)
}

func (s *CoAService) Create(c *gin.Context, companyID uint64, req *request.CreateAccountRequest) (*model.ChartOfAccounts, error) {
	// Check duplicate GL code
	exists, err := s.coaRepo.AccountCodeExists(companyID, req.GLCode, 0)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	if exists {
		return nil, errs.ErrConflict("GL code already exists")
	}

	account := &model.ChartOfAccounts{
		CategoryID:  req.CategoryID,
		GLCode:      req.GLCode,
		Name:        req.Name,
		IsCashBank:  req.IsCashBank,
		ShowToPO:    req.ShowToPO,
		InterBranch: req.InterBranch,
	}

	if err := s.coaRepo.Create(nil, account); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	// Audit log
	s.audit.LogAction(c, nil, AuditParams{
		Module:     "finance",
		Action:     "create",
		EntityType: "chart_of_accounts",
		EntityID:   account.ID,
		NewValues:  account,
	})

	// Invalidate cache
	_ = s.cache.InvalidatePattern(context.Background(), CacheKeyCoAList(companyID)+"*")

	return account, nil
}

func (s *CoAService) Update(c *gin.Context, companyID, id uint64, req *request.UpdateAccountRequest) (*model.ChartOfAccounts, error) {
	account, err := s.coaRepo.FindByID(id, companyID)
	if err != nil {
		return nil, errs.ErrNotFound("Account")
	}

	oldValues := *account

	if req.Name != "" {
		account.Name = req.Name
	}
	if req.IsCashBank != nil {
		account.IsCashBank = *req.IsCashBank
	}
	if req.ShowToPO != nil {
		account.ShowToPO = *req.ShowToPO
	}
	if req.InterBranch != nil {
		account.InterBranch = *req.InterBranch
	}

	if err := s.coaRepo.Update(nil, account); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	// Audit log
	s.audit.LogAction(c, nil, AuditParams{
		Module:     "finance",
		Action:     "update",
		EntityType: "chart_of_accounts",
		EntityID:   account.ID,
		OldValues:  oldValues,
		NewValues:  account,
	})

	// Invalidate cache
	_ = s.cache.Delete(context.Background(), CacheKeyCoAItem(companyID, id))
	_ = s.cache.InvalidatePattern(context.Background(), CacheKeyCoAList(companyID)+"*")

	return account, nil
}

func (s *CoAService) Delete(c *gin.Context, companyID, id uint64) error {
	account, err := s.coaRepo.FindByID(id, companyID)
	if err != nil {
		return errs.ErrNotFound("Account")
	}

	if err := s.coaRepo.Delete(id); err != nil {
		return errs.ErrDatabase(err)
	}

	// Audit log
	s.audit.LogAction(c, nil, AuditParams{
		Module:     "finance",
		Action:     "delete",
		EntityType: "chart_of_accounts",
		EntityID:   id,
		OldValues:  account,
	})

	// Invalidate cache
	_ = s.cache.Delete(context.Background(), CacheKeyCoAItem(companyID, id))
	_ = s.cache.InvalidatePattern(context.Background(), CacheKeyCoAList(companyID)+"*")

	return nil
}
