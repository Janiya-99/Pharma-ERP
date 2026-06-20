package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/control/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SoftwareModuleHandler struct {
	logger *zap.Logger
}

func NewSoftwareModuleHandler(logger *zap.Logger) *SoftwareModuleHandler {
	return &SoftwareModuleHandler{logger: logger}
}

func (h *SoftwareModuleHandler) List(c *gin.Context) {
	companyDB, _ := c.Get("companyDB")
	db := companyDB.(*gorm.DB)

	repo := repositories.NewSoftwareModuleRepository(db)
	service := services.NewSoftwareModuleService(repo)

	modules, err := service.ListActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, modules)
}
