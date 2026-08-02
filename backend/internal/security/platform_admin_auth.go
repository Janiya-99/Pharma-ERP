package security

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type PlatformAdminClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	IsAdmin  bool   `json:"is_admin"`
	jwt.RegisteredClaims
}

func GeneratePlatformToken(userID uint, username string, email string) (string, error) {
	claims := PlatformAdminClaims{
		UserID:   userID,
		Username: username,
		Email:    email,
		IsAdmin:  true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ValidatePlatformToken(tokenString string) (*PlatformAdminClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &PlatformAdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*PlatformAdminClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid platform admin token")
}
