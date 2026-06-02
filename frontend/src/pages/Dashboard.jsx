import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

import PageHeader from "../components/layout/PageHeader";
import StatsCard from "../components/dashboard/StatsCard";
import AlertBanner from "../components/dashboard/AlertBanner";
import RecentMovements from "../components/dashboard/RecentMovements";
import CategoryChart from "../components/dashboard/CategoryChart";
import { apiRequest } from "@/lib/api";

import smartstockLogo from "../../assets/logo.png";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState("");

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, movementsResponse] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/products/movements/recent?limit=5"),
      ]);

      setProducts(productsResponse.products || []);
      setMovements(movementsResponse.movements || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError(error.message || "Failed to load dashboard data.");
      setProducts([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const lowStockItems = products.filter(
    (product) =>
      Number(product.quantity || 0) <=
      Number(product.low_stock_threshold || 5)
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0) * Number(product.selling_price || 0),
    0
  );

  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const expiringSoonItems = products.filter((product) => {
    if (!product.expiry_date) return false;

    const expiryDate = new Date(product.expiry_date);

    return expiryDate >= today && expiryDate <= sevenDaysFromNow;
  });

  return (
    <div className="min-h-screen space-y-5 bg-gray-100 pb-20 text-white">
      <PageHeader
        logo={smartstockLogo}
        title="SmartStock"
        subtitle="Scan. Track. Manage — Smarter."
      />

      {error && (
        <div className="px-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}

      <AlertBanner
        lowStockCount={lowStockItems.length}
        expiringCount={expiringSoonItems.length}
      />

      <div className="grid grid-cols-2 gap-3 px-5">
        <StatsCard icon={Package} label="Total Products" value={totalProducts} />

        <StatsCard
          icon={ShoppingCart}
          label="Total Stock"
          value={totalStock}
          color="blue"
        />

        <StatsCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockItems.length}
          color="accent"
        />

        <StatsCard
          icon={TrendingUp}
          label="Stock Value"
          value={`₱${totalValue.toFixed(2)}`}
          color="destructive"
        />
      </div>

      <div className="px-5">
        <CategoryChart products={products} />
      </div>

      <RecentMovements movements={movements} />
    </div>
  );
}