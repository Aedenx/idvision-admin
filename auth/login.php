<?php
session_start();

// 1. Definisikan BASE_URL untuk navigasi lokal
if (!defined('BASE_URL')) {
    define('BASE_URL', 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/idvision');
}

// 2. Import koneksi database
require_once __DIR__ . '/../../backend/config/database.php';

$error = '';
$pdo = getDbConnection();

// Jika sudah login sebagai admin, langsung lempar ke halaman admin
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: ' . BASE_URL . '/admin/products/index.php');
    exit();
}

// Proses Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($email) && !empty($password)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND role = 'admin' LIMIT 1");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                if ((int)$user['is_active'] === 1) {
                    
                    // --- PERBAIKAN SESSION KEY DI SINI ---
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['user_id']          = $user['user_id'];
                    $_SESSION['admin_name']        = $user['full_name'];
                    $_SESSION['email']             = $user['email'];
                    $_SESSION['role']              = $user['role'];

                    header('Location: ' . BASE_URL . '/admin/products/index.php');
                    exit();
                } else {
                    $error = 'Akun Anda dinonaktifkan. Silakan hubungi pengelola.';
                }
            } else {
                $error = 'Email atau password salah, atau Anda bukan Administrator.';
            }
        } catch (PDOException $e) {
            $error = 'Gagal memproses login: ' . $e->getMessage();
        }
    } else {
        $error = 'Harap isi email dan password secara lengkap.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrator - IDVISION</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            width: 100%;
            max-width: 420px;
            padding: 2.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .form-control {
            background-color: #0f172a;
            border: 1px solid #334155;
            color: #f8fafc;
        }
        .form-control:focus {
            background-color: #0f172a;
            border-color: #eab308;
            color: #f8fafc;
            box-shadow: 0 0 0 0.25rem rgba(234, 179, 8, 0.25);
        }
        .btn-gold {
            background-color: #eab308;
            color: #0f172a;
            font-weight: 600;
        }
        .btn-gold:hover {
            background-color: #ca8a04;
            color: #0f172a;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="text-center mb-4">
        <h3 class="fw-bold text-warning mb-1"><i class="bi bi-glasses me-2"></i>IDVISION</h3>
        <p class="text-secondary small">Masuk ke Panel Kontrol Administrator</p>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger py-2 fs-7" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <!-- Action Form Menggunakan BASE_URL Dinamis -->
    <form action="<?= BASE_URL ?>/admin/auth/login.php" method="POST">
        <div class="mb-3">
            <label for="email" class="form-label small text-secondary">Alamat Email</label>
            <div class="input-group">
                <span class="input-group-text bg-dark border-secondary text-secondary"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control" id="email" name="email" placeholder="admin@idvision.com" required>
            </div>
        </div>

        <div class="mb-4">
            <label for="password" class="form-label small text-secondary">Password</label>
            <div class="input-group">
                <span class="input-group-text bg-dark border-secondary text-secondary"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required>
            </div>
        </div>

        <button type="submit" class="btn btn-gold w-100 py-2">
            Sign In <i class="bi bi-box-arrow-in-right ms-1"></i>
        </button>
    </form>
</div>

</body>
</html>