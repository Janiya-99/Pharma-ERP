package dto

type BranchAccessItem struct {
	BranchID  uint64 `json:"branch_id" binding:"required"`
	IsDefault bool   `json:"is_default"`
}

type AssignBranchAccessRequest struct {
	Branches []BranchAccessItem `json:"branches" binding:"required,min=1"`
}

type SoftwareAccessItem struct {
	SoftwareID uint64 `json:"software_id" binding:"required"`
	CanAccess  bool   `json:"can_access"`
}

type AssignSoftwareAccessRequest struct {
	SoftwareModules []SoftwareAccessItem `json:"software_modules" binding:"required,min=1"`
}
