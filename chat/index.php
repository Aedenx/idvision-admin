<?php
// Fix Path Configuration Database
$dbConfigPath = __DIR__ . '/../../backend/config/database.php';
if (!file_exists($dbConfigPath)) {
    // Fallback jika direktori hanya naik 1 tingkat
    $dbConfigPath = __DIR__ . '/../backend/config/database.php';
}
require_once $dbConfigPath;

$pdo = getDbConnection();
$activePhone = $_GET['phone'] ?? '';
$errorMsg = '';

// 1. LOGIKA BALAS CHAT ADMIN (Otomatis Ubah Status Seluruh Percakapan Jadi 'admin_active')
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reply_message'])) {
    $reply = trim($_POST['reply_message']);
    if (!empty($reply) && !empty($activePhone)) {
        try {
            // Update seluruh riwayat chat nomor ini menjadi admin_active
            $stmtUpdate = $pdo->prepare("UPDATE chats SET session_status = 'admin_active' WHERE customer_phone = :phone");
            $stmtUpdate->execute(['phone' => $activePhone]);

            // Simpan balasan baru dari admin
            $stmtInsert = $pdo->prepare("
                INSERT INTO chats (sender_type, sender_name, customer_phone, message, session_status)
                VALUES ('admin', 'Admin IDVISION', :phone, :message, 'admin_active')
            ");
            $stmtInsert->execute([
                'phone'   => $activePhone,
                'message' => $reply
            ]);

            header("Location: index.php?phone=" . urlencode($activePhone));
            exit;
        } catch (Exception $e) {
            $errorMsg = "Gagal mengirim pesan: " . $e->getMessage();
        }
    }
}

// 2. LOGIKA UBAH STATUS (AKHIRI CHAT ATAU AKTIFKAN AI KEMBALI)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_status'])) {
    $newStatus = $_POST['action_status'];
    if (!empty($activePhone) && in_array($newStatus, ['ended', 'ai_active', 'admin_active'])) {
        try {
            // Update seluruh riwayat chat nomor ini sesuai status baru
            $stmtUpdate = $pdo->prepare("UPDATE chats SET session_status = :status WHERE customer_phone = :phone");
            $stmtUpdate->execute([
                'status' => $newStatus,
                'phone'  => $activePhone
            ]);

            $systemMsg = ($newStatus === 'ended') 
                ? '--- Percakapan diakhiri oleh Admin ---' 
                : '--- Sesi dikembalikan ke AI Chatbot ---';

            // Masukkan log pesan sistem
            $stmtStatus = $pdo->prepare("
                INSERT INTO chats (sender_type, sender_name, customer_phone, message, session_status)
                VALUES ('system', 'System', :phone, :message, :status)
            ");
            $stmtStatus->execute([
                'phone'   => $activePhone,
                'message' => $systemMsg,
                'status'  => $newStatus
            ]);

            header("Location: index.php?phone=" . urlencode($activePhone));
            exit;
        } catch (Exception $e) {
            $errorMsg = "Gagal mengubah status: " . $e->getMessage();
        }
    }
}

// 3. LOGIKA HAPUS CHAT
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_phone'])) {
    $phoneToDelete = trim($_POST['delete_phone']);
    if (!empty($phoneToDelete)) {
        try {
            $stmtDelete = $pdo->prepare("DELETE FROM chats WHERE customer_phone = :phone");
            $stmtDelete->execute(['phone' => $phoneToDelete]);

            $redirectUrl = "index.php";
            if ($activePhone !== $phoneToDelete && !empty($activePhone)) {
                $redirectUrl .= "?phone=" . urlencode($activePhone);
            }
            header("Location: " . $redirectUrl);
            exit;
        } catch (Exception $e) {
            $errorMsg = "Gagal menghapus percakapan: " . $e->getMessage();
        }
    }
}

// LOAD HEADER
$headerPath = __DIR__ . '/../includes/header.php';
if (!file_exists($headerPath)) {
    $headerPath = __DIR__ . '/includes/header.php';
}
require_once $headerPath;

// Ambil daftar percakapan
$stmtList = $pdo->query("
    SELECT 
        c.customer_phone,
        (SELECT c2.sender_name FROM chats c2 WHERE c2.customer_phone = c.customer_phone AND c2.sender_type = 'customer' ORDER BY c2.created_at DESC LIMIT 1) as customer_name,
        MAX(c.created_at) as last_chat, 
        (SELECT c3.message FROM chats c3 WHERE c3.customer_phone = c.customer_phone ORDER BY c3.created_at DESC LIMIT 1) as last_message,
        (SELECT c4.sender_type FROM chats c4 WHERE c4.customer_phone = c.customer_phone ORDER BY c4.created_at DESC LIMIT 1) as last_sender_type,
        (SELECT c5.session_status FROM chats c5 WHERE c5.customer_phone = c.customer_phone ORDER BY c5.created_at DESC LIMIT 1) as current_status
    FROM chats c
    GROUP BY c.customer_phone
    ORDER BY last_chat DESC
");
$conversations = $stmtList->fetchAll(PDO::FETCH_ASSOC);

if (empty($activePhone) && !empty($conversations)) {
    $activePhone = $conversations[0]['customer_phone'];
}

// Ambil pesan percakapan aktif
$activeMessages = [];
$latestStatus = 'ai_active';
if ($activePhone) {
    $stmtMsg = $pdo->prepare("SELECT * FROM chats WHERE customer_phone = :phone ORDER BY created_at ASC");
    $stmtMsg->execute(['phone' => $activePhone]);
    $activeMessages = $stmtMsg->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($activeMessages)) {
        $lastRow = end($activeMessages);
        $latestStatus = $lastRow['session_status'] ?? 'ai_active';
    }
}
?>

<div class="container-fluid overflow-hidden" style="height: calc(100vh - 60px);">
    <div class="row h-100">
        <?php 
            $sidebarPath = __DIR__ . '/../includes/sidebar.php';
            if (!file_exists($sidebarPath)) $sidebarPath = __DIR__ . '/includes/sidebar.php';
            include $sidebarPath; 
        ?>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-3 h-100 d-flex flex-column">
            
            <?php if (!empty($errorMsg)): ?>
                <div class="alert alert-danger alert-dismissible fade show shrink-0" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i><?= htmlspecialchars($errorMsg) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            <?php endif; ?>

            <div class="d-flex justify-content-between align-items-center mb-3 shrink-0">
                <h3 class="fw-bold m-0 text-body">Live Chat Pelanggan</h3>
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                    <i class="bi bi-circle-fill fs-8 me-1"></i> Live Session Active
                </span>
            </div>

            <div class="card border-0 shadow-sm rounded-3 overflow-hidden flex-grow-1 mb-3">
                <div class="row g-0 h-100">
                    
                    <!-- DAFTAR CHAT PELANGGAN -->
                    <div class="col-md-4 border-end border-secondary border-opacity-10 h-100 d-flex flex-column bg-body">
                        <div class="p-3 border-bottom border-secondary border-opacity-10 bg-body-tertiary fw-bold fs-7 d-flex justify-content-between align-items-center shrink-0">
                            <span>Daftar Percakapan</span>
                            <span class="badge bg-secondary rounded-pill"><?= count($conversations) ?></span>
                        </div>
                        
                        <div class="list-group list-group-flush overflow-y-auto flex-grow-1">
                            <?php if (empty($conversations)): ?>
                                <div class="p-4 text-center text-muted fs-8">Belum ada obrolan masuk.</div>
                            <?php else: ?>
                                <?php foreach ($conversations as $conv): ?>
                                    <?php 
                                        $isActive = ($conv['customer_phone'] === $activePhone); 
                                        $displayName = !empty($conv['customer_name']) ? $conv['customer_name'] : 'Pelanggan (' . htmlspecialchars($conv['customer_phone']) . ')';
                                        $convStatus = $conv['current_status'] ?? 'ai_active';
                                    ?>
                                    <div class="list-group-item p-0 border-0 border-bottom border-secondary border-opacity-10 position-relative <?= $isActive ? 'bg-primary-subtle' : '' ?>">
                                        <a href="index.php?phone=<?= urlencode($conv['customer_phone']) ?>" class="d-block p-3 text-decoration-none text-reset pe-5">
                                            <div class="d-flex justify-content-between align-items-center mb-1">
                                                <strong class="fs-7 text-body text-truncate" style="max-width: 140px;"><?= htmlspecialchars($displayName) ?></strong>
                                                <small class="text-muted fs-8"><?= date('H:i', strtotime($conv['last_chat'])) ?></small>
                                            </div>
                                            <div class="text-muted fs-8 text-truncate mb-1"><?= htmlspecialchars($conv['last_message']) ?></div>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <small class="text-success fs-8 fw-semibold"><i class="bi bi-whatsapp me-1"></i><?= htmlspecialchars($conv['customer_phone']) ?></small>
                                                
                                                <?php if ($convStatus === 'admin_active'): ?>
                                                    <span class="badge bg-warning text-dark fs-9"><i class="bi bi-headset me-1"></i>Admin CS</span>
                                                <?php elseif ($convStatus === 'ended'): ?>
                                                    <span class="badge bg-secondary fs-9">Selesai</span>
                                                <?php else: ?>
                                                    <span class="badge bg-indigo text-white fs-9" style="background-color: #4f46e5;"><i class="bi bi-robot me-1"></i>AI</span>
                                                <?php endif; ?>
                                            </div>
                                        </a>

                                        <form method="POST" class="position-absolute top-0 end-0 m-2" onsubmit="return confirm('Hapus percakapan dengan <?= htmlspecialchars($conv['customer_phone']) ?>?');">
                                            <input type="hidden" name="delete_phone" value="<?= htmlspecialchars($conv['customer_phone']) ?>">
                                            <button type="submit" class="btn btn-link text-danger p-1 opacity-50 hover-opacity-100" title="Hapus Chat">
                                                <i class="bi bi-trash fs-7"></i>
                                            </button>
                                        </form>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- BOX CHAT AKTIF -->
                    <div class="col-md-8 h-100 d-flex flex-column bg-body-tertiary">
                        <?php if ($activePhone): ?>
                            <div class="p-3 bg-body border-bottom border-secondary border-opacity-10 fw-bold fs-7 d-flex justify-content-between align-items-center shrink-0">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="p-2 rounded-circle bg-primary-subtle text-primary">
                                        <i class="bi bi-person-fill fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="text-body fw-bold"><?= htmlspecialchars($activePhone) ?></div>
                                        <small class="text-muted fs-8">
                                            Status: 
                                            <?php if ($latestStatus === 'admin_active'): ?>
                                                <span class="text-warning fw-bold"><i class="bi bi-headset"></i> Dilayani Admin (AI Mute)</span>
                                            <?php elseif ($latestStatus === 'ended'): ?>
                                                <span class="text-secondary fw-bold"><i class="bi bi-check-circle"></i> Sesi Berakhir</span>
                                            <?php else: ?>
                                                <span class="text-primary fw-bold"><i class="bi bi-robot"></i> Ditangani AI Bot</span>
                                            <?php endif; ?>
                                        </small>
                                    </div>
                                </div>

                                <div class="d-flex gap-2">
                                    <?php if ($latestStatus === 'admin_active'): ?>
                                        <form method="POST" class="m-0">
                                            <input type="hidden" name="action_status" value="ai_active">
                                            <button type="submit" class="btn btn-sm btn-outline-primary">
                                                <i class="bi bi-robot me-1"></i> Aktifkan AI
                                            </button>
                                        </form>
                                    <?php endif; ?>

                                    <?php if ($latestStatus !== 'ended'): ?>
                                        <form method="POST" class="m-0" onsubmit="return confirm('Akhiri obrolan?');">
                                            <input type="hidden" name="action_status" value="ended">
                                            <button type="submit" class="btn btn-sm btn-outline-danger">
                                                <i class="bi bi-x-circle me-1"></i> Akhiri Chat
                                            </button>
                                        </form>
                                    <?php endif; ?>

                                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.location.reload();">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>

                            <div id="chatMessagesBox" class="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-2">
                                <?php foreach ($activeMessages as $m): ?>
                                    <?php 
                                        $isCustomer = ($m['sender_type'] === 'customer');
                                        $isSystem   = ($m['sender_type'] === 'system');
                                        $isAi       = (strpos($m['sender_name'], 'AI') !== false || $m['sender_type'] === 'ai');
                                    ?>

                                    <?php if ($isSystem): ?>
                                        <div class="text-center my-2">
                                            <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-1 fs-8">
                                                <?= htmlspecialchars($m['message']) ?>
                                            </span>
                                        </div>
                                    <?php else: ?>
                                        <div class="d-flex <?= $isCustomer ? 'justify-content-start' : 'justify-content-end' ?>">
                                            <div class="p-2.5 rounded-3 shadow-xs" style="max-width: 75%; <?= $isCustomer ? 'background-color: var(--bs-card-bg); border: 1px solid rgba(255,255,255,0.08);' : ($isAi ? 'background-color: #1e1b4b; color: #a5b4fc; border: 1px solid #4338ca;' : 'background-color: #f59e0b; color: #000; font-weight: 500;') ?>">
                                                <div class="d-flex align-items-center gap-1 mb-1 fs-8 opacity-75">
                                                    <?php if ($isCustomer): ?>
                                                        <i class="bi bi-person-fill"></i>
                                                        <span><?= htmlspecialchars($m['sender_name']) ?></span>
                                                    <?php elseif ($isAi): ?>
                                                        <span class="badge bg-indigo text-white px-1.5 py-0.5 rounded" style="background-color: #4f46e5;"><i class="bi bi-robot me-1"></i>AI Bot</span>
                                                    <?php else: ?>
                                                        <span class="badge bg-dark text-warning px-1.5 py-0.5 rounded"><i class="bi bi-headset me-1"></i>Admin CS</span>
                                                    <?php endif; ?>
                                                </div>

                                                <div class="fs-7 text-break"><?= nl2br(htmlspecialchars($m['message'])) ?></div>
                                                <div class="fs-8 text-end opacity-75 mt-1"><?= date('H:i', strtotime($m['created_at'])) ?></div>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>

                            <!-- FORM BALAS CHAT -->
                            <form method="POST" action="index.php?phone=<?= urlencode($activePhone) ?>" class="p-3 bg-body border-top border-secondary border-opacity-10 d-flex gap-2 shrink-0">
                                <input type="text" name="reply_message" placeholder="Tulis balasan admin..." class="form-control form-control-sm" required autocomplete="off" autofocus>
                                <button type="submit" class="btn btn-warning btn-sm px-4 fw-bold text-dark shrink-0">
                                    <i class="bi bi-send-fill me-1"></i> Balas
                                </button>
                            </form>
                        <?php else: ?>
                            <div class="m-auto text-center text-muted fs-7">
                                <i class="bi bi-chat-left-text fs-1 d-block mb-2 text-secondary"></i>
                                Pilih percakapan pelanggan di sebelah kiri untuk mulai membalas chat.
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var chatBox = document.getElementById("chatMessagesBox");
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
</script>

<?php 
    $footerPath = __DIR__ . '/../includes/footer.php';
    if (!file_exists($footerPath)) $footerPath = __DIR__ . '/includes/footer.php';
    require_once $footerPath; 
?>