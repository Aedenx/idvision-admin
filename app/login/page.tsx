"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "error",
  });

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(
          data.message ||
            "Autentikasi gagal. Silakan periksa kembali kredensial Anda.",
          "error",
        );
      } else {
        showToast("Autentikasi berhasil. Mengalihkan ke sistem...", "success");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      showToast(
        "Koneksi gagal. Pastikan layanan database MySQL aktif.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 p-4 text-white font-sans overflow-hidden">
      {/* Background Animation: technical grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

      {/* Background Animation: monochrome 3D waves */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="waveBackGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
            </linearGradient>

            <linearGradient id="waveMiddleGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.02" />
              <stop offset="50%" stopColor="#f3f4f6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.03" />
            </linearGradient>

            <linearGradient id="waveFrontGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f9fafb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6b7280" stopOpacity="0.02" />
            </linearGradient>

            <filter id="waveBlur">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>

          {/* Rear wave */}
          <g>
            <path
              d="M-100 380 C180 220 330 500 600 350 S1050 180 1540 370 L1540 900 L-100 900 Z"
              fill="url(#waveBackGradient)"
              filter="url(#waveBlur)"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-45 -15; 35 25; -45 -15"
                dur="16s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Middle wave */}
          <g>
            <path
              d="M-100 470 C160 330 370 570 650 430 S1120 310 1540 470 L1540 900 L-100 900 Z"
              fill="url(#waveMiddleGradient)"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="35 15; -35 -20; 35 15"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>

            <path
              d="M-100 470 C160 330 370 570 650 430 S1120 310 1540 470"
              fill="none"
              stroke="#e5e7eb"
              strokeOpacity="0.20"
              strokeWidth="1.5"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="35 15; -35 -20; 35 15"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Front wave */}
          <g>
            <path
              d="M-100 580 C180 440 370 700 680 540 S1150 440 1540 590 L1540 900 L-100 900 Z"
              fill="url(#waveFrontGradient)"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-25 15; 30 -20; -25 15"
                dur="9s"
                repeatCount="indefinite"
              />
            </path>

            <path
              d="M-100 580 C180 440 370 700 680 540 S1150 440 1540 590"
              fill="none"
              stroke="#f9fafb"
              strokeOpacity="0.30"
              strokeWidth="1.5"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-25 15; 30 -20; -25 15"
                dur="9s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Highlight wave */}
          <path
            d="M-100 650 C200 530 420 760 730 620 S1200 510 1540 650"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="20 0; -20 10; 20 0"
              dur="7s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Existing decorative rings */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-[30rem] w-[30rem] rounded-full border border-gray-400/15 animate-[spin_45s_linear_infinite]"></div>
      <div className="pointer-events-none absolute -top-24 -right-16 h-[22rem] w-[22rem] rounded-full border border-gray-300/10 animate-[spin_60s_linear_infinite_reverse]"></div>
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[34rem] w-[34rem] rounded-full border border-gray-400/10 animate-[spin_55s_linear_infinite]"></div>
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-gray-300/[0.06] blur-3xl animate-pulse"></div>

      {/* Modern Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container Card (Split 2 Kolom) */}
      <div className="relative z-10 w-full max-w-4xl bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 md:grid-cols-2">
        {/* Kolom Kiri: Banner Gambar dari Folder Public */}
        <div className="relative hidden md:flex flex-col justify-end p-10 overflow-hidden border-r border-gray-800/80">
          {/* Gambar Background Banner */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/login.jpg')",
            }}
          ></div>

          {/* Dark Overlay Gradient agar teks terbaca jelas */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent"></div>

          {/* Konten Teks di atas Gambar Banner */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              MANAGEMENT PORTAL
            </h2>
            <p className="text-gray-300 text-xs leading-relaxed">
              Infrastruktur terpadu untuk pengawasan inventaris kacamata,
              analisis transaksi, dan kontrol operasional idvisionstore.web.id.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {/* Header Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo-login.png"
                alt="IDVISIONSTORE Logo"
                className="w-12 h-12 object-contain rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-wider text-white">
                  IDVISION<span className="text-blue-500">STORE</span>
                </span>
                <span className="text-[10px] tracking-widest text-gray-400 uppercase -mt-1 font-mono">
                  Eyewear For A Better You
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Silakan masukkan ke panel admin untuk mengakses panel manajemen.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@idvisionstore.web.id"
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-950/40 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-800/80 pt-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-mono">
              Devteam MuhammadIkhwan & DeniSetiawan v3.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
