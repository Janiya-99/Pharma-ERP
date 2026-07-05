package seeders

import (
	"encoding/json"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedApprovalWorkflows(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	if companyID == 0 {
		return nil
	}

	logger.Info("Seeding default approval workflows for company...", zap.Uint64("company_id", companyID))

	// Find some roles to assign if available
	var financeRole, warehouseRole, adminRole models.Role
	db.Where("name LIKE ? OR code LIKE ?", "%Finance%", "%FINANCE%").First(&financeRole)
	db.Where("name LIKE ? OR code LIKE ?", "%Warehouse%", "%WAREHOUSE%").First(&warehouseRole)
	db.Where("name LIKE ? OR code LIKE ?", "%Admin%", "%ADMIN%").First(&adminRole)

	now := time.Now()

	workflows := []models.ApprovalWorkflow{
		{
			CompanyID:    companyID,
			Name:         "Journal Entry Approval Policy",
			Code:         "WF_JE_DEFAULT",
			Module:       "Finance",
			DocumentType: "JOURNAL_ENTRY",
			BranchScope:  "all_branches",
			Description:  "Two-stage approval for journal entries based on amount thresholds",
			Status:       "published",
			VersionNumber: 1,
			Priority:     1,
			IsDefault:    true,
			CreatedBy:    1,
			UpdatedBy:    1,
			PublishedBy:  func() *uint64 { id := uint64(1); return &id }(),
			PublishedAt:  &now,
			CreatedAt:    now,
			UpdatedAt:    now,
			Stages: []models.ApprovalWorkflowStage{
				{
					StageNumber:           1,
					StageName:             "Senior Accountant Review",
					StageDescription:      "Standard review for journal entries up to Rs. 500,000",
					ApproverType:          "role",
					ApproverRoleID:        func() *uint64 { if financeRole.ID != 0 { return &financeRole.ID }; return nil }(),
					MinimumAmount:         0,
					MaximumAmount:         500000,
					SLATimeout:            24,
					SLAUnit:               "hours",
					CanApproveOwnDocument: false,
					MinimumApprovalsRequired: 1,
					ApprovalMode:          "any_one",
					CreatedAt:             now,
					UpdatedAt:             now,
				},
				{
					StageNumber:           2,
					StageName:             "Finance Manager / CFO Approval",
					StageDescription:      "Executive approval for journal entries exceeding Rs. 500,000",
					ApproverType:          "role",
					ApproverRoleID:        func() *uint64 { if adminRole.ID != 0 { return &adminRole.ID }; return nil }(),
					MinimumAmount:         500000.01,
					MaximumAmount:         999999999999,
					SLATimeout:            48,
					SLAUnit:               "hours",
					CanApproveOwnDocument: false,
					MinimumApprovalsRequired: 1,
					ApprovalMode:          "any_one",
					CreatedAt:             now,
					UpdatedAt:             now,
				},
			},
		},
		{
			CompanyID:    companyID,
			Name:         "Goods Receipt Note Approval Policy",
			Code:         "WF_GRN_DEFAULT",
			Module:       "Inventory",
			DocumentType: "GOODS_RECEIPT_NOTE",
			BranchScope:  "all_branches",
			Description:  "Warehouse Manager verification and Procurement review for stock receipts",
			Status:       "published",
			VersionNumber: 1,
			Priority:     1,
			IsDefault:    true,
			CreatedBy:    1,
			UpdatedBy:    1,
			PublishedBy:  func() *uint64 { id := uint64(1); return &id }(),
			PublishedAt:  &now,
			CreatedAt:    now,
			UpdatedAt:    now,
			Stages: []models.ApprovalWorkflowStage{
				{
					StageNumber:           1,
					StageName:             "Warehouse Supervisor Verification",
					StageDescription:      "Physical stock inspection and GRN verification",
					ApproverType:          "role",
					ApproverRoleID:        func() *uint64 { if warehouseRole.ID != 0 { return &warehouseRole.ID }; return nil }(),
					MinimumAmount:         0,
					MaximumAmount:         1000000,
					SLATimeout:            12,
					SLAUnit:               "hours",
					CanApproveOwnDocument: false,
					MinimumApprovalsRequired: 1,
					ApprovalMode:          "any_one",
					CreatedAt:             now,
					UpdatedAt:             now,
				},
			},
		},
	}

	for _, wf := range workflows {
		var count int64
		db.Model(&models.ApprovalWorkflow{}).Where("company_id = ? AND code = ?", companyID, wf.Code).Count(&count)
		if count == 0 {
			if err := db.Create(&wf).Error; err != nil {
				logger.Error("Failed to seed approval workflow", zap.Error(err), zap.String("code", wf.Code))
			} else {
				// Save version snapshot
				wfBytes, _ := json.Marshal(wf)
				ver := models.ApprovalWorkflowVersion{
					WorkflowID:    wf.ID,
					CompanyID:     companyID,
					Name:          wf.Name,
					Code:          wf.Code,
					Module:        wf.Module,
					DocumentType:  wf.DocumentType,
					BranchScope:   wf.BranchScope,
					WorkflowJSON:  wfBytes,
					VersionNumber: 1,
					PublishedBy:   wf.PublishedBy,
					PublishedAt:   &now,
					CreatedAt:     now,
				}
				db.Create(&ver)
			}
		}
	}

	logger.Info("Approval workflows seeding completed successfully")
	return nil
}
