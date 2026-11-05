import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 12969,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // Maksimal koneksi idle yang disimpan
  idleTimeout: 60000, // Tutup koneksi idle setelah 60 detik
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Kirim TCP keep-alive tiap 10 detik agar koneksi Aiven tidak timeout
});
