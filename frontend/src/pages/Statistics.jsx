import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { apiRequest } from "@/lib/api";

export default function Statistics() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, movementsResponse] = await Promise.all([
          apiRequest("/products"),
          apiRequest("/products/movements"),
        ]);

        setProducts(productsResponse.products || []);
        setMovements(movementsResponse.movements || []);
      } catch (error) {
        console.error("Failed to load statistics:", error);
        setError(error.message || "Failed to load statistics.");
        setProducts([]);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = parseInt(range, 10);
  const cutoff = startOfDay(subDays(new Date(), days));

  const filteredMovements = movements.filter((m) => {
    const dateValue = m.created_date || m.created_at;
    if (!dateValue) return false;

    return isAfter(new Date(dateValue), cutoff);
  });

  const salesMovements = filteredMovements.filter((m) => m.type === "sold");
  const stockInMovements = filteredMovements.filter(
    (m) => m.type === "stock_in"
  );

  const totalRevenue = salesMovements.reduce((sum, m) => {
    const prod = products.find((p) => Number(p.id) === Number(m.product_id));
    return sum + Number(m.quantity || 0) * Number(prod?.selling_price || 0);
  }, 0);

  const totalCOGS = salesMovements.reduce((sum, m) => {
    const prod = products.find((p) => Number(p.id) === Number(m.product_id));
    return sum + Number(m.quantity || 0) * Number(prod?.cost_price || 0);
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;

  const grossMargin = totalRevenue
    ? ((grossProfit / totalRevenue) * 100).toFixed(1)
    : 0;

  const totalUnitsSold = salesMovements.reduce(
    (sum, m) => sum + Number(m.quantity || 0),
    0
  );

  const totalStockIn = stockInMovements.reduce(
    (sum, m) => sum + Number(m.quantity || 0),
    0
  );

  const dailyMap = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM d");
    dailyMap[d] = {
      date: d,
      revenue: 0,
      profit: 0,
    };
  }

  salesMovements.forEach((m) => {
    const prod = products.find((p) => Number(p.id) === Number(m.product_id));
    const dateValue = m.created_date || m.created_at;

    if (!dateValue) return;

    const d = format(new Date(dateValue), "MMM d");

    if (dailyMap[d]) {
      const rev = Number(m.quantity || 0) * Number(prod?.selling_price || 0);
      const cost = Number(m.quantity || 0) * Number(prod?.cost_price || 0);

      dailyMap[d].revenue += rev;
      dailyMap[d].profit += rev - cost;
    }
  });

  const dailyData = Object.values(dailyMap).slice(-14);

  const productSales = {};

  salesMovements.forEach((m) => {
    const prod = products.find((p) => Number(p.id) === Number(m.product_id));
    const productId = m.product_id;

    if (!productSales[productId]) {
      productSales[productId] = {
        name: m.product_name || prod?.name || "Unknown Product",
        qty: 0,
        revenue: 0,
      };
    }

    productSales[productId].qty += Number(m.quantity || 0);
    productSales[productId].revenue +=
      Number(m.quantity || 0) * Number(prod?.selling_price || 0);
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const fmt = (n) =>
    `₱${Number(n || 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-5 text-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl bg-white border shadow-sm active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-bold">Statistics</h1>
          <p className="text-sm text-gray-500">
            Revenue & Performance Overview
          </p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded-xl p-2 text-sm bg-white"
        >
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Revenue" value={fmt(totalRevenue)} icon={DollarSign} />

        <StatCard
          label="Profit"
          value={fmt(grossProfit)}
          icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
          color={grossProfit >= 0 ? "text-green-600" : "text-red-500"}
          sub={`${grossMargin}% margin`}
        />

        <StatCard
          label="Units Sold"
          value={totalUnitsSold}
          icon={ShoppingCart}
        />

        <StatCard label="Stock In" value={totalStockIn} icon={Package} />
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-4">
        <p className="text-sm font-semibold mb-3">Revenue vs Profit</p>

        {dailyData.every((item) => item.revenue === 0 && item.profit === 0) ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No sales data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              <Line dataKey="profit" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-4">
        <p className="text-sm font-semibold mb-3">Top Products</p>

        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No sold products yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-2">
        <p className="text-sm font-semibold">Profit & Loss</p>

        <Row label="Revenue" value={fmt(totalRevenue)} />
        <Row label="Cost of Goods Sold" value={`-${fmt(totalCOGS)}`} />
        <Row label="Profit" value={fmt(grossProfit)} bold />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-blue-600", sub }) {
  const IconComponent = icon;

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
        {IconComponent && (
          <IconComponent className={`h-4 w-4 ${color}`} />
        )}
        {label}
      </div>

      <p className="text-lg font-bold">{value}</p>

      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-gray-500"}>
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}