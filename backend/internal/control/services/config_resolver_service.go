package services

import (
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"go.uber.org/zap"
)

type ConfigurationResolverService struct {
	repo         *repositories.SettingsRepository
	auditService *AuditService
	logger       *zap.Logger
	cache        sync.Map // simple in-memory cache for fast resolution
}

func NewConfigurationResolverService(repo *repositories.SettingsRepository, auditService *AuditService, logger *zap.Logger) *ConfigurationResolverService {
	return &ConfigurationResolverService{
		repo:         repo,
		auditService: auditService,
		logger:       logger,
	}
}

// InvalidateCache clears cached settings when a setting is published or updated
func (s *ConfigurationResolverService) InvalidateCache(companyID uint64) {
	s.cache.Range(func(key, value interface{}) bool {
		if strings.HasPrefix(key.(string), strconv.FormatUint(companyID, 10)+":") {
			s.cache.Delete(key)
		}
		return true
	})
}

// ResolveSetting resolves a setting key following hierarchy: Branch Override -> Company Published -> System Default
func (s *ConfigurationResolverService) ResolveSetting(companyID uint64, branchID *uint64, key string) (json.RawMessage, error) {
	cacheKey := strconv.FormatUint(companyID, 10) + ":"
	if branchID != nil && *branchID != 0 {
		cacheKey += strconv.FormatUint(*branchID, 10) + ":" + key
	} else {
		cacheKey += "0:" + key
	}

	if val, ok := s.cache.Load(cacheKey); ok {
		return val.(json.RawMessage), nil
	}

	// 1. Check branch override if branchID is specified
	if branchID != nil && *branchID != 0 {
		overrides, err := s.repo.GetBranchOverrides(companyID, *branchID)
		if err == nil {
			for _, o := range overrides {
				if o.SettingKey == key && o.Status == "published" {
					s.cache.Store(cacheKey, o.SettingValueJSON)
					return o.SettingValueJSON, nil
				}
			}
		}
	}

	// 2. Check company published setting
	setting, err := s.repo.GetSettingByKey(companyID, key, nil)
	if err == nil && setting != nil && setting.Status == "published" {
		s.cache.Store(cacheKey, setting.SettingValueJSON)
		return setting.SettingValueJSON, nil
	}

	return nil, errors.New("setting not found or not published")
}

func (s *ConfigurationResolverService) ResolveSettingString(companyID uint64, branchID *uint64, key string, defaultVal string) string {
	valJSON, err := s.ResolveSetting(companyID, branchID, key)
	if err != nil {
		return defaultVal
	}
	var str string
	if err := json.Unmarshal(valJSON, &str); err != nil {
		// Try raw string if not JSON quoted
		raw := string(valJSON)
		if len(raw) > 0 {
			return strings.Trim(raw, "\"")
		}
		return defaultVal
	}
	return str
}

func (s *ConfigurationResolverService) ResolveSettingBool(companyID uint64, branchID *uint64, key string, defaultVal bool) bool {
	valJSON, err := s.ResolveSetting(companyID, branchID, key)
	if err != nil {
		return defaultVal
	}
	var b bool
	if err := json.Unmarshal(valJSON, &b); err != nil {
		return defaultVal
	}
	return b
}

func (s *ConfigurationResolverService) ResolveSettingInt(companyID uint64, branchID *uint64, key string, defaultVal int) int {
	valJSON, err := s.ResolveSetting(companyID, branchID, key)
	if err != nil {
		return defaultVal
	}
	var i int
	if err := json.Unmarshal(valJSON, &i); err != nil {
		return defaultVal
	}
	return i
}

func (s *ConfigurationResolverService) ResolveSettingFloat(companyID uint64, branchID *uint64, key string, defaultVal float64) float64 {
	valJSON, err := s.ResolveSetting(companyID, branchID, key)
	if err != nil {
		return defaultVal
	}
	var f float64
	if err := json.Unmarshal(valJSON, &f); err != nil {
		return defaultVal
	}
	return f
}

func (s *ConfigurationResolverService) ListEffectiveSettings(companyID uint64, groupCode string, branchID *uint64) ([]map[string]interface{}, error) {
	settings, err := s.repo.ListSettings(companyID, groupCode, nil)
	if err != nil {
		return nil, err
	}

	var branchOverridesMap map[string]json.RawMessage
	if branchID != nil && *branchID != 0 {
		overrides, err := s.repo.GetBranchOverrides(companyID, *branchID)
		if err == nil {
			branchOverridesMap = make(map[string]json.RawMessage)
			for _, o := range overrides {
				if o.Status == "published" {
					branchOverridesMap[o.SettingKey] = o.SettingValueJSON
				}
			}
		}
	}

	var result []map[string]interface{}
	for _, st := range settings {
		val := st.SettingValueJSON
		isOverridden := false
		if branchOverridesMap != nil {
			if overVal, ok := branchOverridesMap[st.SettingKey]; ok {
				val = overVal
				isOverridden = true
			}
		}

		var parsedVal interface{}
		json.Unmarshal(val, &parsedVal)

		item := map[string]interface{}{
			"id":             st.ID,
			"setting_group":  st.SettingGroup,
			"setting_key":    st.SettingKey,
			"setting_value":  parsedVal,
			"raw_json":       string(val),
			"status":         st.Status,
			"version_number": st.VersionNumber,
			"is_overridden":  isOverridden,
			"effective_from": st.EffectiveFrom,
			"updated_at":     st.UpdatedAt,
		}
		result = append(result, item)
	}

	return result, nil
}

func (s *ConfigurationResolverService) SaveSetting(companyID uint64, groupCode string, key string, val interface{}, status string, activeUserID uint64, ipAddress, userAgent string) (*models.SystemSetting, error) {
	valBytes, err := json.Marshal(val)
	if err != nil {
		return nil, errors.New("invalid setting value JSON")
	}

	setting, err := s.repo.GetSettingByKey(companyID, key, nil)
	now := time.Now()
	if err != nil || setting == nil {
		// Create new setting
		setting = &models.SystemSetting{
			CompanyID:        companyID,
			SettingGroup:     groupCode,
			SettingKey:       key,
			SettingValueJSON: valBytes,
			Status:           status,
			VersionNumber:    1,
			EffectiveFrom:    &now,
			CreatedBy:        activeUserID,
			UpdatedBy:        activeUserID,
			CreatedAt:        now,
			UpdatedAt:        now,
		}
		if status == "published" {
			setting.PublishedBy = &activeUserID
			setting.PublishedAt = &now
		}
	} else {
		oldVal := *setting
		setting.SettingValueJSON = valBytes
		setting.Status = status
		setting.UpdatedBy = activeUserID
		setting.UpdatedAt = now

		if status == "published" {
			setting.VersionNumber++
			setting.PublishedBy = &activeUserID
			setting.PublishedAt = &now

			// Create version snapshot
			ver := models.SystemSettingVersion{
				SettingID:        setting.ID,
				CompanyID:        companyID,
				SettingGroup:     setting.SettingGroup,
				SettingKey:       setting.SettingKey,
				SettingValueJSON: valBytes,
				VersionNumber:    setting.VersionNumber,
				EffectiveFrom:    &now,
				PublishedBy:      &activeUserID,
				PublishedAt:      &now,
				CreatedAt:        now,
			}
			s.repo.CreateVersion(&ver)
		}

		s.auditService.LogAction(
			companyID,
			nil,
			&activeUserID,
			"CONTROL_CENTER",
			"SETTING_UPDATED",
			"system_settings",
			&setting.ID,
			oldVal,
			setting,
			ipAddress,
			userAgent,
		)
	}

	if err := s.repo.SaveSetting(setting); err != nil {
		return nil, err
	}

	s.InvalidateCache(companyID)
	return setting, nil
}

func (s *ConfigurationResolverService) SaveBranchOverride(companyID uint64, branchID uint64, key string, val interface{}, activeUserID uint64, ipAddress, userAgent string) error {
	valBytes, err := json.Marshal(val)
	if err != nil {
		return errors.New("invalid override value JSON")
	}

	err = s.repo.SaveBranchOverride(companyID, branchID, key, valBytes, activeUserID)
	if err != nil {
		return err
	}

	s.auditService.LogAction(
		companyID,
		&branchID,
		&activeUserID,
		"CONTROL_CENTER",
		"BRANCH_SETTING_OVERRIDE",
		"branch_setting_overrides",
		nil,
		nil,
		map[string]interface{}{"key": key, "value": val},
		ipAddress,
		userAgent,
	)

	s.InvalidateCache(companyID)
	return nil
}

func (s *ConfigurationResolverService) GetImpactPreview(companyID uint64, key string, newValue interface{}) (map[string]interface{}, error) {
	setting, _ := s.repo.GetSettingByKey(companyID, key, nil)
	var oldVal interface{}
	if setting != nil {
		json.Unmarshal(setting.SettingValueJSON, &oldVal)
	}

	// Identify affected modules based on key prefix
	var affectedModules []string
	if strings.HasPrefix(key, "currency.") || strings.HasPrefix(key, "fiscal_year.") || strings.HasPrefix(key, "tax.") {
		affectedModules = []string{"Finance", "Inventory", "Invoice Center"}
	} else if strings.HasPrefix(key, "format.") || strings.HasPrefix(key, "timezone.") {
		affectedModules = []string{"All Modules (UI & Reports)"}
	} else {
		affectedModules = []string{"Control Center"}
	}

	return map[string]interface{}{
		"setting_key":           key,
		"current_value":         oldVal,
		"proposed_value":        newValue,
		"affected_modules":      affectedModules,
		"requires_logout":       strings.HasPrefix(key, "security."),
		"effective_immediately": true,
	}, nil
}
