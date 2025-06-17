'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const dataSkp = [
  {
    id: 1,
    pegawai: 'Budi Santosa',
    unit: 'Biro A',
    inovasi: 'Aplikasi Pelayanan Mandiri',
    target: 'Digitalisasi Pelayanan Publik',
    status: 'Sudah Implementasi',
    dampak: 'Waktu layanan -40%',
  },
  {
    id: 2,
    pegawai: 'Rina Lestari',
    unit: 'Pusat B',
    inovasi: 'Integrasi Data Evaluasi',
    target: 'Kolaborasi Lintas Unit',
    status: 'On Progress',
    dampak: 'Akurasi data meningkat',
  },
  {
    id: 3,
    pegawai: 'Yuli Rahmawati',
    unit: 'Sekretariat',
    inovasi: 'Dashboard SKP Inovatif',
    target: 'Transparansi Kinerja Pegawai',
    status: 'Sudah Implementasi',
    dampak: 'Visibilitas meningkat 80%',
  },
  {
    id: 4,
    pegawai: 'Deni Hidayat',
    unit: 'Pusat B',
    inovasi: 'Otomasi Laporan SKP',
    target: 'Efisiensi Administrasi',
    status: 'Dalam Rencana',
    dampak: '-',
  },
]

const statusCount = dataSkp.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1
  return acc
}, {} as Record<string, number>)

const pieData = Object.entries(statusCount).map(([key, value]) => ({
  name: key,
  value,
}))

const unitCount = dataSkp.reduce((acc, item) => {
  acc[item.unit] = (acc[item.unit] || 0) + 1
  return acc
}, {} as Record<string, number>)

const barData = Object.entries(unitCount).map(([unit, count]) => ({
  unit,
  jumlah: count,
}))

const COLORS = ['#34d399', '#60a5fa', '#facc15']

const summaryCards = [
  { label: 'Total SKP Transformasional', value: dataSkp.length },
  { label: 'Sudah Implementasi', value: statusCount['Sudah Implementasi'] || 0 },
  { label: 'On Progress', value: statusCount['On Progress'] || 0 },
  { label: 'Dalam Rencana', value: statusCount['Dalam Rencana'] || 0 },
]

export default function SkpTransformasionalPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">SKP Transformasional</h1>

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
              <th className="px-4 py-2 text-left">Pegawai</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Inovasi</th>
              <th className="px-4 py-2 text-left">Target Transformasi</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Dampak</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataSkp.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.pegawai}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2">{item.inovasi}</td>
                <td className="px-4 py-2">{item.target}</td>
                <td className="px-4 py-2">{item.status}</td>
                <td className="px-4 py-2">{item.dampak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grafik Pie */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Proporsi Status Implementasi Inovasi
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

      {/* Grafik Bar */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Jumlah Inovasi Pendukung SKP per Unit Kerja
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="unit" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jumlah" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
