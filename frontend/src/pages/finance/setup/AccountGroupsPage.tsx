import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import ERPConfirmDialog from "../../../components/erp/ERPConfirmDialog";

type AccountGroup = {
  id: number;
  group_code: string;
  group_name: string;
  account_type: string;
  parent_group_id?: number | null;
  parent_group?: AccountGroup | null;
  description?: string;
  status: string;
};

type AccountGroupForm = {
  group_code: string;
  group_name: string;
  account_type: string;
  parent_group_id: string;
  description: string;
  status: string;
};

const accountTypes = ["asset", "liability", "equity", "income", "expense"];

const emptyForm: AccountGroupForm = {
  group_code: "",
  group_name: "",
  account_type: "asset",
  parent_group_id: "none",
  description: "",
  status: "active",
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const labelize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const AccountGroupsPage = () => {
  const { company, user } = useAuth();
  const companyId = company?.id || company?.company_id;

  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AccountGroup | null>(null);
  const [groupToDeactivate, setGroupToDeactivate] =
    useState<AccountGroup | null>(null);
  const [form, setForm] = useState<AccountGroupForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    search: "",
    account_type: "all",
    status: "all",
  });

  const fetchGroups = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await financeApi.getAccountGroups({
        page: 1,
        limit: 500,
        company_id: companyId,
        search: filters.search,
        account_type:
          filters.account_type === "all" ? "" : filters.account_type,
        status: filters.status === "all" ? "" : filters.status,
      });
      setGroups(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load account groups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [companyId, filters.search, filters.account_type, filters.status]);

  const parentOptions = useMemo(() => {
    return groups.filter((group) => {
      if (group.status !== "active") return false;
      if (group.account_type !== form.account_type) return false;
      if (editingGroup && group.id === editingGroup.id) return false;
      return true;
    });
  }, [groups, form.account_type, editingGroup]);

  const setField = <K extends keyof AccountGroupForm>(
    key: K,
    value: AccountGroupForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (group: AccountGroup) => {
    setEditingGroup(group);
    setForm({
      group_code: group.group_code || "",
      group_name: group.group_name || "",
      account_type: group.account_type || "asset",
      parent_group_id: group.parent_group_id
        ? String(group.parent_group_id)
        : "none",
      description: group.description || "",
      status: group.status || "active",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!companyId)
      nextErrors.company_id = "Please select a company before saving.";
    if (!form.group_code.trim())
      nextErrors.group_code = "Group code is required.";
    if (!form.group_name.trim())
      nextErrors.group_name = "Group name is required.";
    if (!form.account_type)
      nextErrors.account_type = "Account type is required.";
    if (!form.status) nextErrors.status = "Status is required.";
    if (
      editingGroup &&
      form.parent_group_id !== "none" &&
      Number(form.parent_group_id) === editingGroup.id
    ) {
      nextErrors.parent_group_id = "Parent group cannot be the same group.";
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      company_id: companyId,
      group_code: form.group_code.trim(),
      group_name: form.group_name.trim(),
      account_type: form.account_type,
      parent_group_id:
        form.parent_group_id === "none" ? null : Number(form.parent_group_id),
      description: form.description.trim(),
      status: form.status,
      ...(editingGroup ? { updated_by: user?.id } : { created_by: user?.id }),
    };

    setSubmitting(true);
    try {
      if (editingGroup) {
        await financeApi.updateAccountGroup(editingGroup.id, payload);
        toast.success("Account group updated successfully");
      } else {
        await financeApi.createAccountGroup(payload);
        toast.success("Account group created successfully");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingGroup(null);
      await fetchGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save account group"));
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (group: AccountGroup) => {
    setGroupToDeactivate(group);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!groupToDeactivate) return;
    setDeactivating(true);
    try {
      await financeApi.deactivateAccountGroup(groupToDeactivate.id, {
        updated_by: user?.id,
      });
      toast.success("Account group deactivated successfully");
      setConfirmOpen(false);
      setGroupToDeactivate(null);
      await fetchGroups();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to deactivate account group"));
    } finally {
      setDeactivating(false);
    }
  };

  if (!companyId) {
    return (
      <div className="text-slate-900 min-h-full bg-[#F8FAFC] p-6">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a company before using Account Groups.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-slate-900 min-h-full bg-[#F8FAFC] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Finance Setup
          </p>
          <h1 className="text-slate-900 mt-1 text-3xl font-bold tracking-tight">
            Account Groups
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl text-sm">
            Create and maintain account groups used to organize the chart of
            accounts and finance reports.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Account Group
        </Button>
      </div>

      <Card className="border-slate-200 border bg-white shadow-sm">
        <CardHeader className="border-slate-100 border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Account Groups</CardTitle>
              <CardDescription>
                Search, filter, create, edit, and deactivate account groups.
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_130px]">
              <div className="relative">
                <Search className="text-slate-400 pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search groups"
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.account_type}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, account_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {labelize(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Code</TableHead>
                <TableHead>Group Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="bg-slate-100 h-8 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-slate-500 h-32 text-center text-sm"
                  >
                    No account groups found.
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="text-slate-900 font-medium">
                      {group.group_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-slate-900 font-medium">
                          {group.group_name}
                        </p>
                        {group.description ? (
                          <p className="text-slate-500 mt-1 line-clamp-1 text-xs">
                            {group.description}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{labelize(group.account_type || "")}</TableCell>
                    <TableCell>
                      {group.parent_group?.group_name || "Root group"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          group.status === "active"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {labelize(group.status || "inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(group)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => requestDeactivate(group)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Update Account Group" : "Create Account Group"}
              </DialogTitle>
              <DialogDescription>
                Required fields are marked with an asterisk.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Group Code" required error={errors.group_code}>
                <Input
                  value={form.group_code}
                  onChange={(event) =>
                    setField("group_code", event.target.value)
                  }
                  placeholder="AG-001"
                />
              </Field>
              <Field label="Group Name" required error={errors.group_name}>
                <Input
                  value={form.group_name}
                  onChange={(event) =>
                    setField("group_name", event.target.value)
                  }
                  placeholder="Current Assets"
                />
              </Field>
              <Field label="Account Type" required error={errors.account_type}>
                <Select
                  value={form.account_type}
                  onValueChange={(value) => {
                    setField("account_type", value);
                    setField("parent_group_id", "none");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {labelize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Parent Group" error={errors.parent_group_id}>
                <Select
                  value={form.parent_group_id}
                  onValueChange={(value) => setField("parent_group_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Root group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Root group</SelectItem>
                    {parentOptions.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.group_code} - {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" required error={errors.status}>
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setField("description", event.target.value)
                    }
                    rows={3}
                    placeholder="Optional notes for this account group"
                  />
                </Field>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {editingGroup ? "Update Account Group" : "Create Account Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ERPConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate Account Group"
        message="This keeps the account group history but removes it from active setup choices."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={deactivating}
      />
    </div>
  );
};

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label className="text-slate-700 text-sm font-medium">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </Label>
    {children}
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>
);

export default AccountGroupsPage;
