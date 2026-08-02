package dto

type CreateGenericNameRequest struct {
	GenericCode string `json:"generic_code" binding:"required"`
	GenericName string `json:"generic_name" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateGenericNameRequest struct {
	GenericCode string `json:"generic_code" binding:"required"`
	GenericName string `json:"generic_name" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status" binding:"required,oneof=active inactive"`
}
