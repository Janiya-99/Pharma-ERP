package dto

type CreateProductCategoryRequest struct {
	CategoryCode string  `json:"category_code" binding:"required"`
	CategoryName string  `json:"category_name" binding:"required"`
	ParentID     *uint64 `json:"parent_id"`
	Level        int     `json:"level" binding:"required"`
	Description  string  `json:"description"`
	Status       string  `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateProductCategoryRequest struct {
	CategoryCode string  `json:"category_code" binding:"required"`
	CategoryName string  `json:"category_name" binding:"required"`
	ParentID     *uint64 `json:"parent_id"`
	Level        int     `json:"level" binding:"required"`
	Description  string  `json:"description"`
	Status       string  `json:"status" binding:"required,oneof=active inactive"`
}
