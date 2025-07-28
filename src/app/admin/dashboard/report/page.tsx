"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SCORE_COLUMNS = [
  { key: "learning_score", label: "Learning" },
  { key: "branding_score", label: "Branding" },
  { key: "bigger_score", label: "BIGGER" },
  { key: "networking_score", label: "Networking" },
  { key: "inovasi_score", label: "Inovasi" },
  { key: "smarter_score", label: "SMARTER" },
  { key: "better_score", label: "BETTER" },
];

const ALL_COLUMNS = [
  ...SCORE_COLUMNS,
  { key: "serapan", label: "Serapan Anggaran (%)" }
];

function SortIcon({ direction }: { direction: "asc" | "desc" | null }) {
  if (!direction) return null;
  return direction === "asc" ? (
    <span className="ml-1 text-xs">▲</span>
  ) : (
    <span className="ml-1 text-xs">▼</span>
  );
}

function InfoButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button type="button" className="ml-2 align-middle" onClick={onClick} aria-label="Info">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="2" fill="#fff" />
        <path d="M10 7.5a1 1 0 110-2 1 1 0 010 2zm-1 2.5a1 1 0 012 0v5a1 1 0 11-2 0v-5z" fill="#2563eb" />
      </svg>
    </button>
  );
}

function InfoPopupGlobal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Penjelasan Indikator & Formula Makarti</h2>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-xs border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">DIMENSI MAKARTI</th>
                <th className="border px-2 py-1">INDIKATOR & BOBOT</th>
                <th className="border px-2 py-1">FORMULA PENGHITUNGAN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>INOVASI</td>
                <td className="border px-2 py-1">KINERJA INOVASI (50%)</td>
                <td className="border px-2 py-1">Rata-rata kinerja inovasi: Ide (40%), Perencanaan (60%), Uji Coba (80%), Implementasi (100%)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">PRODUK KAJIAN (50%)</td>
                <td className="border px-2 py-1">Rata-rata progres kajian: Draft (40%), Revisi (60%), Review (80%), Selesai (100%)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>LEARNING</td>
              <td className="border px-2 py-1">PELATIHAN PEGAWAI INTERNAL (50%)</td>
              <td className="border px-2 py-1">Persentase pegawai yang telah mengikuti Pengembangan Kompetensi ASN minimal 20 JP</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">PENYELENGGARAAN BANGKOM UNIT (50%)</td>
                <td className="border px-2 py-1">Total peserta dari daftar kehadiran dibagi 5000 x 100%</td>
              </tr>
              <tr><td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>BRANDING</td>
              <td className="border px-2 py-1">ENGAGEMENT (50%)</td>
              <td className="border px-2 py-1">(Jumlah Likes / Jumlah Views) x 100% dibagi 0.06 x 100%</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">JUMLAH PUBLIKASI (50%)</td>
                <td className="border px-2 py-1">Jumlah publikasi unit kerja dibagi 60 x 100%</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>NETWORKING</td>
              <td className="border px-2 py-1">KERJASAMA (80%)</td>
              <td className="border px-2 py-1">Persentase kerjasama dengan status MoU Ditandatangani atau Selesai</td>
              </tr>
              <tr><td className="border px-2 py-1">KOORDINASI (20%)</td>
              <td className="border px-2 py-1">Persentase koordinasi dengan status SELESAI</td>
              </tr>
            </tbody>
          </table>
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">PILAR MAKARTI</th>
                <th className="border px-2 py-1">DIMENSI & BOBOT</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>BIGGER</td><td className="border px-2 py-1">BRANDING (50%)</td></tr>
              <tr><td className="border px-2 py-1">NETWORKING (50%)</td></tr>
              <tr><td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>SMARTER</td><td className="border px-2 py-1">LEARNING (50%)</td></tr>
              <tr><td className="border px-2 py-1">INOVASI (50%)</td></tr>
              <tr><td className="border px-2 py-1 font-semibold align-top" rowSpan={4}>BETTER</td><td className="border px-2 py-1">BRANDING (25%)</td></tr>
              <tr><td className="border px-2 py-1">NETWORKING (25%)</td></tr>
              <tr><td className="border px-2 py-1">LEARNING (25%)</td></tr>
              <tr><td className="border px-2 py-1">INOVASI (25%)</td></tr>
            </tbody>
          </table>
        </div>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-600 text-sm" onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
}

// Fungsi untuk menentukan ranking pada setiap kolom
interface UnitKerjaData {
  name?: string;
  unit_kerja_id: number;
  parent_id?: number;
  scores?: { [key: string]: number };
}

function getRankings(data: UnitKerjaData[], colKey: string) {
  // Ambil nilai dan urutkan descending
  const values = data.map((item, idx) => ({ idx, value: item.scores?.[colKey] ?? 0 }));
  // Urutkan dan simpan urutan index
  const sorted = [...values].sort((a, b) => b.value - a.value);
  // Ranking: index -> urutan
  const ranks: number[] = Array(data.length).fill(0);
  sorted.forEach((item, i) => {
    ranks[item.idx] = i + 1;
  });
  return ranks;
}

export default function ReportRekapPage() {
  const [data, setData] = useState<UnitKerjaData[]>([]);
  const [serapan, setSerapan] = useState<
    { unit_kerja_id: number; detail_per_bulan: { bulan: string; capaian_realisasi_kumulatif: number }[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("better_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/scores/rekap").then((res) => res.json()),
      fetch("/api/serapan").then((res) => res.json()),
    ])
      .then(([rekap, serapanData]) => {
        if (rekap.level_3 && Array.isArray(rekap.level_3)) {
          // Pastikan parent_id ikut diambil
          setData(rekap.level_3.map((d: UnitKerjaData) => ({ ...d, parent_id: d.parent_id })));
        } else {
          setError("Format data rekap tidak sesuai.");
        }
        if (Array.isArray(serapanData)) {
          setSerapan(serapanData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data.");
        setLoading(false);
      });
  }, []);

  // Filter by search
  const filtered = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    if (sortKey === "unit_kerja") {
      aVal = a.parent_id ?? -Infinity;
      bVal = b.parent_id ?? -Infinity;
      if (aVal === bVal) return 0;
      if (sortDir === "asc") return aVal - bVal;
      return bVal - aVal;
    }
    if (sortKey === "serapan") {
      aVal = getSerapanPersenById(a.unit_kerja_id) ?? -Infinity;
      bVal = getSerapanPersenById(b.unit_kerja_id) ?? -Infinity;
    } else {
      aVal = a.scores?.[sortKey] ?? -Infinity;
      bVal = b.scores?.[sortKey] ?? -Infinity;
    }
    if (aVal === bVal) return 0;
    if (sortDir === "asc") return aVal - bVal;
    return bVal - aVal;
  });

  // Handle sort click
  function handleSort(col: string) {
    if (sortKey === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(col);
      setSortDir("desc");
    }
  }

  // Fungsi cari serapan berdasarkan unit_kerja_id
  function getSerapanPersenById(unit_kerja_id: number) {
    const found = serapan.find((s: { unit_kerja_id: number; detail_per_bulan: { bulan: string; capaian_realisasi_kumulatif: number }[] }) => s.unit_kerja_id === unit_kerja_id);
    if (found && Array.isArray(found.detail_per_bulan) && found.detail_per_bulan.length > 0) {
      const bulanOrder = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const sortedBulan = [...found.detail_per_bulan].sort((a, b) => {
        return bulanOrder.indexOf(a.bulan) - bulanOrder.indexOf(b.bulan);
      });
      const lastMonth = sortedBulan[sortedBulan.length - 1];
      return lastMonth.capaian_realisasi_kumulatif;
    }
    return null;
  }

  // Untuk menutup popup info jika klik di luar
  useEffect(() => {
    function handleClick() {
      setInfoOpen(false);
    }
    if (infoOpen) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [infoOpen]);

  // Fungsi untuk mendapatkan nilai serapan untuk ranking
  function getSerapanValue(item: UnitKerjaData) {
    const val = getSerapanPersenById(item.unit_kerja_id);
    return typeof val === "number" ? val : 0;
  }

  // Hitung ranking untuk setiap kolom (termasuk serapan)
  const rankingsByCol: { [key: string]: number[] } = {};
  ALL_COLUMNS.forEach(col => {
    if (col.key === "serapan") {
      const values = sorted.map((item, idx) => ({ idx, value: getSerapanValue(item) }));
      const sortedVals = [...values].sort((a, b) => b.value - a.value);
      const ranks: number[] = Array(sorted.length).fill(0);
      sortedVals.forEach((item, i) => {
        ranks[item.idx] = i + 1;
      });
      rankingsByCol[col.key] = ranks;
    } else {
      rankingsByCol[col.key] = getRankings(sorted, col.key);
    }
  });

  // Helper untuk style kolom
  function getColClass(key: string, isHeader = false) {
    if (key === "bigger_score" || key === "smarter_score") {
      return isHeader ? "bg-gray-50" : "bg-gray-50";
    }
    if (key === "better_score" || key === "serapan") {
      return isHeader ? "bg-blue-50" : "bg-blue-50";
    }
    return "";
  }

  function handleExportPDF() {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Rekapitulasi Capaian Makarti Unit Kerja", 14, 16);
    const head = [
      ["Unit Kerja", ...ALL_COLUMNS.map((col) => col.label)]
    ];
    const body = sorted.map((item) => {
      return [
        item.name,
        ...ALL_COLUMNS.map((col) => {
          if (col.key === "serapan") {
            const val = getSerapanPersenById(item.unit_kerja_id);
            return val !== null && val !== undefined ? val + "%" : "-";
          } else {
            const val = item.scores?.[col.key] ?? "-";
            return val !== "-" ? val : "-";
          }
        })
      ];
    });
    autoTable(doc, {
      head,
      body,
      startY: 22,
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 60,
      },
      columnStyles: {
        3: { fillColor: [240, 240, 240] }, // BIGGER
        5: { fillColor: [240, 240, 240] }, // SMARTER
        6: { fillColor: [219, 234, 254] }, // BETTER
        7: { fillColor: [219, 234, 254] }, // Serapan
      },
    });
    doc.save("Rekap_Makarti_Unit_Kerja.pdf");
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 overflow-x-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rekapitulasi Capaian Makarti Unit Kerja</h1>
        <InfoButton onClick={(e) => { e.stopPropagation(); setInfoOpen(true); }} />
        <button
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm"
          onClick={handleExportPDF}
        >
          Download Report
        </button>
      </div>
      <InfoPopupGlobal show={infoOpen} onClose={() => setInfoOpen(false)} />
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <input
          type="text"
          placeholder="Cari unit kerja..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-64 text-sm"
        />
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none relative"
                onClick={() => handleSort("unit_kerja")}
              >
                <div className="flex flex-col items-start">
                  <span>Unit Kerja</span>
                </div>
                <SortIcon direction={sortKey === "unit_kerja" ? sortDir : null} />
              </th>
              {ALL_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-center font-semibold text-gray-700 cursor-pointer select-none relative ${getColClass(col.key, true)}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex flex-col items-center">
                    <span>{col.label}</span>
                  </div>
                  <SortIcon direction={sortKey === col.key ? sortDir : null} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={ALL_COLUMNS.length + 1} className="text-center py-8 text-gray-500">Tidak ada data unit kerja level 3.</td>
              </tr>
            ) : (
              sorted.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                  {ALL_COLUMNS.map((col) => {
                    let val, rank, badge = null, numClass = "";
                    const cellClass = getColClass(col.key);
                    if (col.key === "serapan") {
                      val = getSerapanPersenById(item.unit_kerja_id);
                      rank = rankingsByCol[col.key][idx];
                      if (val === 0 || val === null || val === undefined) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">⚠️</span>;
                        numClass = "text-red-600 font-bold";
                      } else if (rank === 1) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">🥇</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank === 2) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold">🥈</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank === 3) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold">🥉</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank > sorted.length - 2 || rank === sorted.length) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">⚠️</span>;
                        numClass = "text-red-600 font-bold";
                      }
                      return (
                        <td key={col.key} className={`px-6 py-4 text-center ${cellClass}`}>
                          {badge}
                          <span className={numClass}>{val !== null && val !== undefined ? `${val}%` : '-'}</span>
                        </td>
                      );
                    } else {
                      val = item.scores?.[col.key] ?? '-';
                      rank = rankingsByCol[col.key][idx];
                      if (val === 0 || val === "-") {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">⚠️</span>;
                        numClass = "text-red-600 font-bold";
                      } else if (rank === 1) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">🥇</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank === 2) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold">🥈</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank === 3) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold">🥉</span>;
                        numClass = "text-green-600 font-bold";
                      } else if (rank > sorted.length - 2 || rank === sorted.length) {
                        badge = <span className="mr-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">⚠️</span>;
                        numClass = "text-red-600 font-bold";
                      }
                      return (
                        <td key={col.key} className={`px-6 py-4 text-center ${cellClass}`}>
                          {badge}
                          <span className={numClass}>{val !== '-' ? val : '-'}</span>
                        </td>
                      );
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
