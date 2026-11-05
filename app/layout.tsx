import "@/app/globals.css";
import { cookies } from "next/headers";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { ToastProvider } from "@/components/ToastProvider";
import { Suspense } from "react";

// Komponen internal untuk membaca cookies secara aman di dalam Suspense
async function AdminSessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminName = cookieStore.get("admin_name")?.value || "Administrator";
  const adminEmail =
    cookieStore.get("admin_email")?.value || "admin@idvisionstore.web.id.com";
  const adminImage = cookieStore.get("admin_image")?.value || "";

  return (
    <ClientLayoutWrapper
      adminName={adminName}
      adminEmail={adminEmail}
      adminImage={adminImage}
    >
      {children}
    </ClientLayoutWrapper>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-black text-white font-sans antialiased flex min-h-screen overflow-x-hidden">
        <ToastProvider>
          <Suspense
            fallback={
              <div className="p-12 text-center text-neutral-500 bg-black min-h-screen w-full flex items-center justify-center">
                Memuat panel admin...
              </div>
            }
          >
            <AdminSessionWrapper>{children}</AdminSessionWrapper>
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
