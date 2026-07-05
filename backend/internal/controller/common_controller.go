package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type CommonController struct{}

func NewCommonController() *CommonController {
	return &CommonController{}
}

func (c *CommonController) GetCountries(ctx *gin.Context) {
	countries := []map[string]string{
		{"code": "SL", "name": "Sri Lanka"},
		{"code": "US", "name": "United States"},
		{"code": "GB", "name": "United Kingdom"},
		{"code": "IN", "name": "India"},
		{"code": "AU", "name": "Australia"},
		{"code": "CA", "name": "Canada"},
		{"code": "SG", "name": "Singapore"},
		{"code": "AE", "name": "United Arab Emirates"},
		{"code": "MY", "name": "Malaysia"},
		{"code": "CN", "name": "China"},
		{"code": "DE", "name": "Germany"},
		{"code": "FR", "name": "France"},
		{"code": "JP", "name": "Japan"},
		{"code": "KR", "name": "South Korea"},
		{"code": "NZ", "name": "New Zealand"},
		{"code": "ZA", "name": "South Africa"},
		{"code": "IT", "name": "Italy"},
		{"code": "NL", "name": "Netherlands"},
		{"code": "CH", "name": "Switzerland"},
		{"code": "SE", "name": "Sweden"},
		{"code": "BD", "name": "Bangladesh"},
		{"code": "NP", "name": "Nepal"},
		{"code": "MV", "name": "Maldives"},
		{"code": "PK", "name": "Pakistan"},
		{"code": "TH", "name": "Thailand"},
		{"code": "ID", "name": "Indonesia"},
		{"code": "VN", "name": "Vietnam"},
		{"code": "PH", "name": "Philippines"},
		{"code": "BR", "name": "Brazil"},
		{"code": "MX", "name": "Mexico"},
		{"code": "ES", "name": "Spain"},
		{"code": "PT", "name": "Portugal"},
		{"code": "RU", "name": "Russia"},
		{"code": "SA", "name": "Saudi Arabia"},
		{"code": "QA", "name": "Qatar"},
		{"code": "KW", "name": "Kuwait"},
		{"code": "OM", "name": "Oman"},
		{"code": "BH", "name": "Bahrain"},
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    countries,
	})
}
