package dto

type CreateDepartmentRequest struct {
	DepartmentCode string `json:"department_code" binding:"required"`
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateDepartmentRequest struct {
	DepartmentCode string `json:"department_code" binding:"required"`
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required,oneof=active inactive"`
}
