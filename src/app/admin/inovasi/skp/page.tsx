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
  {
    id: 5,
    pegawai: 'Ahmad Fauzi',
    unit: 'Biro A',
    inovasi: 'Sistem Monitoring Real-time',
    target: 'Peningkatan Kualitas Layanan',
    status: 'Sudah Implementasi',
    dampak: 'Response time -60%',
  },
  {
    id: 6,
    pegawai: 'Sari Dewi',
    unit: 'Sekretariat',
    inovasi: 'Portal Self-Service ASN',
    target: 'Kemudahan Akses Informasi',
    status: 'On Progress',
    dampak: 'User satisfaction +75%',
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

// Calculate unit statistics for ranking
const unitStats = Object.entries(unitCount).map(([unit, count]) => ({
  unit,
  jumlahInovasi: count,
  implementasi: dataSkp.filter(d => d.unit === unit && d.status === 'Sudah Implementasi').length,
  progress: dataSkp.filter(d => d.unit === unit && d.status === 'On Progress').length
})).sort((a, b) => b.jumlahInovasi - a.jumlahInovasi).slice(0, 3)

const COLORS = ['#34d399', '#60a5fa', '#facc15']

const summaryCards = [
  { 
    label: 'Total SKP Transformasional', 
    value: dataSkp.length,
    icon: '🎯',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500'
  },
  { 
    label: 'Sudah Implementasi', 
    value: statusCount['Sudah Implementasi'] || 0,
    icon: '✅',
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500'
  },
  { 
    label: 'On Progress', 
    value: statusCount['On Progress'] || 0,
    icon: '⏳',
    color: 'yellow',
    bgGradient: 'from-yellow-500 to-yellow-600',
    bgLight: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    textDark: 'text-yellow-800',
    borderColor: 'border-yellow-500'
  },
  { 
    label: 'Dalam Rencana', 
    value: statusCount['Dalam Rencana'] || 0,
    icon: '📋',
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500'
  },
]

export default function SkpTransformasionalPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard SKP Transformasional</h1>
        <p className="text-blue-600">Pantau dan kelola inovasi dalam Sasaran Kinerja Pegawai</p>
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
                      width: `${Math.min((card.value / Math.max(...summaryCards.map(c => c.value))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {card.value > 0 ? '📈 Aktif' : '⏳ Monitoring'}
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
          Unit Terbaik (Jumlah Inovasi Terbanyak)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {unitStats.map((unit, index) => {
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

            const successRate = unit.jumlahInovasi > 0 ? ((unit.implementasi / unit.jumlahInovasi) * 100).toFixed(1) : '0'

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
                        {unit.jumlahInovasi}
                      </p>
                      <p className="text-xs text-gray-600">inovasi</p>
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
                          width: `${(unit.jumlahInovasi / Math.max(...unitStats.map(u => u.jumlahInovasi))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{unit.implementasi} implementasi</span>
                      <span className={`font-medium ${colors.text}`}>
                        {successRate}% berhasil
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Innovation Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Inovasi SKP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...unitStats.map(u => u.jumlahInovasi))}
            </div>
            <div className="text-sm text-blue-800">Inovasi Tertinggi</div>
            <div className="text-xs text-blue-600 mt-1">Per Unit</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {((statusCount['Sudah Implementasi'] || 0) / dataSkp.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-green-800">Success Rate</div>
            <div className="text-xs text-green-600 mt-1">Implementasi</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(dataSkp.map(d => d.pegawai)).size}
            </div>
            <div className="text-sm text-purple-800">Pegawai Inovatif</div>
            <div className="text-xs text-purple-600 mt-1">Kontributor</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter(u => u.implementasi >= 2).length}
            </div>
            <div className="text-sm text-orange-800">Unit Unggul</div>
            <div className="text-xs text-orange-600 mt-1">2+ implementasi</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail SKP Transformasional</h2>
          <p className="text-blue-100 text-sm">Daftar inovasi dalam Sasaran Kinerja Pegawai</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Pegawai</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-left font-medium">Inovasi</th>
                <th className="px-6 py-3 text-left font-medium">Target Transformasi</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Dampak</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataSkp.map((item, index) => {
                const unitRank = unitStats.findIndex(u => u.unit === item.unit)
                const isTopUnit = unitRank !== -1

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <span className="flex items-center">
                        👤 {item.pegawai}
                      </span>
                    </td>
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
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <span className="flex items-center">
                        💡 {item.inovasi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.target}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Sudah Implementasi' ? 'bg-green-100 text-green-800' :
                        item.status === 'On Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'Sudah Implementasi' ? '✅' :
                         item.status === 'On Progress' ? '⏳' : '📋'} {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.dampak !== '-' ? (
                        <span className="flex items-center text-green-600">
                          📈 {item.dampak}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
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

        {/* Bar Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Jumlah Inovasi Pendukung SKP per Unit Kerja
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis 
                  allowDecimals={false} 
                  label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="jumlah" 
                  fill="url(#colorGradient)" 
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
      </div>
    </div>
  )
}
