import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface OrgAssignment {
  id?: string | number;
  branch_id: string | number;
  department_id: string | number;
  designation_id: string | number;
  is_primary: boolean;
  effective_from: string;
  effective_to: string;
  status: string;
}

interface OrganizationAssignmentsProps {
  assignments: OrgAssignment[];
  onChange: (assignments: OrgAssignment[]) => void;
  branches: any[];
  departments: any[];
  designations: any[];
}

export const OrganizationAssignments: React.FC<OrganizationAssignmentsProps> = ({
  assignments, onChange, branches, departments, designations
}) => {
  const addAssignment = () => {
    onChange([
      ...assignments,
      {
        branch_id: "", department_id: "", designation_id: "",
        is_primary: assignments.length === 0,
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: "", status: "active"
      }
    ]);
  };

  const updateAssignment = (index: number, field: keyof OrgAssignment, value: any) => {
    const newAssignments = [...assignments];
    newAssignments[index] = { ...newAssignments[index], [field]: value };
    onChange(newAssignments);
  };

  const removeAssignment = (index: number) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    if (assignments[index].is_primary && newAssignments.length > 0) {
      newAssignments[0].is_primary = true;
    }
    onChange(newAssignments);
  };

  const setPrimary = (index: number) => {
    const newAssignments = assignments.map((a, i) => ({ ...a, is_primary: i === index }));
    onChange(newAssignments);
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => (
        <div key={index} className={`p-4 rounded-xl border ${assignment.is_primary ? 'border-[#5483B3] bg-[#f7fbff]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#052659]">Assignment {index + 1}</span>
              {assignment.is_primary && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#C1E8FF] text-[#052659]">
                  <CheckCircle2 className="h-3 w-3" /> Primary
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!assignment.is_primary && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPrimary(index)}>
                  Set Primary
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeAssignment(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Branch *</label>
              <Select value={String(assignment.branch_id)} onValueChange={(v) => updateAssignment(index, "branch_id", v)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.branch_name || b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Department *</label>
              <Select value={String(assignment.department_id)} onValueChange={(v) => updateAssignment(index, "department_id", v)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.department_name || d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Designation *</label>
              <Select value={String(assignment.designation_id)} onValueChange={(v) => updateAssignment(index, "designation_id", v)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select Desig" /></SelectTrigger>
                <SelectContent>
                  {designations.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.designation_name || d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Effective From</label>
              <Input type="date" value={assignment.effective_from} onChange={(e) => updateAssignment(index, "effective_from", e.target.value)} className="h-9 mt-1"  placeholder="Enter value" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Effective To</label>
              <Input type="date" value={assignment.effective_to} onChange={(e) => updateAssignment(index, "effective_to", e.target.value)} className="h-9 mt-1"  placeholder="Enter value" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#052659] uppercase">Status</label>
              <Select value={assignment.status} onValueChange={(v) => updateAssignment(index, "status", v)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addAssignment} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Assignment
      </Button>
    </div>
  );
};
