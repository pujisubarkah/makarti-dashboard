'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#60a5fa', '#34d399', '#facc15']

const dataKegiatan = [
  {
    id: 1,
    instansi: 'Kementerian Keuangan',
    jenis: 'Kunjungan',
    tanggal: '2025-05-10',
    status: 'Selesai',
    unit: 'Unit A',
  },
  {
    id: 2,
    instansi: 'Kementerian PANRB',
    jenis: 'Kerjasama',
    tanggal: '2025-05-15',
    status: 'MoU Ditandatangani',
    unit: 'Unit B',
  },
  {
    id: 3,
    instansi: 'Pemprov Jawa Barat',
    jenis: 'Koordinasi',
    tanggal: '2025-05-20',
    status: 'Menunggu Tindak Lanjut',
    unit: 'Unit C',
  },
  {
    id: 4,
    instansi: 'Universitas Indonesia',
    jenis: 'Kunjungan',
    tanggal: '2025-05-25',
    status: 'Selesai',
    unit: 'Unit A',
  },
]

const summaryCards = [
  { label: 'Total Kegiatan', value: dataKegiatan.length },
  { label: 'Kunjungan', value: dataKegiatan.filter(d => d.jenis === 'Kunjungan').length },
  { label: 'Kerjasama', value: dataKegiatan.filter(d => d.jenis === 'Kerjasama').length },
  { label: 'Koordinasi', value: dataKegiatan.filter(d => d.jenis === 'Koordinasi').length },
]

export default function NetworkingPage() {
  const kegiatanCount = dataKegiatan.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(kegiatanCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Kegiatan Networking & Kunjungan</h1>

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
              <th className="px-4 py-2 text-left">Instansi</th>
              <th className="px-4 py-2 text-left">Jenis Kegiatan</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Unit</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataKegiatan.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.instansi}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Proporsi Jenis Kegiatan
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
