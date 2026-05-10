import { Link } from "react-router-dom";
import { Package, ChevronRight, AlertTriangle } from "lucide-react";

export default function ProductCard({ product }) {
  const isLowStock =
    product.quantity <= (product.low_stock_threshold || 5);
  const isOutOfStock = product.quantity === 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="flex items-center gap-3 bg-white rounded-xl border-blue-300 border p-3.5 active:scale-[0.98] transition-transform"
    >
      {/* image */}
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
            <Package />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-gray-900">
          {product.name}
        </p>
        <p className="text-xs text-gray-500">
          {product.category} · ₱
          {Number(product.selling_price || 0).toFixed(2)}
        </p>
      </div>

      {/* stock */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p
            className={`text-sm font-bold ${
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                ? "text-amber-600"
                : "text-gray-900"
            }`}
          >
            {product.quantity}
          </p>
          <p className="text-[10px] text-gray-400">
            {product.unit || "pcs"}
          </p>
        </div>

        {/* warning icon */}
        {isLowStock && (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        )}

        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Link>
  );
}