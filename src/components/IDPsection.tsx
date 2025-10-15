import React, { useState } from "react";
import IdpFormWizard from "@/components/IdpFormWizard";

export default function IDPSection() {
  const [showModal, setShowModal] = useState(false);
  type FormType = {
    nama: string;
    kompetensi: string;
    metode: string;
    penyelenggara: string;
  };
  const [rencana] = useState<null | FormType>(null);

  return (
    <div>

      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Buat IDP Baru
        </button>
      </div>

      <div className="mb-8 p-6 bg-blue-50 rounded-xl shadow text-base text-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-blue-700">
          Apa itu Individual Development Plan (IDP)?
        </h1>
        <p className="mb-2">
          Individual Development Plan (IDP) adalah dokumen strategis berupa rencana tindakan yang dirancang untuk mengembangkan pengetahuan, keterampilan, dan kompetensi profesional seseorang guna mencapai tujuan karier jangka pendek maupun jangka panjang. IDP umumnya terdiri atas satu hingga dua halaman dan mencakup evaluasi posisi profesional saat ini, identifikasi kekuatan dan kelemahan, serta langkah-langkah konkret untuk peningkatan kapasitas.
        </p>
        <ol className="list-decimal ml-6 mb-2">
          <li>Menetapkan tujuan profesional yang jelas</li>
          <li>Mengidentifikasi kekuatan dan area pengembangan</li>
          <li>Merumuskan tujuan pengembangan secara spesifik dan terukur</li>
          <li>Mengimplementasikan rencana melalui aktivitas nyata seperti pelatihan atau sertifikasi</li>
          <li>Melakukan evaluasi berkala dan menetapkan tujuan baru seiring pencapaian target awal</li>
        </ol>
        <p className="mb-2">
          Manfaat IDP mencakup klarifikasi arah karier, peningkatan keterlibatan profesional, identifikasi kesenjangan kompetensi, serta penguatan hubungan mentorship dengan atasan atau pembimbing. Artikel juga menekankan pentingnya realisme dalam penetapan tujuan, pertimbangan terhadap sumber daya yang tersedia (waktu, biaya, akses pelatihan), serta pemanfaatan dukungan institusional seperti program pengembangan karyawan.
        </p>
        <p className="mb-2">
          Dua contoh IDP disajikan: (1) rencana jangka panjang untuk meraih gelar magister, dan (2) rencana jangka pendek untuk mengurangi gangguan media sosial demi meningkatkan fokus kerja. Kedua contoh menunjukkan struktur IDP yang terdiri atas tujuan, langkah-langkah operasional, sumber daya, dan indikator keberhasilan.
        </p>
        <p className="mb-0">
          Secara keseluruhan, IDP diposisikan sebagai alat reflektif dan proaktif yang mendukung pertumbuhan profesional berkelanjutan, baik bagi individu maupun organisasi.
        </p>
      </div>


      {/* Modal Form IDP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <IdpFormWizard />
          </div>
        </div>
      )}

      {/* Rencana hasil submit */}
      {rencana && (
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-2 text-blue-700">
            Rencana Pengembangan Individu
          </h2>
          <div className="bg-blue-100 rounded-lg p-4">
            <strong>{rencana.nama}</strong> akan mengembangkan <strong>{rencana.kompetensi}</strong> melalui <strong>{rencana.metode}</strong> yang diselenggarakan oleh <strong>{rencana.penyelenggara}</strong>.
          </div>
        </section>
      )}
    </div>
  );
}
