'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { format, differenceInDays } from 'date-fns'
import { parseISO } from 'date-fns/parseISO'

const rawData = [
  {
    id: 1,
    instansi: 'Kementerian Keuangan',
    tanggalMulai: '2025-01-05',
    tanggalSelesai: '2025-01-10',
    jumlahPeserta: 30,
    unit: 'Unit A',
  },
  {
    id: 2,
    instansi: 'Kementerian PANRB',
    tanggalMulai: '2025-02-01',
    tanggalSelesai: '2025-02-04',
    jumlahPeserta: 20,
    unit: 'Unit B',
  },
  {
    id: 3,
    instansi: 'Pemprov Jabar',
    tanggalMulai: '2025-03-01',
    tanggalSelesai: '2025-03-07',
    jumlahPeserta: 50,
    unit: 'Unit C',
  },
  {
    id: 4,
    instansi: 'Universitas Indonesia',
    tanggalMulai: '2025-04-10',
    tanggalSelesai: '2025-04-12',
    jumlahPeserta: 40,
    unit: 'Unit A',
  },
  {
    id: 5,
    instansi: 'BPS Pusat',
    tanggalMulai: '2025-05-15',
    tanggalSelesai: '2025-05-20',
    jumlahPeserta: 35,
    unit: 'Unit B',
  },
  {
    id: 6,
    instansi: 'Kemendagri',
    tanggalMulai: '2025-06-01',
    tanggalSelesai: '2025-06-08',
    jumlahPeserta: 45,
    unit: 'Unit C',
  },
]

const unitColorMap: Record<string, string> = {
  'Unit A': '#60a5fa',
  'Unit B': '#34d399',
  'Unit C': '#fbbf24',
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

const ganttData = rawData.map((item) => {
  const start = parseISO(item.tanggalMulai).getTime()
  const end = parseISO(item.tanggalSelesai).getTime()
  const durasi = differenceInDays(new Date(end), new Date(start)) + 1
  return {
    ...item,
    start,
    durasi,
  }
})

export default function BangkomGanttChart() {
  // Calculate summary values
  const totalKegiatan = rawData.length
  const totalPeserta = rawData.reduce((sum, item) => sum + item.jumlahPeserta, 0)
  const unitSet = new Set(rawData.map(item => item.unit))
  const totalUnit = unitSet.size
  const avgDurasi =
    rawData.length > 0
      ? Math.round(
          rawData.reduce(
            (sum, item) =>
              sum +
              (differenceInDays(
                parseISO(item.tanggalSelesai),
                parseISO(item.tanggalMulai)
              ) +
                1),
            0
          ) / rawData.length
        )
      : 0

  // Calculate unit statistics
  const unitStats = Object.entries(
    rawData.reduce((acc, item) => {
      if (!acc[item.unit]) {
        acc[item.unit] = { totalPeserta: 0, totalKegiatan: 0 }
      }
      acc[item.unit].totalPeserta += item.jumlahPeserta
      acc[item.unit].totalKegiatan += 1
      return acc
    }, {} as Record<string, { totalPeserta: number; totalKegiatan: number }>)
  ).map(([unit, stats]) => ({
    unit,
    totalPeserta: stats.totalPeserta,
    totalKegiatan: stats.totalKegiatan,
    rataRataPeserta: stats.totalPeserta / stats.totalKegiatan
  })).sort((a, b) => b.totalPeserta - a.totalPeserta).slice(0, 3)

  // Enhanced summary cards
  const summaryCards = [
    {
      label: 'Total Penyelenggaraan',
      value: totalKegiatan,
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
      label: 'Jumlah Unit',
      value: totalUnit,
      icon: '🏢',
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500'
    },
    {
      label: 'Rata-rata Durasi',
      value: `${avgDurasi} hari`,
      icon: '⏰',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
  ]

  // Data for pie chart
  const pieData = Object.entries(
    rawData.reduce((acc, item) => {
      acc[item.unit] = (acc[item.unit] || 0) + item.jumlahPeserta
      return acc
    }, {} as Record<string, number>)
  ).map(([unit, peserta]) => ({ name: unit, value: peserta }))

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Penyelenggaraan Bangkom</h1>
        <p className="text-blue-600">Pantau dan kelola penyelenggaraan program bangkom di seluruh unit kerja</p>
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
                      width: `${Math.min((parseFloat(card.value.toString()) / Math.max(...summaryCards.map(c => parseFloat(c.value.toString()) || 0))) * 100, 100)}%` 
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

      {/* Activity Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Penyelenggaraan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...unitStats.map(u => u.totalPeserta))}
            </div>
            <div className="text-sm text-blue-800">Peserta Tertinggi</div>
            <div className="text-xs text-blue-600 mt-1">Best Performance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...unitStats.map(u => u.rataRataPeserta)).toFixed(1)}
            </div>
            <div className="text-sm text-green-800">Rata-rata Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Per Kegiatan</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...rawData.map(item => differenceInDays(parseISO(item.tanggalSelesai), parseISO(item.tanggalMulai)) + 1))}
            </div>
            <div className="text-sm text-purple-800">Durasi Terlama</div>
            <div className="text-xs text-purple-600 mt-1">Hari</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter(u => u.totalPeserta >= 50).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">50+ peserta</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Penyelenggaraan Bangkom</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap kegiatan penyelenggaraan program bangkom</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal Mulai</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal Selesai</th>
                <th className="px-6 py-3 text-left font-medium">Durasi</th>
                <th className="px-6 py-3 text-right font-medium">Jumlah Peserta</th>
                <th className="px-6 py-3 text-left font-medium">Unit Kerja</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {rawData.map((item, idx) => {
                const unitRank = unitStats.findIndex(u => u.unit === item.unit)
                const isTopUnit = unitRank !== -1
                const durasi = differenceInDays(parseISO(item.tanggalSelesai), parseISO(item.tanggalMulai)) + 1

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.instansi.includes('Kementerian') && <span className="mr-1">🏛️</span>}
                      {item.instansi.includes('Universitas') && <span className="mr-1">🎓</span>}
                      {item.instansi.includes('Pemprov') && <span className="mr-1">🏢</span>}
                      {item.instansi}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggalMulai}</td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggalSelesai}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        durasi >= 7 ? 'bg-red-100 text-red-800' :
                        durasi >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        ⏰ {durasi} hari
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jumlahPeserta >= 40 ? 'bg-green-100 text-green-800' :
                        item.jumlahPeserta >= 25 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        👥 {item.jumlahPeserta}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Peserta per Unit
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

        {/* Enhanced Gantt Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Timeline Penyelenggaraan
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={ganttData}
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="instansi" 
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null
                    const data = payload[0].payload
                    const end = data.start + (data.durasi - 1) * 86400000
                    return (
                      <div className="bg-white border shadow p-3 text-sm rounded-lg">
                        <div className="font-bold text-gray-800">{data.instansi}</div>
                        <div className="text-gray-600">Mulai: {format(new Date(data.start), 'dd MMM yyyy')}</div>
                        <div className="text-gray-600">Selesai: {format(new Date(end), 'dd MMM yyyy')}</div>
                        <div className="text-gray-600">Durasi: {data.durasi} hari</div>
                        <div className="text-gray-600">Unit: {data.unit}</div>
                        <div className="text-gray-600">Peserta: {data.jumlahPeserta}</div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="durasi" barSize={15} isAnimationActive={false}>
                  {ganttData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={unitColorMap[entry.unit] || '#a5b4fc'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
