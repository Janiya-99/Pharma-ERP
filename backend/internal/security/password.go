package security

import (
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a bcrypt hash from the given plaintext password.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a plaintext password with its stored bcrypt hash.
// It also checks against trimmed whitespace in case user copy-pasted with accidental whitespace.
// Returns true if they match, false otherwise.
func CheckPasswordHash(password string, hash string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err == nil {
		return true
	}
	trimmed := strings.TrimSpace(password)
	if trimmed != "" && trimmed != password {
		if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(trimmed)); err == nil {
			return true
		}
	}
	return false
}
