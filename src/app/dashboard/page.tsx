'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Lightbulb, Megaphone, Users, BookOpenCheck } from 'lucide-react'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']

const summaryData = [
  { title: 'Jumlah Inovasi Aktif', value: 15, icon: <Lightbulb className="w-5 h-5" /> },
  { title: 'Postingan Komunikasi', value: 42, icon: <Megaphone className="w-5 h-5" /> },
  { title: 'Kunjungan Instansi', value: 8, icon: <Users className="w-5 h-5" /> },
  { title: 'Kegiatan Pembelajaran', value: 10, icon: <BookOpenCheck className="w-5 h-5" /> },
]

const makartiChart = [
  { name: 'Inovasi', Januari: 2, Februari: 4, Maret: 5 },
  { name: 'Komunikasi', Januari: 3, Februari: 6, Maret: 8 },
  { name: 'Networking', Januari: 1, Februari: 2, Maret: 4 },
  { name: 'Learning', Januari: 4, Februari: 6, Maret: 5 },
]

const serapanData = [
  { name: 'Terserap', value: 375 },
  { name: 'Sisa', value: 125 },
]

export default function RingkasanMakartiPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-blue-700">Ringkasan Kinerja MAKARTI</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <div key={item.title} className="bg-white shadow p-4 rounded-xl flex items-center space-x-4">
            <div className="text-blue-600">{item.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Tren Kinerja Tiap Pilar (Jan–Mar)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={makartiChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Januari" fill="#8884d8" />
            <Bar dataKey="Februari" fill="#82ca9d" />
            <Bar dataKey="Maret" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Serapan */}
      <div className="bg-white p-6 rounded-xl shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Serapan Anggaran</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={serapanData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {serapanData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-500">Total Anggaran: Rp500 juta (75% terserap)</p>
      </div>
    </div>
  )
}
