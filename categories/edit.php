<?php
require_once '../../backend/config/database.php';

$pdo = getDbConnection();
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$error = '';

if ($id <= 0) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM categories WHERE category_id = :id LIMIT 1");
$stmt->execute(['id' => $id]);
$category = $stmt->fetch();

if (!$category) {
    header("Location: index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name        = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $is_active   = isset($_POST['is_active']) ? 1 : 0;
    $imagePath   = $category['image_path']; // Default tetap pakai gambar lama

    if (empty($name)) {
        $error = 'Nama kategori wajib diisi!';
    } else {
        try {
            // Upload Gambar Baru Jika Ada
            if (isset($_FILES['category_image']) && $_FILES['category_image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../../backend/uploads/categories/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileTmp  = $_FILES['category_image']['tmp_name'];
                $fileName = $_FILES['category_image']['name'];
                $fileExt  = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                $allowed  = ['jpg', 'jpeg', 'png', 'webp'];

                if (in_array($fileExt, $allowed)) {
                    // Hapus gambar lama
                    if (!empty($category['image_path']) && file_exists($uploadDir . $category['image_path'])) {
                        unlink($uploadDir . $category['image_path']);
                    }

                    $newFileName = 'cat_' . time() . '_' . rand(100, 999) . '.' . $fileExt;
                    if (move_uploaded_file($fileTmp, $uploadDir . $newFileName)) {
                        $imagePath = $newFileName;
                    }
                }
            }

            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));

            $stmtUp = $pdo->prepare("
                UPDATE categories 
                SET name = :name, slug = :slug, description = :desc, image_path = :img, is_active = :active
                WHERE category_id = :id
            ");
            $stmtUp->execute([
                'name'   => $name,
                'slug'   => $slug,
                'desc'   => $description,
                'img'    => $imagePath,
                'active' => $is_active,
                'id'     => $id
            ]);

            header("Location: index.php?msg=updated");
            exit;
        } catch (Exception $e) {
            $error = 'Gagal merubah kategori: ' . $e->getMessage();
        }
    }
}

require_once '../includes/header.php';
?>

<div class="container-fluid">
    <div class="row">
        <?php include '../includes/sidebar.php'; ?>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold m-0 text-body">Edit Kategori</h3>
                    <small class="text-muted">Perbarui nama, gambar, atau deskripsi kategori produk.</small>
                </div>
                <a href="index.php" class="btn btn-outline-secondary btn-sm fw-semibold">
                    <i class="bi bi-arrow-left me-1"></i> Kembali ke Daftar
                </a>
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger border-0 bg-danger-subtle text-danger alert-dismissible fade show">
                    <?= htmlspecialchars($error) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <div class="row">
                <div class="col-lg-6">
                    <div class="card border-0 p-4">
                        <form action="" method="POST" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label class="form-label fs-8 fw-semibold">Nama Kategori</label>
                                <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($category['name']) ?>" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fs-8 fw-semibold">Gambar Latar Saat Ini</label>
                                <?php if (!empty($category['image_path'])): ?>
                                    <div class="mb-2">
                                        <img src="../../backend/uploads/categories/<?= htmlspecialchars($category['image_path']) ?>" class="rounded border" style="max-height: 120px;">
                                    </div>
                                <?php endif; ?>
                                <input type="file" name="category_image" class="form-control" accept="image/*">
                                <small class="text-muted fs-8">Pilih gambar baru jika ingin mengganti.</small>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fs-8 fw-semibold">Deskripsi Singkat</label>
                                <textarea name="description" class="form-control" rows="3"><?= htmlspecialchars($category['description'] ?? '') ?></textarea>
                            </div>

                            <div class="form-check form-switch mb-4">
                                <input class="form-check-input" type="checkbox" name="is_active" id="isActiveCat" <?= $category['is_active'] ? 'checked' : '' ?>>
                                <label class="form-check-label fs-8 fw-semibold" for="isActiveCat">Aktifkan Kategori</label>
                            </div>

                            <button type="submit" class="btn btn-success fw-bold py-2 w-100">
                                <i class="bi bi-floppy me-1"></i> Simpan Perubahan
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>