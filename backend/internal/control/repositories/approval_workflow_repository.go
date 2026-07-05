package repositories

import (
	"encoding/json"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type ApprovalWorkflowRepository struct {
	db *gorm.DB
}

func NewApprovalWorkflowRepository(db *gorm.DB) *ApprovalWorkflowRepository {
	return &ApprovalWorkflowRepository{db: db}
}

// GetDB returns the underlying GORM database
func (r *ApprovalWorkflowRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *ApprovalWorkflowRepository) ListWorkflows(companyID uint64, module string, docType string, status string) ([]models.ApprovalWorkflow, error) {
	query := r.db.Where("company_id = ?", companyID).Preload("Stages").Preload("Stages.Approvers")
	if module != "" {
		query = query.Where("module = ?", module)
	}
	if docType != "" {
		query = query.Where("document_type = ?", docType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	var workflows []models.ApprovalWorkflow
	err := query.Order("priority ASC, id DESC").Find(&workflows).Error
	return workflows, err
}

func (r *ApprovalWorkflowRepository) GetByID(id uint64) (*models.ApprovalWorkflow, error) {
	var wf models.ApprovalWorkflow
	err := r.db.Preload("Stages").Preload("Stages.Approvers").Where("id = ?", id).First(&wf).Error
	if err != nil {
		return nil, err
	}
	return &wf, nil
}

func (r *ApprovalWorkflowRepository) GetByCode(companyID uint64, code string) (*models.ApprovalWorkflow, error) {
	var wf models.ApprovalWorkflow
	err := r.db.Preload("Stages").Preload("Stages.Approvers").Where("company_id = ? AND code = ?", companyID, code).First(&wf).Error
	if err != nil {
		return nil, err
	}
	return &wf, nil
}

func (r *ApprovalWorkflowRepository) GetActiveForDocument(companyID uint64, branchID uint64, module string, docType string) (*models.ApprovalWorkflow, error) {
	var workflows []models.ApprovalWorkflow
	err := r.db.Preload("Stages").Preload("Stages.Approvers").
		Where("company_id = ? AND module = ? AND document_type = ? AND status = ?", companyID, module, docType, "published").
		Order("priority ASC, id DESC").Find(&workflows).Error
	if err != nil {
		return nil, err
	}

	for _, wf := range workflows {
		if wf.BranchScope == "all_branches" {
			return &wf, nil
		}
		if wf.BranchScope == "single_branch" && wf.BranchID != nil && *wf.BranchID == branchID {
			return &wf, nil
		}
		if wf.BranchScope == "selected_branches" && len(wf.SelectedBranchesJSON) > 0 {
			var branchIDs []uint64
			if err := json.Unmarshal(wf.SelectedBranchesJSON, &branchIDs); err == nil {
				for _, bID := range branchIDs {
					if bID == branchID {
						return &wf, nil
					}
				}
			}
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *ApprovalWorkflowRepository) Save(wf *models.ApprovalWorkflow) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Save(wf).Error
}

func (r *ApprovalWorkflowRepository) Delete(id uint64) error {
	return r.db.Delete(&models.ApprovalWorkflow{}, id).Error
}

func (r *ApprovalWorkflowRepository) CreateVersion(ver *models.ApprovalWorkflowVersion) error {
	return r.db.Create(ver).Error
}

func (r *ApprovalWorkflowRepository) ListVersions(workflowID uint64) ([]models.ApprovalWorkflowVersion, error) {
	var versions []models.ApprovalWorkflowVersion
	err := r.db.Where("workflow_id = ?", workflowID).Order("version_number DESC").Find(&versions).Error
	return versions, err
}

func (r *ApprovalWorkflowRepository) CreateInstance(inst *models.ApprovalWorkflowInstance) error {
	return r.db.Create(inst).Error
}

func (r *ApprovalWorkflowRepository) SaveInstance(inst *models.ApprovalWorkflowInstance) error {
	return r.db.Save(inst).Error
}

func (r *ApprovalWorkflowRepository) GetInstanceByDocument(companyID uint64, module string, docType string, docID uint64) (*models.ApprovalWorkflowInstance, error) {
	var inst models.ApprovalWorkflowInstance
	err := r.db.Where("company_id = ? AND module = ? AND document_type = ? AND document_id = ?", companyID, module, docType, docID).Order("id DESC").First(&inst).Error
	if err != nil {
		return nil, err
	}
	return &inst, nil
}

func (r *ApprovalWorkflowRepository) CreateInstanceLog(log *models.ApprovalWorkflowInstanceLog) error {
	return r.db.Create(log).Error
}

func (r *ApprovalWorkflowRepository) ListInstanceLogs(instanceID uint64) ([]models.ApprovalWorkflowInstanceLog, error) {
	var logs []models.ApprovalWorkflowInstanceLog
	err := r.db.Where("instance_id = ?", instanceID).Order("id ASC").Find(&logs).Error
	return logs, err
}
