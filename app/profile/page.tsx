"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // State animasi tombol AAMIIN
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [hasSaidAamiin, setHasSaidAamiin] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const router = useRouter();

  // Pembacaan data cookie lokal saat halaman dimuat
  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc: any, current) => {
      const [key, value] = current.split("=");
      acc[key] = decodeURIComponent(value || "");
      return acc;
    }, {});

    if (cookies.admin_name) setFullName(cookies.admin_name);
    if (cookies.admin_email) setEmail(cookies.admin_email);
    if (cookies.admin_image) setPreviewImage(cookies.admin_image);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Efek perayaan ketika tombol AAMIIN diklik
  const handleAamiin = () => {
    setCelebrationKey((prev) => prev + 1);
    setHasSaidAamiin(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("password", password);

      if (selectedFile) {
        formData.append("profile_image", selectedFile);
      }

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          show: true,
          message: "Profil berhasil diperbarui!",
          type: "success",
        });

        setPassword("");

        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setToast({
          show: true,
          message: data.message || "Gagal memperbarui profil.",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: "Koneksi ke server gagal.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3500);
    }
  };

  // Partikel animasi. Tidak membutuhkan library eksternal.
  const confettiColors = [
    "#a855f7",
    "#c084fc",
    "#facc15",
    "#ffffff",
    "#818cf8",
    "#f9a8d4",
    "#34d399",
  ];

  return (
    <div className="profile-page relative max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans min-h-screen transition-colors duration-300">
      {/* CSS ANIMASI */}
      <style jsx global>{`
        .aamiin-button {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .aamiin-button::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -100%;
          width: 55%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transform: rotate(25deg);
          transition: left 0.6s ease;
          z-index: -1;
        }

        .aamiin-button:hover::before {
          left: 150%;
        }

        .aamiin-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(168, 85, 247, 0.4);
        }

        .aamiin-button:active {
          transform: scale(0.95);
        }

        .prayer-card {
          transition:
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }

        .prayer-card.prayer-glow {
          animation: prayerGlow 1.4s ease-in-out;
        }

        @keyframes prayerGlow {
          0% {
            box-shadow: 0 0 0 rgba(168, 85, 247, 0);
          }
          35% {
            box-shadow:
              0 0 35px rgba(168, 85, 247, 0.3),
              0 0 80px rgba(250, 204, 21, 0.12);
            border-color: rgba(192, 132, 252, 0.9);
          }
          100% {
            box-shadow: 0 0 0 rgba(168, 85, 247, 0);
          }
        }

        .celebration-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          pointer-events: none;
          animation: overlayFade 3.8s ease-out forwards;
        }

        .celebration-flash {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 60%,
            rgba(192, 132, 252, 0.24),
            rgba(250, 204, 21, 0.08) 35%,
            transparent 70%
          );
          animation: flashEffect 1.2s ease-out forwards;
        }

        .celebration-piece {
          position: absolute;
          top: -24px;
          left: var(--left);
          width: var(--size);
          height: calc(var(--size) * 1.65);
          border-radius: var(--radius);
          background: var(--color);
          opacity: 0;
          animation: confettiFall var(--duration) var(--delay) ease-in forwards;
          will-change: transform, opacity;
        }

        .celebration-sparkle {
          position: absolute;
          left: var(--left);
          top: var(--top);
          width: var(--size);
          height: var(--size);
          color: var(--color);
          font-size: var(--size);
          line-height: 1;
          opacity: 0;
          animation: sparklePop 1.5s var(--delay) ease-out both;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .aamiin-floating-message {
          position: fixed;
          z-index: 10000;
          left: 50%;
          top: 42%;
          width: max-content;
          max-width: 90vw;
          transform: translate(-50%, -50%);
          pointer-events: none;
          text-align: center;
          animation: messagePop 2.5s ease-out forwards;
        }

        .aamiin-floating-message span {
          display: block;
          font-weight: 900;
          letter-spacing: -0.04em;
          font-size: clamp(2rem, 7vw, 4.5rem);
          line-height: 1.1;
          color: white;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
          text-shadow:
            0 3px 0 #7e22ce,
            0 8px 25px rgba(126, 34, 206, 0.55),
            0 0 55px rgba(216, 180, 254, 0.7);
        }

        .aamiin-floating-message small {
          display: block;
          margin-top: 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #fef3c7;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        @keyframes confettiFall {
          0% {
            opacity: 0;
            transform: translate3d(0, -5vh, 0) rotate(0deg) scale(0.4);
          }
          8% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--drift), 110vh, 0)
              rotate(var(--rotation)) scale(1);
          }
        }

        @keyframes sparklePop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(-30deg);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3) rotate(15deg);
          }
          65% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.85) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(35deg);
          }
        }

        @keyframes flashEffect {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes overlayFade {
          0% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes messagePop {
          0% {
            opacity: 0;
            transform: translate(-50%, -35%) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.08);
          }
          25% {
            transform: translate(-50%, -50%) scale(1);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -58%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -90%) scale(0.9);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aamiin-button,
          .prayer-card,
          .celebration-overlay,
          .celebration-piece,
          .celebration-sparkle,
          .aamiin-floating-message {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* FULL-PAGE CELEBRATION */}
      {celebrationKey > 0 && (
        <div
          key={celebrationKey}
          className="celebration-overlay"
          aria-hidden="true"
        >
          <div className="celebration-flash" />

          {/* Confetti memenuhi seluruh viewport */}
          {Array.from({ length: 100 }, (_, i) => {
            const left = (i * 37.17 + 5.3) % 100;
            const size = 5 + ((i * 13) % 8);
            const delay = (i % 25) * 0.035;
            const duration = 2.2 + ((i * 7) % 18) / 10;
            const drift = ((i * 47) % 240) - 120;
            const rotation = 360 + ((i * 71) % 720);

            return (
              <span
                key={`${celebrationKey}-${i}`}
                className="celebration-piece"
                style={
                  {
                    "--left": `${left}%`,
                    "--size": `${size}px`,
                    "--delay": `${delay}s`,
                    "--duration": `${duration}s`,
                    "--drift": `${drift}px`,
                    "--rotation": `${rotation}deg`,
                    "--color": confettiColors[i % confettiColors.length],
                    "--radius": i % 3 === 0 ? "50%" : "2px",
                  } as React.CSSProperties
                }
              />
            );
          })}

          {/* Kilauan bintang */}
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={`sparkle-${celebrationKey}-${i}`}
              className="celebration-sparkle"
              style={
                {
                  "--left": `${((i * 41 + 9) % 94) + 3}%`,
                  "--top": `${((i * 29 + 12) % 82) + 5}%`,
                  "--size": `${14 + ((i * 7) % 22)}px`,
                  "--delay": `${(i % 8) * 0.09}s`,
                  "--color": i % 3 === 0 ? "#facc15" : "#ffffff",
                } as React.CSSProperties
              }
            >
              {i % 3 === 0 ? "✦" : "✧"}
            </span>
          ))}

          {/* Pesan utama */}
          <div className="aamiin-floating-message">
            <span>AAMIIN 🤲</span>
            <small>SEMOGA SEMUA IMPIAN TERWUJUD</small>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500/40 text-emerald-700 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/90 border-rose-500/40 text-rose-700 dark:text-rose-200"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 border-b border-slate-200 dark:border-neutral-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Profil Admin
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 text-xs mt-1">
          Kelola foto avatar, nama, dan kata sandi akun administrator Anda.
        </p>
      </div>

      {/* FORM PROFIL */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Upload & Preview Foto */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-colors">
          <div className="relative group w-32 h-32 mb-4">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Avatar Admin"
                className="w-32 h-32 rounded-full object-cover border-2 border-purple-500/50 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-3xl shadow-xl">
                {fullName ? fullName.charAt(0).toUpperCase() : "A"}
              </div>
            )}

            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-medium text-purple-300">
              <svg
                className="w-6 h-6 mb-1 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Ubah Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Format: JPG, PNG, WEBP (Maks. 2MB)
          </p>
        </div>

        {/* Form Data */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl space-y-5 shadow-lg transition-colors">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Alamat Email (Tetap)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Kata Sandi Baru (Kosongkan jika tidak diubah)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
            </button>
          </div>
        </div>
      </form>

      {/* KARTU DOA - PALING BAWAH */}
      <div
        className={`prayer-card relative overflow-hidden mt-10 rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 via-white to-violet-100 dark:from-purple-950/40 dark:via-neutral-950 dark:to-violet-950/30 p-5 sm:p-6 shadow-sm ${
          celebrationKey > 0 ? "prayer-glow" : ""
        }`}
      >
        {/* Dekorasi Background */}
        <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-violet-300/20 dark:bg-violet-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-2xl">
            🤲
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-purple-600 dark:text-purple-400">
                A Prayer for Our Future
              </span>
              <span className="text-xs"></span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
              Bismillah, Menuju Masa Depan yang Lebih Baik
            </h2>

            <div className="space-y-3 text-sm leading-7 text-slate-600 dark:text-neutral-300">
              <p>
                Ya Allah, mudahkanlah langkah kami dalam menuntut ilmu.
                Lancarkanlah setiap urusan kuliah kami, kuatkan semangat kami
                dalam menghadapi segala tantangan, dan izinkan kami lulus tepat
                waktu dengan hasil yang membanggakan.
              </p>

              <p>
                Lapangkanlah pintu rezeki kami, berkahilah setiap usaha yang
                kami bangun, mudahkanlah jalan menuju kesuksesan, dan jadikanlah
                setiap kerja keras kami sebagai jalan untuk membahagiakan orang
                tua serta keluarga kami.
              </p>

              <p>
                Ya Allah, bimbinglah kami agar kelak menjadi pengusaha dan CEO
                yang sukses, jujur, amanah, serta rendah hati. Tumbuhkanlah
                IDVISIONSTORE menjadi bisnis yang besar, bukakan kesempatan
                untuk menciptakan lapangan pekerjaan, dan jadikan kesuksesan
                kami bermanfaat bagi banyak orang.
              </p>

              <p className="font-medium text-purple-700 dark:text-purple-300">
                Semoga segala impian yang kami perjuangkan hari ini menjadi
                kenyataan pada waktu terbaik menurut-Mu. Aamiin Ya Rabbal
                &apos;Alamiin. 🤲
              </p>
            </div>

            {/* TOMBOL AAMIIN */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={handleAamiin}
                className="aamiin-button inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/40"
                aria-label="Aamiin, semoga doa dan impian kami dikabulkan"
              >
                <span className="text-lg" aria-hidden="true">
                  🤲
                </span>
                <span>
                  {hasSaidAamiin ? "AAMIIN, YA ALLAH!" : "KLIK AAMIIN"}
                </span>
                <span aria-hidden="true">✨</span>
              </button>

              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-5">
                {hasSaidAamiin
                  ? "Aamiin. Semoga setiap langkah kita diberkahi. 💜"
                  : "Klik dengan penuh harapan untuk masa depan yang lebih baik."}
              </p>
            </div>

            {/* Motivasi Penutup */}
            <div className="mt-6 pt-4 border-t border-purple-200/80 dark:border-purple-500/20">
              <p className="text-[10px] sm:text-xs font-bold tracking-[0.12em] text-purple-600 dark:text-purple-400">
                DREAM BIG <span className="mx-1.5">·</span>
                WORK HARD <span className="mx-1.5">·</span>
                PRAY ALWAYS
              </p>

              <p className="text-xs text-slate-500 dark:text-neutral-500 mt-2">
                Dari mahasiswa, menjadi sarjana, membangun bisnis, hingga
                menjadi CEO. Bismillah! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
