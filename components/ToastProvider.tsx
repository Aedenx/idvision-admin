"use client";

import React, { createContext, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showAlert: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showAlert = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showAlert }}>
      {children}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-medium bg-neutral-900/90 border-neutral-800 text-white">
          {toast.type === "success" && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
          {toast.type === "error" && (
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          )}
          {toast.type === "info" && (
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
