import { useState, useEffect } from "react";
import { getSoftwareModules } from "../../api/controlApi";
import { Loader2 } from "lucide-react";

const SoftwareSelector = ({ value, onChange, disabled = false, required = false, className = "" }: { value?: any; onChange?: (value: any) => void; disabled?: boolean; required?: boolean; className?: string }) => {
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSoftware();
  }, []);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      const res = await getSoftwareModules();
      if (res.success) {
        setSoftware(res.data.items || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch software modules", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e: any) => onChange?.(e.target.value)}
        disabled={disabled || loading}
        required={required}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 disabled:bg-gray-100 disabled:text-gray-500 transition-colors appearance-none pr-10"
      >
        <option value="">Select Software Module</option>
        {software.map((s: unknown) => (
          <option key={s.id} value={s.id}>
            {s.software_name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
      </div>
    </div>
  );
};

export default SoftwareSelector;
