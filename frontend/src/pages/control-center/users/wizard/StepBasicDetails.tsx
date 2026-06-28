import React from "react";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";

interface StepBasicDetailsProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  departments: any[];
  designations: any[];
}

const StepBasicDetails = ({
  formData,
  onChange,
  departments,
  designations,
}: StepBasicDetailsProps) => {
  const handleChange = (e: any) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Basic Details
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Enter the user's personal and organizational information
          </p>
        </div>
      </div>
      <div className="card-premium-body">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="First Name *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            autoFocus
          />
          <Input
            label="Last Name *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
          />
          <Input
            label="Display Name"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            placeholder="How this user appears in the system"
          />
          <Input
            label="Email Address *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@company.com"
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 77 123 4567"
          />
          <Input
            label="Employee Code"
            name="employee_code"
            value={formData.employee_code}
            onChange={handleChange}
            placeholder="EMP-001"
          />
          <Select
            label="Department"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            searchable={true}
            placeholder="Select Department"
            options={departments.map((d: any) => ({
              value: d.id,
              label: d.department_name,
            }))}
          />
          <Select
            label="Designation"
            name="designation_id"
            value={formData.designation_id}
            onChange={handleChange}
            searchable={true}
            placeholder="Select Designation"
            options={designations.map((d: any) => ({
              value: d.id,
              label: d.designation_name,
            }))}
          />
        </div>

        {/* Status */}
        <div className="section-divider" />
        <div className="max-w-xs">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default StepBasicDetails;
