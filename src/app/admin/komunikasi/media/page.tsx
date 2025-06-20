'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataPublikasi = [
  {
    id: 1,
    judul: 'Peluncuran Inovasi Pelayanan',
    tanggal: '2025-05-20',
    jenis: 'Media Online',
    unit: 'Unit A',
    link: '#',
  },
  {
    id: 2,
    judul: 'Live IG Sosialisasi Kebijakan',
    tanggal: '2025-05-18',
    jenis: 'Instagram',
    unit: 'Unit B',
    link: '#',
    likes: 300,
    views: 5000,
  },
  {
    id: 3,
    judul: 'Berita Peliputan oleh Metro TV',
    tanggal: '2025-05-15',
    jenis: 'Media Massa',
    unit: 'Unit C',
    link: '#',
  },
  {
    id: 4,
    judul: 'Artikel Website Resmi',
    tanggal: '2025-05-10',
    jenis: 'Website',
    unit: 'Unit A',
    link: '#',
  },
  {
    id: 5,
    judul: 'Kampanye Digital MAKARTI',
    tanggal: '2025-05-05',
    jenis: 'Instagram',
    unit: 'Unit A',
    link: '#',
    likes: 450,
    views: 6200,
  },
  {
    id: 6,
    judul: 'Siaran Pers Pencapaian Target',
    tanggal: '2025-05-01',
    jenis: 'Media Massa',
    unit: 'Unit B',
    link: '#',
  },
]

const COLORS = ['#60a5fa', '#f472b6', '#34d399', '#facc15']

export default function MediaPage() {
  const mediaCount = dataPublikasi.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Hitung posting per unit
  const unitCount = dataPublikasi.reduce((acc, item) => {
    acc[item.unit] = (acc[item.unit] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Urutkan unit berdasarkan jumlah posting
  const sortedUnits = Object.entries(unitCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // ambil 3 teratas

  const pieData = Object.entries(mediaCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const summaryCards = [
    { 
      label: 'Total Publikasi', 
      value: dataPublikasi.length,
      icon: '📰',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    { 
      label: 'Instagram', 
      value: mediaCount['Instagram'] || 0,
      icon: '📱',
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-100',
      textColor: 'text-pink-600',
      textDark: 'text-pink-800',
      borderColor: 'border-pink-500'
    },
    {
      label: 'Total Likes (Instagram)',
      value: dataPublikasi
        .filter(d => d.jenis === 'Instagram')
        .reduce((a, b) => a + (b.likes || 0), 0),
      icon: '❤️',
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-100',
      textColor: 'text-red-600',
      textDark: 'text-red-800',
      borderColor: 'border-red-500'
    },
    {
      label: 'Avg Engagement (Instagram)',
      value: (() => {
        const ig = dataPublikasi.filter(d => d.jenis === 'Instagram' && d.views && d.views > 0)
        if (ig.length === 0) return '-'
        const totalEngagement = ig.reduce(
          (sum, item) => sum + (item.likes! / item.views!) * 100,
          0
        )
        return `${(totalEngagement / ig.length).toFixed(1)}%`
      })(),
      icon: '📊',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Publikasi & Media</h1>
        <p className="text-blue-600">Pantau dan kelola publikasi media di seluruh platform</p>
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
                      width: `${Math.min((typeof card.value === 'number' ? card.value : 0) / Math.max(...summaryCards.map(c => typeof c.value === 'number' ? c.value : 0)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {typeof card.value === 'number' && card.value > 0 ? '📈 Aktif' : '⏳ Monitoring'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Terpopuler Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Unit Terpopuler dalam Media
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

            const percentage = ((count / dataPublikasi.length) * 100).toFixed(1)

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
                  
                  {/* Progress Bar */}
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
                      <span>{percentage}% total publikasi</span>
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

      {/* Media Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          Ringkasan Performa Media
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-600">
              {mediaCount['Media Online'] || 0}
            </div>
            <div className="text-sm text-blue-800">Media Online</div>
            <div className="text-xs text-blue-600 mt-1">Digital Platform</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">📺</div>
            <div className="text-2xl font-bold text-purple-600">
              {mediaCount['Media Massa'] || 0}
            </div>
            <div className="text-sm text-purple-800">Media Massa</div>
            <div className="text-xs text-purple-600 mt-1">Traditional Media</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">🌐</div>
            <div className="text-2xl font-bold text-green-600">
              {mediaCount['Website'] || 0}
            </div>
            <div className="text-sm text-green-800">Website</div>
            <div className="text-xs text-green-600 mt-1">Official Portal</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-indigo-600">
              {Object.keys(unitCount).length}
            </div>
            <div className="text-sm text-indigo-800">Unit Aktif</div>
            <div className="text-xs text-indigo-600 mt-1">Total Contributing</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Publikasi Media</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap publikasi di berbagai platform media</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Judul</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Jenis Media</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-right font-medium">Likes</th>
                <th className="px-6 py-3 text-right font-medium">Views</th>
                <th className="px-6 py-3 text-right font-medium">Engagement</th>
                <th className="px-6 py-3 text-center font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataPublikasi.map((item, index) => {
                const isInstagram = item.jenis === 'Instagram'
                const engagement =
                  isInstagram && item.views
                    ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                    : '-'

                // Tentukan badge untuk unit populer
                const unitRank = sortedUnits.findIndex(([unit]) => unit === item.unit)
                const isTopUnit = unitRank !== -1 && unitRank < 3

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.judul}</td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                        item.jenis === 'Media Online' ? 'bg-blue-100 text-blue-800' :
                        item.jenis === 'Media Massa' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.jenis === 'Instagram' ? '📱' :
                         item.jenis === 'Media Online' ? '💻' :
                         item.jenis === 'Media Massa' ? '📺' : '🌐'} {item.jenis}
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
                    <td className="px-6 py-4 text-right font-medium">
                      {isInstagram ? (
                        <span className="text-red-600">{item.likes}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {isInstagram ? (
                        <span className="text-blue-600">{item.views}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {engagement !== '-' ? (
                        <span className="text-green-600">{engagement}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a 
                        href={item.link} 
                        className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                      >
                        🔗 Lihat
                      </a>
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
          Proporsi Jenis Media
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
            <h3 className="font-medium text-gray-800 mb-3">Breakdown Media</h3>
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
                    {((item.value / dataPublikasi.length) * 100).toFixed(0)}%
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
