package model

// Permission represents a granular action that can be performed on a resource.
// Format: module:resource:action (e.g., "finance:journal_entries:create")
//
// Permissions are global (not company-scoped) — they define what CAN be done.
// Roles (company-scoped) determine WHO can do it.
type Permission struct {
	ID       uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	Module   string `gorm:"size:50;not null;index:idx_perm_slug" json:"module"`   // e.g., "finance", "auth", "inventory"
	Resource string `gorm:"size:50;not null;index:idx_perm_slug" json:"resource"` // e.g., "journal_entries", "users"
	Action   string `gorm:"size:50;not null;index:idx_perm_slug" json:"action"`   // e.g., "create", "read", "update", "delete", "approve"
	Slug     string `gorm:"size:150;uniqueIndex;not null" json:"slug"`            // e.g., "finance.journal_entries.create"
	// Relationships
	Roles    []Role `gorm:"many2many:role_permissions" json:"roles,omitempty"`
}

func (Permission) TableName() string {
	return "permissions"
}
