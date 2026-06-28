//go:build ignore

package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
)

type StockBalance struct {
	ProductID           uint64  `gorm:"column:product_id"`
	ProductBatchID      *uint64 `gorm:"column:product_batch_id"`
	WarehouseID         uint64  `gorm:"column:warehouse_id"`
	WarehouseLocationID *uint64 `gorm:"column:warehouse_location_id"`
}

func main() {
	dsn := "root:root@tcp(localhost:3306)/erp_omacx?parseTime=true"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	var sb StockBalance
	if err := db.Table("stock_balances").Where("quantity_available > 0").First(&sb).Error; err != nil {
		log.Fatal(err)
	}

	batchID := "null"
	if sb.ProductBatchID != nil {
		batchID = fmt.Sprintf("%d", *sb.ProductBatchID)
	}
	locationID := "null"
	if sb.WarehouseLocationID != nil {
		locationID = fmt.Sprintf("%d", *sb.WarehouseLocationID)
	}

	fmt.Printf("ProductID=%d BatchID=%s WarehouseID=%d LocationID=%s\n", sb.ProductID, batchID, sb.WarehouseID, locationID)
}
