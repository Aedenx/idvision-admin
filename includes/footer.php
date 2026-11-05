<footer class="py-4 my-4 border-top text-center text-muted fs-8">
    <div class="container">
        &copy; <?= date('Y') ?> <strong class="text-body">IDVISION Eyewear</strong>. Admin Management System.
    </div>
</footer>

<!-- Bootstrap 5 Bundle JS (Hanya dimuat di footer) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", function () {
    let lastKnownOrderId = localStorage.getItem("last_known_order_id") || 0;

    // --- FITUR DARK / LIGHT MODE ---
    const btnToggle     = document.getElementById('btnThemeToggle');
    const themeIconMenu = document.getElementById('themeIconMenu');
    const themeTextMenu = document.getElementById('themeTextMenu');
    const htmlTag       = document.documentElement;

    function updateThemeUI(theme) {
        htmlTag.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);

        if (themeIconMenu) {
            themeIconMenu.className = theme === 'dark' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill text-primary';
        }
        if (themeTextMenu) {
            themeTextMenu.innerText = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
        }
    }

    // Set tema awal
    const currentTheme = localStorage.getItem('theme') || 'dark';
    updateThemeUI(currentTheme);

    // Event handler klik tombol tema
    if (btnToggle) {
        btnToggle.addEventListener('click', function (e) {
            const activeTheme = htmlTag.getAttribute('data-bs-theme');
            const newTheme    = activeTheme === 'dark' ? 'light' : 'dark';
            updateThemeUI(newTheme);
        });
    }

    // --- CEK NOTIFIKASI PESANAN BARU ---
    function checkNewOrders() {
        fetch('/idvision/admin/api/check_new_orders.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.total_new !== undefined) {
                    const badge = document.getElementById('pending-orders-badge');
                    if (badge) {
                        if (data.total_new > 0) {
                            badge.innerText = data.total_new;
                            badge.classList.remove('d-none');
                        } else {
                            badge.classList.add('d-none');
                        }
                    }

                    if (lastKnownOrderId != 0 && data.last_id > lastKnownOrderId) {
                        const sound = document.getElementById('orderNotifSound');
                        if (sound) sound.play().catch(() => {});

                        if (confirm(`🔔 ADA PESANAN BARU MASUK!\n\nID Pesanan: #${data.last_id}\nApakah Anda ingin langsung mengelola pesanan ini sekarang?`)) {
                            window.location.href = `/idvision/admin/orders/detail.php?id=${data.last_id}`;
                        }
                    }

                    lastKnownOrderId = data.last_id;
                    localStorage.setItem("last_known_order_id", data.last_id);
                }
            })
            .catch(err => console.error("Gagal mengecek notifikasi order:", err));
    }

    checkNewOrders();
    setInterval(checkNewOrders, 5000);
});
</script>
</body>
</html>