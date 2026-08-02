package dto

type CreateAccountGroupRequest struct {
	GroupCode     string  `json:"group_code" binding:"required"`
	GroupName     string  `json:"group_name" binding:"required"`
	AccountType   string  `json:"account_type" binding:"required"`
	ParentGroupID *uint64 `json:"parent_group_id"`
	Description   string  `json:"description"`
	Status        string  `json:"status" binding:"required"`
}

type UpdateAccountGroupRequest struct {
	GroupCode     string  `json:"group_code" binding:"required"`
	GroupName     string  `json:"group_name" binding:"required"`
	AccountType   string  `json:"account_type" binding:"required"`
	ParentGroupID *uint64 `json:"parent_group_id"`
	Description   string  `json:"description"`
	Status        string  `json:"status" binding:"required"`
}
