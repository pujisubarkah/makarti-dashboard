"use client";
import React, { useEffect, useState } from "react";
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
        <button
          className="absolute top-2 right-2 px-2 py-1 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  tahun_pensiun?: number;
  users?: { unit_kerja?: string };
};

export default function PensiunRekapPage() {
  const [data, setData] = useState<{ rekap: Record<string, number>; pegawai: Pegawai[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employee/pensiun")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Memuat data...</div>;
  if (!data) return <div>Data tidak ditemukan</div>;

  // Format data untuk grafik
  const chartData = Object.entries(data.rekap).map(([tahun, jumlah]) => ({ tahun, jumlah }));

  // Filter pegawai sesuai tahun pensiun yang dipilih
  const detailPegawai = selectedYear
    ? data.pegawai.filter((p) => String(p.tahun_pensiun) === selectedYear)
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Grafik Rekap Pensiun per Tahun</h2>
      <div className="bg-white rounded shadow p-4 mb-8">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tahun" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="jumlah" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-bold mb-4">Tabel Rekap Pensiun per Tahun</h2>
      <table className="w-full mb-8 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Tahun Pensiun</th>
            <th className="p-2 text-left">Jumlah Pegawai</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.rekap).map(([tahun, jumlah]) => (
            <tr key={tahun}>
              <td className="p-2">{tahun}</td>
              <td className="p-2">
                <button
                  className="text-blue-600 underline hover:text-blue-800 font-semibold"
                  onClick={() => setSelectedYear(tahun)}
                >
                  {jumlah}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!selectedYear} onClose={() => setSelectedYear(null)}>
        {selectedYear && (
          <>
            <h2 className="text-lg font-bold mb-4">Detail Pegawai Pensiun Tahun {selectedYear}</h2>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">NIP</th>
                  <th className="p-2 text-left">Jabatan</th>
                  <th className="p-2 text-left">Unit Kerja</th>
                </tr>
              </thead>
              <tbody>
                {detailPegawai.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2">{p.nama}</td>
                    <td className="p-2">{p.nip}</td>
                    <td className="p-2">{p.jabatan}</td>
                    <td className="p-2">{p.users?.unit_kerja || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </div>
  );
}
