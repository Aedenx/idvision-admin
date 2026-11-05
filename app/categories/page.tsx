"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  total_products: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      showAlert("Gagal memuat kategori", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editId ? `/api/categories/${editId}` : "/api/categories";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showAlert(data.message, "success");
        setName("");
        setDescription("");
        setEditId(null);
        fetchCategories();
      } else {
        showAlert(data.message || "Gagal menyimpan kategori", "error");
      }
    } catch (error) {
      showAlert("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.category_id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName("");
    setDescription("");
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Hapus kategori "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        showAlert("Kategori berhasil dihapus", "success");
        setCategories(categories.filter((c) => c.category_id !== id));
      } else {
        showAlert(data.message || "Gagal menghapus kategori", "error");
      }
    } catch (error) {
      showAlert("Kesalahan server", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kelola Kategori Kacamata
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 text-xs mt-1">
          Atur kategori frame, sunglasses, atau jenis lensa untuk pengelompokan
          produk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah/Edit Kategori */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xl h-fit transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            {editId ? "Edit Kategori" : "+ Tambah Kategori Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Frame Round"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                Deskripsi (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Keterangan singkat kategori..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editId
                    ? "Perbarui Kategori"
                    : "Simpan Kategori"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabel Daftar Kategori */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
          {loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-neutral-500 text-sm">
              Memuat kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-neutral-500 text-sm">
              Belum ada kategori terdaftar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-100/60 dark:bg-black/40 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Jumlah Produk</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 text-xs">
                  {categories.map((cat) => (
                    <tr
                      key={cat.category_id}
                      className="hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 dark:text-white text-sm block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-500">
                          {cat.description || "Tanpa deskripsi"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 dark:text-neutral-400 text-[11px]">
                        {cat.slug}
                      </td>
                      <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                        {cat.total_products} Produk
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-purple-600 dark:text-purple-400 rounded-lg transition"
                            title="Edit Kategori"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(cat.category_id, cat.name)
                            }
                            className="p-2 bg-slate-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg transition"
                            title="Hapus Kategori"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
