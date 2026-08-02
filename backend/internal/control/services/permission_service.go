package services

import (
	"math"

	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type PermissionService struct {
	repo *repositories.PermissionRepository
}

func NewPermissionService(repo *repositories.PermissionRepository) *PermissionService {
	return &PermissionService{repo: repo}
}

func (s *PermissionService) ListPermissions(softwareID, softwareCode, permissionGroup, status, search string, page, limit int) ([]dto.PermissionResponse, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	permissions, count, err := s.repo.FindPermissions(softwareID, softwareCode, permissionGroup, status, search, offset, limit)
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

	var res []dto.PermissionResponse
	for _, p := range permissions {
		res = append(res, dto.PermissionResponse{
			ID:              p.ID,
			SoftwareID:      p.SoftwareID,
			SoftwareCode:    p.Software.SoftwareCode,
			PermissionGroup: p.PermissionGroup,
			PermissionKey:   p.PermissionKey,
			PermissionName:  p.PermissionName,
			Description:     p.Description,
			Status:          p.Status,
		})
	}

	return res, pagination, nil
}

func (s *PermissionService) ListPermissionsGrouped(softwareID, softwareCode string) ([]dto.SoftwarePermissionsResponse, error) {
	permissions, err := s.repo.FindPermissionsGrouped(softwareID, softwareCode)
	if err != nil {
		return nil, err
	}

	isAllModules := s.repo.IsAllModules(softwareID, softwareCode)

	if isAllModules {
		var groupOrder []string
		groupMap := make(map[string][]dto.PermissionItem)

		for _, p := range permissions {
			gname := p.Software.SoftwareName + " - " + p.PermissionGroup
			if _, ok := groupMap[gname]; !ok {
				groupOrder = append(groupOrder, gname)
			}
			item := dto.PermissionItem{
				ID:             p.ID,
				PermissionKey:  p.PermissionKey,
				PermissionName: p.PermissionName,
			}
			groupMap[gname] = append(groupMap[gname], item)
		}

		var groups []dto.PermissionGroupResponse
		for _, gname := range groupOrder {
			groups = append(groups, dto.PermissionGroupResponse{
				PermissionGroup: gname,
				Permissions:     groupMap[gname],
			})
		}

		return []dto.SoftwarePermissionsResponse{
			{
				SoftwareCode: "ALL_MODULES",
				Groups:       groups,
			},
		}, nil
	}

	// Group by SoftwareCode then PermissionGroup
	groupedMap := make(map[string]map[string][]dto.PermissionItem)

	for _, p := range permissions {
		if _, ok := groupedMap[p.Software.SoftwareCode]; !ok {
			groupedMap[p.Software.SoftwareCode] = make(map[string][]dto.PermissionItem)
		}

		item := dto.PermissionItem{
			ID:             p.ID,
			PermissionKey:  p.PermissionKey,
			PermissionName: p.PermissionName,
		}
		groupedMap[p.Software.SoftwareCode][p.PermissionGroup] = append(groupedMap[p.Software.SoftwareCode][p.PermissionGroup], item)
	}

	var res []dto.SoftwarePermissionsResponse
	for scode, groupMap := range groupedMap {
		var groups []dto.PermissionGroupResponse
		for gname, items := range groupMap {
			groups = append(groups, dto.PermissionGroupResponse{
				PermissionGroup: gname,
				Permissions:     items,
			})
		}
		res = append(res, dto.SoftwarePermissionsResponse{
			SoftwareCode: scode,
			Groups:       groups,
		})
	}

	return res, nil
}
