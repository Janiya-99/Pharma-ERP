package dto

import "github.com/pixandco/erp-phrma/internal/company/models"

type CreateUserRequest struct {
	EmployeeCode        string `json:"employee_code"`
	Name                string `json:"name" binding:"required"`
	DisplayName         string `json:"display_name"`
	Email               string `json:"email" binding:"required,email"`
	Phone               string `json:"phone"`
	DepartmentID        uint64 `json:"department_id"`
	DesignationID       uint64 `json:"designation_id"`
	DefaultBranchID     uint64 `json:"default_branch_id"`
	UserType            string `json:"user_type" binding:"required,oneof=super_admin company_user"`
	Password            string `json:"password" binding:"required,min=8"`
	ConfirmPassword     string `json:"confirm_password" binding:"required,eqfield=Password"`
	Status              string `json:"status" binding:"required,oneof=active inactive suspended locked"`
	AvatarURL           string `json:"avatar_url"`
	LoginEnabled        bool   `json:"login_enabled"`
	TwoFactorEnabled    bool   `json:"two_factor_enabled"`
	ForcePasswordChange bool   `json:"force_password_change"`
}

type UpdateUserRequest struct {
	EmployeeCode        string `json:"employee_code"`
	Name                string `json:"name" binding:"required"`
	DisplayName         string `json:"display_name"`
	Email               string `json:"email" binding:"required,email"`
	Phone               string `json:"phone"`
	DepartmentID        uint64 `json:"department_id"`
	DesignationID       uint64 `json:"designation_id"`
	DefaultBranchID     uint64 `json:"default_branch_id"`
	UserType            string `json:"user_type" binding:"required,oneof=super_admin company_user"`
	Status              string `json:"status" binding:"required,oneof=active inactive suspended locked"`
	AvatarURL           string `json:"avatar_url"`
	LoginEnabled        bool   `json:"login_enabled"`
	TwoFactorEnabled    bool   `json:"two_factor_enabled"`
	ForcePasswordChange bool   `json:"force_password_change"`
}

type ChangeUserStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=active inactive suspended locked"`
	Reason string `json:"reason"`
}

type ResetPasswordRequest struct {
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}

type UserResponse struct {
	ID                  uint64                      `json:"id"`
	EmployeeCode        string                      `json:"employee_code"`
	Name                string                      `json:"name"`
	Email               string                      `json:"email"`
	Phone               string                      `json:"phone"`
	Department          string                      `json:"department"`
	Designation         string                      `json:"designation"`
	DefaultBranch       string                      `json:"default_branch"`
	DepartmentID        *uint64                     `json:"department_id,omitempty"`
	DesignationID       *uint64                     `json:"designation_id,omitempty"`
	DefaultBranchID     *uint64                     `json:"default_branch_id,omitempty"`
	UserType            string                      `json:"user_type"`
	Status              string                      `json:"status"`
	ProfileImageURL     string                      `json:"profile_image_url"`
	AvatarURL           string                      `json:"avatar_url"`
	LastLoginAt         *string                     `json:"last_login_at"`
	LoginCount          int                         `json:"login_count"`
	CreatedAt           *string                     `json:"created_at,omitempty"`
	UpdatedAt           *string                     `json:"updated_at,omitempty"`
	LoginEnabled        bool                        `json:"login_enabled"`
	TwoFactorEnabled    bool                        `json:"two_factor_enabled"`
	ForcePasswordChange bool                        `json:"force_password_change"`
	FullName            string                      `json:"full_name"`
	DisplayName         string                      `json:"display_name"`
	Roles               []models.Role               `json:"roles,omitempty"`
	AssignedBranches    []models.UserBranchAccess   `json:"assigned_branches,omitempty"`
	AssignedSoftware    []models.UserSoftwareAccess `json:"assigned_software,omitempty"`
}
