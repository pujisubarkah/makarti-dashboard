"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#f472b6", "#22d3ee"];

// Define types for pegawai data
interface User {
  unit_kerja?: string;
}

interface Pegawai {
  id: string;
  nama: string;
  jabatan: string;
  golongan: string;
  nip?: string;
  users?: User;
}

interface ChartEntry {
  golongan: string;
  jumlah: number;
}

// interface GenerasiEntry {
//   generasi: string;
//   jumlah: number;
// }

// Fungsi untuk menentukan generasi berdasarkan tahun lahir
function getGenerasi(tglLahir: string): string {
  const tahun = parseInt(tglLahir.slice(0, 4));
  if (tahun <= 1964) return "Baby Boomer";
  if (tahun <= 1980) return "X";
  if (tahun <= 1996) return "Y";
  if (tahun <= 2012) return "Z";
  return "Alpha";
}

export default function DaftarPegawaiPage() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    fetch("/api/employee")
      .then((res) => res.json())
      .then((data) => setPegawaiList(data));
  }, []);

  // Filter unit kerja
  const unitOptions = Array.from(new Set(pegawaiList.map((p) => p.users?.unit_kerja).filter(Boolean)));
  const filteredPegawai = unitFilter
    ? pegawaiList.filter((pegawai) => pegawai.users?.unit_kerja === unitFilter)
    : pegawaiList;

  // Grafik donat golongan
  const golonganData = Array.from(
    filteredPegawai.reduce((map: Map<string, number>, pegawai: Pegawai) => {
      map.set(
        pegawai.golongan,
        (map.get(pegawai.golongan) || 0) + 1
      );
      return map;
    }, new Map()),
    ([golongan, jumlah]) => ({ golongan, jumlah })
  );

  // Grafik batang generasi
  const generasiData = Array.from(
    filteredPegawai.reduce((map: Map<string, number>, pegawai: Pegawai) => {
      // Asumsi nip format: tahun lahir 8 digit pertama, misal: 19680705...
      const tglLahir = pegawai.nip ? pegawai.nip.slice(0, 4) + "-01-01" : "";
      const generasi = getGenerasi(tglLahir);
      map.set(generasi, (map.get(generasi) || 0) + 1);
      return map;
    }, new Map()),
    ([generasi, jumlah]) => ({ generasi, jumlah })
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Daftar Pegawai</h2>
      <div className="mb-8 flex flex-wrap gap-8 items-start">
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Pegawai Berdasarkan Golongan (Donat)</h3>
          <div className="bg-white border rounded shadow mb-6 p-4 flex items-center justify-center" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={golonganData}
                  dataKey="jumlah"
                  nameKey="golongan"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#3b82f6"
                  label={(entry: ChartEntry) => entry.golongan}
                >
                  {golonganData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Pegawai Berdasarkan Generasi (Batang)</h3>
          <div className="bg-white border rounded shadow mb-6 p-4" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={generasiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="generasi" label={{ value: "Generasi", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Jumlah", angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#10b981" name="Jumlah Pegawai">
                  {generasiData.map((entry, idx) => (
                    <Cell key={`bar-cell-gen-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="flex justify-end mb-2">
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm focus:outline-blue-500"
          style={{ minWidth: 200 }}
        >
          <option value="">Semua Unit Kerja</option>
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="py-2 px-4 border">No</th>
            <th className="py-2 px-4 border">Nama</th>
            <th className="py-2 px-4 border">Jabatan</th>
            <th className="py-2 px-4 border">Unit Kerja</th>
            <th className="py-2 px-4 border">Golongan</th>
          </tr>
        </thead>
        <tbody>
          {filteredPegawai.map((pegawai, idx) => (
            <tr key={pegawai.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border text-center">{idx + 1}</td>
              <td className="py-2 px-4 border">{pegawai.nama}</td>
              <td className="py-2 px-4 border">{pegawai.jabatan}</td>
              <td className="py-2 px-4 border">{pegawai.users?.unit_kerja}</td>
              <td className="py-2 px-4 border">{pegawai.golongan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
