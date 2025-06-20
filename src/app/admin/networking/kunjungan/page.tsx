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
  { 
    label: 'Total Kegiatan', 
    value: dataKegiatan.length,
    icon: '🤝',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500'
  },
  { 
    label: 'Kunjungan', 
    value: dataKegiatan.filter(d => d.jenis === 'Kunjungan').length,
    icon: '👥',
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500'
  },
  { 
    label: 'Kerjasama', 
    value: dataKegiatan.filter(d => d.jenis === 'Kerjasama').length,
    icon: '📋',
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500'
  },
  { 
    label: 'Koordinasi', 
    value: dataKegiatan.filter(d => d.jenis === 'Koordinasi').length,
    icon: '🎯',
    color: 'orange',
    bgGradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    textDark: 'text-orange-800',
    borderColor: 'border-orange-500'
  },
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

  // Hitung unit terpopuler
  const unitCount = dataKegiatan.reduce((acc, item) => {
    acc[item.unit] = (acc[item.unit] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedUnits = Object.entries(unitCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Networking & Kunjungan</h1>
        <p className="text-blue-600">Pantau kegiatan networking, kunjungan, dan kerjasama antar instansi</p>
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
                  <span>Progress</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {card.value > 0 ? '✓ Aktif' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Unit Paling Aktif dalam Networking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedUnits.map(([unit, count], index) => {
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

            const percentage = ((count / dataKegiatan.length) * 100).toFixed(1)

            return (
              <div
                key={unit}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${colors.dark} mb-1`}>
                        {unit}
                      </p>
                      <p className={`text-3xl font-bold ${colors.text}`}>
                        {count}
                      </p>
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
                          width: `${(count / Math.max(...sortedUnits.map(([, c]) => c))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{percentage}% total kegiatan</span>
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

      {/* Activity Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Kegiatan Networking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">🏛️</div>
            <div className="text-2xl font-bold text-blue-600">
              {dataKegiatan.filter(d => d.instansi.includes('Kementerian')).length}
            </div>
            <div className="text-sm text-blue-800">Kementerian</div>
            <div className="text-xs text-blue-600 mt-1">Instansi Pusat</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {dataKegiatan.filter(d => d.status === 'Selesai').length}
            </div>
            <div className="text-sm text-green-800">Selesai</div>
            <div className="text-xs text-green-600 mt-1">Status Completed</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">📜</div>
            <div className="text-2xl font-bold text-purple-600">
              {dataKegiatan.filter(d => d.status.includes('MoU')).length}
            </div>
            <div className="text-sm text-purple-800">MoU</div>
            <div className="text-xs text-purple-600 mt-1">Kerjasama Formal</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-orange-600">
              {dataKegiatan.filter(d => d.status.includes('Menunggu')).length}
            </div>
            <div className="text-sm text-orange-800">Pending</div>
            <div className="text-xs text-orange-600 mt-1">Butuh Tindak Lanjut</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Kegiatan Networking</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap kegiatan kunjungan, kerjasama, dan koordinasi</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Jenis Kegiatan</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataKegiatan.map((item, index) => {
                const unitRank = sortedUnits.findIndex(([unit]) => unit === item.unit)
                const isTopUnit = unitRank !== -1 && unitRank < 3

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.instansi.includes('Kementerian') && <span className="mr-1">🏛️</span>}
                      {item.instansi}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis === 'Kunjungan' ? 'bg-green-100 text-green-800' :
                        item.jenis === 'Kerjasama' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.jenis === 'Kunjungan' ? '👥' :
                         item.jenis === 'Kerjasama' ? '📋' : '🎯'} {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        item.status.includes('MoU') ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.status === 'Selesai' ? '✅' :
                         item.status.includes('MoU') ? '📜' : '⏳'} {item.status}
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

      {/* Enhanced Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">🥧</span>
          Proporsi Jenis Kegiatan
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
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 mb-3">Breakdown Kegiatan</h3>
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
                    {((item.value / dataKegiatan.length) * 100).toFixed(0)}%
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
