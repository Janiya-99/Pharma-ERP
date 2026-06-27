import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Boxes,
  Building2,
  CheckCircle2,
  Save,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

import {
  assignUserAccessMatrix,
  assignUserBranches,
  assignUserSoftware,
  getBranches,
  getRoles,
  getSoftwareModules,
  getUserAccessMatrix,
  getUserBranches,
  getUserById,
  getUserSoftware,
  getUsers,
  removeUserAccessMatrix,
  removeUserBranch,
  removeUserSoftware,
} from "../../../api/controlApi";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { Switch } from "../../../components/ui/switch";

type UserItem = {
  id: number | string;
  name?: string;
  full_name?: string;
  display_name?: string;
  email?: string;
  employee_code?: string;
  status?: string;
  user_type?: string;
  login_enabled?: boolean;
  role_name?: string;
  role?: { role_name?: string };
  isMock?: boolean;
};

type BranchItem = {
  id: number | string;
  branch_name?: string;
  name?: string;
};

type SoftwareItem = {
  id: number | string;
  software_name?: string;
  software_code?: string;
  description?: string;
};

type RoleItem = {
  id: number | string;
  role_name?: string;
  name?: string;
};

type AccessRecord = {
  id: number | string;
  branch_id?: number | string;
  software_id?: number | string;
  role_id?: number | string;
  role_name?: string;
};

const mockUsers: UserItem[] = [
  { id: "mock-1", name: "Janith Samarasinghe", email: "janith@omacxpharma.lk", employee_code: "EMP-001", status: "active", role_name: "Super Admin", login_enabled: true, isMock: true },
  { id: "mock-2", name: "Nimal Perera", email: "nimal@omacxpharma.lk", employee_code: "EMP-014", status: "active", role_name: "Accountant", login_enabled: true, isMock: true },
  { id: "mock-3", name: "Kasun Silva", email: "kasun@omacxpharma.lk", employee_code: "EMP-027", status: "active", role_name: "Inventory Manager", login_enabled: true, isMock: true },
  { id: "mock-4", name: "Amal Fernando", email: "amal@omacxpharma.lk", employee_code: "EMP-038", status: "inactive", role_name: "Viewer", login_enabled: false, isMock: true },
];

const fallbackBranches: BranchItem[] = [
  { id: "main", branch_name: "Main Branch" },
  { id: "colombo", branch_name: "Colombo Branch" },
  { id: "kandy", branch_name: "Kandy Branch" },
  { id: "galle", branch_name: "Galle Branch" },
  { id: "central-warehouse", branch_name: "Central Warehouse" },
];

const fallbackSoftware: SoftwareItem[] = [
  { id: "control", software_name: "Control Center", software_code: "CONTROL_CENTER", description: "Users, roles, branches, and system setup" },
  { id: "finance", software_name: "Finance", software_code: "FINANCE", description: "Accounting, ledgers, cash, and reports" },
  { id: "inventory", software_name: "Inventory", software_code: "INVENTORY", description: "Products, stock, warehouses, and transfers" },
  { id: "invoice", software_name: "Invoice Center", software_code: "INVOICE_CENTER", description: "Invoices, sales orders, and customer billing" },
  { id: "compliance", software_name: "Compliance Center", software_code: "COMPLIANCE_CENTER", description: "Licenses, recalls, batch holds, and controls" },
];

const fallbackRoles: RoleItem[] = [
  { id: "super-admin", role_name: "Super Admin" },
  { id: "company-admin", role_name: "Company Admin" },
  { id: "branch-manager", role_name: "Branch Manager" },
  { id: "accountant", role_name: "Accountant" },
  { id: "inventory-manager", role_name: "Inventory Manager" },
  { id: "cashier", role_name: "Cashier" },
  { id: "viewer", role_name: "Viewer" },
];

const permissionSummary: Record<string, string[]> = {
  FINANCE: ["View reports", "Create journals", "Approve payments"],
  INVENTORY: ["View stock", "Create GRN", "Transfer stock"],
  CONTROL_CENTER: ["View dashboard", "Manage users"],
  INVOICE_CENTER: ["View invoices", "Create sales orders", "Record receipts"],
  COMPLIANCE_CENTER: ["View compliance records", "Track batch holds", "Review recalls"],
};

const normaliseList = <T,>(res: any, nestedKey?: string): T[] => {
  const data = res?.data ?? res;
  if (nestedKey && Array.isArray(data?.[nestedKey])) return data[nestedKey];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const nameFor = (user: UserItem) => user.display_name || user.name || user.full_name || "Unnamed User";
const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
const idKey = (value: string | number | undefined) => String(value ?? "");
const roleLabel = (role?: RoleItem | null) => role?.role_name || role?.name || "Viewer";
const branchLabel = (branch: BranchItem) => branch.branch_name || branch.name || "Unnamed Branch";
const softwareLabel = (software: SoftwareItem) => software.software_name || software.software_code || "Unnamed Module";
const softwareCode = (software: SoftwareItem) => software.software_code || software.software_name?.toUpperCase().replace(/\s+/g, "_") || "";

const statusClasses = (status?: string) => {
  if (status === "active") return "border-green-200 bg-green-50 text-green-700";
  if (status === "locked" || status === "suspended") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
};

const UserAccessPage = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>(fallbackBranches);
  const [softwareModules, setSoftwareModules] = useState<SoftwareItem[]>(fallbackSoftware);
  const [roles, setRoles] = useState<RoleItem[]>(fallbackRoles);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [accessEnabled, setAccessEnabled] = useState(true);
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>([]);
  const [assignedBranchIds, setAssignedBranchIds] = useState<string[]>([]);
  const [assignedSoftwareIds, setAssignedSoftwareIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSetupData = async () => {
      setLoadingUsers(true);
      try {
        const [usersRes, branchesRes, softwareRes, rolesRes] = await Promise.allSettled([
          getUsers({ page: 1, limit: 100 }),
          getBranches({ page: 1, limit: 100, status: "active" }),
          getSoftwareModules(),
          getRoles({ page: 1, limit: 100, status: "active" }),
        ]);

        if (usersRes.status === "fulfilled") {
          const userList = normaliseList<UserItem>(usersRes.value);
          setUsers(userList.length > 0 ? userList : mockUsers);
        } else {
          setUsers(mockUsers);
        }

        if (branchesRes.status === "fulfilled") {
          const branchList = normaliseList<BranchItem>(branchesRes.value);
          if (branchList.length > 0) setBranches(branchList);
        }

        if (softwareRes.status === "fulfilled") {
          const softwareList = normaliseList<SoftwareItem>(softwareRes.value);
          if (softwareList.length > 0) setSoftwareModules(softwareList);
        }

        if (rolesRes.status === "fulfilled") {
          const roleList = normaliseList<RoleItem>(rolesRes.value);
          if (roleList.length > 0) setRoles(roleList);
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchSetupData();
  }, []);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId || selectedUser) return;

    const existingUser = users.find((user) => idKey(user.id) === userId);
    if (existingUser) {
      setSelectedUser(existingUser);
      return;
    }

    const fetchLinkedUser = async () => {
      try {
        const res = await getUserById(userId);
        if (res.success && res.data) setSelectedUser(res.data);
      } catch {
        setError("Unable to load the selected user.");
      }
    };

    fetchLinkedUser();
  }, [searchParams, selectedUser, users]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedBranchIds([]);
      setSelectedSoftwareIds([]);
      setSelectedRoleId("");
      setAccessRecords([]);
      setAssignedBranchIds([]);
      setAssignedSoftwareIds([]);
      setAccessEnabled(true);
      return;
    }

    setAccessEnabled(selectedUser.login_enabled !== false && selectedUser.status !== "inactive");

    if (selectedUser.isMock) {
      setSelectedBranchIds([idKey(branches[0]?.id)].filter(Boolean));
      setSelectedSoftwareIds([idKey(softwareModules[0]?.id), idKey(softwareModules[1]?.id)].filter(Boolean));
      setSelectedRoleId(idKey(roles.find((role) => roleLabel(role) === selectedUser.role_name)?.id || roles[0]?.id));
      return;
    }

    const fetchUserAccess = async () => {
      setLoadingAccess(true);
      setError("");
      try {
        const [branchRes, softwareRes, matrixRes] = await Promise.allSettled([
          getUserBranches(selectedUser.id),
          getUserSoftware(selectedUser.id),
          getUserAccessMatrix(selectedUser.id),
        ]);

        if (branchRes.status === "fulfilled") {
          const branchList = normaliseList<any>(branchRes.value, "branches");
          const branchIds = branchList.map((branch) => idKey(branch.branch_id || branch.id));
          setAssignedBranchIds(branchIds);
          setSelectedBranchIds(branchIds);
        }

        if (softwareRes.status === "fulfilled") {
          const softwareList = normaliseList<any>(softwareRes.value, "software_modules");
          const softwareIds = softwareList.map((software) => idKey(software.software_id || software.id));
          setAssignedSoftwareIds(softwareIds);
          setSelectedSoftwareIds(softwareIds);
        }

        if (matrixRes.status === "fulfilled") {
          const matrixData = matrixRes.value?.data || matrixRes.value;
          const records = Array.isArray(matrixData) ? matrixData : matrixData?.access_matrix || [];
          setAccessRecords(records);
          const firstRoleId = records.find((record: AccessRecord) => record.role_id)?.role_id;
          if (firstRoleId) setSelectedRoleId(idKey(firstRoleId));
        }
      } catch {
        setError("Unable to load current access for this user.");
      } finally {
        setLoadingAccess(false);
      }
    };

    fetchUserAccess();
  }, [selectedUser, branches, softwareModules, roles]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !q || `${nameFor(user)} ${user.email || ""} ${user.employee_code || ""}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (user.status || "active") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, users]);

  const selectedRole = roles.find((role) => idKey(role.id) === selectedRoleId) || null;
  const selectedSoftware = softwareModules.filter((software) => selectedSoftwareIds.includes(idKey(software.id)));
  const selectedBranches = branches.filter((branch) => selectedBranchIds.includes(idKey(branch.id)));

  const toggleId = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const saveAccess = async () => {
    if (!selectedUser) return;
    if (!selectedRoleId) {
      setError("Select a role before saving access.");
      return;
    }

    if (selectedUser.isMock) {
      toast.success("Access saved for the sample user.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const branchIdsToAssign = selectedBranchIds.filter((id) => !assignedBranchIds.includes(id));
      const branchIdsToRemove = assignedBranchIds.filter((id) => !selectedBranchIds.includes(id));
      const softwareIdsToAssign = selectedSoftwareIds.filter((id) => !assignedSoftwareIds.includes(id));
      const softwareIdsToRemove = assignedSoftwareIds.filter((id) => !selectedSoftwareIds.includes(id));

      if (branchIdsToAssign.length > 0) {
        await assignUserBranches(selectedUser.id, {
          branches: branchIdsToAssign.map((branchId) => ({ branch_id: Number(branchId), is_default: false })),
        });
      }

      await Promise.all(branchIdsToRemove.map((branchId) => removeUserBranch(selectedUser.id, branchId)));

      if (softwareIdsToAssign.length > 0) {
        await assignUserSoftware(selectedUser.id, {
          software_modules: softwareIdsToAssign.map((softwareId) => ({ software_id: Number(softwareId), can_access: true })),
        });
      }

      await Promise.all(softwareIdsToRemove.map((softwareId) => removeUserSoftware(selectedUser.id, softwareId)));

      const targetKeys = new Set(
        selectedBranchIds.flatMap((branchId) =>
          selectedSoftwareIds.map((softwareId) => `${branchId}:${softwareId}:${selectedRoleId}`)
        )
      );

      await Promise.all(
        accessRecords
          .filter((record) => !targetKeys.has(`${record.branch_id}:${record.software_id}:${record.role_id}`))
          .map((record) => removeUserAccessMatrix(selectedUser.id, record.id))
      );

      if (selectedBranchIds.length > 0 && selectedSoftwareIds.length > 0) {
        await assignUserAccessMatrix(selectedUser.id, {
          access: selectedBranchIds.flatMap((branchId) =>
            selectedSoftwareIds.map((softwareId) => ({
              branch_id: Number(branchId),
              software_id: Number(softwareId),
              role_id: Number(selectedRoleId),
            }))
          ),
        });
      }

      toast.success("User access saved successfully.");
      setAssignedBranchIds(selectedBranchIds);
      setAssignedSoftwareIds(selectedSoftwareIds);
      const refreshed = await getUserAccessMatrix(selectedUser.id);
      const refreshedData = refreshed?.data;
      setAccessRecords(Array.isArray(refreshedData) ? refreshedData : refreshedData?.access_matrix || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to save access. Please review the selections and try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedUserName = selectedUser ? nameFor(selectedUser) : "";

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Control Center</span>
            <span>/</span>
            <span className="font-medium text-slate-900">User Access</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Access</h1>
            <p className="mt-2 text-sm text-slate-500">
              Select a user and manage their branch access, software modules, and role in one place.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-blue-600" />
                Users
              </CardTitle>
              <CardDescription>Select a user to update access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 bg-white pl-9"
                  placeholder="Search users"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>

              <ScrollArea className="h-[620px] pr-3">
                <div className="space-y-2">
                  {loadingUsers ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="rounded-xl border border-slate-100 p-3">
                        <Skeleton className="h-11 w-full bg-slate-100" />
                      </div>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const fullName = nameFor(user);
                      const isSelected = selectedUser && idKey(selectedUser.id) === idKey(user.id);
                      return (
                        <button
                          key={idKey(user.id)}
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-blue-200 bg-blue-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 font-semibold text-blue-700">
                                {initialsFor(fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
                              <p className="truncate text-xs text-slate-500">{user.email || "No email"}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                                  {user.role_name || user.role?.role_name || (user.user_type || "Viewer").replace(/_/g, " ")}
                                </Badge>
                                <Badge variant="outline" className={statusClasses(user.status)}>
                                  {user.status || "active"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <UserCog className="h-5 w-5 text-blue-600" />
                Access Setup
              </CardTitle>
              <CardDescription>Assign branches, software modules, and role for the selected user.</CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              {!selectedUser ? (
                <div className="flex min-h-[620px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Users className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Select a user to manage access</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Choose a user from the list to assign branches, software modules, and role.
                    </p>
                  </div>
                </div>
              ) : loadingAccess ? (
                <div className="space-y-5">
                  <Skeleton className="h-28 w-full bg-slate-100" />
                  <Skeleton className="h-40 w-full bg-slate-100" />
                  <Skeleton className="h-56 w-full bg-slate-100" />
                </div>
              ) : (
                <div className="space-y-5">
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-blue-100 text-lg font-bold text-blue-700">
                            {initialsFor(selectedUserName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">{selectedUserName}</h2>
                          <p className="text-sm text-slate-500">{selectedUser.email || "No email"}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Employee code: {selectedUser.employee_code || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusClasses(selectedUser.status)}>
                          {selectedUser.status || "active"}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                          {roleLabel(selectedRole)}
                        </Badge>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                          <Label className="text-xs text-slate-500">Access enabled</Label>
                          <Switch checked={accessEnabled} onCheckedChange={setAccessEnabled} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Branch Access
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">Select the branches this user can access.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {branches.map((branch) => {
                        const value = idKey(branch.id);
                        return (
                          <label
                            key={value}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-200 hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={selectedBranchIds.includes(value)}
                              onCheckedChange={() => toggleId(value, selectedBranchIds, setSelectedBranchIds)}
                            />
                            <span className="text-sm font-medium text-slate-700">{branchLabel(branch)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <Boxes className="h-5 w-5 text-blue-600" />
                        Software Access
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {softwareModules.map((software) => {
                        const value = idKey(software.id);
                        const checked = selectedSoftwareIds.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleId(value, selectedSoftwareIds, setSelectedSoftwareIds)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              checked ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                <Boxes className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-slate-900">{softwareLabel(software)}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {software.description || "Module access and related workflows"}
                                    </p>
                                  </div>
                                  <Checkbox
                                    checked={checked}
                                    onClick={(event) => event.stopPropagation()}
                                    onCheckedChange={() => toggleId(value, selectedSoftwareIds, setSelectedSoftwareIds)}
                                  />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        Role
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        The selected role controls the user's permissions inside assigned modules.
                      </p>
                    </div>
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                      <SelectTrigger className="h-10 w-full max-w-sm bg-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={idKey(role.id)} value={idKey(role.id)}>
                            {roleLabel(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Permission Summary
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">Read-only summary based on the selected role and modules.</p>
                    </div>
                    {selectedSoftware.length === 0 ? (
                      <Alert className="border-slate-200 bg-slate-50">
                        <AlertDescription>Select at least one software module to see the permission summary.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {selectedSoftware.map((software) => {
                          const code = softwareCode(software);
                          const summary = permissionSummary[code] || ["View assigned records", "Create permitted records", "Review assigned work"];
                          return (
                            <div key={idKey(software.id)} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="font-semibold text-slate-900">{softwareLabel(software)}</p>
                                <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                                  {roleLabel(selectedRole)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {summary.map((item) => (
                                  <Badge key={item} variant="outline" className="border-blue-100 bg-white text-slate-600">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <Separator />

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      className="h-10 bg-white"
                      onClick={() => {
                        if (selectedUser) setSelectedUser({ ...selectedUser });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-10 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={saving || selectedBranches.length === 0 || selectedSoftware.length === 0}
                      onClick={saveAccess}
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Access"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserAccessPage;
