import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "../components/inventory/ProductCard";
import { apiRequest } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CATEGORIES = [
  "All",
  "Beverages",
  "Snacks",
  "Canned Goods",
  "Condiments",
  "Personal Care",
  "Household",
  "Frozen",
  "Fresh Produce",
  "Dairy",
  "Bread & Bakery",
  "Rice & Grains",
  "Other",
];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");

  const handleDownloadAll = () => {
    console.log("Download all QR");
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/products");

        const productList = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error.message);
        setError("Failed to load products from backend.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const name = p.name || p.product_name || "";
    const sku = p.sku || "";
    const productCategory = p.category || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "All" || productCategory === category;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-4 px-4 py-12 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-gray-500">{products.length} products</p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={handleDownloadAll}
          className="rounded-xl flex items-center gap-1 bg-slate-200 text-gray-700 hover:bg-blue-700 hover:text-white text-xs"
        >
          <Download className="h-4 w-4" />
          Download All QR
        </Button>

        <Link to="/add-product">
          <Button className="rounded-xl flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-900 text-white">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white text-black rounded-xl"
          />
        </div>

        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white rounded-xl"
        >
          <Filter className="h-4 w-4 text-gray-700" />
        </Button>
      </div>

      {showFilters && (
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-xl bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent className="bg-white border rounded-xl shadow-md">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No products found</p>
        ) : (
          filtered.map((p) => (
            <ProductCard key={p.id || p.product_id || p.sku} product={p} />
          ))
        )}
      </div>
    </div>
  );
}