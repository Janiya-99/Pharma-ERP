package services

import (
	"errors"
	"math"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	repo         *repositories.UserRepository
	branchRepo   *repositories.UserBranchAccessRepository
	deptRepo     *repositories.DepartmentRepository
	desigRepo    *repositories.DesignationRepository
	auditService *AuditService
}

func NewUserService(repo *repositories.UserRepository, branchRepo *repositories.UserBranchAccessRepository, deptRepo *repositories.DepartmentRepository, desigRepo *repositories.DesignationRepository, auditService *AuditService) *UserService {
	return &UserService{
		repo:         repo,
		branchRepo:   branchRepo,
		deptRepo:     deptRepo,
		desigRepo:    desigRepo,
		auditService: auditService,
	}
}

func mapUserToResponse(user *models.User, branches []models.UserBranchAccess) dto.UserResponse {
	deptName := ""
	if user.Department != nil {
		deptName = user.Department.DepartmentName
	}
	desigName := ""
	if user.Designation != nil {
		desigName = user.Designation.DesignationName
	}
	branchName := ""
	if user.DefaultBranch != nil {
		branchName = user.DefaultBranch.BranchName
	}

	res := dto.UserResponse{
		ID:                  user.ID,
		EmployeeCode:        user.EmployeeCode,
		Name:                user.Name,
		FullName:            user.Name,
		DisplayName:         user.Name,
		Email:               user.Email,
		Phone:               user.Phone,
		Department:          deptName,
		Designation:         desigName,
		DefaultBranch:       branchName,
		DepartmentID:        user.DepartmentID,
		DesignationID:       user.DesignationID,
		DefaultBranchID:     user.DefaultBranchID,
		UserType:            user.UserType,
		Status:              user.Status,
		ProfileImageURL:     user.ProfileImageURL,
		AvatarURL:           user.ProfileImageURL,
		LoginCount:          user.LoginCount,
		LoginEnabled:        user.LoginEnabled,
		TwoFactorEnabled:    user.TwoFactorEnabled,
		ForcePasswordChange: user.ForcePasswordChange,
		AssignedBranches:    branches,
	}

	if user.LastLoginAt != nil {
		s := user.LastLoginAt.Format(time.RFC3339)
		res.LastLoginAt = &s
	}
	if !user.CreatedAt.IsZero() {
		s := user.CreatedAt.Format(time.RFC3339)
		res.CreatedAt = &s
	}
	if !user.UpdatedAt.IsZero() {
		s := user.UpdatedAt.Format(time.RFC3339)
		res.UpdatedAt = &s
	}

	return res
}

func (s *UserService) ListUsers(search, departmentID, designationID, status, userType string, page, limit int) ([]dto.UserResponse, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	users, count, err := s.repo.FindUsers(search, departmentID, designationID, status, userType, offset, limit)
	if err != nil {
		return nil, nil, err
	}

	totalPages := int(math.Ceil(float64(count) / float64(limit)))

	pagination := &dto.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      count,
		TotalPages: totalPages,
	}

	var userResponses []dto.UserResponse
	for _, user := range users {
		userResponses = append(userResponses, mapUserToResponse(&user, nil))
	}

	return userResponses, pagination, nil
}

func (s *UserService) GetUserByID(id uint64) (*dto.UserResponse, error) {
	user, err := s.repo.FindUserByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	branches, _ := s.branchRepo.FindUserBranches(id)
	res := mapUserToResponse(user, branches)
	return &res, nil
}

func (s *UserService) CreateUser(req dto.CreateUserRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.UserResponse, error) {
	existing, _ := s.repo.FindUserByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already exists")
	}

	if req.EmployeeCode != "" {
		existingCode, _ := s.repo.FindUserByEmployeeCode(req.EmployeeCode)
		if existingCode != nil {
			return nil, errors.New("employee code already exists")
		}
	}

	if req.DepartmentID > 0 {
		if _, err := s.deptRepo.GetByID(req.DepartmentID); err != nil {
			return nil, errors.New("department not found")
		}
	}

	if req.DesignationID > 0 {
		if _, err := s.desigRepo.GetByID(req.DesignationID); err != nil {
			return nil, errors.New("designation not found")
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	var deptID *uint64
	if req.DepartmentID > 0 {
		deptID = &req.DepartmentID
	}

	var desigID *uint64
	if req.DesignationID > 0 {
		desigID = &req.DesignationID
	}

	var defaultBranchID *uint64
	if req.DefaultBranchID > 0 {
		defaultBranchID = &req.DefaultBranchID
	}

	user := &models.User{
		CompanyID:           companyID,
		EmployeeCode:        req.EmployeeCode,
		Name:                req.Name,
		Email:               req.Email,
		Phone:               req.Phone,
		PasswordHash:        string(hashedPassword),
		DepartmentID:        deptID,
		DesignationID:       desigID,
		DefaultBranchID:     defaultBranchID,
		UserType:            req.UserType,
		Status:              req.Status,
		ProfileImageURL:     req.AvatarURL,
		LoginEnabled:        req.LoginEnabled,
		TwoFactorEnabled:    req.TwoFactorEnabled,
		ForcePasswordChange: req.ForcePasswordChange,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, errors.New("failed to create user")
	}

	// Create user_branch_access if default branch is provided
	if req.DefaultBranchID > 0 {
		access := &models.UserBranchAccess{
			UserID:    user.ID,
			BranchID:  req.DefaultBranchID,
			IsDefault: true,
			Status:    "active",
			CreatedBy: &activeUserID,
		}
		_ = s.branchRepo.CreateOrUpdateUserBranchAccess(access)
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_CREATED", "user", &user.ID, nil, user, ipAddress, userAgent,
	)

	return s.GetUserByID(user.ID)
}

func (s *UserService) UpdateUser(id uint64, req dto.UpdateUserRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.UserResponse, error) {
	user, err := s.repo.FindUserByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if req.Email != user.Email {
		existing, _ := s.repo.FindUserByEmail(req.Email)
		if existing != nil && existing.ID != id {
			return nil, errors.New("email already exists")
		}
	}

	if req.EmployeeCode != "" && req.EmployeeCode != user.EmployeeCode {
		existingCode, _ := s.repo.FindUserByEmployeeCode(req.EmployeeCode)
		if existingCode != nil && existingCode.ID != id {
			return nil, errors.New("employee code already exists")
		}
	}

	if req.DefaultBranchID > 0 {
		access, err := s.branchRepo.FindUserBranchAccess(id, req.DefaultBranchID)
		if err != nil || access == nil {
			access = &models.UserBranchAccess{
				UserID:    id,
				BranchID:  req.DefaultBranchID,
				IsDefault: true,
				Status:    "active",
				CreatedBy: &activeUserID,
			}
			_ = s.branchRepo.CreateOrUpdateUserBranchAccess(access)
		}
	}

	oldValues := *user

	user.EmployeeCode = req.EmployeeCode
	user.Name = req.Name
	user.Email = req.Email
	user.Phone = req.Phone
	user.UserType = req.UserType
	user.Status = req.Status
	user.LoginEnabled = req.LoginEnabled
	user.TwoFactorEnabled = req.TwoFactorEnabled
	user.ForcePasswordChange = req.ForcePasswordChange
	if req.AvatarURL != "" {
		user.ProfileImageURL = req.AvatarURL
	}

	if req.DepartmentID > 0 {
		user.DepartmentID = &req.DepartmentID
	} else {
		user.DepartmentID = nil
	}

	if req.DesignationID > 0 {
		user.DesignationID = &req.DesignationID
	} else {
		user.DesignationID = nil
	}

	if req.DefaultBranchID > 0 {
		user.DefaultBranchID = &req.DefaultBranchID
	} else {
		user.DefaultBranchID = nil
	}

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, errors.New("failed to update user")
	}

	// Make sure only the new default branch has is_default = true
	if req.DefaultBranchID > 0 {
		branches, _ := s.branchRepo.FindUserBranches(id)
		for _, b := range branches {
			if b.BranchID == req.DefaultBranchID {
				if !b.IsDefault {
					b.IsDefault = true
					_ = s.branchRepo.CreateOrUpdateUserBranchAccess(&b)
				}
			} else {
				if b.IsDefault {
					b.IsDefault = false
					_ = s.branchRepo.CreateOrUpdateUserBranchAccess(&b)
				}
			}
		}
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_UPDATED", "user", &user.ID, oldValues, user, ipAddress, userAgent,
	)

	return s.GetUserByID(user.ID)
}

func (s *UserService) DeleteUser(id uint64, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	user, err := s.repo.FindUserByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	if id == activeUserID {
		return errors.New("cannot delete yourself")
	}

	if user.UserType == "super_admin" && user.Status == "active" {
		count, _ := s.repo.CountActiveSuperAdmins()
		if count <= 1 {
			return errors.New("cannot delete the last active super_admin")
		}
	}

	if err := s.repo.SoftDeleteUser(id); err != nil {
		return errors.New("failed to delete user")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_DELETED", "user", &user.ID, user, nil, ipAddress, userAgent,
	)

	return nil
}

func (s *UserService) ChangeUserStatus(id uint64, req dto.ChangeUserStatusRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) (*dto.UserResponse, error) {
	user, err := s.repo.FindUserByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if id == activeUserID {
		return nil, errors.New("cannot change your own status")
	}

	if user.UserType == "super_admin" && user.Status == "active" && req.Status != "active" {
		count, _ := s.repo.CountActiveSuperAdmins()
		if count <= 1 {
			return nil, errors.New("cannot disable the last active super_admin")
		}
	}

	oldValues := *user
	user.Status = req.Status

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, errors.New("failed to update user status")
	}

	statusChangeData := map[string]string{
		"new_status": req.Status,
		"reason":     req.Reason,
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_STATUS_CHANGED", "user", &user.ID, oldValues, statusChangeData, ipAddress, userAgent,
	)

	return s.GetUserByID(user.ID)
}

func (s *UserService) ResetUserPassword(id uint64, req dto.ResetPasswordRequest, companyID, activeUserID, activeBranchID uint64, ipAddress, userAgent string) error {
	user, err := s.repo.FindUserByID(id)
	if err != nil {
		return errors.New("user not found")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	user.PasswordHash = string(hashedPassword)

	if err := s.repo.UpdateUser(user); err != nil {
		return errors.New("failed to reset user password")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &activeUserID, "CONTROL_CENTER",
		"USER_PASSWORD_RESET", "user", &user.ID, nil, nil, ipAddress, userAgent,
	)

	return nil
}
