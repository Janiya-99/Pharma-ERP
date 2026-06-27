import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Building2,
  Boxes,
  ShieldCheck,
  Lock,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Breadcrumbs from "../../../components/common/Breadcrumbs";
import StepperIndicator from "../../../components/common/StepperIndicator";
import StepBasicDetails from "./wizard/StepBasicDetails";
import StepOrganizationAssignment from "./wizard/StepOrganizationAssignment";
import StepSoftwareAccess from "./wizard/StepSoftwareAccess";
import StepRolesPermissions from "./wizard/StepRolesPermissions";
import StepLoginSecurity from "./wizard/StepLoginSecurity";
import StepReviewSave from "./wizard/StepReviewSave";
import {
  createUser,
  updateUser,
  getUserById,
  getUserBranches,
  getUserSoftware,
  assignUserBranches,
  assignUserSoftware,
  getDepartments,
  getDesignations,
} from "../../../api/controlApi";

const STEPS = [
  { label: "Basic Details", icon: <User className="h-4 w-4" /> },
  { label: "Organization", icon: <Building2 className="h-4 w-4" /> },
  { label: "Software", icon: <Boxes className="h-4 w-4" /> },
  { label: "Roles", icon: <ShieldCheck className="h-4 w-4" /> },
  { label: "Security", icon: <Lock className="h-4 w-4" /> },
  { label: "Review", icon: <ClipboardCheck className="h-4 w-4" /> },
];

const INITIAL_FORM_DATA = {
  // Step 1
  first_name: "",
  last_name: "",
  display_name: "",
  email: "",
  phone: "",
  employee_code: "",
  department_id: "",
  designation_id: "",
  status: "active",
  // Step 2
  assigned_branches: [] as (string | number)[],
  primary_branch_id: "",
  allow_all_branches: false,
  // Step 3
  software_modules: [] as (string | number)[],
  default_software_id: "",
  // Step 4
  role_assignments: {} as Record<string, any>,
  // Step 5
  login_enabled: true,
  password: "",
  confirm_password: "",
  force_password_change: true,
  two_factor_enabled: false,
  account_expiry: "",
  allowed_login_time: "",
  allowed_ips: "",
};

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchUserData();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        getDepartments({ limit: 100 }),
        getDesignations({ limit: 100 }),
      ]);
      if (deptRes.success) setDepartments(deptRes.data.items || deptRes.data);
      if (desigRes.success) setDesignations(desigRes.data.items || desigRes.data);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, branchRes, softwareRes] = await Promise.all([
        getUserById(id!),
        getUserBranches(id!),
        getUserSoftware(id!),
      ]);

      if (userRes.success) {
        const user = userRes.data;
        const nameParts = (user.full_name || "").split(" ");
        setFormData((prev) => ({
          ...prev,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          display_name: user.display_name || user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          employee_code: user.employee_code || "",
          department_id: user.department_id || "",
          designation_id: user.designation_id || "",
          status: user.status || "active",
          primary_branch_id: user.default_branch_id || "",
          login_enabled: user.login_enabled !== false,
          two_factor_enabled: user.two_factor_enabled || false,
          force_password_change: user.force_password_change || false,
        }));
      }

      if (branchRes.success) {
        const branches = branchRes.data.branches || [];
        setFormData((prev) => ({
          ...prev,
          assigned_branches: branches.map((b: any) => b.id),
        }));
      }

      if (softwareRes.success) {
        const software = softwareRes.data.software_modules || [];
        setFormData((prev) => ({
          ...prev,
          software_modules: software.map((s: any) => s.id),
        }));
      }
    } catch (err) {
      console.error("Failed to load user", err);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async (createAnother = false) => {
    setSaving(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      const payload: any = {
        employee_code: formData.employee_code,
        full_name: fullName,
        display_name: formData.display_name || fullName,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id ? parseInt(String(formData.department_id), 10) : null,
        designation_id: formData.designation_id ? parseInt(String(formData.designation_id), 10) : null,
        default_branch_id: formData.primary_branch_id ? parseInt(String(formData.primary_branch_id), 10) : null,
        user_type: "company_user",
        status: formData.status,
        login_enabled: formData.login_enabled,
        force_password_change: formData.force_password_change,
        two_factor_enabled: formData.two_factor_enabled,
      };

      if (!isEdit) {
        payload.password = formData.password;
      }

      let userId: string | number;
      if (isEdit) {
        const res = await updateUser(id!, payload);
        if (!res.success) {
          toast.error(res.message || "Failed to update user");
          return;
        }
        userId = id!;
        toast.success("User updated successfully!");
      } else {
        const res = await createUser(payload);
        if (!res.success) {
          toast.error(res.message || "Failed to create user");
          return;
        }
        userId = res.data?.id || res.data?.user_id;
        toast.success("User created successfully!");
      }

      // Assign branches
      if (formData.assigned_branches.length > 0) {
        try {
          await assignUserBranches(userId, {
            branch_ids: formData.assigned_branches.map((id) => parseInt(String(id), 10)),
          });
        } catch {
          toast.error("User saved but branch assignment failed");
        }
      }

      // Assign software modules
      if (formData.software_modules.length > 0) {
        try {
          await assignUserSoftware(userId, {
            software_ids: formData.software_modules.map((id) => parseInt(String(id), 10)),
          });
        } catch {
          toast.error("User saved but software assignment failed");
        }
      }

      if (createAnother) {
        setFormData({ ...INITIAL_FORM_DATA });
        setCurrentStep(0);
        window.scrollTo(0, 0);
      } else {
        navigate("/control-center/users");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/control-center/users" },
          { label: "Users", href: "/control-center/users" },
          { label: isEdit ? "Edit User" : "Create User" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mt-4 mb-6">
        <button
          onClick={() => navigate("/control-center/users")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit User" : "Create New User"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit
              ? "Update user details, access, and permissions"
              : "Set up a new user with branch access, software modules, and roles"}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <StepperIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 0 && (
          <StepBasicDetails
            formData={formData}
            onChange={handleFieldChange}
            departments={departments}
            designations={designations}
          />
        )}
        {currentStep === 1 && (
          <StepOrganizationAssignment formData={formData} onChange={handleFieldChange} />
        )}
        {currentStep === 2 && (
          <StepSoftwareAccess formData={formData} onChange={handleFieldChange} />
        )}
        {currentStep === 3 && (
          <StepRolesPermissions formData={formData} onChange={handleFieldChange} />
        )}
        {currentStep === 4 && (
          <StepLoginSecurity formData={formData} onChange={handleFieldChange} isEdit={isEdit} />
        )}
        {currentStep === 5 && (
          <StepReviewSave
            formData={formData}
            isEdit={isEdit}
            onSave={() => handleSave(false)}
            onSaveAndCreate={() => handleSave(true)}
            onBack={handleBack}
            onCancel={() => navigate("/control-center/users")}
            saving={saving}
          />
        )}
      </div>

      {/* Navigation Buttons (steps 0-4 only; step 5 has its own) */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/control-center/users")}
            className="wizard-nav-btn wizard-nav-btn-ghost"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button type="button" onClick={handleBack} className="wizard-nav-btn wizard-nav-btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button type="button" onClick={handleNext} className="wizard-nav-btn wizard-nav-btn-primary">
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCreatePage;
