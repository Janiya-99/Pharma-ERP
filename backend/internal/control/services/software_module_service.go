package services

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type SoftwareModuleService struct {
	repo *repositories.SoftwareModuleRepository
}

func NewSoftwareModuleService(repo *repositories.SoftwareModuleRepository) *SoftwareModuleService {
	return &SoftwareModuleService{repo: repo}
}

func (s *SoftwareModuleService) ListActive() ([]models.SoftwareModule, error) {
	return s.repo.ListActive()
}
