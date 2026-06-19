package service

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pixandco/erp-phrma/internal/config"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/crypto"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

// JWTClaims holds the JWT token claims including user and tenant info.
type JWTClaims struct {
	jwt.RegisteredClaims
	UserID    uint64 `json:"user_id"`
	CompanyID uint64 `json:"company_id"`
	BranchID  uint64 `json:"branch_id"`
	Email     string `json:"email"`
}

// AuthTokens holds the access and refresh tokens returned after login.
type AuthTokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    int64  `json:"expires_at"`
	TokenType    string `json:"token_type"`
}

// AuthService handles authentication logic.
type AuthService struct {
	userRepo    *repository.UserRepository
	sessionRepo *repository.SessionRepository
	jwtCfg      *config.JWTConfig
	logger      *zap.Logger
}

func NewAuthService(
	userRepo *repository.UserRepository,
	sessionRepo *repository.SessionRepository,
	jwtCfg *config.JWTConfig,
	logger *zap.Logger,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		jwtCfg:      jwtCfg,
		logger:      logger,
	}
}

// Login validates credentials and returns JWT + refresh token.
func (s *AuthService) Login(email, password, ip, userAgent string) (*AuthTokens, *model.User, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, nil, errs.ErrUnauthorized("Invalid email or password")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, nil, errs.ErrUnauthorized("Account is deactivated")
	}

	// Verify password
	if err := crypto.CheckPassword(user.PasswordHash, password); err != nil {
		return nil, nil, errs.ErrUnauthorized("Invalid email or password")
	}

	// Generate tokens
	tokens, err := s.generateTokens(user, ip, userAgent)
	if err != nil {
		return nil, nil, errs.ErrInternal(err)
	}

	s.logger.Info("user logged in",
		zap.Uint64("user_id", user.ID),
		zap.String("email", email),
		zap.String("ip", ip),
	)

	return tokens, user, nil
}

// RefreshToken validates a refresh token and issues new tokens (rotation).
func (s *AuthService) RefreshToken(refreshToken, ip, userAgent string) (*AuthTokens, error) {
	// Find session by refresh token
	session, err := s.sessionRepo.FindByRefreshToken(refreshToken)
	if err != nil {
		return nil, errs.ErrUnauthorized("Invalid or expired refresh token")
	}

	// Check expiry
	if session.IsExpired() {
		_ = s.sessionRepo.Delete(session.ID)
		return nil, errs.ErrUnauthorized("Refresh token has expired")
	}

	// Get user
	user, err := s.userRepo.FindByID(session.UserID)
	if err != nil {
		return nil, errs.ErrInternal(err)
	}

	if !user.IsActive {
		return nil, errs.ErrUnauthorized("Account is deactivated")
	}

	// Generate new token pair
	tokenID := uuid.New().String()
	newRefreshToken, err := crypto.GenerateSecureToken(32)
	if err != nil {
		return nil, errs.ErrInternal(err)
	}

	// Create new access token
	accessToken, expiresAt, err := s.createAccessToken(user, tokenID)
	if err != nil {
		return nil, errs.ErrInternal(err)
	}

	// Rotate refresh token
	newExpiry := time.Now().Add(s.jwtCfg.RefreshExpiry())
	if err := s.sessionRepo.RotateRefreshToken(session.ID, newRefreshToken, tokenID, newExpiry); err != nil {
		return nil, errs.ErrInternal(err)
	}

	return &AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresAt:    expiresAt,
		TokenType:    "Bearer",
	}, nil
}

// Logout invalidates a session.
func (s *AuthService) Logout(accessTokenID string) error {
	session, err := s.sessionRepo.FindByAccessTokenID(accessTokenID)
	if err != nil {
		return nil // Session already expired or doesn't exist
	}
	return s.sessionRepo.Delete(session.ID)
}

// ValidateAccessToken parses and validates a JWT access token.
func (s *AuthService) ValidateAccessToken(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errs.ErrUnauthorized("Invalid token signing method")
		}
		return []byte(s.jwtCfg.Secret), nil
	})

	if err != nil || !token.Valid {
		return nil, errs.ErrUnauthorized("Invalid or expired access token")
	}

	return claims, nil
}

// generateTokens creates JWT access token + refresh token and persists the session.
func (s *AuthService) generateTokens(user *model.User, ip, userAgent string) (*AuthTokens, error) {
	tokenID := uuid.New().String()

	// Generate refresh token
	refreshToken, err := crypto.GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}

	// Create access token
	accessToken, expiresAt, err := s.createAccessToken(user, tokenID)
	if err != nil {
		return nil, err
	}

	// Persist session
	session := &model.Session{
		UserID:        user.ID,
		AccessTokenID: tokenID,
		RefreshToken:  refreshToken,
		IPAddress:     ip,
		UserAgent:     userAgent,
		ExpiresAt:     time.Now().Add(s.jwtCfg.RefreshExpiry()),
	}
	if err := s.sessionRepo.Create(session); err != nil {
		return nil, err
	}

	return &AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		TokenType:    "Bearer",
	}, nil
}

// createAccessToken generates a signed JWT access token.
func (s *AuthService) createAccessToken(user *model.User, tokenID string) (string, int64, error) {
	expiresAt := time.Now().Add(s.jwtCfg.AccessExpiry())

	claims := &JWTClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        tokenID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			Issuer:    "erp-phrma",
		},
		UserID:    user.ID,
		CompanyID: user.CompanyID,
		BranchID:  user.BranchID,
		Email:     user.Email,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(s.jwtCfg.Secret))
	if err != nil {
		return "", 0, err
	}

	return signedToken, expiresAt.Unix(), nil
}
