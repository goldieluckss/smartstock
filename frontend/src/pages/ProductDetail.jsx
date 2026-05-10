import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Calendar,
  MapPin,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import moment from "moment";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);

        const productResponse = await apiRequest(`/products/${id}`);
        const productData = productResponse.product;

        setProduct(productData);
        setEditForm(productData || {});

        const movementResponse = await apiRequest(`/products/${id}/movements`);
        setMovements(movementResponse.movements || []);
      } catch (error) {
        console.error("Failed to load product details:", error);
        setProduct(null);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [id]);

  const handleEdit = async () => {
    try {
      setSaving(true);

      const payload = {
        name: editForm.name,
        sku: editForm.sku,
        qr_code: editForm.qr_code,
        category: editForm.category,
        unit: editForm.unit,
        quantity: Number(editForm.quantity),
        cost_price: Number(editForm.cost_price),
        selling_price: Number(editForm.selling_price),
        low_stock_threshold: Number(editForm.low_stock_threshold),
        expiry_date: editForm.expiry_date || null,
        supplier: editForm.supplier,
        location: editForm.location,
        image: editForm.image || null,
      };

      const data = await apiRequest(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setProduct(data.product);
      setEditForm(data.product);
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update product:", error);
      alert(error.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/products/${id}`, {
        method: "DELETE",
      });

      setDeleteOpen(false);
      navigate("/inventory");
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(error.message || "Failed to delete product.");
    }
  };

  const downloadQr = async (qrCode, productName) => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrCode
      )}`;

      const response = await fetch(url);
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `${productName || "product"}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download QR:", error);
      alert("Failed to download QR.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate("/inventory")} className="mt-3 rounded-xl">
          Back
        </Button>
      </div>
    );
  }

  const isLow = Number(product.quantity) <= Number(product.low_stock_threshold || 5);
  const isExpired =
    product.expiry_date && new Date(product.expiry_date) < new Date();

  return (
    <div className="h-screen overflow-y-auto bg-gray-100 pb-20 space-y-5">
      <div className="px-5 pt-6 flex justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>

        <div className="flex gap-2 bg-slate-100 bg-secondary p-1 rounded-xl">
          <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
            <Edit />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white bg-card rounded-2xl border p-5">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-100 bg-secondary rounded-xl flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold">{product.name}</h1>
              <p className="text-gray-700 text-sm text-muted-foreground">
                {product.category}
              </p>
              <p className="text-gray-500 text-xs text-muted-foreground">
                {product.sku || product.qr_code}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-slate-100 bg-secondary p-3 rounded-xl text-center">
              <p className={cn("text-xl font-bold", isLow && "text-amber-600")}>
                {product.quantity}
              </p>
              <p className="text-xs text-gray-500">Stock</p>
            </div>

            <div className="bg-slate-100 bg-secondary p-3 rounded-xl text-center">
              <p className="text-xl font-bold">
                ₱{Number(product.selling_price || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Price</p>
            </div>

            <div className="bg-slate-100 bg-secondary p-3 rounded-xl text-center">
              <p className="text-xl font-bold">
                ₱
                {(
                  Number(product.quantity || 0) *
                  Number(product.selling_price || 0)
                ).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Value</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {product.expiry_date && (
              <p>
                <Calendar className="inline w-4 h-4 mr-1" />
                <span className="text-xs">
                  Expiry Date: {product.expiry_date} {isExpired && "(Expired)"}
                </span>
              </p>
            )}

            {product.location && (
              <p>
                <MapPin className="inline w-4 h-4 mr-1" />
                <span className="text-xs">Location: {product.location}</span>
              </p>
            )}

            {product.supplier && (
              <p>
                <Truck className="inline w-4 h-4 mr-1" />
                <span className="text-xs">Supplier: {product.supplier}</span>
              </p>
            )}

            <hr className="my-3 border-gray-300" />

            {product.qr_code && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Scan this QR to find the product
                </p>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                    product.qr_code
                  )}`}
                  className="w-28 h-28 rounded-lg mx-auto"
                  alt="QR Code"
                />

                <p className="text-xs text-gray-400 mt-2">
                  {product.sku || product.qr_code}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mx-auto rounded-xl flex items-center gap-1.5 mt-2"
                  onClick={() => downloadQr(product.qr_code, product.name)}
                >
                  <Download className="flex items-center w-4 h-4" />
                  Download QR
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5">
        <h2 className="font-semibold mb-2">Recent Movements</h2>

        <div className="bg-white rounded-2xl border divide-y">
          {movements.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No movements yet.</p>
          ) : (
            movements.map((m) => {
              const isPositive = m.type === "stock_in" || m.type === "return";

              return (
                <div key={m.id} className="flex items-center justify-between p-3">
                  <div>
                    {isPositive ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 ml-3">
                    <p className="text-xs text-gray-600">
                      {moment(m.created_date).format("MMM D, h:mm A")}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {String(m.type).replace("_", " ")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: isPositive ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {isPositive ? "+" : "-"}
                      {m.quantity || 1}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="text-gray-800 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="text-sm text-gray-500">Name</div>
            <Input
              className="bg-slate-200 border-slate-300"
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">SKU/Barcode</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.sku || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sku: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">QR Code</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.qr_code || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, qr_code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">Category</div>
            <Input
              className="bg-slate-200 border-slate-300"
              value={editForm.category || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Quantity</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.quantity || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Unit</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.unit || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unit: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cost Price</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.cost_price || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cost_price: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Selling Price</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.selling_price || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, selling_price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                <Input
                  className="bg-slate-200 border-slate-300"
                  value={editForm.low_stock_threshold || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      low_stock_threshold: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                <Input
                  type="date"
                  className="bg-slate-200 border-slate-300"
                  value={editForm.expiry_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">Supplier</div>
            <Input
              value={editForm.supplier || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, supplier: e.target.value })
              }
              className="bg-slate-200 border-slate-300 w-full p-3 rounded-xl"
            />

            <div className="text-sm text-gray-500">Location</div>
            <Input
              value={editForm.location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="bg-slate-200 border-slate-300 w-full p-3 rounded-xl"
            />

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Product Image</p>

              <input
                type="file"
                accept="image/*"
                className="w-full p-2 rounded-xl"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const reader = new FileReader();

                  reader.onloadend = () => {
                    setEditForm({
                      ...editForm,
                      image: reader.result,
                    });
                  };

                  reader.readAsDataURL(file);
                }}
              />

              {editForm.image && (
                <img
                  src={editForm.image}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl mt-2 border"
                />
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={handleEdit}
              disabled={saving}
              className="w-full text-white bg-gradient-to-r from-blue-400 to-blue-700 hover:to-blue-800 rounded-xl"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="text-gray-800 bg-white rounded-md mt-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white hover:bg-gray-100 rounded-md mt-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="text-white bg-red-500 hover:bg-red-600 rounded-md mt-1"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}