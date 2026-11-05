"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function PreviewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setProduct(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading)
    return (
      <div className="p-12 text-center text-neutral-500 bg-black min-h-screen text-white">
        Memuat detail produk...
      </div>
    );
  if (!product)
    return (
      <div className="p-12 text-center text-rose-500 bg-black min-h-screen">
        Produk tidak ditemukan.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black text-white font-sans min-h-screen">
      <Link
        href="/products"
        className="text-xs text-purple-400 hover:underline mb-6 inline-block"
      >
        ← Kembali ke Daftar Produk
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full h-80 bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-neutral-600 text-xs">Tidak ada gambar</span>
          )}
        </div>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs font-semibold">
            SKU: {product.sku_base}
          </span>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl font-extrabold text-emerald-400">
            Rp {Number(product.base_price).toLocaleString("id-ID")}
          </p>

          {product.discount_percent > 0 && (
            <div className="text-xs bg-rose-950/40 border border-rose-500/30 text-rose-300 p-2 rounded-lg">
              Diskon Aktif: {product.discount_percent}% (Harga Promo: Rp{" "}
              {Number(product.discount_price).toLocaleString("id-ID")})
            </div>
          )}

          <div className="text-xs text-neutral-300 space-y-1">
            <p>
              <strong>Target Gender:</strong> {product.gender_target}
            </p>
            <p>
              <strong>Stok Tersedia:</strong> {product.stock_quantity} Unit
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Deskripsi:
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {product.description || "Tidak ada deskripsi."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
