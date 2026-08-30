document.addEventListener('DOMContentLoaded', () => {
    const layer1 = document.getElementById('layer1');
    const mainContent = document.getElementById('main-content');
    const video = document.getElementById('my-video');
    const btnOpen = document.getElementById('btn-open');
    const sections = document.querySelectorAll('.layer-section');

    // 1. Fungsi Buka Undangan
    function openInvitation() {
        mainContent.classList.remove('hidden');
        layer1.classList.add('fade-out');
        document.body.classList.remove('no-scroll');

        video.muted = false;
        video.play().catch(error => {
            console.log("Autoplay video gagal diputar:", error);
        });
    }

    btnOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        openInvitation();
    });

    layer1.addEventListener('click', openInvitation);

    // 2. Intersection Observer untuk Efek Transisi Soft antar Layer
    const observerOptions = {
        root: mainContent,
        threshold: 0.5 // Aktif jika 50% area layer sudah masuk ke layar
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Opsional: Hapus komentar di bawah jika ingin efek transisi diulang tiap kali scroll balik
                // entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});