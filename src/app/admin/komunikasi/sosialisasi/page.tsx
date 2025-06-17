'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataSosialisasi = [
  {
    id: 1,
    nama: 'Webinar SPBE dan Inovasi Digital',
    tanggal: '2025-05-10',
    jenis: 'Webinar',
    platform: 'Zoom',
    unit: 'Unit A',
    peserta: 200,
  },
  {
    id: 2,
    nama: 'Sosialisasi Reformasi Birokrasi',
    tanggal: '2025-05-12',
    jenis: 'Tatap Muka',
    platform: 'Kantor LAN Pusat',
    unit: 'Unit B',
    peserta: 80,
  },
  {
    id: 3,
    nama: 'Live Instagram ASN BerAKHLAK',
    tanggal: '2025-05-14',
    jenis: 'Live IG',
    platform: '@lanri_official',
    unit: 'Unit C',
    peserta: 500,
  },
  {
    id: 4,
    nama: 'FGD Strategi Inovasi Pelayanan',
    tanggal: '2025-05-16',
    jenis: 'FGD',
    platform: 'Offline',
    unit: 'Unit A',
    peserta: 30,
  },
]

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

const jenisCount = dataSosialisasi.reduce((acc, item) => {
  acc[item.jenis] = (acc[item.jenis] || 0) + 1
  return acc
}, {} as Record<string, number>)

const pieData = Object.entries(jenisCount).map(([key, value]) => ({
  name: key,
  value,
}))

const totalPeserta = dataSosialisasi.reduce((sum, item) => sum + item.peserta, 0)

const summaryCards = [
  { label: 'Total Kegiatan', value: dataSosialisasi.length },
  { label: 'Total Peserta', value: totalPeserta },
  { label: 'Kegiatan Daring', value: dataSosialisasi.filter(d => d.jenis === 'Webinar' || d.jenis === 'Live IG').length },
  { label: 'Kegiatan Luring', value: dataSosialisasi.filter(d => d.jenis === 'Tatap Muka' || d.jenis === 'FGD').length },
]

export default function SosialisasiPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Sosialisasi</h1>

      {/* Summary Cards */}
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

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Nama Kegiatan</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Platform</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-right">Peserta</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataSosialisasi.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">{item.platform}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2 text-right">{item.peserta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Distribusi Jenis Kegiatan
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
