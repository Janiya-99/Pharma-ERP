package service

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/crypto"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// UserService handles user business logic.
type UserService struct {
	userRepo *repository.UserRepository
	db       *gorm.DB
	logger   *zap.Logger
}

func NewUserService(userRepo *repository.UserRepository, db *gorm.DB, logger *zap.Logger) *UserService {
	return &UserService{userRepo: userRepo, db: db, logger: logger}
}

func (s *UserService) GetByID(id uint64) (*model.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("User")
	}
	return user, nil
}

func (s *UserService) List(companyID uint64, req *dto.PaginationRequest) ([]model.User, int64, error) {
	return s.userRepo.List(companyID, req)
}

func (s *UserService) Create(companyID uint64, req *request.CreateUserRequest) (*model.User, error) {
	// Check duplicate email
	exists, err := s.userRepo.EmailExists(req.Email, 0)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	if exists {
		return nil, errs.ErrConflict("Email already registered")
	}

	// Hash password
	hash, err := crypto.HashPassword(req.Password)
	if err != nil {
		return nil, errs.ErrInternal(err)
	}

	user := &model.User{
		TenantModel: model.TenantModel{
			CompanyID: companyID,
			BranchID:  req.BranchID,
		},
		Email:         req.Email,
		PasswordHash:  hash,
		FullName:      req.FullName,
		Phone:         req.Phone,
		IsActive:      true,
		DesignationID: req.DesignationID,
	}

	if err := s.userRepo.Create(nil, user); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	// Assign roles if provided
	if len(req.RoleIDs) > 0 {
		if err := s.userRepo.AssignRoles(nil, user.ID, req.RoleIDs); err != nil {
			s.logger.Error("failed to assign roles", zap.Error(err))
		}
	}

	return user, nil
}

func (s *UserService) Update(id uint64, req *request.UpdateUserRequest) (*model.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("User")
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.BranchID > 0 {
		user.BranchID = req.BranchID
	}
	user.DesignationID = req.DesignationID
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.userRepo.Update(nil, user); err != nil {
		return nil, errs.ErrDatabase(err)
	}

	if len(req.RoleIDs) > 0 {
		if err := s.userRepo.AssignRoles(nil, user.ID, req.RoleIDs); err != nil {
			s.logger.Error("failed to update roles", zap.Error(err))
		}
	}

	return user, nil
}

func (s *UserService) Delete(id uint64) error {
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		return errs.ErrNotFound("User")
	}
	if err := s.userRepo.Delete(id); err != nil {
		return errs.ErrDatabase(err)
	}
	return nil
}
