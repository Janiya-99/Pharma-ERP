package dto

type CreateWarehouseRequest struct {
	BranchID      uint64 `json:"branch_id" binding:"required"`
	WarehouseCode string `json:"warehouse_code" binding:"required"`
	WarehouseName string `json:"warehouse_name" binding:"required"`
	WarehouseType string `json:"warehouse_type" binding:"required"`
	Address       string `json:"address"`
	ContactPerson string `json:"contact_person"`
	ContactNumber string `json:"contact_number"`
	IsDefault     bool   `json:"is_default"`
	Status        string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateWarehouseRequest struct {
	WarehouseCode string `json:"warehouse_code" binding:"required"`
	WarehouseName string `json:"warehouse_name" binding:"required"`
	WarehouseType string `json:"warehouse_type" binding:"required"`
	Address       string `json:"address"`
	ContactPerson string `json:"contact_person"`
	ContactNumber string `json:"contact_number"`
	IsDefault     bool   `json:"is_default"`
	Status        string `json:"status" binding:"required,oneof=active inactive"`
}
