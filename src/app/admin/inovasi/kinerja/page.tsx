'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataInovasi = [
  {
    id: 1,
    judul: 'Digitalisasi Formulir Pelayanan',
    pengusul: 'Unit A',
    tahap: 'Implementasi',
    tanggal: '2025-04-01',
    indikator: 'Waktu proses berkurang 40%',
  },
  {
    id: 2,
    judul: 'Aplikasi Penilaian Mandiri ASN',
    pengusul: 'Unit B',
    tahap: 'Uji Coba',
    tanggal: '2025-03-12',
    indikator: 'Uji coba pada 3 unit kerja',
  },
  {
    id: 3,
    judul: 'Bot Konsultasi Kebijakan',
    pengusul: 'Unit C',
    tahap: 'Ide',
    tanggal: '2025-05-05',
    indikator: 'Belum direncanakan lebih lanjut',
  },
  {
    id: 4,
    judul: 'Sistem Pelacakan Surat Masuk',
    pengusul: 'Unit A',
    tahap: 'Perencanaan',
    tanggal: '2025-04-20',
    indikator: 'Target uji coba Juni 2025',
  },
  {
    id: 5,
    judul: 'Dashboard Kinerja Pegawai',
    pengusul: 'Unit B',
    tahap: 'Implementasi',
    tanggal: '2025-03-28',
    indikator: 'Sudah diakses oleh 80% pegawai',
  },
]

const summaryCards = [
  { 
    label: 'Total Inovasi', 
    value: dataInovasi.length,
    icon: '💡',
    color: 'blue',
    bgColor: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800'
  },
  {
    label: 'Tahap Ide',
    value: dataInovasi.filter(d => d.tahap === 'Ide').length,
    icon: '🧠',
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    textDark: 'text-yellow-800'
  },
  {
    label: 'Tahap Uji Coba',
    value: dataInovasi.filter(d => d.tahap === 'Uji Coba').length,
    icon: '🔬',
    color: 'orange',
    bgColor: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    textDark: 'text-orange-800'
  },
  {
    label: 'Sudah Implementasi',
    value: dataInovasi.filter(d => d.tahap === 'Implementasi').length,
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-500',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800'
  },
]

const tahapCount = dataInovasi.reduce((acc, curr) => {
  acc[curr.tahap] = (acc[curr.tahap] || 0) + 1
  return acc
}, {} as Record<string, number>)

const pieData = Object.entries(tahapCount).map(([key, value]) => ({
  name: key,
  value,
}))

const COLORS = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6']

export default function InovasiPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Inovasi & Kinerja</h1>
        <p className="text-blue-600">Pantau perkembangan inovasi di seluruh unit kerja</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 hover:scale-105 group"
            style={{ borderLeftColor: card.bgColor.replace('bg-', '#') === 'blue' ? '#3b82f6' : 
                     card.bgColor.replace('bg-', '#') === 'yellow' ? '#eab308' :
                     card.bgColor.replace('bg-', '#') === 'orange' ? '#f97316' : '#10b981' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">📊</span>
                  {card.value > 0 ? (
                    <span>
                      {((card.value / dataInovasi.length) * 100).toFixed(0)}% dari total
                    </span>
                  ) : (
                    <span>Belum ada data</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Progress Inovasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-lg font-bold text-blue-600">
              {((dataInovasi.filter(d => d.tahap === 'Implementasi').length / dataInovasi.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-blue-800">Tingkat Implementasi</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl mb-2">💪</div>
            <div className="text-lg font-bold text-green-600">
              {dataInovasi.filter(d => d.tahap === 'Implementasi' || d.tahap === 'Uji Coba').length}
            </div>
            <div className="text-sm text-green-800">Inovasi Aktif</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-bold text-purple-600">
              {new Set(dataInovasi.map(d => d.pengusul)).size}
            </div>
            <div className="text-sm text-purple-800">Unit Terlibat</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-lg font-bold text-orange-600">
              {dataInovasi.filter(d => d.indikator.includes('%') || d.indikator.includes('80%')).length}
            </div>
            <div className="text-sm text-orange-800">Dengan Metrik</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Inovasi per Unit</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap inovasi dan status perkembangannya</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Judul Inovasi</th>
                <th className="px-6 py-3 text-left font-medium">Pengusul</th>
                <th className="px-6 py-3 text-left font-medium">Tahap</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Indikator Kinerja</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataInovasi.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.judul}</td>
                  <td className="px-6 py-4 text-gray-600">{item.pengusul}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.tahap === 'Implementasi' ? 'bg-green-100 text-green-800' :
                      item.tahap === 'Uji Coba' ? 'bg-orange-100 text-orange-800' :
                      item.tahap === 'Perencanaan' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.tahap === 'Implementasi' ? '✅' :
                       item.tahap === 'Uji Coba' ? '🔬' :
                       item.tahap === 'Perencanaan' ? '📋' : '💡'} {item.tahap}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                  <td className="px-6 py-4 text-gray-600">{item.indikator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          Distribusi Tahapan Inovasi
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
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
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 mb-3">Ringkasan Tahapan</h3>
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{item.value}</div>
                  <div className="text-xs text-gray-500">
                    {((item.value / dataInovasi.length) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
