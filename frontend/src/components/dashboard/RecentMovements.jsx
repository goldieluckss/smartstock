import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Undo2 } from "lucide-react";
import moment from "moment";

const typeConfig = {
  stock_in: { icon: ArrowDownLeft, color: "#16a34a", label: "Stock In" },
  stock_out: { icon: ArrowUpRight, color: "#ef4444", label: "Stock Out" },
  sold: { icon: ArrowUpRight, color: "#ef4444", label: "Sold" },
  adjustment: { icon: RefreshCw, color: "#2563eb", label: "Adjusted" },
  return: { icon: Undo2, color: "#7c3aed", label: "Return" },
};

function isPositiveMovement(type) {
  return type === "stock_in" || type === "return";
}

export default function RecentMovements({ movements = [] }) {
  if (movements.length === 0) {
    return (
      <div className="px-5">
        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base text-black font-semibold">Recent Activity</h2>
        <Link to="/history" className="text-xs text-blue-600 font-medium">
          View All
        </Link>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {movements.slice(0, 5).map((m) => {
          const config = typeConfig[m.type] || typeConfig.stock_in;
          const Icon = config.icon;
          const positive = isPositiveMovement(m.type);

          return (
            <div key={m.id} className="flex items-center gap-3 p-3.5">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-black font-medium truncate">
                  {m.product_name || "Unknown Product"}
                </p>
                <p className="text-xs text-gray-500">
                  {config.label} · Inventory
                </p>
              </div>

              <div className="flex flex-col items-end">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: positive ? "#16a34a" : "#ef4444",
                  }}
                >
                  {positive ? "+" : "-"}
                  {m.quantity || 1} pcs
                </p>

                <p className="text-[10px] text-gray-500 mt-0.5">
                  {m.created_date ? moment(m.created_date).fromNow() : "Just now"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}