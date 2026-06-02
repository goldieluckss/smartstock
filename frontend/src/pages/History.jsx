import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Undo2,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { apiRequest } from "@/lib/api";

const typeConfig = {
  stock_in: {
    icon: ArrowDownLeft,
    color: "text-green-600 bg-green-50",
    label: "Stock In",
  },
  stock_out: {
    icon: ArrowUpRight,
    color: "text-red-500 bg-red-50",
    label: "Removed",
  },
  sold: {
    icon: ShoppingCart,
    color: "text-blue-600 bg-blue-50",
    label: "Sold",
  },
  adjustment: {
    icon: RefreshCw,
    color: "text-indigo-600 bg-indigo-50",
    label: "Adjusted",
  },
  return: {
    icon: Undo2,
    color: "text-purple-600 bg-purple-50",
    label: "Return",
  },
};

const filterLabels = {
  all: "All",
  stock_in: "Stock In",
  stock_out: "Stock Out",
  sold: "Sold",
  adjustment: "Adjustment",
  return: "Return",
};

export default function History() {
  const navigate = useNavigate();

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovements() {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          filterType === "all"
            ? "/products/movements"
            : `/products/movements?type=${filterType}`;

        const data = await apiRequest(endpoint);

        setMovements(data.movements || []);
      } catch (error) {
        console.error("Failed to load history:", error);
        setError(error.message || "Failed to load history.");
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMovements();
  }, [filterType]);

  const grouped = movements.reduce((acc, m) => {
    const date = moment(m.created_date || m.created_at).format("YYYY-MM-DD");

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(m);
    return acc;
  }, {});

  function isPositiveMovement(type) {
    return type === "stock_in" || type === "return";
  }

  return (
    <div className="space-y-4 text-gray-900 px-4 py-12">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl bg-white border hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-gray-500">Stock movement logs</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "stock_in", "stock_out", "sold", "adjustment", "return"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                filterType === t
                  ? "bg-gradient-to-r from-blue-500 to-blue-900 text-white"
                  : "bg-white text-gray-900 border"
              }`}
            >
              {filterLabels[t]}
            </button>
          )
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* CONTENT */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : movements.length === 0 ? (
          <div className="text-center text-gray-700 py-10">
            No movements yet
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-sm text-gray-500 mb-2">
                {moment(date).format("MMM D, YYYY")}
              </p>

              <div className="bg-white rounded-xl divide-y border">
                {items.map((m) => {
                  const config = typeConfig[m.type] || typeConfig.stock_in;
                  const Icon = config.icon;
                  const positive = isPositiveMovement(m.type);

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {m.product_name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {config.label} • Inventory
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {moment(m.created_date || m.created_at).fromNow()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            positive ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {positive ? "+" : "-"}
                          {m.quantity || 1}
                        </p>

                        <p className="text-[12px] text-gray-400">
                          {m.type || "movement"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}