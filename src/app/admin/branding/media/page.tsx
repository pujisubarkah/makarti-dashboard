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

interface SummaryResponse {
  unit_kerja_sudah_isi: string[]
  unit_kerja_belum_isi: string[]
  summary: {
    total_sudah_isi: number
    total_belum_isi: number
    total_unit_kerja: number
  }
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

  // SWR hook for summary data
  const { 
    data: summaryData, 
    error: summaryError,
    isLoading: summaryLoading 
  } = useSWR('/api/publikasi/summary', async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.status} ${response.statusText}`)
    }
    const result: SummaryResponse = await response.json()
    return result
  }, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // State for popup
  const [showInactiveUnitsAlert, setShowInactiveUnitsAlert] = React.useState(false)
  
  // State for pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  // Transform and calculate data
  const dataPublikasi = publikasiData || []

  // Pagination calculations
  const totalPages = Math.ceil(dataPublikasi.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = dataPublikasi.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

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

  // Find inactive units from summary data
  const inactiveUnits = summaryData ? summaryData.unit_kerja_belum_isi : []

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
      value: summaryData ? summaryData.summary.total_sudah_isi : Object.keys(unitCount).length,
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
      Promise.all([mutate(), summaryData ? fetch('/api/publikasi/summary').then(() => {}) : Promise.resolve()]),
      {
        loading: 'Memperbarui data...',
        success: 'Data berhasil diperbarui!',
        error: 'Gagal memperbarui data',
      }
    )
  }

  if (isLoading || summaryLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data publikasi...</p>
        </div>
      </div>
    )
  }

  if (error || summaryError) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            Error: {error?.message || summaryError?.message}
          </p>
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
                {summaryData && (
                  <>
                    Dari {summaryData.summary.total_unit_kerja} total unit kerja, hanya{' '}
                    <span className="font-semibold text-green-600">
                      {summaryData.summary.total_sudah_isi} unit ({((summaryData.summary.total_sudah_isi / summaryData.summary.total_unit_kerja) * 100).toFixed(1)}%)
                    </span>{' '}
                    yang sudah aktif mengisi publikasi media.{' '}
                    <span className="font-semibold text-orange-600">
                      {summaryData.summary.total_belum_isi} unit ({((summaryData.summary.total_belum_isi / summaryData.summary.total_unit_kerja) * 100).toFixed(1)}%)
                    </span>{' '}
                    masih belum aktif.
                  </>
                )}
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center justify-center">
                  <span className="mr-2">📋</span>
                  Unit Kerja yang Belum Mengisi ({inactiveUnits.length} dari {summaryData?.summary.total_unit_kerja || 0} unit)
                </h4>
                
                {/* Progress Bar */}
                {summaryData && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Belum Aktif: {summaryData.summary.total_belum_isi}</span>
                      <span>Sudah Aktif: {summaryData.summary.total_sudah_isi}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="h-full flex">
                        <div 
                          className="bg-green-500 transition-all duration-300"
                          style={{ width: `${(summaryData.summary.total_sudah_isi / summaryData.summary.total_unit_kerja) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-orange-500 transition-all duration-300"
                          style={{ width: `${(summaryData.summary.total_belum_isi / summaryData.summary.total_unit_kerja) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600 font-medium">
                        {((summaryData.summary.total_sudah_isi / summaryData.summary.total_unit_kerja) * 100).toFixed(1)}% Aktif
                      </span>
                      <span className="text-orange-600 font-medium">
                        {((summaryData.summary.total_belum_isi / summaryData.summary.total_unit_kerja) * 100).toFixed(1)}% Belum Aktif
                      </span>
                    </div>
                  </div>
                )}
                
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
                {summaryData && (
                  <span className="ml-1 text-xs opacity-75">
                    ({((summaryData.summary.total_belum_isi / summaryData.summary.total_unit_kerja) * 100).toFixed(1)}%)
                  </span>
                )}
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Publikasi Media</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap publikasi media dari semua unit kerja</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-100 text-sm">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-white/20 text-white rounded px-2 py-1 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value={5} className="text-gray-800">5</option>
                  <option value={10} className="text-gray-800">10</option>
                  <option value={25} className="text-gray-800">25</option>
                  <option value={50} className="text-gray-800">50</option>
                </select>
                <span className="text-blue-100 text-sm">data per halaman</span>
              </div>
            </div>
          </div>
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
              {currentData.length > 0 ? (
                currentData.map((item, index) => {
                  const globalIndex = startIndex + index + 1; // Global row number
                  return (
                    <tr key={item.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 text-gray-600">{globalIndex}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.judul.length > 50 ? `${item.judul.substring(0, 50)}...` : item.judul}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                          item.jenis === 'TikTok' ? 'bg-purple-100 text-purple-800' :
                          item.jenis === 'YouTube' ? 'bg-red-100 text-red-800' :
                          item.jenis === 'Facebook' ? 'bg-blue-100 text-blue-800' :
                          item.jenis === 'Twitter' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.jenis === 'Instagram' ? '📸' :
                           item.jenis === 'TikTok' ? '🎵' :
                           item.jenis === 'YouTube' ? '📺' :
                           item.jenis === 'Facebook' ? '👥' :
                           item.jenis === 'Twitter' ? '🐦' : '📱'} {item.jenis}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {item.users.unit_kerja.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {item.likes ? (
                          <span className="text-red-600">❤️ {item.likes.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {item.views ? (
                          <span className="text-blue-600">👁️ {item.views.toLocaleString()}</span>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data publikasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {dataPublikasi.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                  <span className="font-medium">{Math.min(endIndex, dataPublikasi.length)}</span> dari{' '}
                  <span className="font-medium">{dataPublikasi.length}</span> hasil
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Sebelumnya
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        key="first-page"
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span key="start-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                    </>
                  )}
                  
                  {/* Pages around current page */}
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                      pages.push(
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span key="end-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                      <button
                        key="last-page"
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
