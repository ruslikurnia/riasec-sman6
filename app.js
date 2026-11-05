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
const RIASEC_BANK = [
  {
    code: "R",
    items: [
      "Memperbaiki peralatan elektronik atau merakit perangkat keras (hardware).",
      "Melakukan aktivitas fisik atau bekerja di luar ruangan (lapangan/alam).",
      "Mengoperasikan mesin, alat ukur, atau perkakas teknis.",
      "Membangun atau membuat sesuatu menggunakan keterampilan tangan.",
      "Bekerja dengan objek nyata, tumbuhan, atau material fisik.",
    ],
  },
  {
    code: "I",
    items: [
      "Melakukan eksperimen atau penelitian di laboratorium sains.",
      "Memecahkan teka-teki logika, algoritma, atau soal matematika tingkat lanjut.",
      "Menganalisis data statistik untuk menemukan penyebab suatu masalah.",
      "Membaca dan mengkaji artikel ilmiah atau perkembangan teknologi terbaru.",
      "Mengamati gejala alam, biologi, atau fenomena sains secara rinci.",
    ],
  },
  {
    code: "A",
    items: [
      "Mendesain antarmuka grafis, tata letak visual, atau melukis/menggambar.",
      "Menciptakan komposisi musik atau bermain instrumen alat musik.",
      "Menulis cerita fiksi, puisi, naskah drama, atau artikel kreatif.",
      "Mengekspresikan diri melalui seni pertunjukan (teater, fotografi, sinematografi).",
      "Merancang arsitektur ruang, dekorasi, atau karya estetika lainnya.",
    ],
  },
  {
    code: "S",
    items: [
      "Mengajar, melatih, atau menjelaskan materi pelajaran kepada teman.",
      "Mendengarkan keluh kesah dan memberikan saran (konseling) kepada orang lain.",
      "Menjadi sukarelawan dalam kegiatan sosial atau pelayanan masyarakat.",
      "Berkolaborasi di dalam tim untuk menyelesaikan konflik interpersonal.",
      "Merawat atau membantu orang lain yang sedang mengalami kesulitan.",
    ],
  },
  {
    code: "E",
    items: [
      "Memimpin sebuah tim, kepanitiaan acara, atau organisasi di sekolah.",
      "Merintis usaha (bisnis), berjualan, atau mengelola proyek kewirausahaan.",
      "Berdebat secara terstruktur, bernegosiasi, atau meyakinkan orang lain.",
      "Mempresentasikan gagasan, produk, atau proyek di depan khalayak umum.",
      "Mengambil keputusan strategis dan terukur untuk mencapai target organisasi.",
    ],
  },
  {
    code: "C",
    items: [
      "Menyusun dokumen, arsip, atau laporan secara rapi dan sistematis.",
      "Mengelola pencatatan keuangan atau menyusun anggaran pengeluaran.",
      "Mengolah angka dan basis data menggunakan tabel spreadsheet (seperti Excel).",
      "Mematuhi instruksi, prosedur kerja, dan standar operasional yang baku.",
      "Membuat jadwal kegiatan dan matriks perencanaan yang sangat terperinci.",
    ],
  },
];

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
  legend.textContent =
    "Bagian II: Daftar Pernyataan Minat Aktivitas (30 Butir)";
  fieldset.appendChild(legend);

  const labels = ["1 (STS)", "2 (TS)", "3 (N)", "4 (S)", "5 (SS)"];

  flatQuestions.forEach((qObj, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-item";

    const p = document.createElement("p");
    p.className = "question-text";
    p.textContent = `${index + 1}. ${qObj.text}`;
    wrapper.appendChild(p);

    const scaleDiv = document.createElement("div");
    scaleDiv.className = "likert-scale";

    for (let val = 1; val <= 5; val++) {
      const label = document.createElement("label");
      label.className = "likert-option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = qObj.qId;
      radio.value = val;
      radio.required = true;

      const span = document.createElement("span");
      span.textContent = labels[val - 1];

      label.appendChild(radio);
      label.appendChild(span);
      scaleDiv.appendChild(label);
    }

    wrapper.appendChild(scaleDiv);
    fieldset.appendChild(wrapper);
  });

  fragment.appendChild(fieldset);
  container.appendChild(fragment);
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
  // Sembunyikan form dan petunjuk awal
  document.getElementById("riasecForm").classList.add("hidden");
  document.getElementById("instructionsSection").classList.add("hidden");

  const resultView = document.getElementById("resultView");
  document.getElementById("studentIdentityText").textContent =
    `NISN: ${nisn} | Kelas Terverifikasi: ${verifiedKelas}`;

  // Tampilkan Kode Tiga Huruf (Holland Triad)
  document.getElementById("triadCodeDisplay").textContent =
    `${top3.rank1} - ${top3.rank2} - ${top3.rank3}`;
  document.getElementById("triadNamesDisplay").textContent =
    `${RIASEC_INSIGHTS[top3.rank1].name.split(" ")[0]} • ` +
    `${RIASEC_INSIGHTS[top3.rank2].name.split(" ")[0]} • ` +
    `${RIASEC_INSIGHTS[top3.rank3].name.split(" ")[0]}`;

  // Render Grafik Batang Skor Keenam Dimensi (Diurutkan dari tertinggi ke terendah)
  const barsContainer = document.getElementById("scoreBarsContainer");
  barsContainer.innerHTML = "";
  const maxPossibleScore = 25; // 5 soal x skala maksimal 5

  sortedList.forEach(([code, score]) => {
    const percentage = Math.round((score / maxPossibleScore) * 100);
    const row = document.createElement("div");
    row.className = "score-bar-row";

    const labelDiv = document.createElement("div");
    labelDiv.className = "score-bar-label";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = `${code} — ${RIASEC_INSIGHTS[code].name}`;

    const valSpan = document.createElement("span");
    valSpan.textContent = `${score} / 25 (${percentage}%)`;

    labelDiv.appendChild(nameSpan);
    labelDiv.appendChild(valSpan);

    const trackDiv = document.createElement("div");
    trackDiv.className = "score-bar-track";

    const fillDiv = document.createElement("div");
    fillDiv.className = "score-bar-fill";
    fillDiv.style.width = `${percentage}%`;

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

    const header = document.createElement("div");
    header.className = "insight-card-header";

    const title = document.createElement("span");
    title.className = "insight-title";
    title.textContent = `${code}: ${info.name} (${score}/25 — ${percentage}%)`;

    const badge = document.createElement("span");
    badge.className = "insight-rank-badge";
    badge.textContent = rankLabels[idx];

    header.appendChild(title);
    header.appendChild(badge);

    const desc = document.createElement("p");
    desc.className = "insight-desc";
    desc.textContent = info.description;

    const majors = document.createElement("div");
    majors.className = "insight-majors";
    const strong = document.createElement("strong");
    strong.textContent = "Rekomendasi Rumpun Program Studi: ";
    const majorsText = document.createTextNode(info.majors);
    majors.appendChild(strong);
    majors.appendChild(majorsText);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(majors);
    insightsContainer.appendChild(card);
  });

  // Munculkan kontainer hasil dan gulir layar ke atas
  resultView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  const form = document.getElementById("riasecForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusMsg = document.getElementById("statusMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMsg.className = "status-msg";
    statusMsg.textContent = "";

    if (!form.checkValidity()) {
      statusMsg.classList.add("status-error");
      statusMsg.textContent =
        "Harap lengkapi NISN, Portofolio, dan seluruh 30 butir pernyataan sebelum mengirim.";
      form.reportValidity();
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Memverifikasi NISN & Memproses Data...";

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
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim & Lihat Hasil Analisis Minat";
    }
  });
});
