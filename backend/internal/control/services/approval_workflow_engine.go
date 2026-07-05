package services

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"go.uber.org/zap"
)

type ApprovalWorkflowEngine struct {
	repo         *repositories.ApprovalWorkflowRepository
	auditService *AuditService
	logger       *zap.Logger
}

func NewApprovalWorkflowEngine(repo *repositories.ApprovalWorkflowRepository, auditService *AuditService, logger *zap.Logger) *ApprovalWorkflowEngine {
	return &ApprovalWorkflowEngine{
		repo:         repo,
		auditService: auditService,
		logger:       logger,
	}
}

func (e *ApprovalWorkflowEngine) ListWorkflows(companyID uint64, module, docType, status string) ([]models.ApprovalWorkflow, error) {
	return e.repo.ListWorkflows(companyID, module, docType, status)
}

func (e *ApprovalWorkflowEngine) GetWorkflow(id uint64) (*models.ApprovalWorkflow, error) {
	return e.repo.GetByID(id)
}

func (e *ApprovalWorkflowEngine) SaveWorkflow(wf *models.ApprovalWorkflow, activeUserID uint64, ipAddress, userAgent string) (*models.ApprovalWorkflow, error) {
	now := time.Now()
	var oldVal interface{}
	if wf.ID != 0 {
		old, _ := e.repo.GetByID(wf.ID)
		if old != nil {
			oldVal = *old
		}
		wf.UpdatedBy = activeUserID
		wf.UpdatedAt = now
	} else {
		wf.CreatedBy = activeUserID
		wf.UpdatedBy = activeUserID
		wf.CreatedAt = now
		wf.UpdatedAt = now
		wf.VersionNumber = 1
	}

	if wf.Status == "published" {
		wf.PublishedBy = &activeUserID
		wf.PublishedAt = &now
	}

	if err := e.repo.Save(wf); err != nil {
		return nil, err
	}

	if wf.Status == "published" {
		wfBytes, _ := json.Marshal(wf)
		ver := models.ApprovalWorkflowVersion{
			WorkflowID:    wf.ID,
			CompanyID:     wf.CompanyID,
			Name:          wf.Name,
			Code:          wf.Code,
			Module:        wf.Module,
			DocumentType:  wf.DocumentType,
			BranchScope:   wf.BranchScope,
			WorkflowJSON:  wfBytes,
			VersionNumber: wf.VersionNumber,
			PublishedBy:   &activeUserID,
			PublishedAt:   &now,
			CreatedAt:     now,
		}
		e.repo.CreateVersion(&ver)
	}

	e.auditService.LogAction(
		wf.CompanyID,
		wf.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"APPROVAL_WORKFLOW_SAVED",
		"approval_workflows",
		&wf.ID,
		oldVal,
		wf,
		ipAddress,
		userAgent,
	)

	return wf, nil
}

func (e *ApprovalWorkflowEngine) PublishWorkflow(id uint64, activeUserID uint64, ipAddress, userAgent string) (*models.ApprovalWorkflow, error) {
	wf, err := e.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	oldVal := *wf
	wf.Status = "published"
	wf.VersionNumber++
	now := time.Now()
	wf.UpdatedBy = activeUserID
	wf.UpdatedAt = now
	wf.PublishedBy = &activeUserID
	wf.PublishedAt = &now

	if err := e.repo.Save(wf); err != nil {
		return nil, err
	}

	wfBytes, _ := json.Marshal(wf)
	ver := models.ApprovalWorkflowVersion{
		WorkflowID:    wf.ID,
		CompanyID:     wf.CompanyID,
		Name:          wf.Name,
		Code:          wf.Code,
		Module:        wf.Module,
		DocumentType:  wf.DocumentType,
		BranchScope:   wf.BranchScope,
		WorkflowJSON:  wfBytes,
		VersionNumber: wf.VersionNumber,
		PublishedBy:   &activeUserID,
		PublishedAt:   &now,
		CreatedAt:     now,
	}
	e.repo.CreateVersion(&ver)

	e.auditService.LogAction(
		wf.CompanyID,
		wf.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"APPROVAL_WORKFLOW_PUBLISHED",
		"approval_workflows",
		&wf.ID,
		oldVal,
		wf,
		ipAddress,
		userAgent,
	)

	return wf, nil
}

func (e *ApprovalWorkflowEngine) DeleteWorkflow(id uint64, activeUserID uint64, ipAddress, userAgent string) error {
	wf, err := e.repo.GetByID(id)
	if err != nil {
		return err
	}
	if err := e.repo.Delete(id); err != nil {
		return err
	}
	e.auditService.LogAction(
		wf.CompanyID,
		wf.BranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"APPROVAL_WORKFLOW_DELETED",
		"approval_workflows",
		&id,
		wf,
		nil,
		ipAddress,
		userAgent,
	)
	return nil
}

func (e *ApprovalWorkflowEngine) ListVersions(workflowID uint64) ([]models.ApprovalWorkflowVersion, error) {
	return e.repo.ListVersions(workflowID)
}

// EvaluateAndStartWorkflow instantiates a workflow for a submitted document
func (e *ApprovalWorkflowEngine) EvaluateAndStartWorkflow(companyID uint64, branchID uint64, module string, docType string, docID uint64, docNum string, amount float64, submittedBy uint64) (*models.ApprovalWorkflowInstance, error) {
	wf, err := e.repo.GetActiveForDocument(companyID, branchID, module, docType)
	if err != nil || wf == nil || len(wf.Stages) == 0 {
		// No active workflow -> auto approved!
		now := time.Now()
		inst := &models.ApprovalWorkflowInstance{
			CompanyID:      companyID,
			BranchID:       branchID,
			WorkflowID:     0,
			Module:         module,
			DocumentType:   docType,
			DocumentID:     docID,
			DocumentNumber: docNum,
			DocumentAmount: amount,
			SubmittedBy:    submittedBy,
			Status:         "approved",
			CurrentStage:   1,
			Remarks:        "Auto-approved (no workflow policy required)",
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		e.repo.CreateInstance(inst)
		return inst, nil
	}

	// Determine starting stage based on amount thresholds
	startStage := 1
	for _, st := range wf.Stages {
		if amount >= st.MinimumAmount && amount <= st.MaximumAmount {
			startStage = st.StageNumber
			break
		}
	}

	now := time.Now()
	var dueTime *time.Time
	for _, st := range wf.Stages {
		if st.StageNumber == startStage && st.SLATimeout > 0 {
			dt := now.Add(time.Duration(st.SLATimeout) * time.Hour)
			dueTime = &dt
			break
		}
	}

	inst := &models.ApprovalWorkflowInstance{
		CompanyID:      companyID,
		BranchID:       branchID,
		WorkflowID:     wf.ID,
		Module:         module,
		DocumentType:   docType,
		DocumentID:     docID,
		DocumentNumber: docNum,
		DocumentAmount: amount,
		SubmittedBy:    submittedBy,
		Status:         "pending_approval",
		CurrentStage:   startStage,
		SLADueTime:     dueTime,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := e.repo.CreateInstance(inst); err != nil {
		return nil, err
	}

	e.auditService.LogAction(
		companyID,
		&branchID,
		&submittedBy,
		"CONTROL_CENTER",
		"APPROVAL_WORKFLOW_STARTED",
		"approval_workflow_instances",
		&inst.ID,
		nil,
		inst,
		"",
		"",
	)

	return inst, nil
}

// ProcessApprovalAction processes an approve, reject, or return action by an authorized actor
func (e *ApprovalWorkflowEngine) ProcessApprovalAction(companyID uint64, instanceID uint64, action string, actorID uint64, actorRoleIDs []uint64, remarks string, ipAddress, userAgent string) (*models.ApprovalWorkflowInstance, error) {
	var inst models.ApprovalWorkflowInstance
	err := e.repo.GetDB().Where("id = ? AND company_id = ?", instanceID, companyID).First(&inst).Error
	if err != nil {
		return nil, errors.New("approval workflow instance not found")
	}

	if inst.Status != "pending_approval" {
		return nil, errors.New("workflow is not pending approval")
	}

	wf, err := e.repo.GetByID(inst.WorkflowID)
	if err != nil || wf == nil {
		// If workflow deleted or 0, allow action
	} else {
		// Verify actor authority for CurrentStage
		var currentStageObj *models.ApprovalWorkflowStage
		for _, st := range wf.Stages {
			if st.StageNumber == inst.CurrentStage {
				currentStageObj = &st
				break
			}
		}

		if currentStageObj != nil {
			if !currentStageObj.CanApproveOwnDocument && inst.SubmittedBy == actorID {
				return nil, errors.New("separation of duties violation: you cannot approve a document you submitted")
			}
			// Check if actor has role/department matching stage
			authorized := false
			if currentStageObj.ApproverRoleID != nil {
				for _, rID := range actorRoleIDs {
					if rID == *currentStageObj.ApproverRoleID {
						authorized = true
						break
					}
				}
			} else {
				authorized = true // If no specific role ID restricted, allow any admin / manager
			}
			if !authorized {
				return nil, errors.New("unauthorized: your role is not assigned to approve this stage")
			}
		}
	}

	now := time.Now()
	log := models.ApprovalWorkflowInstanceLog{
		InstanceID:  inst.ID,
		StageNumber: inst.CurrentStage,
		Action:      action,
		ActorID:     actorID,
		Remarks:     remarks,
		CreatedAt:   now,
	}
	e.repo.CreateInstanceLog(&log)

	oldVal := inst
	if action == "reject" {
		inst.Status = "rejected"
	} else if action == "return" {
		inst.Status = "returned"
	} else if action == "approve" {
		// Check if there is a next stage
		nextStage := inst.CurrentStage + 1
		hasNext := false
		if wf != nil {
			for _, st := range wf.Stages {
				if st.StageNumber == nextStage && inst.DocumentAmount <= st.MaximumAmount {
					hasNext = true
					break
				}
			}
		}
		if hasNext {
			inst.CurrentStage = nextStage
		} else {
			inst.Status = "approved"
		}
	} else {
		return nil, errors.New("invalid action: must be approve, reject, or return")
	}

	inst.UpdatedAt = now
	if err := e.repo.SaveInstance(&inst); err != nil {
		return nil, err
	}

	e.auditService.LogAction(
		companyID,
		&inst.BranchID,
		&actorID,
		"CONTROL_CENTER",
		"APPROVAL_WORKFLOW_ACTION_"+action,
		"approval_workflow_instances",
		&inst.ID,
		oldVal,
		inst,
		ipAddress,
		userAgent,
	)

	return &inst, nil
}
