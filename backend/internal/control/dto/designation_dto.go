package dto

type CreateDesignationRequest struct {
	DesignationName string `json:"designation_name" binding:"required"`
	Description     string `json:"description"`
	Status          string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateDesignationRequest struct {
	DesignationName string `json:"designation_name" binding:"required"`
	Description     string `json:"description"`
	Status          string `json:"status" binding:"required,oneof=active inactive"`
}
