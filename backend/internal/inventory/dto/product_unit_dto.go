package dto

type CreateProductUnitRequest struct {
	UnitCode    string `json:"unit_code" binding:"required"`
	UnitName    string `json:"unit_name" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateProductUnitRequest struct {
	UnitCode    string `json:"unit_code" binding:"required"`
	UnitName    string `json:"unit_name" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status" binding:"required,oneof=active inactive"`
}
