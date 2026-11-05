import { db } from "@/lib/db";
import { Suspense } from "react";

async function DashboardMetrics() {
  let totalSales = 0;
  let totalClients = 0;
  let totalProducts = 0;
  let totalStock = 0;
  let categoryData: any = [];

  try {
    const [salesRows]: any = await db.query(
      "SELECT SUM(total_amount) as totalSales FROM orders",
    );
    totalSales = salesRows[0]?.totalSales || 0;

    const [clientRows]: any = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'customer'",
    );
    totalClients = clientRows[0]?.total || 0;

    const [prodRows]: any = await db.query(
      "SELECT COUNT(*) as total FROM products",
    );
    totalProducts = prodRows[0]?.total || 0;

    const [stockRows]: any = await db.query(
      "SELECT SUM(stock_quantity) as totalStock FROM product_variants",
    );
    totalStock = stockRows[0]?.totalStock || 0;

    const [catRows]: any = await db.query(`
      SELECT c.name, COUNT(p.product_id) as count 
      FROM categories c 
      LEFT JOIN products p ON c.category_id = p.category_id 
      GROUP BY c.category_id
    `);
    categoryData = catRows;
  } catch (error) {
    console.error("Gagal memuat data dashboard:", error);
  }

  const colors = [
    "#ff6b6b",
    "#4dabf7",
    "#ffd43b",
    "#20c997",
    "#b197fc",
    "#ffa8a8",
  ];

  return (
    <>
      {/* Kartu Statistik Atas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg transition-colors">
          <p className="text-slate-500 dark:text-neutral-400 text-sm mb-1">
            Total Sales
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rp {Number(totalSales).toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg transition-colors">
          <p className="text-slate-500 dark:text-neutral-400 text-sm mb-1">
            Total Clients
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalClients.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg transition-colors">
          <p className="text-slate-500 dark:text-neutral-400 text-sm mb-1">
            Total Products
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalProducts.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg transition-colors">
          <p className="text-slate-500 dark:text-neutral-400 text-sm mb-1">
            Stock
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalStock.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      {/* Bagian Bawah: Sales Overview & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-neutral-200">
              Sales Overview
            </h2>
            <div className="h-64 w-full flex items-end relative px-2 pt-6">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-300 dark:border-neutral-700 w-full"></div>
                <div className="border-b border-slate-300 dark:border-neutral-700 w-full"></div>
                <div className="border-b border-slate-300 dark:border-neutral-700 w-full"></div>
                <div className="border-b border-slate-300 dark:border-neutral-700 w-full"></div>
              </div>

              <svg
                className="absolute inset-x-0 bottom-6 w-full h-48 overflow-visible px-4"
                preserveAspectRatio="none"
                viewBox="0 0 500 150"
              >
                <path
                  d="M 0,120 Q 80,40 160,90 T 320,60 T 480,20"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="3"
                />
                <circle cx="0" cy="120" r="4" fill="#c084fc" />
                <circle cx="160" cy="90" r="4" fill="#c084fc" />
                <circle cx="320" cy="60" r="4" fill="#c084fc" />
                <circle cx="480" cy="20" r="5" fill="#c084fc" />
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 text-xs">
              <svg
                className="w-4 h-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>Real-time database analytics stream</span>
            </div>
            <div className="w-32 bg-slate-200 dark:bg-black h-2 rounded-full overflow-hidden border border-slate-300 dark:border-neutral-800">
              <div className="bg-purple-600 w-3/4 h-full"></div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-neutral-200">
              Category Distribution
            </h2>

            <div className="space-y-4 my-6">
              {categoryData.length > 0 ? (
                categoryData.map((cat: any, index: number) => {
                  const total =
                    categoryData.reduce(
                      (acc: number, curr: any) => acc + curr.count,
                      0,
                    ) || 1;
                  const percentage = Math.round((cat.count / total) * 100);
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        ></span>
                        <span className="text-slate-600 dark:text-neutral-300">
                          {cat.name}
                        </span>
                      </div>
                      <span className="font-semibold" style={{ color: color }}>
                        {percentage}% ({cat.count} produk)
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 dark:text-neutral-500">
                  Belum ada data kategori.
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-neutral-500 text-center border-t border-slate-200 dark:border-neutral-800 pt-3">
            Dihitung otomatis dari database
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-8 bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">
        Dashboard
      </h1>

      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-400 dark:text-neutral-500">
            Memuat statistik dashboard...
          </div>
        }
      >
        <DashboardMetrics />
      </Suspense>
    </div>
  );
}
