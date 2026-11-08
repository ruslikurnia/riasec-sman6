/**
 * @fileoverview Modul Klien: Fisher-Yates Randomization, Kalkulasi Holland Triad, & SPA Insight View
 * @complexity Shuffle: O(N) Time, O(1) Space | Sorting Triad: O(D log D) Time | Rendering: O(N)
 */

// GANTI URL DI BAWAH INI DENGAN WEB APP URL GOOGLE APPS SCRIPT ANDA
const GAS_ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbyP0AMUd_lYx9X-Jis7UopfJM7uDpZiB6DxQs7hYqsBcuCDfBLxH56zj_ob7kt2xJPXKA/exec";

// === [PERUBAHAN 1: Kamus Deskripsi Insight & Rekomendasi Studi per Dimensi RIASEC] ===
const RIASEC_INSIGHTS = {
  R: {
    name: "Realistic (The Doers)",
    orientation: "Praktis, Teknis, Mekanis, & Terapan Fisik",
    description:
      "Anda menyukai aktivitas yang menghasilkan sesuatu yang nyata, bekerja dengan perangkat keras, mesin, instrumen teknis, atau aktivitas lapangan. Anda cenderung berpikir secara konkret dan lebih menyukai praktik langsung dibandingkan abstraksi teoretis.",
    majors:
      "Teknik Mesin, Teknik Elektro, Teknik Sipil, Teknik Industri, Arsitektur, Perangkat Keras Komputer, Pertanian/Kehutanan, Kedokteran Hewan.",
  },
  I: {
    name: "Investigative (The Thinkers)",
    orientation: "Analitis, Saintifik, Logis, & Riset",
    description:
      "Anda memiliki rasa ingin tahu intelektual yang tinggi, gemar memecahkan masalah kompleks menggunakan logika, algoritma, matematika, dan observasi ilmiah. Anda sangat unggul dalam menganalisis fenomena dan bekerja secara mandiri berbasis data.",
    majors:
      "Teknik Informatika / Ilmu Komputer, Sains Data, Matematika, Fisika, Kimia, Biologi, Kedokteran, Farmasi, Statistika.",
  },
  A: {
    name: "Artistic (The Creators)",
    orientation: "Kreatif, Ekspresif, Intuitif, & Inovatif",
    description:
      "Anda memiliki imajinasi tinggi, menyukai kebebasan berekspresi, dan kurang menyukai rutinitas yang kaku. Anda unggul dalam merancang estetika visual, karya tulis, komposisi audio-visual, maupun inovasi desain antarmuka.",
    majors:
      "Desain Komunikasi Visual (DKV), Desain Produk/Interior, Arsitektur, Seni Rupa, Ilmu Komunikasi, Sastra & Bahasa, Sinematografi/Televisi.",
  },
  S: {
    name: "Social (The Helpers)",
    orientation: "Empatis, Kolaboratif, Edukatif, & Humanis",
    description:
      "Anda memiliki kepekaan interpersonal yang kuat, senang membantu, mengajar, membimbing, dan memberdayakan orang lain. Anda sangat efektif dalam komunikasi dua arah, kerja sama tim, dan pemecahan masalah sosial.",
    majors:
      "Psikologi, Pendidikan / Keguruan, Ilmu Komunikasi, Hubungan Internasional, Sosiologi, Keperawatan, Kesehatan Masyarakat, Bimbingan Konseling.",
  },
  E: {
    name: "Enterprising (The Persuaders)",
    orientation: "Kepemimpinan, Strategis, Persuasif, & Manajerial",
    description:
      "Anda memiliki jiwa kepemimpinan alami, berorientasi pada pencapaian target, berani mengambil keputusan strategis, dan mahir bernegosiasi atau memengaruhi orang lain. Anda berkembang pesat di lingkungan yang dinamis dan kompetitif.",
    majors:
      "Manajemen Bisnis, Kewirausahaan, Ilmu Hukum, Ilmu Politik, Hubungan Internasional, Teknik Industri, Ekonomi Pembangunan, Pemasaran.",
  },
  C: {
    name: "Conventional (The Organizers)",
    orientation: "Terstruktur, Presisi Data, Sistematis, & Administratif",
    description:
      "Anda sangat teliti, terorganisir, menyukai keteraturan sistem, serta unggul dalam mengelola angka, arsip, basis data, dan tata kelola keuangan. Anda bekerja dengan tingkat akurasi dan kepatuhan prosedur yang sangat tinggi.",
    majors:
      "Akuntansi, Sistem Informasi, Keuangan & Perbankan, Ilmu Aktuaria, Administrasi Bisnis/Publik, Perpajakan, Manajemen Logistik.",
  },
};


// Bank Soal Mentah (6 Dimensi x 5 Butir = 30 Pernyataan)
// Gaya bahasa: pernyataan sudut pandang orang pertama ("Saya ...") yang komunikatif
// dan mudah dipahami siswa SMA, dijawab dengan skala kesesuaian 1–5.
const RIASEC_BANK = [
  {
    code: "R",
    items: [
      "Saya senang mengutak-atik, memperbaiki, atau merakit barang elektronik maupun perangkat keras komputer.",
      "Saya lebih bersemangat ketika beraktivitas fisik atau berkegiatan di luar ruangan, seperti di lapangan atau alam terbuka.",
      "Saya tertarik mempelajari cara kerja mesin, alat ukur, atau perkakas teknis, lalu mencoba mengoperasikannya sendiri.",
      "Saya suka membuat atau membangun sesuatu dengan tangan sendiri, misalnya prakarya, maket, atau kerajinan.",
      "Saya menikmati kegiatan yang berhubungan dengan benda nyata, seperti merawat tanaman, mengolah bahan, atau menangani material fisik.",
    ],
  },
  {
    code: "I",
    items: [
      "Saya penasaran dan senang melakukan percobaan atau penelitian di laboratorium sains.",
      "Saya merasa tertantang ketika memecahkan teka-teki logika, soal matematika yang sulit, atau menyusun algoritma.",
      "Saya suka menganalisis data atau angka untuk mencari tahu penyebab di balik suatu masalah.",
      "Saya senang membaca artikel ilmiah atau mengikuti kabar terbaru tentang penemuan dan perkembangan teknologi.",
      "Saya suka mengamati fenomena alam, makhluk hidup, atau gejala sains secara detail dan teliti.",
    ],
  },
  {
    code: "A",
    items: [
      "Saya senang menggambar, melukis, atau mendesain tampilan visual seperti poster dan antarmuka aplikasi.",
      "Saya menikmati bermain alat musik, bernyanyi, atau menciptakan lagu dan aransemen musik.",
      "Saya suka menuangkan ide melalui tulisan, seperti cerpen, puisi, naskah drama, atau artikel kreatif.",
      "Saya senang mengekspresikan diri lewat seni pertunjukan, fotografi, atau pembuatan video dan film.",
      "Saya tertarik menata ruangan, mendekorasi, atau merancang sesuatu agar terlihat indah dan estetik.",
    ],
  },
  {
    code: "S",
    items: [
      "Saya senang menjelaskan atau mengajari materi pelajaran kepada teman yang belum memahaminya.",
      "Saya senang menjadi tempat bercerita bagi teman, mendengarkan keluh kesah mereka, dan memberikan saran.",
      "Saya tertarik menjadi relawan dalam kegiatan sosial, bakti masyarakat, atau penggalangan dana.",
      "Saya senang bekerja sama dalam tim dan membantu menengahi ketika terjadi perselisihan antaranggota.",
      "Saya merasa puas ketika dapat merawat atau menolong orang lain yang sedang mengalami kesulitan.",
    ],
  },
  {
    code: "E",
    items: [
      "Saya senang dipercaya memimpin tim, kepanitiaan acara, atau organisasi di sekolah.",
      "Saya tertarik memulai usaha sendiri, berjualan, atau mengelola proyek yang menghasilkan keuntungan.",
      "Saya menikmati kegiatan berdebat, bernegosiasi, atau meyakinkan orang lain agar sependapat dengan saya.",
      "Saya merasa percaya diri saat mempresentasikan ide, produk, atau proyek di depan banyak orang.",
      "Saya senang menyusun strategi dan mengambil keputusan penting demi mencapai target bersama.",
    ],
  },
  {
    code: "C",
    items: [
      "Saya senang merapikan dan menyusun dokumen, catatan, atau laporan secara teratur dan sistematis.",
      "Saya suka mencatat pemasukan dan pengeluaran atau menyusun rencana anggaran dengan cermat.",
      "Saya merasa nyaman mengolah angka dan data menggunakan tabel atau aplikasi spreadsheet seperti Excel.",
      "Saya merasa lebih tenang bekerja dengan mengikuti instruksi, prosedur, dan aturan yang jelas.",
      "Saya senang membuat jadwal kegiatan dan rencana kerja yang rinci serta terorganisir.",
    ],
  },
];

// Warna identitas tiap dimensi RIASEC (dipakai pada grafik & kartu insight)
const RIASEC_COLORS = {
  R: "#ea580c",
  I: "#2563eb",
  A: "#9333ea",
  S: "#16a34a",
  E: "#dc2626",
  C: "#0891b2",
};

// Opsi skala Likert (label lengkap untuk desktop, singkatan untuk layar kecil)
const LIKERT_OPTIONS = [
  { value: 1, full: "Sangat Tidak Sesuai", short: "STS" },
  { value: 2, full: "Tidak Sesuai", short: "TS" },
  { value: 3, full: "Netral", short: "N" },
  { value: 4, full: "Sesuai", short: "S" },
  { value: 5, full: "Sangat Sesuai", short: "SS" },
];

const TOTAL_QUESTIONS = RIASEC_BANK.reduce((n, d) => n + d.items.length, 0);
const SUBMIT_LABEL = "Kirim & Lihat Hasil Analisis Minat";
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const scrollBehavior = () => (prefersReducedMotion ? "auto" : "smooth");

/**
 * === [PERUBAHAN 2: Algoritma Pengacakan Fisher-Yates (Knuth) Shuffle] ===
 * Mengacak urutan elemen array secara in-place tanpa bias distribusi.
 * Kompleksitas Waktu: O(N) | Kompleksitas Ruang: O(1)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * === [PERUBAHAN 3: Peleburan & Rendering 30 Soal Tanpa Label Dimensi] ===
 * Soal dilebur ke satu array datar, diacak dengan Fisher-Yates, lalu dirender dalam satu blok tunggal.
 */
function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  const fragment = document.createDocumentFragment();

  // 1. Flattening: Melebur 6 dimensi menjadi 30 objek soal independen
  const flatQuestions = [];
  RIASEC_BANK.forEach((dimension) => {
    dimension.items.forEach((itemText, itemIdx) => {
      flatQuestions.push({
        qId: `q_${dimension.code}_${itemIdx}`,
        code: dimension.code,
        text: itemText,
      });
    });
  });

  // 2. Mengacak urutan 30 soal
  shuffleArray(flatQuestions);

  // 3. Merender seluruh soal di dalam satu fieldset tunggal tanpa header dimensi
  const fieldset = document.createElement("fieldset");
  fieldset.className = "card";

  const legend = document.createElement("legend");
  legend.className = "section-legend";
  const legendStep = document.createElement("span");
  legendStep.className = "section-step";
  legendStep.textContent = "Bagian II";
  const legendName = document.createElement("span");
  legendName.className = "section-name";
  legendName.textContent = `Pernyataan Minat Aktivitas (${TOTAL_QUESTIONS} Butir)`;
  legend.appendChild(legendStep);
  legend.appendChild(legendName);
  fieldset.appendChild(legend);

  const subtitle = document.createElement("p");
  subtitle.className = "section-subtitle";
  subtitle.textContent =
    "Bacalah setiap pernyataan dengan saksama, lalu pilih jawaban yang paling menggambarkan dirimu saat ini.";
  fieldset.appendChild(subtitle);

  flatQuestions.forEach((qObj, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-item";
    wrapper.dataset.qid = qObj.qId;
    wrapper.style.setProperty("--delay", `${Math.min(index, 8) * 40}ms`);

    const head = document.createElement("div");
    head.className = "question-head";

    const num = document.createElement("span");
    num.className = "question-number";
    num.textContent = String(index + 1).padStart(2, "0");

    const p = document.createElement("p");
    p.className = "question-text";
    p.id = `${qObj.qId}_label`;
    p.textContent = qObj.text;

    head.appendChild(num);
    head.appendChild(p);
    wrapper.appendChild(head);

    const scaleDiv = document.createElement("div");
    scaleDiv.className = "likert-scale";
    scaleDiv.setAttribute("role", "radiogroup");
    scaleDiv.setAttribute("aria-labelledby", p.id);

    LIKERT_OPTIONS.forEach((opt) => {
      const label = document.createElement("label");
      label.className = `likert-option opt-${opt.value}`;
      label.title = opt.full;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = qObj.qId;
      radio.value = opt.value;
      radio.required = true;
      radio.setAttribute("aria-label", `${opt.value} - ${opt.full}`);

      const dot = document.createElement("span");
      dot.className = "likert-dot";
      dot.textContent = opt.value;

      const text = document.createElement("span");
      text.className = "likert-label";
      const full = document.createElement("span");
      full.className = "label-full";
      full.textContent = opt.full;
      const short = document.createElement("span");
      short.className = "label-short";
      short.textContent = opt.short;
      text.appendChild(full);
      text.appendChild(short);

      label.appendChild(radio);
      label.appendChild(dot);
      label.appendChild(text);
      scaleDiv.appendChild(label);
    });

    wrapper.appendChild(scaleDiv);
    fieldset.appendChild(wrapper);
  });

  fragment.appendChild(fieldset);
  container.appendChild(fragment);
}

/**
 * Memperbarui indikator progres pengisian (sticky progress bar).
 */
function updateProgress() {
  const answered = document.querySelectorAll(".question-item.answered").length;
  const percent = Math.round((answered / TOTAL_QUESTIONS) * 100);

  document.getElementById("progressCount").textContent = answered;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document
    .getElementById("progressTrack")
    .setAttribute("aria-valuenow", String(percent));
  document
    .getElementById("progressWrapper")
    .classList.toggle("complete", answered === TOTAL_QUESTIONS);
}

/**
 * Mencari butir pertanyaan berikutnya (setelah `fromItem`) yang belum dijawab.
 */
function findNextUnanswered(fromItem) {
  const items = Array.from(document.querySelectorAll(".question-item"));
  const startIdx = fromItem ? items.indexOf(fromItem) + 1 : 0;
  for (let i = startIdx; i < items.length; i++) {
    if (!items[i].classList.contains("answered")) return items[i];
  }
  return items.find((el) => !el.classList.contains("answered")) || null;
}

/**
 * === [PERUBAHAN 4: Kalkulasi Vektor & Ekstraksi 3 Kategori Teratas (Holland Triad)] ===
 * Kompleksitas Waktu: O(N) agregasi + O(D log D) sorting (D=6 konstan) => O(N)
 */
function computeRIASECProfile(formData) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  RIASEC_BANK.forEach((dimension) => {
    dimension.items.forEach((_, itemIdx) => {
      const key = `q_${dimension.code}_${itemIdx}`;
      const val = parseInt(formData.get(key), 10);
      if (isNaN(val)) {
        throw new Error("Terdapat butir pernyataan yang belum diisi.");
      }
      scores[dimension.code] += val;
    });
  });

  // Mengurutkan dimensi berdasarkan skor tertinggi (descending)
  const sortedList = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const top3 = {
    rank1: sortedList[0][0],
    rank2: sortedList[1][0],
    rank3: sortedList[2][0],
  };

  return { scores, top3, sortedList };
}

/**
 * === [PERUBAHAN 5: Fungsi Rendering Halaman Hasil & Insight (SPA View)] ===
 * Menampilkan grafik persentase dan deskripsi mendalam Top 3 RIASEC secara aman (XSS-safe).
 */
function renderResultView(nisn, verifiedKelas, scores, top3, sortedList) {
  // Sembunyikan form, petunjuk awal, dan progress bar
  document.getElementById("riasecForm").classList.add("hidden");
  document.getElementById("instructionsSection").classList.add("hidden");
  document.getElementById("progressWrapper").classList.add("hidden");

  const resultView = document.getElementById("resultView");
  document.getElementById("studentIdentityText").textContent =
    `NISN: ${nisn} | Kelas Terverifikasi: ${verifiedKelas}`;

  // Tampilkan Kode Tiga Huruf (Holland Triad) dalam bentuk ubin huruf
  const triadBox = document.getElementById("triadCodeDisplay");
  triadBox.innerHTML = "";
  triadBox.setAttribute(
    "aria-label",
    `Kode Holland: ${top3.rank1} - ${top3.rank2} - ${top3.rank3}`,
  );
  [top3.rank1, top3.rank2, top3.rank3].forEach((code, idx) => {
    const tile = document.createElement("div");
    tile.className = "triad-letter";
    tile.style.setProperty("--dim-color", RIASEC_COLORS[code]);
    tile.style.setProperty("--delay", `${150 + idx * 150}ms`);

    const letter = document.createElement("span");
    letter.className = "letter";
    letter.textContent = code;

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = `Peringkat ${idx + 1}`;

    tile.appendChild(letter);
    tile.appendChild(rank);
    triadBox.appendChild(tile);
  });

  document.getElementById("triadNamesDisplay").textContent =
    `${RIASEC_INSIGHTS[top3.rank1].name.split(" ")[0]} • ` +
    `${RIASEC_INSIGHTS[top3.rank2].name.split(" ")[0]} • ` +
    `${RIASEC_INSIGHTS[top3.rank3].name.split(" ")[0]}`;

  // Render Grafik Batang Skor Keenam Dimensi (Diurutkan dari tertinggi ke terendah)
  const barsContainer = document.getElementById("scoreBarsContainer");
  barsContainer.innerHTML = "";
  const maxPossibleScore = 25; // 5 soal x skala maksimal 5
  const topCodes = [top3.rank1, top3.rank2, top3.rank3];
  const fills = [];

  sortedList.forEach(([code, score]) => {
    const percentage = Math.round((score / maxPossibleScore) * 100);
    const row = document.createElement("div");
    row.className = "score-bar-row";
    if (topCodes.includes(code)) row.classList.add("is-top");
    row.style.setProperty("--dim-color", RIASEC_COLORS[code]);

    const labelDiv = document.createElement("div");
    labelDiv.className = "score-bar-label";

    const nameSpan = document.createElement("span");
    nameSpan.className = "dim-name";
    const codeBadge = document.createElement("span");
    codeBadge.className = "dim-code";
    codeBadge.textContent = code;
    nameSpan.appendChild(codeBadge);
    nameSpan.appendChild(document.createTextNode(RIASEC_INSIGHTS[code].name));

    const valSpan = document.createElement("span");
    valSpan.className = "dim-value";
    valSpan.textContent = `${score} / 25 (${percentage}%)`;

    labelDiv.appendChild(nameSpan);
    labelDiv.appendChild(valSpan);

    const trackDiv = document.createElement("div");
    trackDiv.className = "score-bar-track";

    const fillDiv = document.createElement("div");
    fillDiv.className = "score-bar-fill";
    fillDiv.style.width = "0%";
    fillDiv.dataset.target = `${percentage}%`;
    fills.push(fillDiv);

    trackDiv.appendChild(fillDiv);
    row.appendChild(labelDiv);
    row.appendChild(trackDiv);
    barsContainer.appendChild(row);
  });

  // Render Kartu Insight untuk Top 3 Dimensi
  const insightsContainer = document.getElementById("insightsContainer");
  insightsContainer.innerHTML = "";
  const rankLabels = [
    "Peringkat 1 — Kecenderungan Utama (Primary Trait)",
    "Peringkat 2 — Kecenderungan Pendukung (Secondary Trait)",
    "Peringkat 3 — Kecenderungan Komplementer (Tertiary Trait)",
  ];

  [top3.rank1, top3.rank2, top3.rank3].forEach((code, idx) => {
    const info = RIASEC_INSIGHTS[code];
    const score = scores[code];
    const percentage = Math.round((score / maxPossibleScore) * 100);

    const card = document.createElement("div");
    card.className = "insight-card";
    card.style.setProperty("--dim-color", RIASEC_COLORS[code]);
    card.style.setProperty("--delay", `${300 + idx * 120}ms`);

    const header = document.createElement("div");
    header.className = "insight-card-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "insight-title-wrap";

    const letter = document.createElement("span");
    letter.className = "insight-letter";
    letter.textContent = code;

    const titleText = document.createElement("div");
    const title = document.createElement("span");
    title.className = "insight-title";
    title.textContent = info.name;
    const sub = document.createElement("span");
    sub.className = "insight-sub";
    sub.textContent = `${info.orientation} · Skor ${score}/25 (${percentage}%)`;
    titleText.appendChild(title);
    titleText.appendChild(sub);

    titleWrap.appendChild(letter);
    titleWrap.appendChild(titleText);

    const badge = document.createElement("span");
    badge.className = "insight-rank-badge";
    badge.textContent = rankLabels[idx];

    header.appendChild(titleWrap);
    header.appendChild(badge);

    const desc = document.createElement("p");
    desc.className = "insight-desc";
    desc.textContent = info.description;

    const majors = document.createElement("div");
    majors.className = "insight-majors";
    const strong = document.createElement("strong");
    strong.textContent = "Rekomendasi Rumpun Program Studi:";
    const chips = document.createElement("div");
    chips.className = "major-chips";
    info.majors
      .replace(/\.$/, "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
      .forEach((m) => {
        const chip = document.createElement("span");
        chip.className = "major-chip";
        chip.textContent = m;
        chips.appendChild(chip);
      });
    majors.appendChild(strong);
    majors.appendChild(chips);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(majors);
    insightsContainer.appendChild(card);
  });

  // Munculkan kontainer hasil dan gulir layar ke atas
  resultView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: scrollBehavior() });

  // Animasi pengisian grafik batang setelah elemen tampil
  setTimeout(() => {
    fills.forEach((el, i) => {
      setTimeout(() => {
        el.style.width = el.dataset.target;
      }, i * 90);
    });
  }, 350);
}

/**
 * Mengatur status tombol kirim (loading / normal).
 */
function setSubmitLoading(button, isLoading, text) {
  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.querySelector(".btn-label").textContent = text;
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  const form = document.getElementById("riasecForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusMsg = document.getElementById("statusMessage");
  const questionsContainer = document.getElementById("questionsContainer");
  const nisnField = document.getElementById("nisn");
  const nisnWrap = nisnField.closest(".input-wrap");

  document.getElementById("progressTotal").textContent = TOTAL_QUESTIONS;
  updateProgress();

  // Validasi NISN secara langsung: hanya angka, umpan balik visual valid/tidak valid
  nisnField.addEventListener("input", () => {
    nisnField.value = nisnField.value.replace(/\D/g, "");
    const val = nisnField.value;
    nisnWrap.classList.toggle("is-valid", /^\d{8,12}$/.test(val));
    nisnWrap.classList.remove("is-invalid");
  });
  nisnField.addEventListener("blur", () => {
    if (nisnField.value && !/^\d{8,12}$/.test(nisnField.value)) {
      nisnWrap.classList.add("is-invalid");
    }
  });

  // Tandai butir terjawab, perbarui progres, lalu gulir otomatis ke butir berikutnya
  questionsContainer.addEventListener("change", (e) => {
    if (!e.target.matches('input[type="radio"]')) return;
    const item = e.target.closest(".question-item");
    const isFirstAnswer = !item.classList.contains("answered");
    item.classList.add("answered");
    item.classList.remove("missing");
    updateProgress();

    if (!isFirstAnswer) return;
    const next = findNextUnanswered(item);
    setTimeout(() => {
      if (next) {
        next.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      } else {
        document
          .querySelector(".submit-area")
          .scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }, 280);
  });

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMsg.className = "status-msg";
    statusMsg.textContent = "";

    if (!form.checkValidity()) {
      statusMsg.classList.add("status-error");

      if (!nisnField.checkValidity()) {
        nisnWrap.classList.add("is-invalid");
        statusMsg.textContent =
          "NISN belum diisi atau formatnya tidak valid (8–12 digit angka).";
        nisnField.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
        nisnField.focus({ preventScroll: true });
        return;
      }

      const unanswered = document.querySelectorAll(
        ".question-item:not(.answered)",
      );
      unanswered.forEach((el) => {
        el.classList.remove("missing");
        void el.offsetWidth; // restart animasi shake
        el.classList.add("missing");
      });
      statusMsg.textContent = `Masih ada ${unanswered.length} pernyataan yang belum dijawab. Silakan lengkapi butir yang ditandai merah.`;
      if (unanswered[0]) {
        unanswered[0].scrollIntoView({
          behavior: scrollBehavior(),
          block: "center",
        });
      }
      return;
    }

    try {
      setSubmitLoading(submitBtn, true, "Memverifikasi NISN & Memproses Data...");

      const formData = new FormData(form);
      const nisnInput = formData.get("nisn").trim();
      const { scores, top3, sortedList } = computeRIASECProfile(formData);

      const payload = {
        nisn: nisnInput,
        portofolio: formData.get("portofolio"),
        scores: scores,
        top3: top3,
      };

      const response = await fetch(GAS_ENDPOINT_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        // Transisi ke halaman laporan Insight SPA
        renderResultView(
          nisnInput,
          result.kelas || "XII-Eligible",
          scores,
          top3,
          sortedList,
        );
      } else {
        throw new Error(
          result.message || "Gagal memverifikasi atau menyimpan data.",
        );
      }
    } catch (err) {
      statusMsg.classList.add("status-error");
      statusMsg.textContent = `${err.message}`;
    } finally {
      setSubmitLoading(submitBtn, false, SUBMIT_LABEL);
    }
  });
});
