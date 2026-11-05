"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface CategoryOption {
  category_id: number;
  name: string;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { showAlert } = useToast();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");
  const [skuBase, setSkuBase] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [genderTarget, setGenderTarget] = useState("unisex");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number | "">(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Ambil Kategori
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => showAlert("Gagal memuat opsi kategori", "error"));
  }, [showAlert]);

  // 2. Ambil Data Detail Produk
  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const p = data.data;
            setName(p.name || "");
            setSkuBase(p.sku_base || "");
            setCategoryId(p.category_id ? String(p.category_id) : "");
            setGenderTarget(p.gender_target || "unisex");
            setDescription(p.description || "");
            setBasePrice(p.base_price || 0);
            setDiscountPercent(p.discount_percent || 0);
            setStockQuantity(p.stock_quantity || 0);
            setPreviewUrl(p.image_url || "");
          }
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
          showAlert("Gagal memuat data produk", "error");
        });
    }
  }, [id, showAlert]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku_base", skuBase);
      formData.append("category_id", categoryId);
      formData.append("gender_target", genderTarget);
      formData.append("description", description);
      formData.append("base_price", String(basePrice));
      formData.append("discount_percent", String(discountPercent));
      formData.append("stock_quantity", String(stockQuantity));
      if (selectedFile) {
        formData.append("product_image", selectedFile);
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showAlert("Produk berhasil diperbarui!", "success");
        setTimeout(() => {
          router.push("/products");
          router.refresh();
        }, 800);
      } else {
        showAlert(data.message || "Gagal memperbarui produk.", "error");
        setLoading(false);
      }
    } catch (error) {
      showAlert("Terjadi kesalahan koneksi server.", "error");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-12 text-center text-neutral-500 bg-black min-h-screen">
        Memuat data produk...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black text-white font-sans min-h-screen">
      <Link
        href="/products"
        className="text-xs text-purple-400 hover:underline mb-6 inline-block"
      >
        ← Kembali ke Katalog
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Produk Kacamata</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Nama Produk
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              SKU Base
            </label>
            <input
              type="text"
              value={skuBase}
              onChange={(e) => setSkuBase(e.target.value)}
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Kategori Produk
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Target Gender
            </label>
            <select
              value={genderTarget}
              onChange={(e) => setGenderTarget(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="unisex">Unisex</option>
              <option value="pria">Pria</option>
              <option value="wanita">Wanita</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Harga Dasar (Rp)
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) =>
                setBasePrice(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Diskon (%)
            </label>
            <input
              type="number"
              min="0"
              max="99"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Stok Unit
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) =>
                setStockQuantity(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Deskripsi
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Gambar Produk
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl mb-2 border border-neutral-800"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
        >
          {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
