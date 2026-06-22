package model

// Role represents a named set of permissions within a company.
// System roles (is_system=true) cannot be deleted.
type Role struct {
	BaseModel
	CompanyScopedModel
	Name        string `gorm:"size:100;not null" json:"name"`
	Slug        string `gorm:"size:100;uniqueIndex:idx_role_slug;not null" json:"slug"`
	Description string `gorm:"size:255" json:"description"`
	IsSystem    bool   `gorm:"default:false;not null" json:"is_system"`
	// Relationships
	Permissions []Permission `gorm:"many2many:role_permissions" json:"permissions,omitempty"`
	Users       []User       `gorm:"many2many:user_roles" json:"users,omitempty"`
}

func (Role) TableName() string {
	return "roles"
}
