package services

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/auth/dto"
	"github.com/pixandco/erp-phrma/internal/company/models"
	platformModels "github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Login(req dto.LoginRequest, platformCompany *platformModels.PlatformCompany) (*dto.LoginResponse, error) {
	var user models.User

	// 1. Find user by email
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		s.logFailedLogin(nil, req.Email, "User not found")
		return nil, errors.New("invalid credentials")
	}

	// 2. Check user status
	if user.Status != "active" {
		s.logFailedLogin(&user.ID, req.Email, "User is not active: "+user.Status)
		return nil, errors.New("user account is " + user.Status)
	}

	// 3. Verify password
	if !security.CheckPasswordHash(req.Password, user.PasswordHash) {
		s.logFailedLogin(&user.ID, req.Email, "Invalid password")
		return nil, errors.New("invalid credentials")
	}

	// 4. Find user's branches
	var branchAccesses []models.UserBranchAccess
	s.db.Preload("Branch").Where("user_id = ? AND status = ?", user.ID, "active").Find(&branchAccesses)
	if len(branchAccesses) == 0 {
		s.logFailedLogin(&user.ID, req.Email, "No branch access")
		return nil, errors.New("No branch access assigned to this user")
	}

	var activeBranch models.Branch
	foundDefaultBranch := false
	for _, ba := range branchAccesses {
		if user.DefaultBranchID != nil && ba.BranchID == *user.DefaultBranchID {
			activeBranch = ba.Branch
			foundDefaultBranch = true
			break
		}
	}
	if !foundDefaultBranch {
		activeBranch = branchAccesses[0].Branch
	}

	// 5. Find user's software
	var softwareAccesses []models.UserSoftwareAccess
	s.db.Preload("Software").Where("user_id = ? AND status = ?", user.ID, "active").Find(&softwareAccesses)
	if len(softwareAccesses) == 0 {
		s.logFailedLogin(&user.ID, req.Email, "No software access")
		return nil, errors.New("No software access assigned to this user")
	}

	var activeSoftware models.SoftwareModule
	foundControlCenter := false
	for _, sa := range softwareAccesses {
		if sa.Software.SoftwareCode == "CONTROL_CENTER" {
			activeSoftware = sa.Software
			foundControlCenter = true
			break
		}
	}
	if !foundControlCenter {
		activeSoftware = softwareAccesses[0].Software
	}

	// 6. Generate JWT
	claims := security.AuthClaims{
		UserID:             user.ID,
		CompanyCode:        platformCompany.CompanyCode,
		CompanyID:          user.CompanyID,
		ActiveBranchID:     activeBranch.ID,
		ActiveSoftwareCode: activeSoftware.SoftwareCode,
	}

	token, err := security.GenerateToken(claims)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	// 7. Log successful login
	now := time.Now()
	s.db.Create(&models.LoginLog{
		UserID:      &user.ID,
		Email:       user.Email,
		LoginStatus: "success",
		LoggedAt:    &now,
	})

	// Update last_login_at
	s.db.Model(&user).Update("last_login_at", &now)

	// 8. Load permissions for active context
	permissions := s.GetUserPermissionsForActiveContext(user.ID, activeBranch.ID, activeSoftware.ID)

	// 9. Build response
	return s.BuildLoginContext(token, user, *platformCompany, activeBranch, activeSoftware, branchAccesses, softwareAccesses, permissions), nil
}

func (s *AuthService) BuildLoginContext(token string, user models.User, company platformModels.PlatformCompany, activeBranch models.Branch, activeSoftware models.SoftwareModule, branchAccesses []models.UserBranchAccess, softwareAccesses []models.UserSoftwareAccess, permissions []string) *dto.LoginResponse {
	var branchDTOs []dto.BranchDTO
	for _, ba := range branchAccesses {
		branchDTOs = append(branchDTOs, dto.BranchDTO{
			ID:         ba.Branch.ID,
			BranchCode: ba.Branch.BranchCode,
			BranchName: ba.Branch.BranchName,
		})
	}

	var softwareDTOs []dto.SoftwareDTO
	for _, sa := range softwareAccesses {
		softwareDTOs = append(softwareDTOs, dto.SoftwareDTO{
			SoftwareCode: sa.Software.SoftwareCode,
			SoftwareName: sa.Software.SoftwareName,
		})
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserDTO{
			ID:       user.ID,
			Name:     user.Name,
			Email:    user.Email,
			UserType: user.UserType,
		},
		Company: dto.CompanyDTO{
			ID:          user.CompanyID, // Should ideally be platformCompany.ID if we return platform ID, but usually it's the internal company ID
			CompanyCode: company.CompanyCode,
			CompanyName: company.CompanyName,
		},
		ActiveBranch: dto.BranchDTO{
			ID:         activeBranch.ID,
			BranchCode: activeBranch.BranchCode,
			BranchName: activeBranch.BranchName,
		},
		ActiveSoftware: dto.SoftwareDTO{
			SoftwareCode: activeSoftware.SoftwareCode,
			SoftwareName: activeSoftware.SoftwareName,
		},
		Branches:        branchDTOs,
		SoftwareModules: softwareDTOs,
		Permissions:     permissions,
	}
}

func (s *AuthService) GetUserPermissionsForActiveContext(userID, branchID, softwareID uint64) []string {
	// Find roles assigned to user for this branch and software
	var matrix []models.UserBranchSoftwareRole
	s.db.Where("user_id = ? AND branch_id = ? AND software_id = ? AND status = ?", userID, branchID, softwareID, "active").Find(&matrix)

	if len(matrix) == 0 {
		return []string{}
	}

	var roleIDs []uint64
	for _, m := range matrix {
		roleIDs = append(roleIDs, m.RoleID)
	}

	var rolePermissions []models.RolePermission
	s.db.Preload("Permission").Where("role_id IN ?", roleIDs).Find(&rolePermissions)

	permMap := make(map[string]bool)
	var permissions []string
	for _, rp := range rolePermissions {
		if rp.Permission.Status == "active" {
			if !permMap[rp.Permission.PermissionKey] {
				permMap[rp.Permission.PermissionKey] = true
				permissions = append(permissions, rp.Permission.PermissionKey)
			}
		}
	}

	return permissions
}

func (s *AuthService) logFailedLogin(userID *uint64, email string, reason string) {
	now := time.Now()
	s.db.Create(&models.LoginLog{
		UserID:        userID,
		Email:         email,
		LoginStatus:   "failed",
		FailureReason: reason,
		LoggedAt:      &now,
	})
}
