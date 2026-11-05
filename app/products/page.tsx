"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface Product {
  product_id: number;
  name: string;
  price: number;
  discount_percent: number;
  discount_price: number;
  image_url: string;
  category_name: string;
  total_stock: number;
  total_sold: number;
  is_active: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // <-- State untuk sorting[cite: 3]
  const [loading, setLoading] = useState(true);
  const { showAlert } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        showAlert("Produk berhasil dihapus!", "success");
        setProducts(products.filter((p) => p.product_id !== id));
      } else {
        showAlert(data.message || "Gagal menghapus produk.", "error");
      }
    } catch (err) {
      showAlert("Kesalahan koneksi server.", "error");
    }
  };

  // 1. Filter pencarian dan kategori[cite: 3]
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category_name &&
        product.category_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || product.category_name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 2. Sorting Produk (Terlaris, Harga, Terbaru)[cite: 3]
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA =
      a.discount_percent > 0
        ? a.price - a.price * (a.discount_percent / 100)
        : a.price;
    const priceB =
      b.discount_percent > 0
        ? b.price - b.price * (b.discount_percent / 100)
        : b.price;

    if (sortBy === "best_seller") {
      return (b.total_sold || 0) - (a.total_sold || 0); // Terlaris ke tersedikit[cite: 3]
    }
    if (sortBy === "lowest_price") {
      return priceA - priceB; // Termurah ke termahal[cite: 3]
    }
    if (sortBy === "highest_price") {
      return priceB - priceA; // Termahal ke termurah[cite: 3]
    }
    if (sortBy === "lowest_stock") {
      return a.total_stock - b.total_stock; // Stok paling sedikit[cite: 3]
    }
    // Default: Terbaru (ID terbesar ke terkecil)[cite: 3]
    return b.product_id - a.product_id;
  });

  const categories = Array.from(
    new Set(products.map((p) => p.category_name).filter(Boolean)),
  );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen font-sans relative transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Katalog Produk Kacamata
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 text-xs mt-1">
            Target 50 Produk: Kelola inventaris, harga coret, dan urutan produk.
          </p>
        </div>
        <Link
          href="/products/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition"
        >
          + Tambah Produk Baru
        </Link>
      </div>

      {/* Filter, Search & Sorting Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari nama kacamata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition shadow-sm"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sorting / Urutkan */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition font-medium shadow-sm"
          >
            <option value="newest">Terbaru Ditambahkan</option>
            <option value="best_seller">Terlaris (Best Seller)</option>
            <option value="lowest_price">Harga Termurah</option>
            <option value="highest_price">Harga Termahal</option>
            <option value="lowest_stock">Stok Menipis</option>
          </select>

          <div className="text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap ml-auto md:ml-0">
            Total:{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {sortedProducts.length}
            </span>{" "}
            / 50 Target
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        {loading ? (
          <div className="p-12 text-center text-slate-400 dark:text-neutral-500 text-sm">
            Memuat data produk...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-neutral-500 text-sm">
            Tidak ada produk ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-100/60 dark:bg-black/40 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Produk</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Harga & Promo</th>
                  <th className="py-4 px-6">Stok</th>
                  <th className="py-4 px-6">Terjual</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 text-xs">
                {sortedProducts.map((product) => {
                  const hasDiscount =
                    product.discount_percent && product.discount_percent > 0;
                  const finalPrice = hasDiscount
                    ? product.price -
                      product.price * (product.discount_percent / 100)
                    : product.price;

                  const isLowStock = product.total_stock <= 3;

                  return (
                    <tr
                      key={product.product_id}
                      className="hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-neutral-600">
                                No Image
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                              ID: #{product.product_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-medium">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {hasDiscount ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                Rp {Number(finalPrice).toLocaleString("id-ID")}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                                -{product.discount_percent}%
                              </span>
                            </div>
                            <span className="text-slate-400 dark:text-neutral-500 text-[11px] line-through">
                              Rp {Number(product.price).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${isLowStock ? "text-amber-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {product.total_stock} Unit
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] rounded font-semibold animate-pulse">
                              Stok Menipis
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-purple-600 dark:text-purple-400">
                        {product.total_sold || 0} Terjual
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/preview/${product.product_id}`}
                            className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-cyan-600 dark:text-cyan-400 rounded-lg transition"
                            title="Preview Detail"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/products/edit/${product.product_id}`}
                            className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-purple-600 dark:text-purple-400 rounded-lg transition"
                            title="Edit Produk"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.product_id, product.name)
                            }
                            className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg transition"
                            title="Hapus Produk"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
