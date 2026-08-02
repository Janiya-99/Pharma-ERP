package dto

type CreateDosageFormRequest struct {
	DosageFormCode string `json:"dosage_form_code" binding:"required"`
	DosageFormName string `json:"dosage_form_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required,oneof=active inactive"`
}

type UpdateDosageFormRequest struct {
	DosageFormCode string `json:"dosage_form_code" binding:"required"`
	DosageFormName string `json:"dosage_form_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required,oneof=active inactive"`
}
