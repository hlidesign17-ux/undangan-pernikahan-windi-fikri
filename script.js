document.addEventListener("DOMContentLoaded", () => {
  const layer1 = document.getElementById("layer1");
  const mainContent = document.getElementById("main-content");
  const video = document.getElementById("my-video");
  const btnOpen = document.getElementById("btn-open");
  const sections = document.querySelectorAll(".layer-section");
  const btnAudio = document.getElementById("btn-audio");
  const audioIcon = document.getElementById("audio-icon");

  // =========================================================
  // 0. BACA PARAMETER NAMA TAMU DARI URL (?to=Nama atau ?p=Nama)
  // =========================================================
  const guestNameElement = document.getElementById("guest-name");
  if (guestNameElement) {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam =
      urlParams.get("to") || urlParams.get("p") || urlParams.get("nama");

    if (guestParam) {
      // Mengubah tanda + atau %20 di URL menjadi spasi
      guestNameElement.textContent = decodeURIComponent(
        guestParam.replace(/\+/g, " "),
      );
    }
  }

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
  // 3.5. LOGIKA HITUNG MUNDUR (COUNTDOWN LAYER 3 - 25 OKTOBER 2026)
  // =========================================================
  const targetDate = new Date("October 25, 2026 08:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
      const countdownContainer = document.getElementById("countdown");
      if (countdownContainer) {
        countdownContainer.innerHTML =
          "<p style='color:#5C2C16; font-weight:600;'>Acara Telah Berlangsung</p>";
      }
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const elDays = document.getElementById("days");
    const elHours = document.getElementById("hours");
    const elMinutes = document.getElementById("minutes");
    const elSeconds = document.getElementById("seconds");

    if (elDays) elDays.textContent = days < 10 ? "0" + days : days;
    if (elHours) elHours.textContent = hours < 10 ? "0" + hours : hours;
    if (elMinutes)
      elMinutes.textContent = minutes < 10 ? "0" + minutes : minutes;
    if (elSeconds)
      elSeconds.textContent = seconds < 10 ? "0" + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // =========================================================
  // 4. INTEGRASI SUPABASE (BUKU TAMU - LAYER 6)
  // =========================================================
  const SUPABASE_URL = "https://wuvjloziovyalrtydkwi.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dmpsb3ppb3Z5YWxydHlka3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTExOTUsImV4cCI6MjEwMzY4NzE5NX0.Yf8trBbAyeqhlZBGV5Vw8ifXNr-kyLlsU3OIzWYIVLk";

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
