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
  {
    id: 5,
    nama: 'Sosialisasi Sistem Merit ASN',
    tanggal: '2025-05-18',
    jenis: 'Webinar',
    platform: 'Teams',
    unit: 'Unit B',
    peserta: 150,
  },
  {
    id: 6,
    nama: 'Workshop Digitalisasi Pelayanan',
    tanggal: '2025-05-20',
    jenis: 'Tatap Muka',
    platform: 'Auditorium LAN',
    unit: 'Unit C',
    peserta: 120,
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

// Calculate unit statistics
const unitStats = Object.entries(
  dataSosialisasi.reduce((acc, item) => {
    if (!acc[item.unit]) {
      acc[item.unit] = { totalPeserta: 0, totalKegiatan: 0 }
    }
    acc[item.unit].totalPeserta += item.peserta
    acc[item.unit].totalKegiatan += 1
    return acc
  }, {} as Record<string, { totalPeserta: number; totalKegiatan: number }>)
).map(([unit, stats]) => ({
  unit,
  totalPeserta: stats.totalPeserta,
  totalKegiatan: stats.totalKegiatan,
  rataRataPeserta: stats.totalPeserta / stats.totalKegiatan
})).sort((a, b) => b.totalPeserta - a.totalPeserta).slice(0, 3)

const summaryCards = [
  { 
    label: 'Total Kegiatan', 
    value: dataSosialisasi.length,
    icon: '📢',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500'
  },
  { 
    label: 'Total Peserta', 
    value: totalPeserta,
    icon: '👥',
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500'
  },
  { 
    label: 'Kegiatan Daring', 
    value: dataSosialisasi.filter(d => d.jenis === 'Webinar' || d.jenis === 'Live IG').length,
    icon: '💻',
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500'
  },
  { 
    label: 'Kegiatan Luring', 
    value: dataSosialisasi.filter(d => d.jenis === 'Tatap Muka' || d.jenis === 'FGD').length,
    icon: '🏢',
    color: 'orange',
    bgGradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    textDark: 'text-orange-800',
    borderColor: 'border-orange-500'
  },
]

export default function SosialisasiPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Sosialisasi & Komunikasi</h1>
        <p className="text-blue-600">Pantau dan kelola kegiatan sosialisasi di seluruh unit kerja</p>
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
          Unit Terbaik (Total Peserta Terbanyak)
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

            const percentage = ((unit.totalPeserta / totalPeserta) * 100).toFixed(1)

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
                        {unit.totalPeserta}
                      </p>
                      <p className="text-xs text-gray-600">peserta</p>
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
                          width: `${(unit.totalPeserta / Math.max(...unitStats.map(u => u.totalPeserta))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{unit.totalKegiatan} kegiatan</span>
                      <span className={`font-medium ${colors.text}`}>
                        {percentage}% total peserta
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Communication Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Komunikasi & Sosialisasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...dataSosialisasi.map(d => d.peserta))}
            </div>
            <div className="text-sm text-blue-800">Peserta Tertinggi</div>
            <div className="text-xs text-blue-600 mt-1">Best Reach</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...unitStats.map(u => u.rataRataPeserta)).toFixed(0)}
            </div>
            <div className="text-sm text-green-800">Rata-rata Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Per Kegiatan</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">💻</div>
            <div className="text-2xl font-bold text-purple-600">
              {dataSosialisasi.filter(d => d.jenis === 'Webinar' || d.jenis === 'Live IG')
                .reduce((sum, d) => sum + d.peserta, 0)}
            </div>
            <div className="text-sm text-purple-800">Total Peserta Daring</div>
            <div className="text-xs text-purple-600 mt-1">Online Reach</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter(u => u.totalPeserta >= 200).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">200+ peserta</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Kegiatan Sosialisasi</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap kegiatan sosialisasi dan komunikasi</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Nama Kegiatan</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Jenis</th>
                <th className="px-6 py-3 text-left font-medium">Platform</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-right font-medium">Peserta</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataSosialisasi.map((item, index) => {
                const unitRank = unitStats.findIndex(u => u.unit === item.unit)
                const isTopUnit = unitRank !== -1

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis === 'Webinar' ? 'bg-blue-100 text-blue-800' :
                        item.jenis === 'Live IG' ? 'bg-pink-100 text-pink-800' :
                        item.jenis === 'Tatap Muka' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.jenis === 'Webinar' ? '💻' :
                         item.jenis === 'Live IG' ? '📱' :
                         item.jenis === 'Tatap Muka' ? '🏢' : '👥'} {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.platform}</td>
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
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.peserta >= 200 ? 'bg-green-100 text-green-800' :
                        item.peserta >= 100 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        👥 {item.peserta}
                      </span>
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

        {/* Bar Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Jumlah Peserta per Unit
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={unitStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis 
                  label={{ value: 'Peserta', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${value} peserta`,
                    name === 'totalPeserta' ? 'Total Peserta' : name
                  ]}
                />
                <Bar 
                  dataKey="totalPeserta" 
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
