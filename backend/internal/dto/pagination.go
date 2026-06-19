package dto

// PaginationRequest holds pagination parameters from query string.
// Defaults: page=1, per_page=20, order=desc
type PaginationRequest struct {
	Page    int    `form:"page,default=1" binding:"min=1"`
	PerPage int    `form:"per_page,default=20" binding:"min=1,max=100"`
	SortBy  string `form:"sort_by,default=created_at"`
	Order   string `form:"order,default=desc" binding:"oneof=asc desc"`
	Search  string `form:"search"`
}

// GetOffset calculates the SQL offset for pagination.
func (p *PaginationRequest) GetOffset() int {
	return (p.Page - 1) * p.PerPage
}

// GetTotalPages calculates total pages from total record count.
func (p *PaginationRequest) GetTotalPages(total int64) int64 {
	if total == 0 {
		return 0
	}
	pages := total / int64(p.PerPage)
	if total%int64(p.PerPage) != 0 {
		pages++
	}
	return pages
}
