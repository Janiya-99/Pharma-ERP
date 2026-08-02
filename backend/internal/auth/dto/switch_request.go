package dto

type SwitchBranchRequest struct {
	BranchID uint64 `json:"branch_id" binding:"required"`
}

type SwitchSoftwareRequest struct {
	SoftwareCode string `json:"software_code" binding:"required"`
}
