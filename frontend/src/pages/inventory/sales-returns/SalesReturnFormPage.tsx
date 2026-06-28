import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { inventoryApi } from "api/inventoryApi";
import * as controlApi from "api/controlApi";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { Card, CardContent } from "components/ui/card";
import { SalesReturnLine } from "types/inventory";
import SalesReturnLinesTable from "./SalesReturnLinesTable";
import { SalesReturnTotalsCard, ReturnConditionWarehouseWarning } from "components/inventory/SalesReturnCards";
import PermissionGuard from "auth/PermissionGuard";

const SalesReturnFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Lookups
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  
  // Header state
  const [salesReturnDate, setSalesReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContactNumber, setCustomerContactNumber] = useState("");
  const [salesInvoiceNumber, setSalesInvoiceNumber] = useState("");
  const [customerCreditNoteNumber, setCustomerCreditNoteNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [returnReason, setReturnReason] = useState("customer_return");
  const [returnCondition, setReturnCondition] = useState("saleable");
  const [remarks, setRemarks] = useState("");

  // Lines state
  const [lines, setLines] = useState<SalesReturnLine[]>([]);

  useEffect(() => {
    fetchLookups();
    if (isEdit) {
      fetchSalesReturn();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const [branchesRes, warehousesRes] = await Promise.all([
        controlApi.getBranches(),
        inventoryApi.getWarehouses({ status: "active", limit: 100 })
      ]);

      if (branchesRes.data?.success) setBranches(branchesRes.data.data);
      if (warehousesRes.data?.success) setWarehouses(warehousesRes.data.data?.data || warehousesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch lookups", error);
    }
  };

  const fetchSalesReturn = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getSalesReturnById(id!);
      if (response.data?.success) {
        const sr = response.data.data;
        if (sr.posted_status !== "unposted" || !["draft", "rejected"].includes(sr.approval_status)) {
          alert("This sales return cannot be edited.");
          navigate(`/inventory/sales-returns/${sr.id}`);
          return;
        }

        setSalesReturnDate(new Date(sr.sales_return_date).toISOString().split("T")[0]);
        setBranchId(sr.branch_id?.toString() || "");
        setWarehouseId(sr.warehouse_id?.toString() || "");
        setCustomerName(sr.customer_name || "");
        setCustomerContactNumber(sr.customer_contact_number || "");
        setSalesInvoiceNumber(sr.sales_invoice_number || "");
        setCustomerCreditNoteNumber(sr.customer_credit_note_number || "");
        setReferenceNumber(sr.reference_number || "");
        setReturnReason(sr.return_reason || "customer_return");
        setReturnCondition(sr.return_condition || "saleable");
        setRemarks(sr.remarks || "");
        setLines(sr.lines || []);
      }
    } catch (error) {
      console.error("Failed to fetch SR", error);
      alert("Failed to load return details.");
      navigate("/inventory/sales-returns");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    lines.forEach(line => {
      totalQty += Number(line.return_quantity) || 0;
      subtotal += (Number(line.return_quantity) || 0) * (Number(line.unit_price) || 0);
      totalDiscount += Number(line.discount_amount) || 0;
      totalTax += Number(line.tax_amount) || 0;
    });

    return {
      total_quantity: totalQty,
      subtotal_amount: subtotal,
      discount_amount: totalDiscount,
      tax_amount: totalTax,
      total_amount: subtotal - totalDiscount + totalTax
    };
  };

  const handleBranchChange = (value: string) => {
    setBranchId(value);
    setWarehouseId(""); // clear warehouse since it depends on branch
    setLines([]); // clear lines
  };

  const selectedWarehouseType = warehouses.find(w => w.id.toString() === warehouseId)?.warehouse_type;

  const handleSave = async () => {
    if (!branchId || !warehouseId || !salesReturnDate || !returnReason || !returnCondition) {
      alert("Please fill all mandatory fields (Branch, Warehouse, Return Date, Reason, Condition)");
      return;
    }
    if (lines.length === 0) {
      alert("Please add at least one line item");
      return;
    }
    
    // Validating Return Condition vs Warehouse Type locally
    const allowedTypes = {
      "saleable": ["main", "secondary", "cold_storage"],
      "quarantine": ["quarantine", "return"],
      "damaged": ["damaged", "return"],
      "expired": ["expired", "return"],
      "recall": ["quarantine", "return", "damaged"],
    }[returnCondition] || [];

    if (selectedWarehouseType && !allowedTypes.includes(selectedWarehouseType)) {
      alert(`Selected warehouse type (${selectedWarehouseType}) is not suitable for return condition (${returnCondition}).`);
      return;
    }

    // Validate lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.product_id) {
        alert(`Line ${i + 1}: Product is required`);
        return;
      }
      if (!line.return_quantity || Number(line.return_quantity) <= 0) {
        alert(`Line ${i + 1}: Return quantity must be greater than 0`);
        return;
      }
      if (Number(line.unit_price) < 0 || Number(line.discount_amount) < 0 || Number(line.tax_amount) < 0 || Number(line.stock_unit_cost) < 0) {
        alert(`Line ${i + 1}: Amounts cannot be negative`);
        return;
      }
      // Product Batch requirement checked locally roughly, backend will strictly enforce
      if (line.product?.batch_tracking && !line.product_batch_id) {
        alert(`Line ${i + 1}: Product requires a batch`);
        return;
      }
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      const payload = {
        sales_return_date: new Date(salesReturnDate).toISOString(),
        branch_id: Number(branchId),
        warehouse_id: Number(warehouseId),
        customer_name: customerName,
        customer_contact_number: customerContactNumber,
        sales_invoice_number: salesInvoiceNumber,
        customer_credit_note_number: customerCreditNoteNumber,
        reference_number: referenceNumber,
        return_reason: returnReason,
        return_condition: returnCondition,
        remarks,
        ...totals,
        lines: lines.map(line => ({
          warehouse_location_id: line.warehouse_location_id ? Number(line.warehouse_location_id) : null,
          product_id: line.product_id,
          product_batch_id: line.product_batch_id || null,
          return_quantity: Number(line.return_quantity),
          unit_price: Number(line.unit_price),
          discount_amount: Number(line.discount_amount) || 0,
          tax_amount: Number(line.tax_amount) || 0,
          line_total: Number(line.line_total),
          stock_unit_cost: Number(line.stock_unit_cost) || 0,
          return_reason: line.return_reason || returnReason,
          return_condition: line.return_condition || returnCondition,
          line_remarks: line.line_remarks
        }))
      };

      if (isEdit) {
        await inventoryApi.updateSalesReturn(id!, payload);
      } else {
        await inventoryApi.createSalesReturn(payload);
      }
      navigate("/inventory/sales-returns");
    } catch (error: any) {
      console.error("Failed to save sales return", error);
      alert(error.response?.data?.message || "Failed to save. Please check the inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const totals = calculateTotals();

  // Filter warehouses based on branch_id
  const filteredWarehouses = warehouses.filter(w => !branchId || w.branch_id.toString() === branchId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/inventory/sales-returns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {isEdit ? "Edit Sales Return" : "Create Sales Return"}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit ? "Update return details and line items" : "Create a new return from a customer"}
            </p>
          </div>
        </div>
        <PermissionGuard permission={isEdit ? "inventory.sales_return.update" : "inventory.sales_return.create"}>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch <span className="text-red-500">*</span></label>
                  <Select value={branchId} onValueChange={handleBranchChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Warehouse <span className="text-red-500">*</span></label>
                  <Select value={warehouseId} onValueChange={setWarehouseId} disabled={!branchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredWarehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.warehouse_name} ({w.warehouse_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Return Date <span className="text-red-500">*</span></label>
                  <Input
                    type="date"
                    value={salesReturnDate}
                    onChange={(e) => setSalesReturnDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    placeholder="E.g., ABC Pharmacy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Contact</label>
                  <Input
                    placeholder="E.g., 0771234567"
                    value={customerContactNumber}
                    onChange={(e) => setCustomerContactNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Invoice Number</label>
                  <Input
                    placeholder="E.g., INV-001"
                    value={salesInvoiceNumber}
                    onChange={(e) => setSalesInvoiceNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Credit Note No</label>
                  <Input
                    placeholder="If any"
                    value={customerCreditNoteNumber}
                    onChange={(e) => setCustomerCreditNoteNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Number</label>
                  <Input
                    placeholder="E.g., SR-REF-001"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Global Return Reason <span className="text-red-500">*</span></label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item</SelectItem>
                      <SelectItem value="customer_return">Customer Return</SelectItem>
                      <SelectItem value="quality_issue">Quality Issue</SelectItem>
                      <SelectItem value="recall">Recall</SelectItem>
                      <SelectItem value="near_expiry">Near Expiry</SelectItem>
                      <SelectItem value="pricing_error">Pricing Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Return Condition <span className="text-red-500">*</span></label>
                  <Select value={returnCondition} onValueChange={setReturnCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saleable">Saleable</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="recall">Recall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ReturnConditionWarehouseWarning condition={returnCondition} warehouseType={selectedWarehouseType} />

              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks</label>
                <Textarea
                  placeholder="Additional context or reason details..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <SalesReturnLinesTable
            lines={lines}
            onLinesChange={setLines}
            disabled={saving}
            defaultReturnReason={returnReason}
            defaultReturnCondition={returnCondition}
            warehouseId={warehouseId}
          />
        </div>

        <div className="space-y-6">
          <SalesReturnTotalsCard salesReturn={totals as any} />
        </div>
      </div>
    </div>
  );
};

export default SalesReturnFormPage;
