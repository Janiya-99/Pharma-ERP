import React, { useEffect, useState } from "react";
import Widget from "components/widget/Widget";
import { MdInventory2, MdLocalShipping, MdStorefront } from "react-icons/md";
import api from "lib/api";

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    warehouses: 0,
    suppliers: 0,
  });

  const fetchStats = async () => {
    try {
      const [products, warehouses, suppliers] = await Promise.all([
        api.get("/inventory/products"),
        api.get("/inventory/warehouses"),
        api.get("/inventory/suppliers"),
      ]);

      setStats({
        products: products.data.data?.length || 0,
        warehouses: warehouses.data.data?.length || 0,
        suppliers: suppliers.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch inventory stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="mb-4 flex flex-col">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Inventory Dashboard
        </h1>
        <p className="text-sm text-gray-400">
          Realtime overview of stock, products, and movements
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={
            <MdInventory2 className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Total Products"
          subtitle={stats.products.toString()}
        />
        <Widget
          icon={
            <MdStorefront className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Warehouses"
          subtitle={stats.warehouses.toString()}
        />
        <Widget
          icon={
            <MdLocalShipping className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Suppliers"
          subtitle={stats.suppliers.toString()}
        />
      </div>
    </div>
  );
}
