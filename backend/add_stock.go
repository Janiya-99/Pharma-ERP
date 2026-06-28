//go:build ignore

package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
)

func main() {
	dsn := "root:root@tcp(localhost:3306)/erp_omacx?parseTime=true"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	res := db.Exec(`
		INSERT INTO stock_balances (company_id, branch_id, warehouse_id, product_id, product_batch_id, quantity_on_hand, quantity_allocated, quantity_available, average_cost, created_at, updated_at) 
		VALUES (1, 1, 1, 4, 1, 100, 0, 100, 10.0, NOW(), NOW())
		ON DUPLICATE KEY UPDATE quantity_on_hand = 100, quantity_available = 100;
	`)

	if res.Error != nil {
		log.Fatal(res.Error)
	}
	fmt.Printf("Added stock balance\n")
}
