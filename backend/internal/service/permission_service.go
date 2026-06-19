package service

import (
	"context"
	"time"

	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

// PermissionService handles permission checking with Redis caching.
type PermissionService struct {
	roleRepo *repository.RoleRepository
	cache    *CacheService
	logger   *zap.Logger
}

func NewPermissionService(
	roleRepo *repository.RoleRepository,
	cache *CacheService,
	logger *zap.Logger,
) *PermissionService {
	return &PermissionService{
		roleRepo: roleRepo,
		cache:    cache,
		logger:   logger,
	}
}

// HasPermission checks if a user has a specific permission slug.
// First checks Redis cache, then falls back to database.
func (s *PermissionService) HasPermission(ctx context.Context, userID uint64, requiredSlug string) (bool, error) {
	perms, err := s.GetUserPermissions(ctx, userID)
	if err != nil {
		return false, err
	}

	for _, perm := range perms {
		if perm == requiredSlug {
			return true, nil
		}
	}
	return false, nil
}

// GetUserPermissions returns all permission slugs for a user.
// Uses Redis cache with 5-minute TTL.
func (s *PermissionService) GetUserPermissions(ctx context.Context, userID uint64) ([]string, error) {
	cacheKey := CacheKeyUserPermissions(userID)

	// Try cache first
	var cachedPerms []string
	found, _ := s.cache.Get(ctx, cacheKey, &cachedPerms)
	if found {
		return cachedPerms, nil
	}

	// Cache miss — query database
	perms, err := s.roleRepo.GetPermissionsByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Cache for 5 minutes
	if err := s.cache.Set(ctx, cacheKey, perms, 5*time.Minute); err != nil {
		s.logger.Warn("failed to cache permissions",
			zap.Uint64("user_id", userID),
			zap.Error(err),
		)
	}

	return perms, nil
}

// InvalidateUserPermissions clears the cached permissions for a user.
// Call this when roles are changed.
func (s *PermissionService) InvalidateUserPermissions(ctx context.Context, userID uint64) error {
	return s.cache.Delete(ctx, CacheKeyUserPermissions(userID))
}

// InvalidateAllPermissions clears all cached permissions.
// Call this when permissions are modified globally.
func (s *PermissionService) InvalidateAllPermissions(ctx context.Context) error {
	return s.cache.InvalidatePattern(ctx, "permissions:*")
}
