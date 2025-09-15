"use client";
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// Dummy data prediksi pensiun
const tahunPensiun = [2026, 2027, 2028, 2029, 2030];
const prediksiPensiun = [
  { nama: "Budi Santoso", tahun: 2026 },
  { nama: "Andi Wijaya", tahun: 2026 },
  { nama: "Siti Aminah", tahun: 2027 },
  { nama: "Joko Widodo", tahun: 2028 },
  { nama: "Rina Dewi", tahun: 2028 },
  { nama: "Agus Salim", tahun: 2029 },
  { nama: "Dewi Lestari", tahun: 2030 },
  { nama: "Fajar Pratama", tahun: 2030 },
];

const tahunNaikPangkat = [2026, 2027, 2028];
const prediksiNaikPangkat = [
  { nama: "Budi Santoso", tahun: 2026 },
  { nama: "Joko Widodo", tahun: 2027 },
  { nama: "Rina Dewi", tahun: 2027 },
  { nama: "Siti Aminah", tahun: 2028 },
];

function getJumlahPerTahun(
  data: { nama: string; tahun: number }[],
  tahunList: number[]
): { tahun: number; jumlah: number; pegawai: string[] }[] {
  return tahunList.map((tahun: number) => ({
    tahun,
    jumlah: data.filter((d: { tahun: number }) => d.tahun === tahun).length,
    pegawai: data.filter((d: { tahun: number; nama: string }) => d.tahun === tahun).map((d) => d.nama),
  }));
}

export default function PrediksiPegawaiPage() {
  const [showDetail, setShowDetail] = useState<{ type: string; tahun: number | null }>({ type: "", tahun: null });
  const jumlahPensiun = getJumlahPerTahun(prediksiPensiun, tahunPensiun);
  const jumlahNaikPangkat = getJumlahPerTahun(prediksiNaikPangkat, tahunNaikPangkat);

  // Data grafik pensiun untuk recharts
  const dataGrafikPensiun = jumlahPensiun.map((row) => ({ tahun: row.tahun.toString(), jumlah: row.jumlah }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Prediksi Pegawai</h2>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Prediksi Pegawai Pensiun (dalam pengembangan)</h3>
        <div className="bg-white border rounded shadow mb-6 p-4" style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataGrafikPensiun}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" label={{ value: "Tahun", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Jumlah", angle: -90, position: "insideLeft" }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="jumlah" stroke="#3b82f6" name="Jumlah Pegawai Pensiun" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Prediksi Pegawai Pensiun</h3>
        <table className="min-w-full bg-white border rounded shadow mb-4">
          <thead>
            <tr className="bg-blue-100 text-blue-700">
              {tahunPensiun.map((tahun) => (
                <th key={tahun} className="py-2 px-4 border text-center">{tahun}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {jumlahPensiun.map((row) => (
                <td key={row.tahun} className="py-2 px-4 border text-center">
                  <button
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={() => setShowDetail({ type: "pensiun", tahun: row.tahun })}
                  >
                    {row.jumlah}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Prediksi Pegawai Naik Pangkat</h3>
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-green-100 text-green-700">
              {tahunNaikPangkat.map((tahun) => (
                <th key={tahun} className="py-2 px-4 border text-center">{tahun}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {jumlahNaikPangkat.map((row) => (
                <td key={row.tahun} className="py-2 px-4 border text-center">
                  <button
                    className="text-green-600 underline hover:text-green-800"
                    onClick={() => setShowDetail({ type: "naik", tahun: row.tahun })}
                  >
                    {row.jumlah}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Modal detail pegawai */}
      {showDetail.tahun && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <h4 className="text-lg font-bold mb-2">
              {showDetail.type === "pensiun" ? "Daftar Pegawai Pensiun" : "Daftar Pegawai Naik Pangkat"} {showDetail.tahun}
            </h4>
            <ul className="mb-4">
              {(showDetail.type === "pensiun"
                ? jumlahPensiun.find((r) => r.tahun === showDetail.tahun)?.pegawai
                : jumlahNaikPangkat.find((r) => r.tahun === showDetail.tahun)?.pegawai
              )?.map((nama, idx) => (
                <li key={idx} className="py-1 border-b last:border-b-0">{nama}</li>
              ))}
            </ul>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowDetail({ type: "", tahun: null })}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
