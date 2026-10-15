import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { PageTitleCard } from "components/common/PageTitleCard";
import { AiAutoFillModal } from "components/common/AiAutoFillModal";
import { inventoryApi } from "api/inventoryApi";
import * as controlApi from "api/controlApi";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { Card, CardContent } from "components/ui/card";
import { PurchaseReturnLine } from "types/inventory";
import PurchaseReturnLinesTable from "./PurchaseReturnLinesTable";
import { PurchaseReturnTotalsCard, GRNLinkedReturnCard } from "components/inventory/PurchaseReturnCards";
import PermissionGuard from "auth/PermissionGuard";

const PurchaseReturnFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Lookups
  const [branches, setBranches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  
  // Header state
  const [purchaseReturnDate, setPurchaseReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [grnId, setGrnId] = useState<string | "none">("none");
  const [returnReason, setReturnReason] = useState("damaged");
  const [remarks, setRemarks] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedGrn, setSelectedGrn] = useState<any>(null);

  // Lines state
  const [lines, setLines] = useState<PurchaseReturnLine[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    inventoryApi
      .getProducts({ limit: 100 })
      .then((res: any) => {
        const list = res.data?.data?.items || res.data?.data || res.data || [];
        if (Array.isArray(list)) setProducts(list);
      })
      .catch(console.error);
  }, []);

  const handleAiApply = (aiData: any) => {
    if (aiData.supplier_id) {
      setSupplierId(String(aiData.supplier_id));
    } else if (aiData.supplier_name && suppliers.length > 0) {
      const match = suppliers.find(
        (s: any) =>
          s.supplier_name?.toLowerCase().includes(aiData.supplier_name.toLowerCase()) ||
          aiData.supplier_name.toLowerCase().includes(s.supplier_name?.toLowerCase()) ||
          s.supplier_code?.toLowerCase() === aiData.supplier_name.toLowerCase()
      );
      if (match) setSupplierId(String(match.id));
    }

    if (aiData.warehouse_id) {
      setWarehouseId(String(aiData.warehouse_id));
    } else if (aiData.warehouse_name && warehouses.length > 0) {
      const match = warehouses.find(
        (w: any) =>
          w.warehouse_name?.toLowerCase().includes(aiData.warehouse_name.toLowerCase()) ||
          aiData.warehouse_name.toLowerCase().includes(w.warehouse_name?.toLowerCase()) ||
          w.warehouse_code?.toLowerCase() === aiData.warehouse_name.toLowerCase()
      );
      if (match) setWarehouseId(String(match.id));
    } else if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(String(warehouses[0].id));
    }

    if (branches.length > 0 && !branchId) {
      setBranchId(String(branches[0].id));
    }

    if (aiData.return_date) setPurchaseReturnDate(aiData.return_date);
    if (aiData.reference_number) setReferenceNumber(aiData.reference_number);
    if (aiData.return_reason) setReturnReason(aiData.return_reason);
    if (aiData.remarks) setRemarks(aiData.remarks);

    if (Array.isArray(aiData.lines) && aiData.lines.length > 0) {
      const mapped = aiData.lines.map((l: any, idx: number) => {
        let matchedProduct = null;
        if (l.product_id) {
          matchedProduct = products.find((p: any) => String(p.id) === String(l.product_id));
        }
        if (!matchedProduct && l.product_name && products.length > 0) {
          const searchName = l.product_name.toLowerCase();
          matchedProduct = products.find(
            (p: any) =>
              p.product_name?.toLowerCase().includes(searchName) ||
              searchName.includes(p.product_name?.toLowerCase()) ||
              p.product_code?.toLowerCase() === searchName
          );
        }
        const prod = matchedProduct || products[0] || null;
        const qty = Number(l.quantity || l.return_quantity || 1);
        const cost = Number(l.unit_cost || prod?.unit_price || 0);

        return {
          id: `line-${idx}-${Date.now()}`,
          product_id: prod ? prod.id : 0,
          product_name: prod ? prod.product_name : (l.product_name || "Pharmaceutical Item"),
          product_code: prod ? prod.product_code : "",
          product_batch_id: null,
          batch_number: l.batch_number || "BATCH-DEFAULT",
          available_quantity: qty * 2,
          return_quantity: qty,
          unit_cost: cost,
          discount_amount: 0,
          tax_amount: 0,
          line_total: qty * cost,
          return_reason: l.return_reason || aiData.return_reason || "damaged",
          line_remarks: l.remarks || "",
        } as PurchaseReturnLine;
      });
      setLines(mapped);
    }
  };

  useEffect(() => {
    fetchLookups();
    if (isEdit) {
      fetchPurchaseReturn();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const [branchesRes, warehousesRes, suppliersRes, grnsRes] = await Promise.all([
        controlApi.getBranches(),
        inventoryApi.getWarehouses({ status: "active", limit: 100 }),
        inventoryApi.getSuppliers({ status: "active", limit: 500 }),
        inventoryApi.getGRNs({ posted_status: "posted", limit: 500 }) // Only allow returns against posted GRNs
      ]);

      if (branchesRes.data?.success) setBranches(branchesRes.data.data);
      if (warehousesRes.data?.success) setWarehouses(warehousesRes.data.data?.data || warehousesRes.data.data);
      if (suppliersRes.data?.success) setSuppliers(suppliersRes.data.data?.data || suppliersRes.data.data);
      if (grnsRes.data?.success) setGrns(grnsRes.data.data?.data || grnsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch lookups", error);
    }
  };

  const fetchPurchaseReturn = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getPurchaseReturnById(id!);
      if (response.data?.success) {
        const pr = response.data.data;
        if (pr.posted_status !== "unposted" || !["draft", "rejected"].includes(pr.approval_status)) {
          alert("This purchase return cannot be edited.");
          navigate(`/inventory/purchase-returns/${pr.id}`);
          return;
        }

        setPurchaseReturnDate(new Date(pr.purchase_return_date).toISOString().split("T")[0]);
        setBranchId(pr.branch_id?.toString() || "");
        setWarehouseId(pr.warehouse_id?.toString() || "");
        setSupplierId(pr.supplier_id?.toString() || "");
        setGrnId(pr.goods_receipt_note_id?.toString() || "none");
        setReturnReason(pr.return_reason || "damaged");
        setRemarks(pr.remarks || "");
        setReferenceNumber(pr.reference_number || "");
        setLines(pr.lines || []);
        if (pr.goods_receipt_note) setSelectedGrn(pr.goods_receipt_note);
      }
    } catch (error) {
      console.error("Failed to fetch PR", error);
      alert("Failed to load return details.");
      navigate("/inventory/purchase-returns");
    } finally {
      setLoading(false);
    }
  };

  const handleGrnSelect = async (selectedGrnId: string) => {
    setGrnId(selectedGrnId);
    if (selectedGrnId === "none") {
      setSelectedGrn(null);
      return;
    }

    try {
      const response = await inventoryApi.getGRNById(selectedGrnId);
      if (response.data?.success) {
        const grn = response.data.data;
        setSelectedGrn(grn);
        
        // Auto-fill header from GRN
        setSupplierId(grn.supplier_id?.toString() || "");
        setWarehouseId(grn.warehouse_id?.toString() || "");
        setBranchId(grn.branch_id?.toString() || "");
        
        // Auto-populate lines with available quantities from GRN
        if (grn.lines && Array.isArray(grn.lines)) {
          const newLines: PurchaseReturnLine[] = grn.lines.map((grnLine: any) => ({
            product_id: grnLine.product_id,
            product: grnLine.product,
            product_batch_id: grnLine.product_batch_id,
            batch: grnLine.product_batch,
            goods_receipt_note_line_id: grnLine.id,
            return_quantity: "", // Wait for user input
            unit_cost: grnLine.unit_cost,
            discount_amount: 0,
            tax_amount: 0,
            line_total: 0,
            return_reason: returnReason,
            line_remarks: "",
            // Assume we need to check real available qty from stock balance API, but for now we set max to received
            available_quantity: grnLine.received_quantity
          }));
          setLines(newLines);
        }
      }
    } catch (error) {
      console.error("Failed to fetch GRN details", error);
    }
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    lines.forEach(line => {
      totalQty += Number(line.return_quantity) || 0;
      subtotal += (Number(line.return_quantity) || 0) * (Number(line.unit_cost) || 0);
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

  const handleSave = async () => {
    if (!branchId || !warehouseId || !supplierId) {
      alert("Please fill all mandatory fields (Branch, Warehouse, Supplier)");
      return;
    }
    if (lines.length === 0) {
      alert("Please add at least one line item");
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
      if (line.available_quantity !== undefined && line.available_quantity !== null) {
        if (Number(line.return_quantity) > line.available_quantity) {
           alert(`Line ${i + 1}: Return quantity exceeds available quantity`);
           return;
        }
      }
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      const payload = {
        purchase_return_date: new Date(purchaseReturnDate).toISOString(),
        branch_id: Number(branchId),
        warehouse_id: Number(warehouseId),
        supplier_id: Number(supplierId),
        goods_receipt_note_id: grnId !== "none" ? Number(grnId) : null,
        return_reason: returnReason,
        remarks,
        reference_number: referenceNumber,
        ...totals,
        lines: lines.map(line => ({
          product_id: line.product_id,
          product_batch_id: line.product_batch_id,
          goods_receipt_note_line_id: line.goods_receipt_note_line_id,
          return_quantity: Number(line.return_quantity),
          unit_cost: Number(line.unit_cost),
          discount_amount: Number(line.discount_amount),
          tax_amount: Number(line.tax_amount),
          line_total: Number(line.line_total),
          return_reason: line.return_reason || returnReason,
          line_remarks: line.line_remarks
        }))
      };

      if (isEdit) {
        await inventoryApi.updatePurchaseReturn(id!, payload);
      } else {
        await inventoryApi.createPurchaseReturn(payload);
      }
      navigate("/inventory/purchase-returns");
    } catch (error) {
      console.error("Failed to save purchase return", error);
      alert("Failed to save. Please check the inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const totals = calculateTotals();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <PageTitleCard
        title={isEdit ? "Edit Purchase Return" : "New Pharmaceutical Purchase Return"}
        description="Return defective, temperature-damaged, or short-expiry batches to pharmaceutical manufacturers."
        moduleTag="Inventory"
        accent="emerald"
        backTo="/inventory/purchase-returns"
        quote={{
          text: "Authorized pharmaceutical vendor returns with mandatory quarantine batch isolation.",
          author: "Ceylon Med Supply Chain Guidelines",
        }}
        actions={
          <div className="flex items-center gap-3">
            {!isEdit && (
              <Button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-medium text-sm shadow-sm transition-all shadow-indigo-100"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>✨ AI Auto-Fill</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/inventory/purchase-returns")}
            >
              Cancel
            </Button>
            <PermissionGuard permission={isEdit ? "inventory.purchase_return.update" : "inventory.purchase_return.create"}>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-600 hover:bg-brand-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link to GRN (Optional)</label>
                  <Select value={grnId} onValueChange={handleGrnSelect} disabled={isEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select GRN" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No GRN / Independent Return</SelectItem>
                      {grns.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.grn_number} - {g.supplier?.supplier_name || "Unknown Supplier"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Return Date <span className="text-red-500">*</span></label>
                  <Input
                    type="date"
                    value={purchaseReturnDate}
                    onChange={(e) => setPurchaseReturnDate(e.target.value)}
                   placeholder="Enter value" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier <span className="text-red-500">*</span></label>
                  <Select value={supplierId} onValueChange={setSupplierId} disabled={grnId !== "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Warehouse <span className="text-red-500">*</span></label>
                  <Select value={warehouseId} onValueChange={setWarehouseId} disabled={grnId !== "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.warehouse_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch <span className="text-red-500">*</span></label>
                  <Select value={branchId} onValueChange={setBranchId} disabled={grnId !== "none"}>
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
                  <label className="text-sm font-medium">Global Return Reason <span className="text-red-500">*</span></label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item</SelectItem>
                      <SelectItem value="over_supply">Over Supply</SelectItem>
                      <SelectItem value="quality_issue">Quality Issue</SelectItem>
                      <SelectItem value="supplier_recall">Supplier Recall</SelectItem>
                      <SelectItem value="pricing_error">Pricing Error</SelectItem>
                      <SelectItem value="near_expiry">Near Expiry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Number</label>
                  <Input
                    placeholder="Supplier Credit Note No, etc."
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              </div>

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

          <PurchaseReturnLinesTable
            lines={lines}
            onLinesChange={setLines}
            disabled={saving}
          />
        </div>

        <div className="space-y-6">
          <PurchaseReturnTotalsCard purchaseReturn={totals as any} />
          
          <GRNLinkedReturnCard grn={selectedGrn} />
        </div>
      </div>

      <AiAutoFillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formType="purchase_return"
        title="AI Purchase Return Auto-Fill"
        contextData={{
          products: products.map((p) => ({
            id: p.id,
            name: p.product_name,
            code: p.product_code,
            unit_price: p.unit_price,
          })),
        }}
        onApply={handleAiApply}
      />
    </div>
  );
};

export default PurchaseReturnFormPage;
