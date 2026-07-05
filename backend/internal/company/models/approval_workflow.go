package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// ApprovalWorkflow represents a multi-stage approval policy for a specific document type.
type ApprovalWorkflow struct {
	ID          uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID   uint64          `gorm:"not null;index:idx_wf_comp_doc,priority:1" json:"company_id"`
	BranchID    *uint64         `gorm:"index" json:"branch_id,omitempty"`
	Name        string          `gorm:"size:100;not null" json:"name"`
	Code        string          `gorm:"size:50;not null;index" json:"code"`
	Module      string          `gorm:"size:50;not null;index:idx_wf_comp_doc,priority:2" json:"module"` // Finance, Inventory, Invoice Center, Compliance Center
	DocumentType string         `gorm:"size:50;not null;index:idx_wf_comp_doc,priority:3" json:"document_type"`
	BranchScope string          `gorm:"size:30;not null;default:'all_branches'" json:"branch_scope"` // all_branches, selected_branches, single_branch
	SelectedBranchesJSON json.RawMessage `gorm:"type:json" json:"selected_branches_json,omitempty"`
	Description string          `gorm:"size:255" json:"description"`
	Status      string          `gorm:"size:20;not null;default:'published';index" json:"status"` // draft, published, archived
	VersionNumber int           `gorm:"not null;default:1" json:"version_number"`
	EffectiveFrom *time.Time    `json:"effective_from,omitempty"`
	EffectiveTo   *time.Time    `json:"effective_to,omitempty"`
	Priority    int             `gorm:"not null;default:1" json:"priority"`
	IsDefault   bool            `gorm:"not null;default:false" json:"is_default"`
	CreatedBy   uint64          `gorm:"not null" json:"created_by"`
	UpdatedBy   uint64          `gorm:"not null" json:"updated_by"`
	PublishedBy *uint64         `json:"published_by,omitempty"`
	PublishedAt *time.Time      `json:"published_at,omitempty"`
	CreatedAt   time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt   time.Time       `gorm:"not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`

	Stages []ApprovalWorkflowStage `gorm:"foreignKey:WorkflowID;constraint:OnDelete:CASCADE;" json:"stages,omitempty"`
}

func (ApprovalWorkflow) TableName() string {
	return "approval_workflows"
}

// ApprovalWorkflowVersion tracks historical versions of approval workflows.
type ApprovalWorkflowVersion struct {
	ID            uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkflowID    uint64          `gorm:"not null;index" json:"workflow_id"`
	CompanyID     uint64          `gorm:"not null;index" json:"company_id"`
	BranchID      *uint64         `gorm:"index" json:"branch_id,omitempty"`
	Name          string          `gorm:"size:100;not null" json:"name"`
	Code          string          `gorm:"size:50;not null" json:"code"`
	Module        string          `gorm:"size:50;not null" json:"module"`
	DocumentType  string          `gorm:"size:50;not null" json:"document_type"`
	BranchScope   string          `gorm:"size:30;not null" json:"branch_scope"`
	WorkflowJSON  json.RawMessage `gorm:"type:json;not null" json:"workflow_json"` // Complete snapshot of workflow and stages
	VersionNumber int             `gorm:"not null" json:"version_number"`
	EffectiveFrom *time.Time      `json:"effective_from,omitempty"`
	EffectiveTo   *time.Time      `json:"effective_to,omitempty"`
	PublishedBy   *uint64         `json:"published_by,omitempty"`
	PublishedAt   *time.Time      `json:"published_at,omitempty"`
	CreatedAt     time.Time       `gorm:"not null" json:"created_at"`
}

func (ApprovalWorkflowVersion) TableName() string {
	return "approval_workflow_versions"
}

// ApprovalWorkflowStage represents a single step in a workflow.
type ApprovalWorkflowStage struct {
	ID                      uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkflowID              uint64          `gorm:"not null;index" json:"workflow_id"`
	StageNumber             int             `gorm:"not null" json:"stage_number"`
	StageName               string          `gorm:"size:100;not null" json:"stage_name"`
	StageDescription        string          `gorm:"size:255" json:"stage_description"`
	ApproverType            string          `gorm:"size:50;not null" json:"approver_type"` // role, department, designation, specific_user, document_owner_manager, branch_manager, custom_group
	ApproverRoleID          *uint64         `gorm:"index" json:"approver_role_id,omitempty"`
	ApproverDepartmentID    *uint64         `gorm:"index" json:"approver_department_id,omitempty"`
	ApproverDesignationID   *uint64         `gorm:"index" json:"approver_designation_id,omitempty"`
	SpecificUsersJSON       json.RawMessage `gorm:"type:json" json:"specific_users_json,omitempty"`
	MinimumAmount           float64         `gorm:"type:decimal(18,2);not null;default:0" json:"minimum_amount"`
	MaximumAmount           float64         `gorm:"type:decimal(18,2);not null;default:999999999999" json:"maximum_amount"`
	SLATimeout              int             `gorm:"not null;default:24" json:"sla_timeout"`
	SLAUnit                 string          `gorm:"size:20;not null;default:'hours'" json:"sla_unit"` // minutes, hours, business_hours, days, business_days
	EscalationRuleJSON      json.RawMessage `gorm:"type:json" json:"escalation_rule_json,omitempty"`
	CanApproveOwnDocument   bool            `gorm:"not null;default:false" json:"can_approve_own_document"`
	MinimumApprovalsRequired int            `gorm:"not null;default:1" json:"minimum_approvals_required"`
	ApprovalMode            string          `gorm:"size:30;not null;default:'any_one'" json:"approval_mode"` // any_one, all_required, minimum_count, sequential
	CreatedAt               time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt               time.Time       `gorm:"not null" json:"updated_at"`

	Approvers []ApprovalWorkflowStageApprover `gorm:"foreignKey:StageID;constraint:OnDelete:CASCADE;" json:"approvers,omitempty"`
}

func (ApprovalWorkflowStage) TableName() string {
	return "approval_workflow_stages"
}

// ApprovalWorkflowStageApprover maps specific users or roles to a stage if needed for complex query lookups.
type ApprovalWorkflowStageApprover struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	StageID   uint64 `gorm:"not null;index" json:"stage_id"`
	UserID    *uint64 `gorm:"index" json:"user_id,omitempty"`
	RoleID    *uint64 `gorm:"index" json:"role_id,omitempty"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}

func (ApprovalWorkflowStageApprover) TableName() string {
	return "approval_workflow_stage_approvers"
}

// ApprovalWorkflowEscalation tracks SLA escalation policies and triggers.
type ApprovalWorkflowEscalation struct {
	ID                  uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	StageID             uint64          `gorm:"not null;index" json:"stage_id"`
	WarningBeforeMinutes int            `gorm:"not null;default:120" json:"warning_before_minutes"`
	EscalateAfterMinutes int            `gorm:"not null;default:1440" json:"escalate_after_minutes"`
	EscalationRoleID    *uint64         `gorm:"index" json:"escalation_role_id,omitempty"`
	EscalationUserID    *uint64         `gorm:"index" json:"escalation_user_id,omitempty"`
	NotificationChannelsJSON json.RawMessage `gorm:"type:json" json:"notification_channels_json"` // ["in_app", "email"]
	CreatedAt           time.Time       `gorm:"not null" json:"created_at"`
	UpdatedAt           time.Time       `gorm:"not null" json:"updated_at"`
}

func (ApprovalWorkflowEscalation) TableName() string {
	return "approval_workflow_escalations"
}

// ApprovalWorkflowInstance represents a running workflow for an active document.
type ApprovalWorkflowInstance struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID      uint64    `gorm:"not null;index" json:"company_id"`
	BranchID       uint64    `gorm:"not null;index" json:"branch_id"`
	WorkflowID     uint64    `gorm:"not null;index" json:"workflow_id"`
	Module         string    `gorm:"size:50;not null;index" json:"module"`
	DocumentType   string    `gorm:"size:50;not null;index" json:"document_type"`
	DocumentID     uint64    `gorm:"not null;index" json:"document_id"`
	DocumentNumber string    `gorm:"size:100;not null" json:"document_number"`
	DocumentAmount float64   `gorm:"type:decimal(18,2);not null;default:0" json:"document_amount"`
	SubmittedBy    uint64    `gorm:"not null;index" json:"submitted_by"`
	Status         string    `gorm:"size:30;not null;default:'pending_approval';index" json:"status"` // pending_approval, approved, rejected, returned
	CurrentStage   int       `gorm:"not null;default:1" json:"current_stage"`
	SLADueTime     *time.Time `json:"sla_due_time,omitempty"`
	Remarks        string    `gorm:"size:500" json:"remarks,omitempty"`
	CreatedAt      time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt      time.Time `gorm:"not null" json:"updated_at"`
}

func (ApprovalWorkflowInstance) TableName() string {
	return "approval_workflow_instances"
}

// ApprovalWorkflowInstanceLog records individual approval actions taken on a workflow instance.
type ApprovalWorkflowInstanceLog struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	InstanceID uint64    `gorm:"not null;index" json:"instance_id"`
	StageNumber int      `gorm:"not null" json:"stage_number"`
	Action     string    `gorm:"size:30;not null" json:"action"` // approve, reject, return
	ActorID    uint64    `gorm:"not null;index" json:"actor_id"`
	Remarks    string    `gorm:"size:500" json:"remarks"`
	CreatedAt  time.Time `gorm:"not null" json:"created_at"`
}

func (ApprovalWorkflowInstanceLog) TableName() string {
	return "approval_workflow_instance_logs"
}
