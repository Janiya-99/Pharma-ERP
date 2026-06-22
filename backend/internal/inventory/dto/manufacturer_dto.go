package dto

type CreateManufacturerRequest struct {
	ManufacturerCode string `json:"manufacturer_code" binding:"required"`
	ManufacturerName string `json:"manufacturer_name" binding:"required"`
	Country          string `json:"country"`
	ContactPerson    string `json:"contact_person"`
	ContactNumber    string `json:"contact_number"`
	Email            string `json:"email"`
	Address          string `json:"address"`
	Status           string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateManufacturerRequest struct {
	ManufacturerCode string `json:"manufacturer_code" binding:"required"`
	ManufacturerName string `json:"manufacturer_name" binding:"required"`
	Country          string `json:"country"`
	ContactPerson    string `json:"contact_person"`
	ContactNumber    string `json:"contact_number"`
	Email            string `json:"email"`
	Address          string `json:"address"`
	Status           string `json:"status" binding:"required,oneof=active inactive"`
}
