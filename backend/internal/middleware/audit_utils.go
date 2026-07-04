package middleware

import (
	"encoding/json"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

// LogAuditWithTx writes an audit log entry using an active transaction.
func LogAuditWithTx(tx *gorm.DB, companyID, userID uint64, action, entityName string, entityID uint64, newValues interface{}) {
	var newStr *string

	if newValues != nil {
		if b, err := json.Marshal(newValues); err == nil {
			str := string(b)
			newStr = &str
		}
	}

	audit := models.AuditLog{
		CompanyID:  companyID,
		UserID:     &userID,
		Action:     action,
		EntityName: entityName,
		EntityID:   &entityID,
		NewValues:  newStr,
	}

	tx.Create(&audit)
}
