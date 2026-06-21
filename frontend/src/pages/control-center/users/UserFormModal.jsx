import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import { createUser, updateUser, getBranches, getUserBranches } from "../../../api/controlApi";

import { toast } from "sonner";

const UserFormModal = ({ isOpen, onClose, user, onSuccess, departments, designations }) => {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    employee_code: "",
    full_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation_id: "",
    default_branch_id: "",
    user_type: "company_user",
    status: "active",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData({
          employee_code: user.employee_code || "",
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          department_id: user.department_id || "",
          designation_id: user.designation_id || "",
          default_branch_id: user.default_branch_id || "",
          user_type: user.user_type || "company_user",
          status: user.status || "active",
          password: "",
          confirm_password: "",
        });
        fetchUserBranches(user.id);
      } else {
        setFormData({
          employee_code: "",
          full_name: "",
          email: "",
          phone: "",
          department_id: "",
          designation_id: "",
          default_branch_id: "",
          user_type: "company_user",
          status: "active",
          password: "",
          confirm_password: "",
        });
        fetchAllBranches();
      }
      setError(null);
    }
  }, [isOpen, user]);

  const fetchAllBranches = async () => {
    try {
      const res = await getBranches({ limit: 100 });
      if (res.success) setBranches(res.data.items || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserBranches = async (userId) => {
    try {
      const res = await getUserBranches(userId);
      if (res.success) {
        setBranches(res.data.branches || []); // Expecting the backend to return assigned branches
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.full_name.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email address.";
    
    if (!isEdit) {
      if (!formData.password) return "Password is required.";
      if (formData.password.length < 8) return "Password must be at least 8 characters.";
      if (formData.password !== formData.confirm_password) return "Passwords do not match.";
    }

    if (!formData.status) return "Status is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      employee_code: formData.employee_code,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
      designation_id: formData.designation_id ? parseInt(formData.designation_id, 10) : null,
      default_branch_id: formData.default_branch_id ? parseInt(formData.default_branch_id, 10) : null,
      user_type: formData.user_type,
      status: formData.status,
    };

    if (!isEdit) {
      payload.password = formData.password;
    }

    try {
      let res;
      if (isEdit) {
        res = await updateUser(user.id, payload);
      } else {
        res = await createUser(payload);
      }

      if (res.success) {
        if (isEdit) {
          toast.success("User updated successfully!");
        } else {
          toast.success("User created successfully!");
        }
        onSuccess();
      } else {
        setError(res.message || "An error occurred");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Create User"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            autoFocus
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Employee Code"
            name="employee_code"
            value={formData.employee_code}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {!isEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 my-2">
            <Input
              label="Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <select
              name="designation_id"
              value={formData.designation_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Select Designation</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>{d.designation_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Branch</label>
            <select
              name="default_branch_id"
              value={formData.default_branch_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branch_name}</option>
              ))}
            </select>
            {isEdit && branches.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">User has no assigned branches.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="company_user">Company User</option>
              <option value="company_admin">Company Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
