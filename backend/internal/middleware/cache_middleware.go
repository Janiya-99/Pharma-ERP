package middleware

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/service"
)

type cacheWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *cacheWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// CacheResponse provides high-performance Redis caching for HTTP GET responses.
// Features:
// - Multi-tenant isolation (caches per company ID when authenticated)
// - X-Cache: HIT / MISS header tagging
// - Query string sensitivity
// - Safe fallback if Redis is unavailable
func CacheResponse(cacheService *service.CacheService, ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only cache GET requests
		if c.Request.Method != http.MethodGet {
			c.Next()
			return
		}

		// Allow clients to bypass cache with Cache-Control: no-cache
		bypass := c.GetHeader("Cache-Control") == "no-cache" || c.GetHeader("Pragma") == "no-cache"

		// Construct tenant-aware cache key
		companyID := uint64(0)
		if authCtxVal, exists := c.Get("authContext"); exists {
			if authCtx, ok := authCtxVal.(*AuthContext); ok {
				companyID = authCtx.CompanyID
			}
		}

		rawKey := fmt.Sprintf("%d:%s:%s", companyID, c.Request.URL.Path, c.Request.URL.RawQuery)
		hasher := sha256.New()
		hasher.Write([]byte(rawKey))
		keyHash := hex.EncodeToString(hasher.Sum(nil))
		cacheKey := fmt.Sprintf("http:%s", keyHash)

		ctx, cancel := context.WithTimeout(c.Request.Context(), 500*time.Millisecond)
		defer cancel()

		if !bypass {
			var cachedBody string
			hit, err := cacheService.Get(ctx, cacheKey, &cachedBody)
			if err == nil && hit && cachedBody != "" {
				c.Header("X-Cache", "HIT")
				c.Header("Content-Type", "application/json; charset=utf-8")
				c.String(http.StatusOK, cachedBody)
				c.Abort()
				return
			}
		}

		// Cache Miss: intercept response writer to capture and cache output
		c.Header("X-Cache", "MISS")
		w := &cacheWriter{body: bytes.NewBuffer(nil), ResponseWriter: c.Writer}
		c.Writer = w

		c.Next()

		// Only cache 200 OK responses with content
		if c.Writer.Status() == http.StatusOK && w.body.Len() > 0 {
			saveCtx, saveCancel := context.WithTimeout(context.Background(), 1*time.Second)
			defer saveCancel()
			_ = cacheService.Set(saveCtx, cacheKey, w.body.String(), ttl)
		}
	}
}
