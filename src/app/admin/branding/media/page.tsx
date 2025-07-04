'use client'

import React from 'react'
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
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // State for popup
  const [showInactiveUnitsAlert, setShowInactiveUnitsAlert] = React.useState(false)

  // Transform and calculate data
  const dataPublikasi = publikasiData || []

  // Define all possible units
  const allUnits = [
    'BIRO_RENAKU',
    'DIT_APK2', 
    'POLTEK_JKT',
    'POLTEK_BDG',
    'POLTEK_SBY',
    'POLTEK_MLG',
    'POLTEK_SMG',
    'POLTEK_MDN',
    'POLTEK_PLB',
    'POLTEK_DPR',
    'POLTEK_BTN',
    'POLTEK_KSR',
  ]

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

  // Find inactive units
  const activeUnits = Object.keys(unitCount)
  const inactiveUnits = allUnits.filter(unit => !activeUnits.includes(unit))

  // Show popup when data loads
  React.useEffect(() => {
    if (dataPublikasi.length > 0 && inactiveUnits.length > 0) {
      const timer = setTimeout(() => {
        setShowInactiveUnitsAlert(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [dataPublikasi.length, inactiveUnits.length])

  // Sort units by post count
   const sortedUnits = Object.entries(unitCount)
     .sort(([, a], [, b]) => b - a)
     .slice(0, 3)

  // Pie chart data
  const pieData = Object.entries(mediaCount).map(([name, value]) => ({
    name,
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
    .map(([month, publikasi]) => ({
      month,
      publikasi,
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
    },
    { 
      label: 'Total Unit Aktif', 
      value: Object.keys(unitCount).length,
      icon: '🏢',
      color: 'green',
    },
    {
      label: 'Total Likes',
      value: totalSocialLikes.toLocaleString(),
      icon: '❤️',
      color: 'red',
    },
    {
      label: 'Total Views',
      value: totalSocialViews.toLocaleString(),
      icon: '👁️',
      color: 'purple',
    },
    {
      label: 'Instagram Engagement',
      value: `${avgInstagramEngagement}%`,
      icon: '📊',
      color: 'pink',
    },
    {
      label: 'Top Performer',
      value: sortedUnits.length > 0 ? sortedUnits[0][0].replace(/_/g, ' ') : 'N/A',
      icon: '🏆',
      color: 'yellow',
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
      {/* Alert Modal for Inactive Units */}
      {showInactiveUnitsAlert && inactiveUnits.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 transform transition-all max-h-[80vh] overflow-y-auto">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Perhatian: Unit Kerja Belum Aktif
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Beberapa unit kerja belum mengisi publikasi media.
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center justify-center">
                  <span className="mr-2">📋</span>
                  Unit Kerja yang Belum Mengisi ({inactiveUnits.length} unit)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {inactiveUnits.map((unit) => (
                    <div 
                      key={unit}
                      className="bg-white rounded-lg p-3 border border-orange-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {unit.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          0 publikasi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowInactiveUnitsAlert(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Publikasi & Media</h1>
          <p className="text-blue-600">Pantau dan kelola publikasi media</p>
        </div>
        <div className="flex items-center gap-3">
          {inactiveUnits.length > 0 && (
            <button
              onClick={() => setShowInactiveUnitsAlert(true)}
              className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2 border border-orange-200"
            >
              <span>📢</span>
              <span className="text-sm font-medium">
                {inactiveUnits.length} Unit Belum Aktif
              </span>
            </button>
          )}
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl shadow-lg border-l-4 border-${card.color}-500 p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-${card.color}-800 mb-1`}>
                  {card.label}
                </p>
                <p className={`text-3xl font-bold text-${card.color}-600`}>
                  {card.value}
                </p>
              </div>
              <div className={`bg-${card.color}-100 p-3 rounded-full`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Proporsi Jenis Media</h2>
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
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tren Publikasi Bulanan</h2>
          {barData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="publikasi" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
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

      {/* Top Performing Units Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Top 3 Unit Kerja Terbaik
        </h2>
        {sortedUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedUnits.map(([unit, count], index) => {
              const medals = ['🥇', '🥈', '🥉']
              const colors = ['yellow', 'gray', 'orange']
              return (
                <div
                  key={unit}
                  className={`bg-gradient-to-br from-${colors[index]}-100 to-${colors[index]}-200 rounded-lg p-4 border border-${colors[index]}-300`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{medals[index]}</div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      Peringkat {index + 1}
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      {unit.replace(/_/g, ' ')}
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-${colors[index]}-300 text-${colors[index]}-800 text-sm font-semibold`}>
                      {count} publikasi
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Belum ada data ranking unit kerja</p>
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Publikasi Media</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Judul</th>
                <th className="px-6 py-3 text-left font-medium">Jenis Media</th>
                <th className="px-6 py-3 text-left font-medium">Unit Kerja</th>
                <th className="px-6 py-3 text-right font-medium">Likes</th>
                <th className="px-6 py-3 text-right font-medium">Views</th>
                <th className="px-6 py-3 text-center font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataPublikasi.length > 0 ? (
                dataPublikasi.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.judul.length > 50 ? `${item.judul.substring(0, 50)}...` : item.judul}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.users.unit_kerja}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.likes ? item.likes.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.views ? item.views.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a 
                        href={item.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                      >
                        🔗 Lihat
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data publikasi
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
