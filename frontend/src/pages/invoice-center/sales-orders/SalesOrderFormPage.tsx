import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import {
  SalesOrderCustomerCreditCard,
  SalesOrderTotalsCard,
} from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { DatePicker } from "../../../components/ui/date-picker";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import type {
  ApiResponse,
  CreateSalesOrderPayload,
  Customer,
  SalesOrderDetail,
  SalesOrderLineForm,
} from "../../../types/invoice-center";
import SalesOrderLinesTable, {
  createBlankSalesOrderLine,
} from "./SalesOrderLinesTable";

type SalesOrderFormState = {
  branch_id: string;
  customer_id: string;
  sales_order_date: string;
  expected_delivery_date: string;
  customer_reference_number: string;
  remarks: string;
};

const today = (): string => new Date().toISOString().slice(0, 10);

const toNumber = (value: number | string | null | undefined): number =>
  Number(value || 0);

const SalesOrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSoftware, activeBranch } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<SalesOrderFormState>({
    branch_id: activeBranch?.id ? String(activeBranch.id) : "",
    customer_id: "",
    sales_order_date: today(),
    expected_delivery_date: "",
    customer_reference_number: "",
    remarks: "",
  });
  const [lines, setLines] = useState<SalesOrderLineForm[]>([
    createBlankSalesOrderLine(),
  ]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      branch_id:
        current.branch_id || (activeBranch?.id ? String(activeBranch.id) : ""),
    }));
  }, [activeBranch]);

  useEffect(() => {
    if (!isEdit || !id || activeSoftware?.software_code !== "INVOICE_CENTER")
      return;

    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await invoiceCenterApi.getSalesOrderById(id);
        const order = (response.data as ApiResponse<SalesOrderDetail>).data;
        setForm({
          branch_id: String(order.branch_id || ""),
          customer_id: String(order.customer_id || ""),
          sales_order_date: order.sales_order_date || today(),
          expected_delivery_date: order.expected_delivery_date || "",
          customer_reference_number: order.customer_reference_number || "",
          remarks: order.remarks || "",
        });
        setCustomer(order.customer || null);
        setLines(
          order.lines?.length
            ? order.lines.map((line) => ({
                id: line.id,
                product_id: line.product_id,
                product_batch_id: line.product_batch_id || null,
                quantity: line.quantity,
                unit_price: line.unit_price,
                discount_amount: line.discount_amount,
                tax_amount: line.tax_amount,
                line_remarks: line.line_remarks || "",
              }))
            : [createBlankSalesOrderLine()]
        );
      } catch (loadError) {
        console.error("Load sales order error:", loadError);
        setError("Failed to load sales order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [activeSoftware, id, isEdit]);

  useEffect(() => {
    if (
      !form.customer_id ||
      activeSoftware?.software_code !== "INVOICE_CENTER"
    ) {
      setCustomer(null);
      return;
    }

    const loadCustomer = async () => {
      try {
        const response = await invoiceCenterApi.getCustomerById(
          form.customer_id
        );
        setCustomer((response.data as ApiResponse<Customer>).data);
      } catch (customerError) {
        console.error("Load customer error:", customerError);
        setCustomer(null);
      }
    };

    loadCustomer();
  }, [activeSoftware, form.customer_id]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="border-rose-200 bg-rose-50 text-rose-600 m-6 rounded-xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payloadLines = lines
      .filter((line) => line.product_id && toNumber(line.quantity) > 0)
      .map((line) => ({
        product_id: Number(line.product_id),
        product_batch_id: line.product_batch_id
          ? Number(line.product_batch_id)
          : null,
        quantity: toNumber(line.quantity),
        unit_price: toNumber(line.unit_price),
        discount_amount: toNumber(line.discount_amount),
        tax_amount: toNumber(line.tax_amount),
        line_remarks: line.line_remarks,
      }));

    if (!form.branch_id || !form.customer_id || payloadLines.length === 0) {
      setError("Branch, customer, and at least one product line are required.");
      return;
    }

    const payload: CreateSalesOrderPayload = {
      branch_id: Number(form.branch_id),
      customer_id: Number(form.customer_id),
      sales_order_date: form.sales_order_date,
      expected_delivery_date: form.expected_delivery_date || undefined,
      customer_reference_number: form.customer_reference_number || undefined,
      remarks: form.remarks || undefined,
      lines: payloadLines,
    };

    setLoading(true);
    try {
      if (isEdit && id) {
        await invoiceCenterApi.updateSalesOrder(id, payload);
      } else {
        await invoiceCenterApi.createSalesOrder(payload);
      }
      navigate("/invoice-center/sales-orders");
    } catch (saveError) {
      console.error("Save sales order error:", saveError);
      setError("Failed to save sales order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6"
    >
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {isEdit ? "Edit Sales Order" : "Create Sales Order"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Use TypeScript-only Invoice Center order entry.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      {error && (
        <div className="border-rose-200 bg-rose-50 text-rose-700 rounded-xl border p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Sales Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Branch ID</Label>
                <Input
                  required
                  value={form.branch_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      branch_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Customer ID</Label>
                <Input
                  required
                  value={form.customer_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      customer_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Customer Reference</Label>
                <Input
                  value={form.customer_reference_number}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      customer_reference_number: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Sales Order Date</Label>
                <DatePicker
                  value={form.sales_order_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      sales_order_date: value,
                    }))
                  }
                  placeholder="Sales order date"
                  clearable={false}
                />
              </div>
              <div className="space-y-1">
                <Label>Expected Delivery Date</Label>
                <DatePicker
                  value={form.expected_delivery_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      expected_delivery_date: value,
                    }))
                  }
                  placeholder="Expected delivery date"
                />
              </div>
              <div className="space-y-1 md:col-span-3">
                <Label>Remarks</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      remarks: event.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent>
              <SalesOrderLinesTable
                lines={lines}
                onChange={setLines}
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SalesOrderCustomerCreditCard customer={customer} />
          <SalesOrderTotalsCard lines={lines} />
        </div>
      </div>
    </form>
  );
};

export default SalesOrderFormPage;
