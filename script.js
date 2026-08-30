document.addEventListener("DOMContentLoaded", () => {
  const layer1 = document.getElementById("layer1");
  const mainContent = document.getElementById("main-content");
  const video = document.getElementById("my-video");
  const btnOpen = document.getElementById("btn-open");
  const sections = document.querySelectorAll(".layer-section");
  const btnAudio = document.getElementById("btn-audio");
  const audioIcon = document.getElementById("audio-icon");

  // 1. Fungsi Buka Undangan
  function openInvitation() {
    mainContent.classList.remove("hidden");
    layer1.classList.add("fade-out");
    document.body.classList.remove("no-scroll");

    // LEPAS CLASS HIDDEN AGAR TOMBOL MUNCUL
    if (btnAudio) {
      btnAudio.classList.remove("hidden");
    }

    // Putar video
    if (video) {
      video.muted = false;
      video.play().catch((error) => {
        console.log("Autoplay video gagal diputar:", error);
      });
    }
  }

  // 2. Fitur Toggle Mute / Unmute
  if (btnAudio && video && audioIcon) {
    btnAudio.addEventListener("click", (e) => {
      e.stopPropagation(); // Mencegah event klik menembus ke elemen lain
      if (video.muted) {
        video.muted = false;
        audioIcon.textContent = "🔊";
      } else {
        video.muted = true;
        audioIcon.textContent = "🔇";
      }
    });
  }

  // Event Listener Buka Undangan
  if (btnOpen) {
    btnOpen.addEventListener("click", (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  if (layer1) {
    layer1.addEventListener("click", openInvitation);
  }

  // 3. Intersection Observer untuk Transisi Layar
  const observerOptions = {
    root: mainContent,
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // =========================================================
  // 4. INTEGRASI SUPABASE (BUKU TAMU - LAYER 6)
  // =========================================================
  const SUPABASE_URL = "https://wuvjloziovyalrtydkwi.supabase.co";
  // Ganti dengan Kunci 'anon public' (diawali eyJhbGci...) dari menu Legacy API Keys Supabase Anda
  const SUPABASE_KEY = "PASTE_ANON_PUBLIC_KEY_ANDA_DI_SINI";

  // Inisialisasi Supabase Client jika SDK tersedia
  if (typeof supabase !== "undefined") {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const formUcapan = document.getElementById("form-ucapan");
    const inputNama = document.getElementById("input-nama");
    const inputPesan = document.getElementById("input-pesan");
    const daftarUcapan = document.getElementById("daftar-ucapan");

    // Fungsi Ambil Ucapan dari Database Supabase
    async function loadUcapan() {
      if (!daftarUcapan) return;

      // Mengambil data tanpa .order("id") karena tabel belum memiliki kolom id
      const { data, error } = await supabaseClient.from("Ucapan").select("*");

      if (error) {
        console.error("Gagal memuat ucapan:", error);
        daftarUcapan.innerHTML = `<p class="loading-text">Gagal memuat ucapan.</p>`;
        return;
      }

      if (!data || data.length === 0) {
        daftarUcapan.innerHTML = `<p class="loading-text">Belum ada ucapan. Jadilah yang pertama!</p>`;
        return;
      }

      // Menggunakan .reverse() agar ucapan yang paling baru masuk muncul di bagian atas
      daftarUcapan.innerHTML = data
        .reverse()
        .map(
          (item) => `
        <div class="ucapan-card">
          <div class="ucapan-nama">${escapeHtml(item.Nama || "Tamu")}</div>
          <div class="ucapan-pesan">${escapeHtml(item.Pesan || "")}</div>
        </div>
      `,
        )
        .join("");
    }

    // Mencegah Serangan XSS
    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // Event Submit Form Ucapan
    if (formUcapan) {
      formUcapan.addEventListener("submit", async (e) => {
        e.preventDefault();
        const namaVal = inputNama.value.trim();
        const pesanVal = inputPesan.value.trim();

        if (!namaVal || !pesanVal) return;

        const btnKirim = document.getElementById("btn-kirim");
        if (btnKirim) {
          btnKirim.disabled = true;
          btnKirim.innerText = "Mengirim...";
        }

        // Memasukkan data ke kolom 'Nama' dan 'Pesan' (huruf kapital)
        const { error } = await supabaseClient
          .from("Ucapan")
          .insert([{ Nama: namaVal, Pesan: pesanVal }]);

        if (btnKirim) {
          btnKirim.disabled = false;
          btnKirim.innerText = "Kirim Ucapan";
        }

        if (!error) {
          inputNama.value = "";
          inputPesan.value = "";
          loadUcapan(); // Refresh tampilan ucapan secara instan
        } else {
          console.error("Error insert:", error);
          alert("Gagal mengirim ucapan: " + error.message);
        }
      });

      // Muat ucapan saat aplikasi pertama kali dijalankan
      loadUcapan();
    }
  }
});
