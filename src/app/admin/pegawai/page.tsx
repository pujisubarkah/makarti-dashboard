"use client";

import React, { useState, useEffect } from "react";
import { Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#f472b6", "#22d3ee"];

function getGenerasi(tglLahir: string): string {
  const tahun = parseInt(tglLahir.slice(0, 4));
  if (tahun <= 1964) return "Baby Boomer";
  if (tahun <= 1980) return "X";
  if (tahun <= 1996) return "Y";
  if (tahun <= 2012) return "Z";
  return "Alpha";
}

type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string;
  eselon?: string;
  users_pegawai_unit_kerja_idTousers?: { unit_kerja?: string };
};

const PegawaiPage: React.FC = () => {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    fetch("/api/employee")
      .then((res) => res.json())
      .then((data: Pegawai[]) => setPegawaiList(data));
  }, []);

  const unitOptions = Array.from(new Set(pegawaiList.map((p) => p.users_pegawai_unit_kerja_idTousers?.unit_kerja).filter(Boolean)));
  const filteredPegawai = unitFilter
    ? pegawaiList.filter((pegawai) => pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja === unitFilter)
    : pegawaiList;

  const golonganData = Array.from(
    filteredPegawai.reduce((map: Map<string, number>, pegawai: Pegawai) => {
      const golongan = pegawai.golongan;
      if (golongan) {
        map.set(golongan, (map.get(golongan) || 0) + 1);
      }
      return map;
    }, new Map<string, number>()),
    ([golongan, jumlah]) => ({ golongan, jumlah })
  );

        // Grafik batang generasi (selalu tampilkan semua generasi)
        const generasiList = ["Baby Boomer", "X", "Y", "Z", "Alpha"];
        const generasiMap = new Map<string, number>();
        filteredPegawai.forEach((pegawai: Pegawai) => {
          // Asumsi nip format: tahun lahir 8 digit pertama, misal: 19680705...
          const tglLahir = pegawai.nip ? pegawai.nip.slice(0, 4) + "-01-01" : "";
          const generasi = getGenerasi(tglLahir);
          generasiMap.set(generasi, (generasiMap.get(generasi) || 0) + 1);
        });
        const generasiData = generasiList.map((generasi) => ({ generasi, jumlah: generasiMap.get(generasi) || 0 }));

  // Statistik berdasarkan eselon
  const totalPegawai = filteredPegawai.length;
  const jumlahJPTM = filteredPegawai.filter(p => p.eselon === 'JPTM').length;
  const jumlahJPTP = filteredPegawai.filter(p => p.eselon === 'JPTP').length;
  const jumlahJA = filteredPegawai.filter(p => p.eselon && p.eselon.includes('JA')).length;
  const jumlahJF = filteredPegawai.filter(p => p.eselon === 'JF').length;
  const jumlahJPEL = filteredPegawai.filter(p => p.eselon === 'JPEL').length;

  // Modal logic removed (not used)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Daftar Pegawai</h2>
      
      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pegawai</p>
              <p className="text-3xl font-bold">{totalPegawai}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pejabat Tinggi Madya (JPTM)</p>
              <p className="text-3xl font-bold">{jumlahJPTM}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Pejabat Tinggi Pratama (JPTP)</p>
              <p className="text-3xl font-bold">{jumlahJPTP}</p>
            </div>
            <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Jabatan Administrator (JA)</p>
              <p className="text-3xl font-bold">{jumlahJA}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Jabatan Fungsional (JF)</p>
              <p className="text-3xl font-bold">{jumlahJF}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Jabatan Pelaksana (JPEL)</p>
              <p className="text-3xl font-bold">{jumlahJPEL}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-8 items-start">
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Pegawai Berdasarkan Golongan</h3>
          <div className="bg-white border rounded shadow mb-6 p-4" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={golonganData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="golongan" label={{ value: "Golongan", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Jumlah", angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#3b82f6" name="Jumlah Pegawai">
                  {golonganData.map((entry, idx) => (
                    <Cell key={`bar-cell-gol-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Grafik Pegawai Berdasarkan Generasi</h3>
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
              <td className="py-2 px-4 border">
                <a
                  href={`/admin/pegawai/${pegawai.id}`}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                  {pegawai.nama}
                </a>
              </td>
              <td className="py-2 px-4 border">{pegawai.jabatan}</td>
              <td className="py-2 px-4 border">{pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja}</td>
              <td className="py-2 px-4 border">{pegawai.golongan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PegawaiPage;
