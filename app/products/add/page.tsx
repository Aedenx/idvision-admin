"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  category_id: number;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [skuBase, setSkuBase] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [genderTarget, setGenderTarget] = useState("unisex");
  const [description, setDescription] = useState("");

  // Promo & Price State
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);

  // Variant State
  const [colorName, setColorName] = useState("Standard");
  const [initialStock, setInitialStock] = useState<number | "">(10);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Ambil daftar kategori dari database secara dinamis
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setCategoryId(String(data.data[0].category_id));
        }
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  // Kalkulasi Harga Promo
  const numericBasePrice = Number(basePrice) || 0;
  const promoPrice =
    discountPercent > 0
      ? numericBasePrice - numericBasePrice * (discountPercent / 100)
      : numericBasePrice;

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
      formData.append("is_featured", String(isFeatured));
      formData.append("color_name", colorName);
      formData.append("stock_quantity", String(initialStock)); // Disamakan dengan backend

      if (selectedFile) {
        formData.append("product_image", selectedFile);
      }

      // PERBAIKAN UTAMA: Mengarah ke /api/products yang benar
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          show: true,
          message: "Produk berhasil ditambahkan!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/products");
          router.refresh();
        }, 1200);
      } else {
        setToast({
          show: true,
          message: data.message || "Gagal menyimpan produk.",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Terjadi kesalahan koneksi.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-black text-white font-sans">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-5">
        <div>
          <Link
            href="/products"
            className="text-xs text-purple-400 hover:underline flex items-center gap-1 mb-2"
          >
            ← Kembali ke Katalog Produk
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Produk & Atur Promo
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Masukkan rincian kacamata baru, harga diskon, serta upload gambar
            produk.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Kolom Kiri & Tengah: Informasi Utama & Harga Promo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Informasi Dasar */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 border-b border-neutral-800 pb-3">
              Informasi Utama Produk
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Nama Kacamata <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SUMMIT Series Black"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!skuBase)
                      setSkuBase(
                        e.target.value.toUpperCase().replace(/\s+/g, "-"),
                      );
                  }}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Kode SKU Base <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SUMMIT-BLK"
                  value={skuBase}
                  onChange={(e) => setSkuBase(e.target.value.toUpperCase())}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {categories.length === 0 ? (
                    <option value="">Memuat kategori...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Target Gender
                </label>
                <select
                  value={genderTarget}
                  onChange={(e) => setGenderTarget(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="unisex">Unisex (Semua)</option>
                  <option value="pria">Pria (Men)</option>
                  <option value="wanita">Wanita (Women)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Deskripsi Produk
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan spesifikasi kacamata, material frame, perlindungan UV400..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Card 2: Pengaturan Harga & Promo */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                Pengaturan Harga & Diskon Promo
              </h2>
              {discountPercent > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                  PROMO AKTIF -{discountPercent}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Harga Dasar (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="200000"
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Persentase Diskon (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Box Kalkulasi Harga Akhir */}
            <div className="bg-black/60 border border-neutral-800/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-neutral-400 text-xs block">
                  Harga Setelah Diskon / Promo:
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  {discountPercent > 0
                    ? `Rp ${numericBasePrice.toLocaleString("id-ID")}`
                    : ""}
                </span>
              </div>
              <span className="text-xl font-extrabold text-emerald-400">
                Rp {promoPrice.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-purple-600 bg-black border-neutral-800 rounded cursor-pointer"
              />
              <label
                htmlFor="isFeatured"
                className="text-xs text-neutral-300 cursor-pointer"
              >
                Tampilkan di Banner / Produk Unggulan Beranda (Featured)
              </label>
            </div>
          </div>

          {/* Card 3: Varian Stok Awal */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 border-b border-neutral-800 pb-3">
              Varian Stok Awal
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Nama Varian / Warna
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Contoh: Black Glossy / Standard"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Jumlah Stok (Unit)
                </label>
                <input
                  type="number"
                  value={initialStock}
                  onChange={(e) =>
                    setInitialStock(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="10"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Upload Gambar Produk */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-4 text-left border-b border-neutral-800 pb-3">
              Gambar Utama Produk
            </h2>

            <div className="relative group w-full h-64 bg-black border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-purple-500/60 transition cursor-pointer mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview Produk"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center p-4 text-neutral-500">
                  <svg
                    className="w-10 h-10 mb-2 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-neutral-400">
                    Klik untuk memilih gambar
                  </span>
                  <span className="text-[10px] text-neutral-600 mt-1">
                    Format: WEBP, JPG, PNG (Maks 2MB)
                  </span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-neutral-500 text-left">
              Gambar ini otomatis tersimpan di{" "}
              <code className="text-purple-400 font-mono">
                public/uploads/products/
              </code>{" "}
              dan dijadikan gambar sampul utama produk.
            </p>
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Menyimpan Produk..." : "Simpan Produk & Promo"}
          </button>
        </div>
      </form>
    </div>
  );
}
