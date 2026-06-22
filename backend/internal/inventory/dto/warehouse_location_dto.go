package dto

type CreateWarehouseLocationRequest struct {
	WarehouseID      uint64 `json:"warehouse_id" binding:"required"`
	LocationCode     string `json:"location_code" binding:"required"`
	LocationName     string `json:"location_name"`
	Rack             string `json:"rack"`
	Shelf            string `json:"shelf"`
	Bin              string `json:"bin"`
	StorageCondition string `json:"storage_condition" binding:"required"`
	Status           string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateWarehouseLocationRequest struct {
	LocationCode     string `json:"location_code" binding:"required"`
	LocationName     string `json:"location_name"`
	Rack             string `json:"rack"`
	Shelf            string `json:"shelf"`
	Bin              string `json:"bin"`
	StorageCondition string `json:"storage_condition" binding:"required"`
	Status           string `json:"status" binding:"required,oneof=active inactive"`
}
