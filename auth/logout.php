<?php
session_start();

// Definisikan BASE_URL
if (!defined('BASE_URL')) {
    define('BASE_URL', 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/idvision');
}

// Hapus semua data session
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();

// Redirect ke halaman login
header("Location: " . BASE_URL . "/admin/auth/login.php");
exit;