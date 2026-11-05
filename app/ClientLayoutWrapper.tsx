"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({
  children,
  adminName,
  adminEmail,
  adminImage,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  adminImage: string;
}) {
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Ref untuk mendeteksi klik di luar dropdown profil
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize tema ke elemen <html> secara global
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 2. Cegah Dropdown Tertutup Ketika Menekan Tombol Lain (Hanya Tutup Jika Klik di Luar Menu Profil)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      title: "Pesanan Baru #1092",
      desc: "Pembelian kacamata Rayban oleh pelanggan.",
      time: "5 menit lalu",
    },
    {
      id: 2,
      title: "Stok Menipis",
      desc: "Varian kacamata IDVISION sisa 2 unit.",
      time: "1 jam lalu",
    },
    {
      id: 3,
      title: "AI Assistant",
      desc: "Laporan analisis mingguan siap ditinjau.",
      time: "3 jam lalu",
    },
  ];

  if (pathname === "/login") {
    return (
      <main
        className={`w-full min-h-screen ${
          darkMode ? "bg-black text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        {children}
      </main>
    );
  }

  const handleLogout = () => {
    document.cookie = "admin_name=; path=/; max-age=0;";
    document.cookie = "admin_email=; path=/; max-age=0;";
    document.cookie = "admin_image=; path=/; max-age=0;";
  };

  return (
    <div
      className={`flex min-h-screen w-full relative font-sans transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* SIDEBAR KIRI */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen border-r transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          darkMode
            ? "bg-black border-neutral-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div>
          {/* LOGO BRAND */}
          <div
            className={`h-16 flex items-center px-4 border-b gap-3 ${
              darkMode ? "border-neutral-800" : "border-slate-200"
            }`}
          >
            <img
              src={darkMode ? "/logo-dark.png" : "/logo-light.png"}
              alt="IDVISION"
              className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
            />
            {sidebarOpen && (
              <span
                className={`font-extrabold text-lg tracking-wider whitespace-nowrap ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                IDVISION<span className="text-purple-600">STORE</span>
              </span>
            )}
          </div>

          {/* MENU NAVIGASI */}
          <nav className="p-3 space-y-1 mt-3">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                pathname === "/"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : darkMode
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {sidebarOpen && <span>Dashboard</span>}
            </Link>

            <Link
              href="/products"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith("/products")
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : darkMode
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {sidebarOpen && <span>Products</span>}
            </Link>

            <Link
              href="/categories"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith("/categories")
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : darkMode
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 12h.01M7 17h.01M11 7h8M11 12h8M11 17h8"
                />
              </svg>
              {sidebarOpen && <span>Categories</span>}
            </Link>

            <Link
              href="/banners"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith("/banners")
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : darkMode
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {sidebarOpen && <span>Banners</span>}
            </Link>

            <Link
              href="/orders"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith("/orders")
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : darkMode
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {sidebarOpen && <span>Orders</span>}
            </Link>
          </nav>
        </div>

        {/* BOTTOM LOGOUT BUTTON */}
        <div
          className={`p-3 border-t ${
            darkMode ? "border-neutral-800" : "border-slate-200"
          }`}
        >
          <Link
            href="/login"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {sidebarOpen && <span>Keluar Panel</span>}
          </Link>
        </div>
      </aside>

      {/* NAVBAR & KONTEN UTAMA */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header
          className={`h-16 border-b sticky top-0 z-30 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300 ${
            darkMode
              ? "bg-black/90 border-neutral-800"
              : "bg-white/90 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl transition focus:outline-none ${
                darkMode
                  ? "bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Toggle Sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="hidden sm:flex flex-col">
              <span
                className={`text-xs ${
                  darkMode ? "text-neutral-400" : "text-slate-500"
                }`}
              >
                Selamat datang kembali,
              </span>
              <span
                className={`text-sm font-bold tracking-wide ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {adminName} 👋
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* TOGGLE DARK / LIGHT MODE BUTTON */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all focus:outline-none ${
                darkMode
                  ? "bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800"
                  : "bg-white border-slate-200 text-purple-600 hover:bg-slate-50 shadow-sm"
              }`}
              title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
            >
              {darkMode ? (
                /* Sun Icon untuk Light Mode */
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                /* Moon Icon untuk Dark Mode */
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* NOTIFIKASI DROPDOWN */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl border transition focus:outline-none ${
                  darkMode
                    ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              </button>

              {showNotifications && (
                <div
                  className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl py-3 z-50 backdrop-blur-xl transition-all ${
                    darkMode
                      ? "bg-neutral-900 border-neutral-800 text-white"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div
                    className={`px-4 pb-2 border-b flex items-center justify-between ${
                      darkMode ? "border-neutral-800" : "border-slate-100"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Notifikasi Sistem
                    </span>
                    <span className="text-[10px] bg-purple-600/20 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                      3 Baru
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-800/20 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 transition cursor-pointer ${
                          darkMode
                            ? "hover:bg-neutral-800/50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-semibold">{notif.title}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {notif.desc}
                        </p>
                        <span className="text-[10px] text-purple-500 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROFIL ADMIN DROPDOWN BULAT (Mandiri & Tidak Terlipat) */}
            <div className="relative" ref={profileDropdownRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-2 border-l border-neutral-800 cursor-pointer group"
              >
                {adminImage ? (
                  <img
                    src={adminImage}
                    alt={adminName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-purple-500 shadow-md transition transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md transition transform group-hover:scale-105">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className={`text-sm font-semibold leading-none group-hover:text-purple-500 transition ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {adminName}
                  </span>
                  <span
                    className={`text-[11px] mt-1 ${
                      darkMode ? "text-neutral-400" : "text-slate-500"
                    }`}
                  >
                    Administrator
                  </span>
                </div>
              </div>

              {/* Menu Dropdown Profil yang Stabil */}
              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl ${
                    darkMode
                      ? "bg-neutral-900 border-neutral-800 text-white"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div
                    className={`px-4 py-3 border-b ${
                      darkMode ? "border-neutral-800" : "border-slate-100"
                    }`}
                  >
                    <p className="text-xs text-neutral-400">Masuk sebagai</p>
                    <p className="text-sm font-bold truncate">{adminEmail}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-xs transition ${
                        darkMode
                          ? "hover:bg-neutral-800 text-neutral-300"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      Edit Profil & Foto
                    </Link>
                  </div>
                  <div
                    className={`border-t pt-1 ${
                      darkMode ? "border-neutral-800" : "border-slate-100"
                    }`}
                  >
                    <Link
                      href="/login"
                      onClick={handleLogout}
                      className="block px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition"
                    >
                      Keluar dari Akun
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={`flex-1 p-6 transition-colors duration-300 ${
            darkMode ? "bg-black" : "bg-slate-50"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
