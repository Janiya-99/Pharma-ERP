import React from "react";

const settingGroups = [
  {
    group: "General",
    settings: [
      { label: "Currency", value: "LKR (Sri Lankan Rupee)", type: "select" },
      { label: "Time Zone", value: "Asia/Colombo (UTC+5:30)", type: "select" },
      { label: "Date Format", value: "DD/MM/YYYY", type: "select" },
    ],
  },
  {
    group: "Document Prefixes",
    settings: [
      { label: "Invoice Prefix", value: "INV-", type: "text" },
      { label: "GRN Prefix", value: "GRN-", type: "text" },
      { label: "PO Prefix", value: "PO-", type: "text" },
      { label: "Credit Note Prefix", value: "CN-", type: "text" },
      { label: "Journal Prefix", value: "JNL-", type: "text" },
    ],
  },
  {
    group: "Tax Settings",
    settings: [
      { label: "Default Tax Rate (%)", value: "12", type: "number" },
      { label: "Tax Registration No.", value: "VAT-123456789", type: "text" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-navy-700 dark:text-white">System Settings</h1>
        <p className="text-sm text-gray-400">Configure global ERP system settings</p>
      </div>
      {settingGroups.map((g: any) => (
        <div key={g.group} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-navy-700">{g.group}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {g.settings.map((s: any) => (
              <div key={s.label} className="flex items-center justify-between px-5 py-3">
                <label className="text-sm font-medium text-gray-700">{s.label}</label>
                <input
                  type={s.type}
                  defaultValue={s.value}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400 w-56 text-right"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <button className="px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all shadow-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}
