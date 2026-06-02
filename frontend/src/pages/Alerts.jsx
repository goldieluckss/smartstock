import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Package } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function Alerts() {
  const [tab, setTab] = useState("low-stock");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    outOfStock: [],
    lowStock: [],
    expired: [],
    expiringSoon: [],
    expiringLater: [],
    counts: {
      lowStockTab: 0,
      expiringTab: 0,
    },
  });

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/products/alerts/summary");

        setSummary({
          outOfStock: data.outOfStock || [],
          lowStock: data.lowStock || [],
          expired: data.expired || [],
          expiringSoon: data.expiringSoon || [],
          expiringLater: data.expiringLater || [],
          counts: data.counts || {
            lowStockTab:
              (data.outOfStock || []).length + (data.lowStock || []).length,
            expiringTab:
              (data.expired || []).length +
              (data.expiringSoon || []).length +
              (data.expiringLater || []).length,
          },
        });
      } catch (error) {
        console.error("Failed to load alerts:", error);
        setError(error.message || "Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const tabs = [
    {
      id: "low-stock",
      label: "Low Stock",
      count: summary.counts.lowStockTab || 0,
    },
    {
      id: "expiring",
      label: "Expiring",
      count: summary.counts.expiringTab || 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-12 space-y-3 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-gray-500">
          Monitor low stock and expiry alerts
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg transition ${
              tab === t.id
                ? "bg-gradient-to-r from-blue-500 to-blue-900 text-white"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            {t.label}

            {t.count > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === "low-stock" ? (
          <>
            <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
              <Package className="h-3 w-3" /> Out of Stock (
              {summary.outOfStock.length})
            </p>

            {summary.outOfStock.map((p) => (
              <Card
                key={p.id}
                icon={<Package className="w-4 h-4" />}
                color="red"
                product={p}
                text="Out of Stock"
              />
            ))}

            <p className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Low Stock (
              {summary.lowStock.length})
            </p>

            {summary.lowStock.map((p) => (
              <Card
                key={p.id}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="yellow"
                product={p}
                text="Low Stock"
              />
            ))}

            {summary.outOfStock.length === 0 &&
              summary.lowStock.length === 0 && (
                <Empty text="All stock is healthy" />
              )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expired ({summary.expired.length})
            </p>

            {summary.expired.map((p) => (
              <Card
                key={p.id}
                icon={<Clock className="w-4 h-4" />}
                color="red"
                product={p}
                text="Expired"
                rightText={p.expiry_date}
              />
            ))}

            <p className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expiring within 7 days (
              {summary.expiringSoon.length})
            </p>

            {summary.expiringSoon.map((p) => (
              <Card
                key={p.id}
                icon={<Clock className="w-4 h-4" />}
                color="yellow"
                product={p}
                text="Expiring Soon"
                rightText={p.expiry_date}
              />
            ))}

            <p className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expiring within 30 days (
              {summary.expiringLater.length})
            </p>

            {summary.expiringLater.map((p) => (
              <Card
                key={p.id}
                icon={<Clock className="w-4 h-4" />}
                color="blue"
                product={p}
                text="Expiring Later"
                rightText={p.expiry_date}
              />
            ))}

            {summary.expired.length === 0 &&
              summary.expiringSoon.length === 0 &&
              summary.expiringLater.length === 0 && (
                <Empty text="No expiry alerts 🎉" />
              )}
          </>
        )}
      </div>
    </div>
  );
}

function Card({ icon, product, text, color, rightText }) {
  const colors = {
    red: {
      border: "border-red-300",
      iconBg: "bg-red-50",
      text: "text-red-600",
    },
    yellow: {
      border: "border-yellow-300",
      iconBg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    blue: {
      border: "border-blue-300",
      iconBg: "bg-blue-50",
      text: "text-blue-600",
    },
  };

  const c = colors[color] || colors.red;

  return (
    <div
      className={`flex items-center justify-between bg-white border rounded-xl p-3 ${c.border}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${c.iconBg} ${c.text}`}>{icon}</div>

        <div>
          <p className="font-medium text-sm text-gray-800">{product.name}</p>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
      </div>

      <div className="text-right">
        <p className={`text-sm font-bold ${c.text}`}>{text}</p>
        <p className="text-xs text-gray-500">
          {rightText || `${product.quantity} ${product.unit || "pcs"}`}
        </p>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-center py-10 text-gray-500">{text}</div>;
}