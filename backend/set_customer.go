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
		UPDATE customers SET current_balance = 0, credit_limit = 1000 WHERE id = 7;
	`)

	if res.Error != nil {
		log.Fatal(res.Error)
	}
	fmt.Printf("Updated customer 7\n")
}
