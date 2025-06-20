'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const dataPelatihan = [
  { id: 1, nama: 'Aulia Rahman', unit: 'Humas', judul: 'Pelatihan Komunikasi Publik', jam: 6, tanggal: '2025-05-10' },
  { id: 2, nama: 'Intan Sari', unit: 'Kepegawaian', judul: 'Manajemen SDM', jam: 8, tanggal: '2025-05-12' },
  { id: 3, nama: 'Rizky Ananda', unit: 'Kepegawaian', judul: 'Evaluasi Kinerja ASN', jam: 7, tanggal: '2025-05-18' },
  { id: 4, nama: 'Dian Setiawan', unit: 'Humas', judul: 'Teknik Desain Grafis', jam: 5, tanggal: '2025-05-20' },
  { id: 5, nama: 'Nina Putri', unit: 'IT', judul: 'Pelatihan Keamanan Siber', jam: 10, tanggal: '2025-06-02' },
  { id: 6, nama: 'Reza Maulana', unit: 'IT', judul: 'Pengembangan Aplikasi Internal', jam: 12, tanggal: '2025-06-05' },
  { id: 7, nama: 'Sari Dewi', unit: 'Keuangan', judul: 'Akuntansi Sektor Publik', jam: 9, tanggal: '2025-06-08' },
  { id: 8, nama: 'Budi Santoso', unit: 'Keuangan', judul: 'Analisis Anggaran', jam: 8, tanggal: '2025-06-10' },
  { id: 9, nama: 'Maya Putri', unit: 'Keuangan', judul: 'Pelaporan Keuangan', jam: 7, tanggal: '2025-06-12' },
  { id: 10, nama: 'Ahmad Fauzi', unit: 'Perencanaan', judul: 'Strategic Planning', jam: 15, tanggal: '2025-06-15' },
  { id: 11, nama: 'Lina Sari', unit: 'Perencanaan', judul: 'Monitoring & Evaluasi', jam: 12, tanggal: '2025-06-18' },
  { id: 12, nama: 'Eko Prasetyo', unit: 'Hukum', judul: 'Peraturan Perundangan', jam: 6, tanggal: '2025-06-20' },
  { id: 13, nama: 'Dewi Lestari', unit: 'Hukum', judul: 'Kontrak dan Pengadaan', jam: 8, tanggal: '2025-06-22' },
  { id: 14, nama: 'Fajar Nugroho', unit: 'Humas', judul: 'Media Relations', jam: 4, tanggal: '2025-06-25' },
  { id: 15, nama: 'Rina Wati', unit: 'IT', judul: 'Database Management', jam: 11, tanggal: '2025-06-28' },
]

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

// Ringkasan
const totalJam = dataPelatihan.reduce((sum, item) => sum + item.jam, 0)
const totalPegawai = new Set(dataPelatihan.map(d => d.nama)).size
const totalUnit = new Set(dataPelatihan.map(d => d.unit)).size

// Hitung rata-rata jam per unit untuk ranking
const unitStats = Object.entries(
  dataPelatihan.reduce((acc, item) => {
    if (!acc[item.unit]) {
      acc[item.unit] = { totalJam: 0, pegawai: new Set() }
    }
    acc[item.unit].totalJam += item.jam
    acc[item.unit].pegawai.add(item.nama)
    return acc
  }, {} as Record<string, { totalJam: number; pegawai: Set<string> }>)
).map(([unit, stats]) => ({
  unit,
  totalJam: stats.totalJam,
  jumlahPegawai: stats.pegawai.size,
  rataJam: stats.totalJam / stats.pegawai.size
})).sort((a, b) => b.rataJam - a.rataJam)

const topPerformingUnits = unitStats.slice(0, 3)

const summaryCards = [
  { 
    label: 'Total Pelatihan', 
    value: dataPelatihan.length,
    icon: '📚',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500'
  },
  { 
    label: 'Total Peserta', 
    value: totalPegawai,
    icon: '👥',
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500'
  },
  { 
    label: 'Rata-rata Jam per Pegawai', 
    value: (totalJam / totalPegawai).toFixed(1),
    icon: '⏰',
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500'
  },
  { 
    label: 'Unit Terlibat', 
    value: totalUnit,
    icon: '🏢',
    color: 'orange',
    bgGradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    textDark: 'text-orange-800',
    borderColor: 'border-orange-500'
  },
]

// Data untuk grafik
const barData = unitStats.map(unit => ({
  unit: unit.unit,
  rataJam: parseFloat(unit.rataJam.toFixed(1)),
  totalJam: unit.totalJam,
  pegawai: unit.jumlahPegawai
}))

// Data untuk pie chart
const pieData = Object.entries(
  dataPelatihan.reduce((acc, item) => {
    acc[item.unit] = (acc[item.unit] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([unit, count]) => ({ name: unit, value: count }))

export default function PelatihanPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Pelatihan & Learning</h1>
        <p className="text-blue-600">Pantau dan kelola program pelatihan pegawai di seluruh unit kerja</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
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
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((parseFloat(card.value.toString()) / Math.max(...summaryCards.map(c => parseFloat(c.value.toString())))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {parseFloat(card.value.toString()) > 0 ? '📈 Aktif' : '⏳ Monitoring'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Units */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Unit Terbaik (Rata-rata Jam Pelatihan Tertinggi)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformingUnits.map((unit, index) => {
            const colors = [
              { 
                bg: 'from-yellow-400 to-yellow-500', 
                light: 'bg-yellow-100', 
                text: 'text-yellow-600', 
                dark: 'text-yellow-800',
                border: 'border-yellow-500',
                icon: '🥇' 
              },
              { 
                bg: 'from-gray-400 to-gray-500', 
                light: 'bg-gray-100', 
                text: 'text-gray-600', 
                dark: 'text-gray-800',
                border: 'border-gray-500',
                icon: '🥈' 
              },
              { 
                bg: 'from-orange-400 to-orange-500', 
                light: 'bg-orange-100', 
                text: 'text-orange-600', 
                dark: 'text-orange-800',
                border: 'border-orange-500',
                icon: '🥉' 
              }
            ][index]

            return (
              <div
                key={unit.unit}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${colors.dark} mb-1`}>
                        {unit.unit}
                      </p>
                      <p className={`text-3xl font-bold ${colors.text}`}>
                        {unit.rataJam.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600">jam/pegawai</p>
                    </div>
                    <div className={`${colors.light} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{colors.icon}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${(unit.rataJam / Math.max(...topPerformingUnits.map(u => u.rataJam))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{unit.jumlahPegawai} pegawai</span>
                      <span className={`font-medium ${colors.text}`}>
                        Rank #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Pembelajaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalJam}
            </div>
            <div className="text-sm text-blue-800">Total Jam</div>
            <div className="text-xs text-blue-600 mt-1">Learning Hours</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...unitStats.map(u => u.rataJam)).toFixed(1)}
            </div>
            <div className="text-sm text-green-800">Jam Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Best Performance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((totalJam / dataPelatihan.length) * 10) / 10}
            </div>
            <div className="text-sm text-purple-800">Rata-rata/Pelatihan</div>
            <div className="text-xs text-purple-600 mt-1">Per Session</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter(u => u.rataJam >= 8).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">8+ jam rata-rata</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Pelatihan Pegawai</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap pelatihan yang telah diikuti pegawai</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Nama Pegawai</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-left font-medium">Judul Pelatihan</th>
                <th className="px-6 py-3 text-left font-medium">Jam</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataPelatihan.map((item, index) => {
                const unitRank = topPerformingUnits.findIndex(u => u.unit === item.unit)
                const isTopUnit = unitRank !== -1

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.nama}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isTopUnit 
                          ? unitRank === 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : unitRank === 1 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{item.judul}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jam >= 10 ? 'bg-green-100 text-green-800' :
                        item.jam >= 7 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        ⏰ {item.jam} jam
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Rata-rata Jam Pelatihan per Unit
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis 
                  label={{ value: 'Jam', angle: -90, position: 'insideLeft' }} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${value} jam`,
                    name === 'rataJam' ? 'Rata-rata Jam' : name
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="rataJam" 
                  fill="url(#colorGradient)" 
                  name="Rata-rata Jam"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Pelatihan per Unit
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
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
    </div>
  )
}
