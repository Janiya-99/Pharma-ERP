package repository

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// SessionRepository handles user session data access.
type SessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

// Create creates a new session.
func (r *SessionRepository) Create(session *model.Session) error {
	return r.db.Create(session).Error
}

// FindByRefreshToken returns a session by its refresh token.
func (r *SessionRepository) FindByRefreshToken(token string) (*model.Session, error) {
	var session model.Session
	err := r.db.Where("refresh_token = ? AND expires_at > ?", token, time.Now()).
		First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// FindByAccessTokenID returns a session by its JWT token ID (jti).
func (r *SessionRepository) FindByAccessTokenID(tokenID string) (*model.Session, error) {
	var session model.Session
	err := r.db.Where("access_token_id = ?", tokenID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// Delete removes a session (logout).
func (r *SessionRepository) Delete(id uint64) error {
	return r.db.Unscoped().Delete(&model.Session{}, id).Error
}

// DeleteByUserID removes all sessions for a user (force logout all).
func (r *SessionRepository) DeleteByUserID(userID uint64) error {
	return r.db.Unscoped().Where("user_id = ?", userID).Delete(&model.Session{}).Error
}

// DeleteExpired removes all expired sessions (cleanup job).
func (r *SessionRepository) DeleteExpired() error {
	return r.db.Unscoped().Where("expires_at < ?", time.Now()).Delete(&model.Session{}).Error
}

// RotateRefreshToken updates the refresh token for a session (token rotation).
func (r *SessionRepository) RotateRefreshToken(sessionID uint64, newRefreshToken string, newAccessTokenID string, newExpiry time.Time) error {
	return r.db.Model(&model.Session{}).Where("id = ?", sessionID).
		Updates(map[string]interface{}{
			"refresh_token":   newRefreshToken,
			"access_token_id": newAccessTokenID,
			"expires_at":      newExpiry,
		}).Error
}
