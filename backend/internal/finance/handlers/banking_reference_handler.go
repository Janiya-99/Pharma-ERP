package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type BankingReferenceHandler struct {
	logger *zap.Logger
}

func NewBankingReferenceHandler(logger *zap.Logger) *BankingReferenceHandler {
	return &BankingReferenceHandler{logger: logger}
}

type sriLankaBankReference struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	ShortName   string `json:"short_name"`
	SwiftCode   string `json:"swift_code"`
	Category    string `json:"category"`
	DisplayName string `json:"display_name"`
}

type sriLankaProvinceReference struct {
	Name      string   `json:"name"`
	Code      string   `json:"code"`
	Districts []string `json:"districts"`
}

func (h *BankingReferenceHandler) ListSriLankaBanks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sri Lanka banks loaded successfully",
		"data":    sriLankaBanks,
	})
}

func (h *BankingReferenceHandler) ListSriLankaProvinces(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sri Lanka provinces loaded successfully",
		"data":    sriLankaProvinces,
	})
}

var sriLankaBanks = []sriLankaBankReference{
	{Name: "Amana Bank PLC", Code: "7463", ShortName: "Amana Bank", SwiftCode: "AMNALKLX", Category: "licensed_commercial_bank", DisplayName: "Amana Bank PLC (7463)"},
	{Name: "Bank of Ceylon", Code: "7010", ShortName: "BOC", SwiftCode: "BCEYLKLX", Category: "licensed_commercial_bank", DisplayName: "Bank of Ceylon (7010)"},
	{Name: "Cargills Bank PLC", Code: "7481", ShortName: "Cargills Bank", SwiftCode: "CGOSLKLX", Category: "licensed_commercial_bank", DisplayName: "Cargills Bank PLC (7481)"},
	{Name: "Citibank N.A.", Code: "7047", ShortName: "Citibank", SwiftCode: "CITILKLX", Category: "licensed_commercial_bank", DisplayName: "Citibank N.A. (7047)"},
	{Name: "Commercial Bank of Ceylon PLC", Code: "7056", ShortName: "Commercial Bank", SwiftCode: "CCEYLKLX", Category: "licensed_commercial_bank", DisplayName: "Commercial Bank of Ceylon PLC (7056)"},
	{Name: "Deutsche Bank AG", Code: "7205", ShortName: "Deutsche Bank", SwiftCode: "DEUTLKLX", Category: "licensed_commercial_bank", DisplayName: "Deutsche Bank AG (7205)"},
	{Name: "DFCC Bank PLC", Code: "7454", ShortName: "DFCC Bank", SwiftCode: "DFCCLKLX", Category: "licensed_commercial_bank", DisplayName: "DFCC Bank PLC (7454)"},
	{Name: "Hatton National Bank PLC", Code: "7083", ShortName: "HNB", SwiftCode: "HBLILKLX", Category: "licensed_commercial_bank", DisplayName: "Hatton National Bank PLC (7083)"},
	{Name: "Indian Bank", Code: "7108", ShortName: "Indian Bank", SwiftCode: "IDIBLKLX", Category: "licensed_commercial_bank", DisplayName: "Indian Bank (7108)"},
	{Name: "Indian Overseas Bank", Code: "7117", ShortName: "Indian Overseas Bank", SwiftCode: "IOBALKLX", Category: "licensed_commercial_bank", DisplayName: "Indian Overseas Bank (7117)"},
	{Name: "MCB Bank Ltd", Code: "7269", ShortName: "MCB Bank", SwiftCode: "MUCBLKLX", Category: "licensed_commercial_bank", DisplayName: "MCB Bank Ltd (7269)"},
	{Name: "National Development Bank PLC", Code: "7214", ShortName: "NDB", SwiftCode: "NDBSLKLX", Category: "licensed_commercial_bank", DisplayName: "National Development Bank PLC (7214)"},
	{Name: "Nations Trust Bank PLC", Code: "7162", ShortName: "Nations Trust Bank", SwiftCode: "NTBCLKLX", Category: "licensed_commercial_bank", DisplayName: "Nations Trust Bank PLC (7162)"},
	{Name: "Pan Asia Banking Corporation PLC", Code: "7311", ShortName: "Pan Asia Bank", SwiftCode: "PABSLKLX", Category: "licensed_commercial_bank", DisplayName: "Pan Asia Banking Corporation PLC (7311)"},
	{Name: "People's Bank", Code: "7135", ShortName: "People's Bank", SwiftCode: "PSBKLKLX", Category: "licensed_commercial_bank", DisplayName: "People's Bank (7135)"},
	{Name: "Public Bank Berhad", Code: "7296", ShortName: "Public Bank", SwiftCode: "PBBELKLX", Category: "licensed_commercial_bank", DisplayName: "Public Bank Berhad (7296)"},
	{Name: "Sampath Bank PLC", Code: "7278", ShortName: "Sampath Bank", SwiftCode: "BSAMLKLX", Category: "licensed_commercial_bank", DisplayName: "Sampath Bank PLC (7278)"},
	{Name: "Seylan Bank PLC", Code: "7287", ShortName: "Seylan Bank", SwiftCode: "SEYBLKLX", Category: "licensed_commercial_bank", DisplayName: "Seylan Bank PLC (7287)"},
	{Name: "Standard Chartered Bank", Code: "7038", ShortName: "Standard Chartered", SwiftCode: "SCBLLKLX", Category: "licensed_commercial_bank", DisplayName: "Standard Chartered Bank (7038)"},
	{Name: "State Bank of India", Code: "7144", ShortName: "SBI", SwiftCode: "SBINLKLX", Category: "licensed_commercial_bank", DisplayName: "State Bank of India (7144)"},
	{Name: "Union Bank of Colombo PLC", Code: "7302", ShortName: "Union Bank", SwiftCode: "UBCLLKLC", Category: "licensed_commercial_bank", DisplayName: "Union Bank of Colombo PLC (7302)"},
	{Name: "Central Bank of Sri Lanka", Code: "8004", ShortName: "CBSL", SwiftCode: "CBCELKLX", Category: "central_bank", DisplayName: "Central Bank of Sri Lanka (8004)"},
}

var sriLankaProvinces = []sriLankaProvinceReference{
	{Name: "Western Province", Code: "WP", Districts: []string{"Colombo", "Gampaha", "Kalutara"}},
	{Name: "Central Province", Code: "CP", Districts: []string{"Kandy", "Matale", "Nuwara Eliya"}},
	{Name: "Southern Province", Code: "SP", Districts: []string{"Galle", "Matara", "Hambantota"}},
	{Name: "Northern Province", Code: "NP", Districts: []string{"Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"}},
	{Name: "Eastern Province", Code: "EP", Districts: []string{"Ampara", "Batticaloa", "Trincomalee"}},
	{Name: "North Western Province", Code: "NWP", Districts: []string{"Kurunegala", "Puttalam"}},
	{Name: "North Central Province", Code: "NCP", Districts: []string{"Anuradhapura", "Polonnaruwa"}},
	{Name: "Uva Province", Code: "UP", Districts: []string{"Badulla", "Monaragala"}},
	{Name: "Sabaragamuwa Province", Code: "SGP", Districts: []string{"Kegalle", "Ratnapura"}},
}
