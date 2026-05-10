import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";

export default function AlertBanner({ lowStockCount, expiringCount }) {
  if (lowStockCount === 0 && expiringCount === 0) return null;

  return (
    <div className="px-5 space-y-2">
      {lowStockCount > 0 && (
        <Link
          to="/alerts?tab=low-stock"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
        >
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Low Stock Alert
            </p>
            <p className="text-xs text-amber-600">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} need restocking
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-400" />
        </Link>
      )}

      {expiringCount > 0 && (
        <Link
          to="/alerts?tab=expiring"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3"
        >
          <div className="p-1.5 bg-red-100 rounded-lg">
            <Clock className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Expiring Soon
            </p>
            <p className="text-xs text-red-600">
              {expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 7 days
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-red-400" />
        </Link>
      )}
    </div>
  );
}