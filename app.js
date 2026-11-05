/**
 * @fileoverview Modul Klien untuk Rendering Instrumen, Kalkulasi Vektor RIASEC, dan Transmisi REST
 * @complexity Time: O(N) untuk rendering & agregasi (N = 30 butir soal) | Space: O(N) untuk struktur DOM
 */

// GANTI URL DI BAWAH INI DENGAN WEB APP URL GOOGLE APPS SCRIPT ANDA
const GAS_ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbyP0AMUd_lYx9X-Jis7UopfJM7uDpZiB6DxQs7hYqsBcuCDfBLxH56zj_ob7kt2xJPXKA/exec";

// Struktur Data Taksonomi 30 Butir Instrumen RIASEC
const RIASEC_BANK = [
  {
    code: "R",
    title: "Dimensi Realistic (Praktis & Teknis)",
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
    title: "Dimensi Investigative (Analitis & Saintifik)",
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
    title: "Dimensi Artistic (Kreatif & Estetis)",
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
    title: "Dimensi Social (Empatis & Edukatif)",
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
    title: "Dimensi Enterprising (Manajerial & Persuasif)",
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
    title: "Dimensi Conventional (Terstruktur & Administratif)",
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
 * Merender 30 butir soal secara dinamis ke dalam DOM.
 * Kompleksitas Waktu: O(N) di mana N adalah total butir pernyataan (30).
 */
function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  const fragment = document.createDocumentFragment();
  let globalIndex = 1;

  RIASEC_BANK.forEach((dimension, sectionIdx) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "card";

    const legend = document.createElement("legend");
    legend.textContent = `Bagian ${sectionIdx + 2}: ${dimension.title}`;
    fieldset.appendChild(legend);

    dimension.items.forEach((itemText, itemIdx) => {
      const qId = `q_${dimension.code}_${itemIdx}`;
      const wrapper = document.createElement("div");
      wrapper.className = "question-item";

      const p = document.createElement("p");
      p.className = "question-text";
      p.textContent = `${globalIndex}. ${itemText}`;
      wrapper.appendChild(p);

      const scaleDiv = document.createElement("div");
      scaleDiv.className = "likert-scale";

      const labels = ["1 (STS)", "2 (TS)", "3 (N)", "4 (S)", "5 (SS)"];
      for (let val = 1; val <= 5; val++) {
        const label = document.createElement("label");
        label.className = "likert-option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = qId;
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
      globalIndex++;
    });

    fragment.appendChild(fieldset);
  });

  container.appendChild(fragment);
}

/**
 * Mengeksekusi agregasi vektor skor dan fungsi argmax untuk mencari tipe kepribadian dominan.
 * Kompleksitas Waktu: O(N + D) -> O(N) karena jumlah dimensi D=6 adalah konstan.
 * Kompleksitas Ruang: O(D) -> O(1) karena hanya menyimpan 6 kunci objek skor.
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

  // Pencarian nilai maksimum (Argmax)
  let dominantTrait = "R";
  let maxScore = -1;

  for (const [trait, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantTrait = trait;
    }
  }

  return { scores, dominantTrait };
}

/**
 * Event Listener untuk pengiriman formulir via Fetch API.
 */
document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  const form = document.getElementById("riasecForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusMsg = document.getElementById("statusMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusMsg.className = "status-msg";
    statusMsg.textContent = "";

    // Validasi kelengkapan HTML5
    if (!form.checkValidity()) {
      statusMsg.classList.add("status-error");
      statusMsg.textContent =
        "Harap lengkapi seluruh identitas dan ke-30 butir pernyataan sebelum mengirim.";
      form.reportValidity();
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Memproses & Mengirim Data...";

      const formData = new FormData(form);
      const { scores, dominantTrait } = computeRIASECProfile(formData);

      const payload = {
        nisn: formData.get("nisn").trim(),
        kelas: formData.get("kelas"),
        portofolio: formData.get("portofolio"),
        scores: scores,
        dominantTrait: dominantTrait,
      };

      // Mengirim HTTP POST menggunakan Content-Type text/plain guna menghindari CORS Preflight
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
        statusMsg.classList.add("status-success");
        statusMsg.textContent = `Berhasil! Profil dominan Anda (${dominantTrait}) telah terekam.`;
        form.reset();
      } else {
        throw new Error(result.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      statusMsg.classList.add("status-error");
      statusMsg.textContent = `Kesalahan: ${err.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Respons Asesmen";
    }
  });
});
