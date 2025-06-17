'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const dataProduk = [
  {
    id: 1,
    nama: 'Sistem e-Integritas',
    unit: 'Pusat A',
    jenis: 'Aplikasi Digital',
    status: 'Aktif Digunakan',
    tanggalRilis: '2024-10-01',
    keterangan: 'Sistem pelaporan benturan kepentingan',
  },
  {
    id: 2,
    nama: 'Dashboard Evaluasi Kinerja',
    unit: 'Pusat B',
    jenis: 'Dashboard',
    status: 'Uji Coba',
    tanggalRilis: '2025-02-15',
    keterangan: 'Dashboard pemantauan real-time capaian SKP',
  },
  {
    id: 3,
    nama: 'Modul Transformasi Digital ASN',
    unit: 'Pusat A',
    jenis: 'Modul Pelatihan',
    status: 'Aktif Digunakan',
    tanggalRilis: '2025-03-10',
    keterangan: 'Modul pelatihan digitalisasi layanan publik',
  },
  {
    id: 4,
    nama: 'Template SOP Pelayanan Prima',
    unit: 'Pusat C',
    jenis: 'SOP',
    status: 'Arsip',
    tanggalRilis: '2023-12-20',
    keterangan: 'Template standar pelayanan untuk unit teknis',
  },
]

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6']

const summaryCards = [
  { label: 'Total Produk Inovasi', value: dataProduk.length },
  { label: 'Produk Aktif', value: dataProduk.filter(d => d.status === 'Aktif Digunakan').length },
  { label: 'Jenis Digital', value: dataProduk.filter(d => d.jenis.includes('Digital') || d.jenis === 'Dashboard').length },
  { label: 'Kolaborasi Unit', value: 2 },
]

const pieData = Object.entries(
  dataProduk.reduce((acc, curr) => {
    acc[curr.jenis] = (acc[curr.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([key, value]) => ({ name: key, value }))

const barData = Object.entries(
  dataProduk.reduce((acc, curr) => {
    acc[curr.unit] = (acc[curr.unit] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([unit, jumlah]) => ({ unit, jumlah }))

export default function ProdukInovasiPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Produk Inovasi</h1>

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

      {/* Tabel */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Nama Produk</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Tanggal Rilis</th>
              <th className="px-4 py-2 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataProduk.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">{item.tanggalRilis}</td>
                <td className="px-4 py-2">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Distribusi Jenis Produk
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

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Jumlah Produk per Unit Kerja
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="unit" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
