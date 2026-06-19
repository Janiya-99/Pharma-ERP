package request

// CreateJournalEntryRequest is the DTO for POST /api/v1/finance/journals
type CreateJournalEntryRequest struct {
	RefNo       string                      `json:"ref_no" binding:"required,min=1,max=50"`
	Description string                      `json:"description" binding:"omitempty"`
	Details     []JournalEntryDetailRequest `json:"details" binding:"required,min=2,dive"`
}

// JournalEntryDetailRequest represents a detail line of a journal entry in a request.
type JournalEntryDetailRequest struct {
	GlID         uint64 `json:"gl_id" binding:"required"`
	CreditAmount string `json:"credit_amount" binding:"required"` // String for DECIMAL precision
	DebitAmount  string `json:"debit_amount" binding:"required"`  // String for DECIMAL precision
	Remarks      string `json:"remarks" binding:"omitempty,max=255"`
}

// SubmitJournalEntryRequest is the DTO for POST /api/v1/finance/journals/:id/submit
type SubmitJournalEntryRequest struct {
	Comment string `json:"comment" binding:"omitempty,max=255"`
}
