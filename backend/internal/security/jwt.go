package security

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthClaims struct {
	UserID             uint64 `json:"user_id"`
	CompanyCode        string `json:"company_code"`
	CompanyID          uint64 `json:"company_id"`
	ActiveBranchID     uint64 `json:"active_branch_id"`
	ActiveSoftwareCode string `json:"active_software_code"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "change_this_secret"
	}
	return []byte(secret)
}

func GenerateToken(claims AuthClaims) (string, error) {
	// Set expiration
	expiryHours := 24
	claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour))
	claims.IssuedAt = jwt.NewNumericDate(time.Now())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ValidateToken(tokenString string) (*AuthClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*AuthClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
