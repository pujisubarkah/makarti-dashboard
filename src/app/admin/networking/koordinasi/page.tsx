'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataKoordinasi = [
  {
    id: 1,
    tanggal: '2025-05-05',
    instansi: 'Bappenas',
    jenisInstansi: 'Pusat',
    topik: 'Sinkronisasi indikator reformasi birokrasi',
    catatan: 'Disepakati penyelarasan indikator RKT',
  },
  {
    id: 2,
    tanggal: '2025-05-15',
    instansi: 'LAN Pusat',
    jenisInstansi: 'Pusat',
    topik: 'Pemanfaatan data evaluasi kebijakan',
    catatan: 'Akan dilakukan FGD lanjutan pekan depan',
  },
  {
    id: 3,
    tanggal: '2025-05-20',
    instansi: 'Kemenko PMK',
    jenisInstansi: 'Pusat',
    topik: 'Kolaborasi lintas sektor untuk bangkom ASN',
    catatan: 'Akan diformalkan dalam SK bersama',
  },
  {
    id: 4,
    tanggal: '2025-05-22',
    instansi: 'Universitas Airlangga',
    jenisInstansi: 'Akademisi',
    topik: 'Koordinasi diseminasi hasil riset ke instansi',
    catatan: 'Disusun draf policy brief bersama',
  },
  {
    id: 5,
    tanggal: '2025-06-01',
    instansi: 'Pemerintah Provinsi Jawa Barat',
    jenisInstansi: 'Daerah',
    topik: 'Koordinasi pelaksanaan pelatihan transformasi digital',
    catatan: 'Perlu pendampingan lanjutan bulan depan',
  },
]

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6']

const summaryCards = [
  { label: 'Total Koordinasi', value: dataKoordinasi.length },
  { label: 'Instansi Pusat', value: dataKoordinasi.filter(d => d.jenisInstansi === 'Pusat').length },
  { label: 'Instansi Daerah', value: dataKoordinasi.filter(d => d.jenisInstansi === 'Daerah').length },
  { label: 'Akademisi', value: dataKoordinasi.filter(d => d.jenisInstansi === 'Akademisi').length },
]

const pieData = Object.entries(
  dataKoordinasi.reduce((acc, curr) => {
    acc[curr.jenisInstansi] = (acc[curr.jenisInstansi] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([key, value]) => ({
  name: key,
  value,
}))

export default function KoordinasiPage() {
  const [filter, setFilter] = useState<string>('Semua')

  const filteredData =
    filter === 'Semua'
      ? dataKoordinasi
      : dataKoordinasi.filter((item) => item.jenisInstansi === filter)

  const jenisOptions = ['Semua', 'Pusat', 'Daerah', 'Akademisi']

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Koordinasi Lintas Instansi</h1>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 text-center border border-gray-100"
          >
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-2xl font-semibold text-blue-600">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Dropdown */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Filter Jenis Instansi:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        >
          {jenisOptions.map((jenis) => (
            <option key={jenis} value={jenis}>
              {jenis}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Instansi</th>
              <th className="px-4 py-2 text-left">Jenis Instansi</th>
              <th className="px-4 py-2 text-left">Topik Koordinasi</th>
              <th className="px-4 py-2 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.instansi}</td>
                <td className="px-4 py-2">{item.jenisInstansi}</td>
                <td className="px-4 py-2">{item.topik}</td>
                <td className="px-4 py-2">{item.catatan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Proporsi Koordinasi Berdasarkan Jenis Instansi
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
