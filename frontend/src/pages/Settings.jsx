import { useEffect, useState } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/api";

export default function Settings() {
  const navigate = useNavigate();

  const [lowStockDefault, setLowStockDefault] = useState(5);
  const [currency, setCurrency] = useState("PHP");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/settings");

        const settings = data.settings || {};

        setLowStockDefault(settings.low_stock_default ?? 5);
        setCurrency(settings.currency || "PHP");
      } catch (error) {
        console.error("Failed to load settings:", error);
        setError(error.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const data = await apiRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          low_stock_default: Number(lowStockDefault),
          currency,
        }),
      });

      const settings = data.settings || {};

      setLowStockDefault(settings.low_stock_default ?? lowStockDefault);
      setCurrency(settings.currency || currency);

      alert("Settings saved!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError(error.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 space-y-5 text-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl bg-white border shadow-sm active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">App preferences & defaults</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-5">
        <div>
          <p className="text-sm font-medium mb-1">Low Stock Threshold</p>

          <input
            type="number"
            min="0"
            value={lowStockDefault}
            onChange={(e) => setLowStockDefault(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <p className="text-xs text-gray-500 mt-1">
            Default alert threshold saved to your account.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Currency</p>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="PHP">PHP (₱)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-5">
        <p className="font-semibold text-sm">About</p>
        <p className="text-sm text-gray-600 mt-1">SmartStock v1.0</p>
        <p className="text-xs text-gray-400">
          Scan. Track. Manage — Smarter system.
        </p>
      </div>
    </div>
  );
}