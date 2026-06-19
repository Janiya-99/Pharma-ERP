package database

import (
	"context"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// NewRedis creates a new Redis connection with connection pooling.
// Used for: permission caching, rate limiting, session caching.
func NewRedis(cfg *config.RedisConfig, logger *zap.Logger) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: 20,
	})

	// Verify connection
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Redis connected successfully",
		zap.String("addr", cfg.Addr()),
		zap.Int("db", cfg.DB),
	)

	return client, nil
}

// CloseRedis gracefully closes the Redis connection.
func CloseRedis(client *redis.Client) error {
	return client.Close()
}
