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
  const [showDetail, setShowDetail] = useState(false);

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
        <h1 className="text-2xl font-bold mb-2 text-blue-700">Apa itu Individual Development Plan (IDP)?</h1>
        <p className="mb-3">IDP (Individual Development Plan) adalah peta tindakan singkat yang membantu Anda naik level dalam karier: tetapkan tujuan, fokus pada kekuatan yang bisa ditingkatkan, dan ubah rencana jadi aksi nyata (pelatihan, sertifikasi, mentoring). <strong>Buat rencana kecil hari ini — hasil besar menanti.</strong></p>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-1 bg-white rounded-full text-sm">🎯 Tujuan</span>
          <span className="px-2 py-1 bg-white rounded-full text-sm">📚 Pelatihan</span>
          <span className="px-2 py-1 bg-white rounded-full text-sm">🤝 Mentoring</span>
          <span className="px-2 py-1 bg-white rounded-full text-sm">📈 Evaluasi</span>
        </div>
        <ol className="list-decimal ml-6 mb-3">
          <li>Menetapkan tujuan profesional yang jelas</li>
          <li>Mengidentifikasi kekuatan dan area pengembangan</li>
          <li>Merencanakan langkah terukur (pelatihan, praktek, mentoring)</li>
          <li>Melaksanakan dan mengevaluasi secara berkala</li>
        </ol>
        <p className="mb-0">Manfaat: arah karier lebih jelas, pengembangan kompetensi terstruktur, dan bukti progres untuk pengajuan jenjang karier atau dukungan institusional.</p>
        <div className="mt-4 text-right">
          <button onClick={() => setShowDetail(true)} className="text-sm text-blue-600 hover:underline">Pelajari lebih lanjut</button>
        </div>
      </div>

      {/* Detail modal for IDP explanation */}
      {showDetail && (
        <div onClick={() => setShowDetail(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative max-h-[80vh] overflow-auto">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setShowDetail(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-3 text-blue-700">Apa itu Individual Development Plan (IDP)?</h2>
            <p className="mb-2">Individual Development Plan (IDP) adalah dokumen strategis berupa rencana tindakan yang dirancang untuk mengembangkan pengetahuan, keterampilan, dan kompetensi profesional seseorang guna mencapai tujuan karier jangka pendek maupun jangka panjang. IDP umumnya terdiri atas satu hingga dua halaman dan mencakup evaluasi posisi profesional saat ini, identifikasi kekuatan dan kelemahan, serta langkah-langkah konkret untuk peningkatan kapasitas.</p>
            <ol className="list-decimal ml-6 mb-2">
              <li>Menetapkan tujuan profesional yang jelas</li>
              <li>Mengidentifikasi kekuatan dan area pengembangan</li>
              <li>Merumuskan tujuan pengembangan secara spesifik dan terukur</li>
              <li>Mengimplementasikan rencana melalui aktivitas nyata seperti pelatihan atau sertifikasi</li>
              <li>Melakukan evaluasi berkala dan menetapkan tujuan baru seiring pencapaian target awal</li>
            </ol>
            <p className="mb-2">Manfaat IDP mencakup klarifikasi arah karier, peningkatan keterlibatan profesional, identifikasi kesenjangan kompetensi, serta penguatan hubungan mentorship dengan atasan atau pembimbing. Artikel juga menekankan pentingnya realisme dalam penetapan tujuan, pertimbangan terhadap sumber daya yang tersedia (waktu, biaya, akses pelatihan), serta pemanfaatan dukungan institusional seperti program pengembangan karyawan.</p>
            <p className="mb-2">Dua contoh IDP disajikan: (1) rencana jangka panjang untuk meraih gelar magister, dan (2) rencana jangka pendek untuk mengurangi gangguan media sosial demi meningkatkan fokus kerja. Kedua contoh menunjukkan struktur IDP yang terdiri atas tujuan, langkah-langkah operasional, sumber daya, dan indikator keberhasilan.</p>
            <p className="mb-0">Secara keseluruhan, IDP diposisikan sebagai alat reflektif dan proaktif yang mendukung pertumbuhan profesional berkelanjutan, baik bagi individu maupun organisasi.</p>
          </div>
        </div>
      )}


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
