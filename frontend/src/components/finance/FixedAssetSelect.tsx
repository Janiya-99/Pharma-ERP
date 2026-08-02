import { useState, useEffect } from "react";
import { financeApi } from "../../api/financeApi";
import { Check, ChevronsUpDown } from "lucide-react";

const FixedAssetSelect = ({ value, onChange, error, disabled, className = "", statusFilter = "active" }: { value?: unknown; onChange?: unknown; error?: unknown; disabled?: unknown; className?: unknown; statusFilter?: unknown }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (statusFilter) {
        params.asset_status = statusFilter;
      }
      const res = await financeApi.getFixedAssets(params);
      setAssets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load fixed assets", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAsset = assets.find((a: unknown) => a.id === value);
  const filteredAssets = assets.filter(
    (a: unknown) =>
      a.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center justify-between w-full p-2.5 bg-white  border rounded-xl cursor-pointer ${
          error ? "border-red-500" : "border-gray-200 "
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-brand-500"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate text-sm ${!selectedAsset ? "text-gray-400" : "text-gray-800 "}`}>
          {selectedAsset 
            ? `${selectedAsset.asset_code} - ${selectedAsset.asset_name} (NBV: ${Number(selectedAsset.net_book_value || 0).toLocaleString()})` 
            : "Select Fixed Asset..."}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg  ">
          <div className="p-2 border-b border-gray-100 ">
            <input
              type="text"
              placeholder="Search asset..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500   "
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
            {loading ? (
              <div className="p-3 text-sm text-center text-gray-500">Loading...</div>
            ) : filteredAssets.length === 0 ? (
              <div className="p-3 text-sm text-center text-gray-500">No assets found.</div>
            ) : (
              filteredAssets.map((asset: unknown) => (
                <div
                  key={asset.id}
                  className={`flex flex-col p-2 text-sm rounded-lg cursor-pointer hover:bg-gray-50  ${
                    value === asset.id ? "bg-brand-50 " : ""
                  }`}
                  onClick={() => {
                    onChange(asset.id, asset);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-medium ${value === asset.id ? "text-brand-600" : "text-gray-800 "}`}>
                      {asset.asset_code} - {asset.asset_name}
                    </span>
                    {value === asset.id && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>NBV: LKR {Number(asset.net_book_value || 0).toLocaleString()}</span>
                    <span>Status: {asset.asset_status?.replace("_", " ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default FixedAssetSelect;
