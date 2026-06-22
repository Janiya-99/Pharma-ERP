package dto

type LoginResponse struct {
	Token           string        `json:"token"`
	User            UserDTO       `json:"user"`
	Company         CompanyDTO    `json:"company"`
	ActiveBranch    BranchDTO     `json:"active_branch"`
	ActiveSoftware  SoftwareDTO   `json:"active_software"`
	Branches        []BranchDTO   `json:"branches"`
	SoftwareModules []SoftwareDTO `json:"software_modules"`
	Permissions     []string      `json:"permissions"`
}

type UserDTO struct {
	ID       uint64 `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	UserType string `json:"user_type"`
}

type CompanyDTO struct {
	ID          uint64 `json:"id"`
	CompanyCode string `json:"company_code"`
	CompanyName string `json:"company_name"`
}

type BranchDTO struct {
	ID         uint64 `json:"id"`
	BranchCode string `json:"branch_code"`
	BranchName string `json:"branch_name"`
}

type SoftwareDTO struct {
	SoftwareCode string `json:"software_code"`
	SoftwareName string `json:"software_name"`
}
