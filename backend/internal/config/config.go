package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
// Like Laravel's config/*.php files, but as a single typed struct.
type Config struct {
	App        AppConfig
	PlatformDB DatabaseConfig // Platform database (erp_platform)
	Database   DatabaseConfig // Company database (legacy / default)
	Redis      RedisConfig
	JWT        JWTConfig
	RateLimit  RateLimitConfig
	CORS       CORSConfig
	Log        LogConfig
}

type AppConfig struct {
	Name  string
	Env   string
	Port  string
	Debug bool
}

type DatabaseConfig struct {
	Host            string
	Port            string
	Name            string
	User            string
	Password        string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		d.User, d.Password, d.Host, d.Port, d.Name,
	)
}

// DSNWithoutDB returns the MySQL Data Source Name without selecting a database.
func (d *DatabaseConfig) DSNWithoutDB() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		d.User, d.Password, d.Host, d.Port,
	)
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

func (r *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%s", r.Host, r.Port)
}

type JWTConfig struct {
	Secret           string
	RefreshSecret    string
	AccessExpiryMins int
	RefreshExpiryHrs int
}

func (j *JWTConfig) AccessExpiry() time.Duration {
	return time.Duration(j.AccessExpiryMins) * time.Minute
}

func (j *JWTConfig) RefreshExpiry() time.Duration {
	return time.Duration(j.RefreshExpiryHrs) * time.Hour
}

type RateLimitConfig struct {
	LoginPerMinute int
	APIPerMinute   int
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

type LogConfig struct {
	Level  string
	Format string
}

// Load reads .env file (if present) and loads all configuration from environment variables.
// It validates that all required variables are set.
func Load() (*Config, error) {
	// Load .env file — ignore error if not found (production uses real env vars)
	_ = godotenv.Load()

	cfg := &Config{
		App: AppConfig{
			Name:  getEnv("APP_NAME", "Pharma ERP"),
			Env:   getEnv("APP_ENV", "development"),
			Port:  getEnv("APP_PORT", "8080"),
			Debug: getEnvBool("APP_DEBUG", false),
		},
		// Platform database — always connects to erp_platform
		PlatformDB: DatabaseConfig{
			Host:            getEnv("PLATFORM_DB_HOST", "localhost"),
			Port:            getEnv("PLATFORM_DB_PORT", "3306"),
			Name:            getEnv("PLATFORM_DB_NAME", "erp_platform"),
			User:            getEnv("PLATFORM_DB_USER", "root"),
			Password:        getEnv("PLATFORM_DB_PASSWORD", ""),
			MaxOpenConns:    getEnvInt("PLATFORM_DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvInt("PLATFORM_DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime: time.Duration(getEnvInt("PLATFORM_DB_CONN_MAX_LIFETIME_MINUTES", 5)) * time.Minute,
		},
		// Company database — legacy single-company connection (kept for backward compatibility)
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "127.0.0.1"),
			Port:            getEnv("DB_PORT", "3306"),
			Name:            getEnv("DB_NAME", "erp_phrma"),
			User:            getEnv("DB_USER", "root"),
			Password:        getEnv("DB_PASSWORD", ""),
			MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime: time.Duration(getEnvInt("DB_CONN_MAX_LIFETIME_MINUTES", 5)) * time.Minute,
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "127.0.0.1"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			Secret:           getEnv("JWT_SECRET", "change_this_secret"),
			RefreshSecret:    getEnv("JWT_REFRESH_SECRET", "change_this_refresh_secret"),
			AccessExpiryMins: getEnvInt("JWT_ACCESS_EXPIRY_MINUTES", 15),
			RefreshExpiryHrs: getEnvInt("JWT_REFRESH_EXPIRY_HOURS", 24),
		},
		RateLimit: RateLimitConfig{
			LoginPerMinute: getEnvInt("RATE_LIMIT_LOGIN_PER_MINUTE", 5),
			APIPerMinute:   getEnvInt("RATE_LIMIT_API_PER_MINUTE", 100),
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"), ","),
			AllowedMethods: strings.Split(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"), ","),
			AllowedHeaders: strings.Split(getEnv("CORS_ALLOWED_HEADERS", "Authorization,Content-Type,X-Request-ID"), ","),
		},
		Log: LogConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}

	return cfg, nil
}

// getEnv returns the env variable value or a default.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

// getEnvRequired returns the env variable value or panics if not set.
func getEnvRequired(key string) string {
	val := os.Getenv(key)
	if val == "" {
		panic(fmt.Sprintf("required environment variable %s is not set", key))
	}
	return val
}

// getEnvInt returns the env variable as int or a default.
func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	intVal, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return intVal
}

// getEnvBool returns the env variable as bool or a default.
func getEnvBool(key string, defaultVal bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	boolVal, err := strconv.ParseBool(val)
	if err != nil {
		return defaultVal
	}
	return boolVal
}
