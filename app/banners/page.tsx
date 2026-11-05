"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta_label: string;
  cta_link: string;
  sort_order: number;
  is_active: number;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { showAlert } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      showAlert("Gagal memuat data banner", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setSubtitle("");
    setCtaLabel("");
    setCtaLink("");
    setSortOrder(0);
    setIsActive(true);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleEditClick = (b: Banner) => {
    setEditId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setCtaLabel(b.cta_label || "");
    setCtaLink(b.cta_link || "");
    setSortOrder(b.sort_order || 0);
    setIsActive(b.is_active === 1);
    setPreviewUrl(b.image);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId && !selectedFile) {
      showAlert("Silakan pilih gambar banner terlebih dahulu!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("cta_label", ctaLabel);
      formData.append("cta_link", ctaLink);
      formData.append("sort_order", String(sortOrder));
      formData.append("is_active", isActive ? "1" : "0");
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const url = editId ? `/api/banners/${editId}` : "/api/banners";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert(
          editId
            ? "Banner berhasil diperbarui!"
            : "Banner berhasil ditambahkan!",
          "success",
        );
        resetForm();
        fetchBanners();
      } else {
        showAlert(data.message || "Gagal menyimpan banner", "error");
      }
    } catch (err) {
      showAlert("Terjadi kesalahan koneksi server", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      const formData = new FormData();
      formData.append("title", b.title);
      formData.append("subtitle", b.subtitle || "");
      formData.append("cta_label", b.cta_label || "");
      formData.append("cta_link", b.cta_link || "");
      formData.append("sort_order", String(b.sort_order));
      formData.append("is_active", b.is_active === 1 ? "0" : "1");

      const res = await fetch(`/api/banners/${b.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert(
          `Banner berhasil di-${b.is_active === 1 ? "nonaktifkan" : "aktifkan"}`,
          "success",
        );
        fetchBanners();
      } else {
        showAlert(data.message || "Gagal mengubah status banner", "error");
      }
    } catch (err) {
      showAlert("Kesalahan server", "error");
    }
  };

  const handleDelete = async (id: number, bannerTitle: string) => {
    if (!confirm(`Hapus banner "${bannerTitle}"?`)) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("Banner berhasil dihapus", "success");
        setBanners(banners.filter((b) => b.id !== id));
      } else {
        showAlert(data.message || "Gagal menghapus banner", "error");
      }
    } catch (err) {
      showAlert("Kesalahan server", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kelola Banner Promosi
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 text-xs mt-1">
          Atur banner utama atau slide promosi yang tampil di beranda depan
          toko.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah / Edit Banner */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xl h-fit transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editId ? "Edit Banner" : "+ Tambah Banner Baru"}
            </h2>
            {editId && (
              <button
                onClick={resetForm}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Judul Banner
              </label>
              <input
                type="text"
                placeholder="Contoh: SUMMIT Series Promo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Subjudul (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Diskon spesial minggu ini"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Teks Tombol (CTA)
                </label>
                <input
                  type="text"
                  placeholder="Beli Sekarang"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Urutan (Sort)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Link Tujuan (URL)
              </label>
              <input
                type="text"
                placeholder="/products/summit"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-purple-600 bg-slate-50 dark:bg-black border-slate-300 dark:border-neutral-800 rounded cursor-pointer"
              />
              <label
                htmlFor="isActiveCheck"
                className="text-xs text-slate-700 dark:text-neutral-300 cursor-pointer"
              >
                Status Aktif (Tampil di Toko)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Gambar Banner
              </label>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl mb-2 border border-slate-200 dark:border-neutral-800"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editId}
                className="text-xs text-slate-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-neutral-800 file:text-slate-700 dark:file:text-neutral-300 hover:file:bg-slate-200 dark:hover:file:bg-neutral-700 cursor-pointer w-full"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              {submitting
                ? "Menyimpan..."
                : editId
                  ? "Perbarui Banner"
                  : "Simpan Banner"}
            </button>
          </form>
        </div>

        {/* Daftar Banner */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl p-6 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Daftar Banner
          </h2>
          {loading ? (
            <div className="text-center text-slate-400 dark:text-neutral-500 py-8 text-sm">
              Memuat banner...
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-neutral-500 py-8 text-sm">
              Belum ada banner tersimpan.
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 p-4 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-24 h-14 object-cover rounded-lg border border-slate-200 dark:border-neutral-800"
                      />
                      <span
                        className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${b.is_active === 1 ? "bg-emerald-500 text-black" : "bg-neutral-600 text-white"}`}
                      >
                        {b.is_active === 1 ? "AKTIF" : "OFF"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {b.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">
                        {b.subtitle || "Tanpa subjudul"}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
                        Urutan: {b.sort_order} | Link: {b.cta_link || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${b.is_active === 1 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30"}`}
                      title="Ubah Status Aktif/Non-Aktif"
                    >
                      {b.is_active === 1 ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      onClick={() => handleEditClick(b)}
                      className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-purple-600 dark:text-purple-400 rounded-lg transition"
                      title="Edit Banner"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg transition"
                      title="Hapus Banner"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
