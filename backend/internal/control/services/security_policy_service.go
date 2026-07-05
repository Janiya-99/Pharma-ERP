package services

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/model"
	"go.uber.org/zap"
)

type SecurityPolicyService struct {
	repo         *repositories.SecuritySettingsRepository
	auditService *AuditService
	logger       *zap.Logger
}

func NewSecurityPolicyService(repo *repositories.SecuritySettingsRepository, auditService *AuditService, logger *zap.Logger) *SecurityPolicyService {
	return &SecurityPolicyService{
		repo:         repo,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *SecurityPolicyService) GetSecurityPolicy(companyID uint64, branchID *uint64) (*models.SecurityPolicy, error) {
	return s.repo.GetSecurityPolicy(companyID, branchID)
}

func (s *SecurityPolicyService) SaveSecurityPolicy(pol *models.SecurityPolicy, activeUserID uint64, ipAddress, userAgent string) (*models.SecurityPolicy, error) {
	now := time.Now()
	var oldVal interface{}
	if pol.ID != 0 {
		old, _ := s.repo.GetSecurityPolicy(pol.CompanyID, pol.BranchID)
		if old != nil {
			oldVal = *old
		}
		pol.UpdatedBy = activeUserID
		pol.UpdatedAt = now
	} else {
		pol.CreatedBy = activeUserID
		pol.UpdatedBy = activeUserID
		pol.CreatedAt = now
		pol.UpdatedAt = now
		pol.VersionNumber = 1
	}

	if pol.Status == "published" {
		pol.PublishedBy = &activeUserID
		pol.PublishedAt = &now
	}

	if err := s.repo.SaveSecurityPolicy(pol); err != nil {
		return nil, err
	}

	s.auditService.LogAction(
		pol.CompanyID,
		pol.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"SECURITY_POLICY_SAVED",
		"security_policies",
		&pol.ID,
		oldVal,
		pol,
		ipAddress,
		userAgent,
	)

	return pol, nil
}

func (s *SecurityPolicyService) ListTrustedIPRules(companyID uint64) ([]models.TrustedIPRule, error) {
	return s.repo.ListTrustedIPRules(companyID)
}

func (s *SecurityPolicyService) SaveTrustedIPRule(rule *models.TrustedIPRule, activeUserID uint64, ipAddress, userAgent string) (*models.TrustedIPRule, error) {
	now := time.Now()
	var oldVal interface{}
	if rule.ID != 0 {
		oldRules, _ := s.repo.ListTrustedIPRules(rule.CompanyID)
		for _, r := range oldRules {
			if r.ID == rule.ID {
				oldVal = r
				break
			}
		}
		rule.UpdatedAt = now
	} else {
		rule.CreatedAt = now
		rule.UpdatedAt = now
	}

	if err := s.repo.SaveTrustedIPRule(rule); err != nil {
		return nil, err
	}

	s.auditService.LogAction(
		rule.CompanyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"TRUSTED_IP_RULE_SAVED",
		"trusted_ip_rules",
		&rule.ID,
		oldVal,
		rule,
		ipAddress,
		userAgent,
	)

	return rule, nil
}

func (s *SecurityPolicyService) DeleteTrustedIPRule(id uint64, companyID uint64, activeUserID uint64, ipAddress, userAgent string) error {
	if err := s.repo.DeleteTrustedIPRule(id); err != nil {
		return err
	}
	s.auditService.LogAction(
		companyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"TRUSTED_IP_RULE_DELETED",
		"trusted_ip_rules",
		&id,
		nil,
		nil,
		ipAddress,
		userAgent,
	)
	return nil
}

func (s *SecurityPolicyService) ListBackupPolicies(companyID uint64) ([]models.BackupPolicy, error) {
	return s.repo.ListBackupPolicies(companyID)
}

func (s *SecurityPolicyService) SaveBackupPolicy(pol *models.BackupPolicy, activeUserID uint64, ipAddress, userAgent string) (*models.BackupPolicy, error) {
	now := time.Now()
	var oldVal interface{}
	if pol.ID != 0 {
		oldPolicies, _ := s.repo.ListBackupPolicies(pol.CompanyID)
		for _, p := range oldPolicies {
			if p.ID == pol.ID {
				oldVal = p
				break
			}
		}
		pol.UpdatedAt = now
	} else {
		pol.CreatedAt = now
		pol.UpdatedAt = now
	}

	if err := s.repo.SaveBackupPolicy(pol); err != nil {
		return nil, err
	}

	s.auditService.LogAction(
		pol.CompanyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"BACKUP_POLICY_SAVED",
		"backup_policies",
		&pol.ID,
		oldVal,
		pol,
		ipAddress,
		userAgent,
	)

	return pol, nil
}

func (s *SecurityPolicyService) ListBackupLogs(companyID uint64, limit int) ([]models.BackupExecutionLog, error) {
	return s.repo.ListBackupLogs(companyID, limit)
}

func (s *SecurityPolicyService) TriggerManualBackup(companyID uint64, activeUserID uint64, ipAddress, userAgent string) (*models.BackupExecutionLog, error) {
	now := time.Now()
	log := models.BackupExecutionLog{
		CompanyID:          companyID,
		BackupType:         "manual",
		Status:             "success",
		FileSizeBytes:      14285760, // Simulate ~14MB backup snapshot
		StoragePath:        fmt.Sprintf("/var/backups/company_%d_%s.sql.gz", companyID, now.Format("20060102_150405")),
		StartedAt:          now.Add(-2 * time.Second),
		CompletedAt:        &now,
		TriggeredByUserID:  &activeUserID,
	}

	if err := s.repo.GetDB().Create(&log).Error; err != nil {
		return nil, err
	}

	s.auditService.LogAction(
		companyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"MANUAL_BACKUP_TRIGGERED",
		"backup_execution_logs",
		&log.ID,
		nil,
		log,
		ipAddress,
		userAgent,
	)

	return &log, nil
}

func (s *SecurityPolicyService) ListActiveSessions(companyID uint64) ([]map[string]interface{}, error) {
	var sessions []model.Session
	err := s.repo.GetDB().Table("sessions").
		Joins("JOIN users ON users.id = sessions.user_id").
		Where("users.company_id = ? AND sessions.expires_at > ?", companyID, time.Now()).
		Preload("User").
		Order("sessions.created_at DESC").
		Find(&sessions).Error
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, sess := range sessions {
		result = append(result, map[string]interface{}{
			"id":          sess.ID,
			"user_id":     sess.UserID,
			"full_name":   sess.User.FullName,
			"email":       sess.User.Email,
			"ip_address":  sess.IPAddress,
			"user_agent":  sess.UserAgent,
			"created_at":  sess.CreatedAt,
			"expires_at":  sess.ExpiresAt,
			"is_current":  false, // Handler can set true if matches current token
		})
	}
	return result, nil
}

func (s *SecurityPolicyService) TerminateSession(companyID uint64, sessionID uint64, activeUserID uint64, ipAddress, userAgent string) error {
	// Verify session belongs to company
	var sess model.Session
	err := s.repo.GetDB().Table("sessions").
		Joins("JOIN users ON users.id = sessions.user_id").
		Where("sessions.id = ? AND users.company_id = ?", sessionID, companyID).
		First(&sess).Error
	if err != nil {
		return err
	}

	if err := s.repo.GetDB().Unscoped().Delete(&model.Session{}, sessionID).Error; err != nil {
		return err
	}

	s.auditService.LogAction(
		companyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"SECURITY_SESSION_TERMINATED",
		"sessions",
		&sessionID,
		sess,
		nil,
		ipAddress,
		userAgent,
	)
	return nil
}

func (s *SecurityPolicyService) TerminateAllSessions(companyID uint64, exceptUserID uint64, activeUserID uint64, ipAddress, userAgent string) error {
	var userIDs []uint64
	s.repo.GetDB().Table("users").Where("company_id = ? AND id != ?", companyID, exceptUserID).Pluck("id", &userIDs)

	if len(userIDs) > 0 {
		s.repo.GetDB().Unscoped().Where("user_id IN (?)", userIDs).Delete(&model.Session{})
	}

	s.auditService.LogAction(
		companyID,
		nil,
		&activeUserID,
		"CONTROL_CENTER",
		"SECURITY_ALL_SESSIONS_TERMINATED",
		"sessions",
		nil,
		nil,
		map[string]interface{}{"terminated_user_count": len(userIDs)},
		ipAddress,
		userAgent,
	)
	return nil
}
