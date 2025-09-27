
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#f472b6", "#22d3ee"];

function getGenerasi(tglLahir: string): string {
  const tahun = parseInt(tglLahir.slice(0, 4));
  if (tahun <= 1964) return "Baby Boomer";
  if (tahun <= 1980) return "X";
  if (tahun <= 1996) return "Y";
  if (tahun <= 2012) return "Z";
  return "Alpha";
}

type PegawaiDetail = {
  id: number;
  pegawai_id: number;
  email?: string;
  unit_kerja?: string | null;
  status_kepegawaian?: string | null;
  alamat?: string;
  pendidikan?: string;
  telp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nm_goldar?: string | null;
  peg_cpns_tmt?: string;
  nip?: string;
  photo_url?: string;
  tingkat_pendidikan?: string;
  agama?: string;
};

type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string;
  eselon?: string;
  unit_kerja_id?: number;
  pegawai_detail?: PegawaiDetail[];
  users?: { unit_kerja?: string };
};

const PegawaiUserPage: React.FC = () => {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  // const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    // Ambil unitKerjaId dari localStorage
    const unitKerjaId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    if (unitKerjaId) {
      fetch(`/api/employee/unit/${unitKerjaId}/detail`)
        .then((res) => res.json())
        .then((data) => {
          // Pastikan data selalu array
          if (Array.isArray(data)) {
            setPegawaiList(data);
          } else if (Array.isArray(data.data)) {
            setPegawaiList(data.data);
          } else {
            setPegawaiList([]);
          }
        });
    }
  }, []);

  // const unitOptions = Array.from(new Set(pegawaiList.map((p) => p.users?.unit_kerja).filter(Boolean)));
  const filteredPegawai = pegawaiList;

  // Data untuk piramida penduduk: kelompok umur dan jenis kelamin
  const ageGroups = [
    { label: "<25", min: 0, max: 24 },
    { label: "25-34", min: 25, max: 34 },
    { label: "35-44", min: 35, max: 44 },
    { label: "45-54", min: 45, max: 54 },
    { label: "55-64", min: 55, max: 64 },
    { label: ">=65", min: 65, max: 200 }
  ];
  const pyramidData = ageGroups.map(group => {
    let male = 0, female = 0;
    filteredPegawai.forEach((pegawai: Pegawai) => {
      const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
      if (!detail?.tanggal_lahir) return;
      const birthYear = parseInt(detail.tanggal_lahir.slice(0, 4));
      const age = new Date().getFullYear() - birthYear;
      if (age >= group.min && age <= group.max) {
        if (detail.jenis_kelamin === "L") male++;
        else if (detail.jenis_kelamin === "P") female++;
      }
    });
    // Always return both bars, even if zero, and ensure correct sign
    return { ageGroup: group.label, male: -Math.abs(male), female: Math.abs(female) };
  });


  // Chart Pie agama
  const agamaMap = new Map<string, number>();
  filteredPegawai.forEach((pegawai: Pegawai) => {
    const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
    const agama = detail?.agama || "Tidak diketahui";
    agamaMap.set(agama, (agamaMap.get(agama) || 0) + 1);
  });
  const agamaData = Array.from(agamaMap.entries()).map(([agama, jumlah]) => ({ agama, jumlah }));

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

  // Grafik batang generasi berdasarkan tanggal lahir dari pegawai_detail
  const generasiList = ["Baby Boomer", "X", "Y", "Z", "Alpha"];
  const generasiMap = new Map<string, number>();
  filteredPegawai.forEach((pegawai: Pegawai) => {
    const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
    const tglLahir = detail?.tanggal_lahir ? detail.tanggal_lahir.slice(0, 4) + "-01-01" : "";
    const generasi = getGenerasi(tglLahir);
    generasiMap.set(generasi, (generasiMap.get(generasi) || 0) + 1);
  });
  const generasiData = generasiList.map((generasi) => ({ generasi, jumlah: generasiMap.get(generasi) || 0 }));

  // Grafik pie jenis kelamin
  const genderMap = new Map<string, number>();
  filteredPegawai.forEach((pegawai: Pegawai) => {
    const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
    const gender = detail?.jenis_kelamin === "L" ? "Laki-laki" : detail?.jenis_kelamin === "P" ? "Perempuan" : "Tidak diketahui";
    genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
  });
  const genderData = Array.from(genderMap.entries()).map(([jenis_kelamin, jumlah]) => ({ jenis_kelamin, jumlah }));

  // Hitung jumlah pegawai berdasarkan tingkat pendidikan
  const pendidikanMap = new Map<string, number>();
  filteredPegawai.forEach((pegawai: Pegawai) => {
    const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
    const tingkat = detail?.tingkat_pendidikan || "Tidak diketahui";
    pendidikanMap.set(tingkat, (pendidikanMap.get(tingkat) || 0) + 1);
  });
  const pendidikanData = Array.from(pendidikanMap.entries()).map(([tingkat_pendidikan, jumlah]) => ({ tingkat_pendidikan, jumlah }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Daftar Pegawai</h2>
      <div className="mb-8 flex flex-wrap gap-8 items-start">
        {/* Chart Jenis Kelamin & Kelompok Umur */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Jenis Kelamin & Kelompok Umur</h3>
          <div className="bg-white border rounded shadow mb-6 p-4 flex items-center justify-center" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pyramidData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => Math.abs(v).toString()} />
                <YAxis type="category" dataKey="ageGroup" />
                <Tooltip formatter={(value: number, name: string) => [`${Math.abs(value)} pegawai`, name === "male" ? "Laki-laki" : name === "female" ? "Perempuan" : name]} />
                <Legend formatter={v => v === "male" ? "Laki-laki" : v === "female" ? "Perempuan" : v} />
                <Bar dataKey="male" fill="#3b82f6" name="Laki-laki" />
                <Bar dataKey="female" fill="#f472b6" name="Perempuan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart Golongan */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Golongan</h3>
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
                  label={({ golongan }) => `${golongan}`}
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
        {/* Chart Generasi */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Generasi</h3>
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
        {/* Chart Jenis Kelamin */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Jenis Kelamin</h3>
          <div className="bg-white border rounded shadow mb-6 p-4 flex items-center justify-center" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="jumlah"
                  nameKey="jenis_kelamin"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#ef4444"
                  label={({ jenis_kelamin }) => `${jenis_kelamin}`}
                >
                  {genderData.map((entry, idx) => (
                    <Cell key={`cell-gender-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart Tingkat Pendidikan */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Tingkat Pendidikan</h3>
          <div className="bg-white border rounded shadow mb-6 p-4 flex items-center justify-center" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pendidikanData}
                  dataKey="jumlah"
                  nameKey="tingkat_pendidikan"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#6366f1"
                  label={({ tingkat_pendidikan }) => `${tingkat_pendidikan}`}
                >
                  {pendidikanData.map((entry, idx) => (
                    <Cell key={`cell-pendidikan-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart Agama */}
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Pegawai Berdasarkan Agama</h3>
          <div className="bg-white border rounded shadow mb-6 p-4 flex items-center justify-center" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agamaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  label={{ value: "Jumlah Pegawai", position: "insideBottom", offset: 0 }}
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="agama"
                  label={{ value: "Agama", angle: 0, position: "insideLeft", offset: 0 }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${value} pegawai`, "Agama"]} />
                <Legend formatter={() => "Agama"} />
                <Bar dataKey="jumlah" fill="#f59e42" name="Jumlah Pegawai" label={{ position: "right", fontSize: 12 }}>
                  {agamaData.map((entry, idx) => (
                    <Cell key={`bar-cell-agama-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Filter unit kerja dihapus sesuai permintaan */}
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="py-2 px-4 border">No</th>
            <th className="py-2 px-4 border">Nama</th>
            <th className="py-2 px-4 border">Jabatan</th>
            <th className="py-2 px-4 border">Golongan</th>
          </tr>
        </thead>
        <tbody>
          {filteredPegawai.map((pegawai, idx) => {
            const detail = pegawai.pegawai_detail && pegawai.pegawai_detail.length > 0 ? pegawai.pegawai_detail[0] : undefined;
            return (
              <tr key={pegawai.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border text-center">{idx + 1}</td>
                <td className="py-2 px-4 border">
                  <div className="flex items-center gap-2">
                    {detail?.photo_url ? (
                      <Image
                        src={detail.photo_url}
                        alt={pegawai.nama}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {pegawai.nama.charAt(0)}
                      </span>
                    )}
                    <a
                      href={`/user/pegawai/${pegawai.id}`}
                      className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                    >
                      {pegawai.nama}
                    </a>
                  </div>
                </td>
                <td className="py-2 px-4 border">{pegawai.jabatan}</td>
                <td className="py-2 px-4 border">{pegawai.golongan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PegawaiUserPage;
