'use client'

import React  from 'react'
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
import useSWR from 'swr'
import { toast } from 'sonner'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PublikasiItem {
  id: number
  judul: string
  tanggal: string
  jenis: string
  unit_kerja_id: number
  link: string
  likes: number | null
  views: number | null
  createdAt: string
  users: {
    id: number
    unit_kerja: string
  }
}

interface ApiResponse {
  data: PublikasiItem[]
}

const COLORS = ['#60a5fa', '#f472b6', '#34d399', '#facc15', '#8b5cf6', '#ef4444']

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }
  const result: ApiResponse = await response.json()
  return result.data
}

export default function MediaPage() {
  // SWR hook for data fetching
  const { 
    data: publikasiData, 
    error, 
    isLoading, 
    mutate 
  } = useSWR('/api/publikasi', fetcher, {
    refreshInterval: 60000, // Refresh setiap 1 menit
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // Transform and calculate data
  const dataPublikasi = publikasiData || []

  // Calculate media counts
  const mediaCount = dataPublikasi.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate posts per unit
  const unitCount = dataPublikasi.reduce((acc, item) => {
    const unitName = item.users.unit_kerja
    acc[unitName] = (acc[unitName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort units by post count
  const sortedUnits = Object.entries(unitCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // ambil 3 teratas

  // Pie chart data
  const pieData = Object.entries(mediaCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  // Monthly data for bar chart
  const monthlyData = dataPublikasi.reduce((acc, item) => {
    const month = new Date(item.tanggal).toLocaleDateString('id-ID', { 
      month: 'short',
      year: 'numeric'
    })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, count]) => ({
      month,
      publikasi: count,
    }))

  // Calculate Instagram metrics
  const instagramPosts = dataPublikasi.filter(d => d.jenis === 'Instagram')
  const totalInstagramLikes = instagramPosts.reduce((a, b) => a + (b.likes || 0), 0)
  const totalInstagramViews = instagramPosts.reduce((a, b) => a + (b.views || 0), 0)
  const avgInstagramEngagement = instagramPosts.length > 0 && totalInstagramViews > 0
    ? ((totalInstagramLikes / totalInstagramViews) * 100).toFixed(1)
    : '0'

  // Calculate all social media metrics
  const socialMediaPosts = dataPublikasi.filter(d => 
    ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter'].includes(d.jenis)
  )
  const totalSocialLikes = socialMediaPosts.reduce((a, b) => a + (b.likes || 0), 0)
  const totalSocialViews = socialMediaPosts.reduce((a, b) => a + (b.views || 0), 0)

  // Summary cards
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
      label: 'Total Unit Aktif', 
      value: Object.keys(unitCount).length,
      icon: '🏢',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    {
      label: 'Total Likes',
      value: totalSocialLikes.toLocaleString(),
      icon: '❤️',
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-100',
      textColor: 'text-red-600',
      textDark: 'text-red-800',
      borderColor: 'border-red-500'
    },
    {
      label: 'Total Views',
      value: totalSocialViews.toLocaleString(),
      icon: '👁️',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
  ]

  // Manual refresh function
  const handleRefresh = () => {
    toast.promise(
      mutate(),
      {
        loading: 'Memperbarui data...',
        success: 'Data berhasil diperbarui!',
        error: 'Gagal memperbarui data',
      }
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data publikasi...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Publikasi & Media</h1>
          <p className="text-blue-600">Pantau dan kelola publikasi media di seluruh platform</p>
          <p className="text-sm text-gray-500 mt-1">
            Data diperbarui: {dataPublikasi.length > 0 ? new Date().toLocaleString('id-ID') : 'Belum ada data'}
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
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
                      width: `${Math.min((typeof card.value === 'number' ? card.value : parseFloat(card.value.toString().replace(/,/g, '')) || 0) / Math.max(...summaryCards.map(c => typeof c.value === 'number' ? c.value : parseFloat(c.value.toString().replace(/,/g, '')) || 0)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {(typeof card.value === 'number' ? card.value : parseFloat(card.value.toString().replace(/,/g, ''))) > 0 ? '📈 Aktif' : '⏳ Monitoring'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Terpopuler Cards */}
      {sortedUnits.length > 0 && (
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
                        <p className={`text-sm font-medium ${colors.dark} mb-1`} title={unit}>
                          {unit.length > 30 ? `${unit.substring(0, 30)}...` : unit}
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
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🥧</span>
            Proporsi Jenis Media
          </h2>
          {pieData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Tren Publikasi Bulanan
          </h2>
          {barData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="publikasi" 
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Belum ada data untuk ditampilkan</p>
            </div>
          )}
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
          <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-2xl font-bold text-pink-600">
              {mediaCount['Instagram'] || 0}
            </div>
            <div className="text-sm text-pink-800">Instagram</div>
            <div className="text-xs text-pink-600 mt-1">
              {avgInstagramEngagement}% avg engagement
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">🌐</div>
            <div className="text-2xl font-bold text-green-600">
              {mediaCount['Website'] || 0}
            </div>
            <div className="text-sm text-green-800">Website</div>
            <div className="text-xs text-green-600 mt-1">Official Portal</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                <th className="px-6 py-3 text-left font-medium">Unit Kerja</th>
                <th className="px-6 py-3 text-right font-medium">Likes</th>
                <th className="px-6 py-3 text-right font-medium">Views</th>
                <th className="px-6 py-3 text-right font-medium">Engagement</th>
                <th className="px-6 py-3 text-center font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataPublikasi.length > 0 ? (
                dataPublikasi.map((item, index) => {
                  const hasSocialMetrics = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter'].includes(item.jenis)
                  const engagement =
                    hasSocialMetrics && item.views && item.views > 0
                      ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                      : '-'

                  // Tentukan badge untuk unit populer
                  const unitRank = sortedUnits.findIndex(([unit]) => unit === item.users.unit_kerja)
                  const isTopUnit = unitRank !== -1 && unitRank < 3

                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800" title={item.judul}>
                        {item.judul.length > 50 ? `${item.judul.substring(0, 50)}...` : item.judul}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                          item.jenis === 'TikTok' ? 'bg-red-100 text-red-800' :
                          item.jenis === 'YouTube' ? 'bg-red-100 text-red-800' :
                          item.jenis === 'Media Online' ? 'bg-blue-100 text-blue-800' :
                          item.jenis === 'Media Massa' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.jenis === 'Instagram' ? '📱' :
                           item.jenis === 'TikTok' ? '🎵' :
                           item.jenis === 'YouTube' ? '📺' :
                           item.jenis === 'Media Online' ? '💻' :
                           item.jenis === 'Media Massa' ? '📺' : '🌐'} {item.jenis}
                        </span>
                      </td>
                      <td className="px-6 py-4" title={item.users.unit_kerja}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isTopUnit 
                            ? unitRank === 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : unitRank === 1 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} 
                          {item.users.unit_kerja.length > 20 
                            ? `${item.users.unit_kerja.substring(0, 20)}...` 
                            : item.users.unit_kerja}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {hasSocialMetrics && item.likes ? (
                          <span className="text-red-600">{item.likes.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {hasSocialMetrics && item.views ? (
                          <span className="text-blue-600">{item.views.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {engagement !== '-' ? (
                          <span className={`${
                            parseFloat(engagement) > 5 ? 'text-green-600' :
                            parseFloat(engagement) > 2 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {engagement}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a 
                          href={item.link} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                        >
                          🔗 Lihat
                        </a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="font-medium">Tidak ada data publikasi</p>
                      <p className="text-sm">Data akan muncul setelah ada publikasi yang ditambahkan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
