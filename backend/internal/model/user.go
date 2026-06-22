package model

// User represents a system user belonging to a company and branch.
type User struct {
	BaseModel
	TenantModel
	Email         string  `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash  string  `gorm:"size:255;not null" json:"-"` // Never serialize password hash
	FullName      string  `gorm:"size:255;not null" json:"full_name"`
	Phone         string  `gorm:"size:50" json:"phone"`
	IsActive      bool    `gorm:"default:true;not null" json:"is_active"`
	DesignationID *uint64 `gorm:"index" json:"designation_id,omitempty"`
	// Relationships
	Company     Company      `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Branch      Branch       `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Designation *Designation `gorm:"foreignKey:DesignationID" json:"designation,omitempty"`
	Roles       []Role       `gorm:"many2many:user_roles" json:"roles,omitempty"`
	Sessions    []Session    `gorm:"foreignKey:UserID" json:"-"`
}

func (User) TableName() string {
	return "users"
}
