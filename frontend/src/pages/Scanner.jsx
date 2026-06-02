import { useState } from "react";
import {
  Camera,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Keyboard,
  X,
} from "lucide-react";

import QrCameraScanner from "../components/scanner/QrCameraScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PageHeader from "../components/layout/PageHeader";
import { apiRequest } from "@/lib/api";

import smartstockLogo from "../assets/logo.jpg";

export default function Scanner() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const searchProduct = async (code) => {
    const q = (code || qrInput).trim();

    if (!q) {
      toast.error("Please enter a QR code, SKU, or product name.");
      return;
    }

    try {
      setSearching(true);
      setFoundProduct(null);

      let product = null;

      try {
        const qrResponse = await apiRequest(
          `/products/by-qr/${encodeURIComponent(q)}`
        );

        product = qrResponse.product;
      } catch {
        product = null;
      }

      if (!product) {
        const productsResponse = await apiRequest("/products");
        const products = productsResponse.products || [];

        product = products.find((p) => {
          const qrCode = String(p.qr_code || "").toLowerCase();
          const sku = String(p.sku || "").toLowerCase();
          const name = String(p.name || "").toLowerCase();
          const query = q.toLowerCase();

          return qrCode === query || sku === query || name.includes(query);
        });
      }

      if (!product) {
        toast.error("Product not found", {
          description: "Try QR code, SKU, or product name.",
        });
        return;
      }

      setFoundProduct(product);
      setManualOpen(false);
      setQrInput("");
    } catch (error) {
      console.error("Failed to search product:", error);
      toast.error("Search failed", {
        description: error.message || "Unable to search product.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleCameraScan = (code) => {
    setCameraOpen(false);
    searchProduct(code);
  };

  const handleAction = async (type) => {
    if (!foundProduct) {
      toast.error("No product selected.");
      return;
    }

    const movementQuantity = Number(quantity);

    if (!movementQuantity || movementQuantity <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    try {
      setProcessing(true);

      const prevQty = Number(foundProduct.quantity || 0);

      await apiRequest(`/products/${foundProduct.id}/movements`, {
        method: "POST",
        body: JSON.stringify({
          movement_type: type,
          quantity: movementQuantity,
        }),
      });

      const updatedProductResponse = await apiRequest(
        `/products/${foundProduct.id}`
      );

      const updatedProduct = updatedProductResponse.product;

      setFoundProduct(updatedProduct);

      const newQty = Number(updatedProduct?.quantity ?? prevQty);

      toast.success(
        `${
          type === "stock_in"
            ? "Stocked In"
            : type === "sold"
            ? "Sold"
            : "Removed"
        }: ${movementQuantity} ${foundProduct.unit || "pcs"}`,
        {
          description: `${foundProduct.name}: ${prevQty} → ${newQty}`,
        }
      );

      setQuantity(1);
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast.error("Stock update failed", {
        description: error.message || "Unable to update stock.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-screen space-y-5 overflow-y-auto">
      <PageHeader
        logo={smartstockLogo}
        title="Stock Scanner"
        subtitle="Scan QR or search product"
      />

      {cameraOpen && (
        <QrCameraScanner
          onScan={handleCameraScan}
          onClose={() => setCameraOpen(false)}
        />
      )}

      <div className="space-y-4 px-5">
        <div
          className="flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-blue-500 bg-white p-8 transition-colors hover:bg-blue-100"
          onClick={() => setCameraOpen(true)}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
            <Camera className="h-20 w-20 rounded-2xl bg-blue-100 p-5 text-blue-700" />
          </div>

          <div className="text-center">
            <p className="font-semibold">Tap to Scan QR Code</p>
            <p className="text-xs text-gray-400">
              Point camera at product QR
            </p>
          </div>
        </div>

        {!manualOpen ? (
          <button
            onClick={() => setManualOpen(true)}
            className="flex w-full items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-gray-900"
          >
            <Keyboard className="h-4 w-4" />
            Search manually
          </button>
        ) : (
          <div className="space-y-3 rounded-2xl border border-blue-400 bg-white p-4">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Manual Search</p>
              <button onClick={() => setManualOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <Input
                className="border-gray-300 bg-white text-black"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProduct()}
                placeholder="QR / SKU / Name"
              />

              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-900"
                onClick={() => searchProduct()}
                disabled={searching}
              >
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        )}

        {foundProduct && (
          <>
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-300 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                    {foundProduct.image ? (
                      <img
                        src={foundProduct.image}
                        alt={foundProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Img</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{foundProduct.name}</p>
                    <p className="text-xs text-gray-500">
                      {foundProduct.category}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {foundProduct.qr_code || foundProduct.sku}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {foundProduct.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      {foundProduct.unit || "pcs"}
                    </p>
                  </div>
                </div>

                <hr className="my-3 border-gray-200" />

                <div className="flex items-center justify-between">
                  <button
                    className="text-xs text-red-500 underline"
                    onClick={() => {
                      setFoundProduct(null);
                      setQuantity(1);
                    }}
                  >
                    Clear
                  </button>

                  <div className="text-right">
                    <p className="text-sm font-bold">
                      ₱{Number(foundProduct.selling_price || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      per {foundProduct.unit || "pcs"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-blue-300 bg-white p-4">
              <Label className="text-sm">Quantity</Label>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, Number(prev) - 1))
                  }
                  disabled={processing}
                >
                  -
                </Button>

                <Input
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-20 text-center"
                />

                <Button
                  onClick={() => setQuantity((prev) => Number(prev) + 1)}
                  disabled={processing}
                >
                  +
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleAction("stock_in")}
                  className="bg-green-600"
                  disabled={processing}
                >
                  <ArrowDownLeft className="h-4 w-4 text-white" />
                  <p className="text-xs text-white">Stock In</p>
                </Button>

                <Button
                  onClick={() => handleAction("sold")}
                  className="bg-teal-600"
                  disabled={processing}
                >
                  <ShoppingCart className="h-4 w-4 text-white" />
                  <p className="text-xs text-white">Sold</p>
                </Button>

                <Button
                  onClick={() => handleAction("stock_out")}
                  className="bg-red-600"
                  disabled={processing}
                >
                  <ArrowUpRight className="h-4 w-4 text-white" />
                  <p className="text-xs text-white">Remove</p>
                </Button>

                <div className="col-span-3 text-center text-xs text-gray-500">
                  <span className="font-bold text-green-600">Stock In</span> =
                  receiving goods ·{" "}
                  <span className="font-bold text-teal-600">Sold</span> =
                  customer purchase ·{" "}
                  <span className="font-bold text-red-600">Remove</span> =
                  damaged/loss
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}