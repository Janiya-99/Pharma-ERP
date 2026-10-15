package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// CacheService provides Redis caching for safe read-only data.
// Only caches: permissions, settings, chart of accounts.
// NEVER cache user sessions or financial transaction data.
type CacheService struct {
	redis  *redis.Client
	logger *zap.Logger
}

func NewCacheService(redis *redis.Client, logger *zap.Logger) *CacheService {
	return &CacheService{redis: redis, logger: logger}
}

// Get retrieves a cached value and unmarshals it into dest.
// Returns false if the key doesn't exist or is expired.
func (s *CacheService) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	val, err := s.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		s.logger.Warn("cache get error", zap.String("key", key), zap.Error(err))
		return false, nil // Treat cache errors as misses, not failures
	}
	if err := json.Unmarshal([]byte(val), dest); err != nil {
		s.logger.Warn("cache unmarshal error", zap.String("key", key), zap.Error(err))
		return false, nil
	}
	return true, nil
}

// Set stores a value in cache with a TTL.
func (s *CacheService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("cache marshal error: %w", err)
	}
	return s.redis.Set(ctx, key, data, ttl).Err()
}

// Ping checks if Redis is reachable and healthy.
func (s *CacheService) Ping(ctx context.Context) error {
	return s.redis.Ping(ctx).Err()
}

// Remember retrieves an item from cache, or executes the fetcher function, caches the result, and populates dest.
func (s *CacheService) Remember(ctx context.Context, key string, ttl time.Duration, dest interface{}, fetcher func() (interface{}, error)) error {
	hit, err := s.Get(ctx, key, dest)
	if err == nil && hit {
		return nil
	}

	val, fetchErr := fetcher()
	if fetchErr != nil {
		return fetchErr
	}

	// Cache the freshly fetched value
	if setErr := s.Set(ctx, key, val, ttl); setErr != nil {
		s.logger.Warn("Failed to set cache in Remember", zap.String("key", key), zap.Error(setErr))
	}

	// Re-marshal to populate dest
	data, err := json.Marshal(val)
	if err == nil {
		_ = json.Unmarshal(data, dest)
	}

	return nil
}

// Delete removes a key from cache.
func (s *CacheService) Delete(ctx context.Context, key string) error {
	return s.redis.Del(ctx, key).Err()
}

// InvalidatePattern removes all keys matching a pattern.
// Usage: InvalidatePattern(ctx, "permissions:user:*")
func (s *CacheService) InvalidatePattern(ctx context.Context, pattern string) error {
	iter := s.redis.Scan(ctx, 0, pattern, 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	if len(keys) > 0 {
		return s.redis.Del(ctx, keys...).Err()
	}
	return nil
}

// InvalidateCompany clears all cached data belonging to a company.
func (s *CacheService) InvalidateCompany(ctx context.Context, companyID uint64) error {
	pattern := fmt.Sprintf("*company:%d*", companyID)
	return s.InvalidatePattern(ctx, pattern)
}

// --- Cache Key Generators ---

func CacheKeyUserPermissions(userID uint64) string {
	return fmt.Sprintf("permissions:user:%d", userID)
}

func CacheKeyCoAList(companyID uint64) string {
	return fmt.Sprintf("coa:company:%d", companyID)
}

func CacheKeyCoAItem(companyID uint64, accountID uint64) string {
	return fmt.Sprintf("coa:company:%d:account:%d", companyID, accountID)
}

func CacheKeyCountries() string {
	return "common:countries"
}

func CacheKeySoftwareModules() string {
	return "common:software_modules"
}

func CacheKeyActiveCompanies() string {
	return "platform:companies:active"
}

func CacheKeySubscriptionPlans() string {
	return "platform:subscription_plans"
}
