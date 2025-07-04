'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

type Penyelenggaraan = {
  id: number
  namaKegiatan: string
  tanggal: string
  jumlahPeserta: number
  jenis_bangkom_non_pelatihan: {
    jenis_bangkom: string
  }
  users: {
    unit_kerja: string
  }
}

export default function PesertaPage() {  const [data, setData] = useState<Penyelenggaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPenyelenggara, setSelectedPenyelenggara] = useState<string>('Semua')
  
  // New filter states
  const [selectedUnitKerja, setSelectedUnitKerja] = useState<string>('Semua')
  const [selectedJenisPelatihan, setSelectedJenisPelatihan] = useState<string>('Semua')
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Modal states
  const [showTopUnitAlert, setShowTopUnitAlert] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/penyelenggaraan')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Gagal fetch data penyelenggaraan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedPenyelenggara, selectedUnitKerja, selectedJenisPelatihan, sortField, sortDirection])

  // Dapatkan daftar penyelenggara unik
  const penyelenggaraList = Array.from(
    new Set(data.map((item) => item.users?.unit_kerja || 'Lainnya'))
  )

  // Dapatkan daftar unit kerja unik
  const unitKerjaList = Array.from(
    new Set(data.map((item) => item.users?.unit_kerja || 'Lainnya'))
  )

  // Dapatkan daftar jenis pelatihan unik
  const jenisPelatihanList = Array.from(
    new Set(data.map((item) => item.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'))
  )

  // Filter berdasarkan semua kriteria
  let filteredData = data
  
  if (selectedPenyelenggara !== 'Semua') {
    filteredData = filteredData.filter((item) => item.users?.unit_kerja === selectedPenyelenggara)
  }
  
  if (selectedUnitKerja !== 'Semua') {
    filteredData = filteredData.filter((item) => (item.users?.unit_kerja || 'Lainnya') === selectedUnitKerja)
  }
  
  if (selectedJenisPelatihan !== 'Semua') {
    filteredData = filteredData.filter((item) => (item.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya') === selectedJenisPelatihan)
  }

  // Apply sorting
  if (sortField) {
    filteredData = [...filteredData].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'namaKegiatan':
          aValue = a.namaKegiatan
          bValue = b.namaKegiatan
          break
        case 'tanggal':
          aValue = new Date(a.tanggal)
          bValue = new Date(b.tanggal)
          break
        case 'jenis':
          aValue = a.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
          bValue = b.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
          break
        case 'penyelenggara':
          aValue = a.users?.unit_kerja || 'Lainnya'
          bValue = b.users?.unit_kerja || 'Lainnya'
          break
        case 'jumlahPeserta':
          aValue = a.jumlahPeserta
          bValue = b.jumlahPeserta
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const totalPeserta = filteredData.reduce((acc, item) => acc + item.jumlahPeserta, 0)
  const totalKegiatan = filteredData.length

  // Hitung rata-rata peserta per kegiatan
  const rataRataPeserta = totalKegiatan > 0 ? (totalPeserta / totalKegiatan).toFixed(1) : '0'

  // Hitung jenis terbanyak
  const jenisCount = filteredData.reduce((acc, curr) => {
    const jenis = curr.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
    acc[jenis] = (acc[jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jenisTerbanyak = Object.entries(jenisCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  // Hitung top performing units berdasarkan total peserta
  const unitStats = Object.entries(
    filteredData.reduce((acc, item) => {
      const unit = item.users?.unit_kerja || 'Lainnya'
      if (!acc[unit]) {
        acc[unit] = { totalPeserta: 0, totalKegiatan: 0 }
      }
      acc[unit].totalPeserta += item.jumlahPeserta
      acc[unit].totalKegiatan += 1
      return acc
    }, {} as Record<string, { totalPeserta: number; totalKegiatan: number }>)
  )
    .map(([unit, stats]) => ({
      unit,
      totalPeserta: stats.totalPeserta,
      totalKegiatan: stats.totalKegiatan,
      rataRataPeserta: stats.totalPeserta / stats.totalKegiatan,
    }))
    .sort((a, b) => b.totalPeserta - a.totalPeserta)
    .slice(0, 3)

  // Show top unit alert when data loads
  useEffect(() => {
    if (data.length > 0 && unitStats.length > 0) {
      const timer = setTimeout(() => {
        setShowTopUnitAlert(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [data.length, unitStats.length])

  // Handler functions for modals
  const handleUnitClick = (unitName: string) => {
    setSelectedUnit(unitName)
    setShowUnitModal(true)
  }

  const getUnitDetails = (unitName: string) => {
    const unitData = filteredData.filter(item => (item.users?.unit_kerja || 'Lainnya') === unitName)
    
    const statusBreakdown = unitData.reduce((acc, item) => {
      const jenis = item.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
      acc[jenis] = (acc[jenis] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const monthlyBreakdown = unitData.reduce((acc, item) => {
      const month = new Date(item.tanggal).toLocaleDateString('id-ID', { 
        month: 'short',
        year: 'numeric'
      })
      acc[month] = (acc[month] || 0) + item.jumlahPeserta
      return acc
    }, {} as Record<string, number>)

    const recentActivities = unitData
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5)

    return {
      totalKegiatan: unitData.length,
      totalPeserta: unitData.reduce((sum, item) => sum + item.jumlahPeserta, 0),
      rataRataPeserta: unitData.length > 0 ? (unitData.reduce((sum, item) => sum + item.jumlahPeserta, 0) / unitData.length).toFixed(1) : '0',
      statusBreakdown,
      monthlyBreakdown,
      recentActivities,
      maxPeserta: Math.max(...unitData.map(item => item.jumlahPeserta)),
      minPeserta: Math.min(...unitData.map(item => item.jumlahPeserta))
    }
  }

  // Get the champion unit (top performer)
  const championUnit = unitStats.length > 0 ? unitStats[0] : null

  const summaryCards = [
    {
      label: 'Total Kegiatan',
      value: totalKegiatan,
      icon: '📚',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
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
      borderColor: 'border-green-500',
    },
    {
      label: 'Rata-rata Peserta',
      value: rataRataPeserta,
      icon: '📊',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
    },
    {
      label: 'Jenis Terbanyak',
      value: jenisTerbanyak,
      icon: '🏆',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
    },
  ]
  const barData = filteredData
    .sort((a, b) => b.jumlahPeserta - a.jumlahPeserta)
    .slice(0, 10)
    .map((item) => ({
      name: item.namaKegiatan.length > 30 ? item.namaKegiatan.substring(0, 30) + '...' : item.namaKegiatan,
      peserta: item.jumlahPeserta,
    }))

  // Data untuk pie chart jenis kegiatan
  const pieData = Object.entries(jenisCount).map(([jenis, count]) => ({
    name: jenis,
    value: count,
  }))

  return (
    <div className="p-6">
      {/* Top Unit Alert Popup */}
      {showTopUnitAlert && championUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white bg-opacity-20 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white bg-opacity-20 rounded-full translate-x-8 translate-y-8"></div>
            <div className="absolute top-1/2 right-0 w-12 h-12 bg-white bg-opacity-10 rounded-full translate-x-6"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-2">UNIT TERBAIK!</h2>
              <div className="bg-white bg-opacity-90 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">{championUnit.unit}</h3>
                <p className="text-yellow-700">
                  Memimpin dengan <span className="font-bold text-2xl text-yellow-800">{championUnit.totalPeserta}</span> peserta
                </p>
                <p className="text-yellow-600 text-sm">
                  dari <span className="font-semibold">{championUnit.totalKegiatan}</span> kegiatan pelatihan
                </p>
                <div className="flex justify-center space-x-2 mt-3">
                  <span className="text-2xl">🥇</span>
                  <span className="text-2xl">🎉</span>
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <p className="text-white text-sm mb-6">
                Unit dengan pencapaian peserta pelatihan terbanyak!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowTopUnitAlert(false);
                    handleUnitClick(championUnit.unit);
                  }}
                  className="w-full bg-white text-yellow-600 font-bold py-3 px-6 rounded-lg hover:bg-yellow-50 transition-colors shadow-lg"
                >
                  🔍 Lihat Detail Prestasi
                </button>
                <button
                  onClick={() => setShowTopUnitAlert(false)}
                  className="w-full bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Detail Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            {(() => {
              const isChampion = championUnit && championUnit.unit === selectedUnit;
              const unitDetails = getUnitDetails(selectedUnit);
              return (
                <>
                  <div className={`text-white p-6 ${
                    isChampion 
                      ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        {isChampion && (
                          <div className="flex items-center mb-2">
                            <span className="bg-white text-yellow-600 text-xs font-bold px-3 py-1 rounded-full mr-2">
                              🏆 UNIT TERBAIK
                            </span>
                            <span className="text-2xl">👑</span>
                          </div>
                        )}
                        <h2 className="text-2xl font-bold">Detail Unit Kerja</h2>
                        <p className={`text-sm mt-1 ${isChampion ? 'text-yellow-100' : 'text-blue-100'}`}>
                          {selectedUnit}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowUnitModal(false)}
                        className="text-white hover:text-red-200 transition-colors text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-6">
                      {/* Champion Celebration Section */}
                      {isChampion && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                          <div className="text-center">
                            <div className="text-4xl mb-3">🎉🏆🎉</div>
                            <h3 className="text-2xl font-bold text-yellow-800 mb-2">SELAMAT!</h3>
                            <p className="text-yellow-700 font-medium">
                              Unit ini adalah UNIT TERBAIK dengan pencapaian luar biasa!
                            </p>
                            <div className="flex justify-center space-x-3 mt-4">
                              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">🥇 Rank #1</span>
                              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">⭐ Champion</span>
                              <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">🚀 Top Performer</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg text-center ${isChampion ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50'}`}>
                          <div className={`text-2xl font-bold ${isChampion ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {unitDetails.totalPeserta}
                          </div>
                          <div className={`text-sm ${isChampion ? 'text-yellow-800' : 'text-blue-800'}`}>
                            Total Peserta
                          </div>
                          {isChampion && <div className="text-xs text-yellow-600 mt-1">👑 Terbanyak!</div>}
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {unitDetails.totalKegiatan}
                          </div>
                          <div className="text-sm text-green-800">Total Kegiatan</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {unitDetails.rataRataPeserta}
                          </div>
                          <div className="text-sm text-purple-800">Rata-rata Peserta</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-600">{unitDetails.maxPeserta}</div>
                          <div className="text-sm text-orange-800">Peserta Tertinggi</div>
                        </div>
                      </div>

                      {/* Activity Type Breakdown */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📊</span>
                          Breakdown Jenis Kegiatan
                          {isChampion && <span className="ml-2 text-yellow-600">🏆</span>}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Object.entries(unitDetails.statusBreakdown).map(([jenis, count]) => (
                            <div key={jenis} className="flex items-center justify-between bg-white p-3 rounded">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                📚 {jenis}
                              </span>
                              <span className="font-bold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Monthly Performance */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📈</span>
                          Performa Bulanan (Peserta)
                        </h3>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                          {Object.entries(unitDetails.monthlyBreakdown)
                            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                            .map(([month, peserta]) => (
                            <div key={month} className="flex items-center justify-between bg-white p-3 rounded">
                              <span className="text-gray-700">{month}</span>
                              <span className="font-bold text-gray-800">{peserta} peserta</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Activities */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📋</span>
                          Aktivitas Terbaru (5 Terakhir)
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {unitDetails.recentActivities.map((activity) => (
                            <div key={activity.id} className={`bg-white p-3 rounded border-l-4 ${
                              isChampion ? 'border-yellow-500' : 'border-blue-500'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{activity.namaKegiatan}</div>
                                  <div className="text-sm text-gray-600">
                                    {activity.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(activity.tanggal).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </div>
                                </div>
                                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  👥 {activity.jumlahPeserta}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                      onClick={() => setShowUnitModal(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Penyelenggaraaan Bangkom</h1>
        <p className="text-blue-600">Pantau dan kelola penyelenggaraan bangkom non-pelatihan di seluruh unit kerja</p>
      </div>

      {/* Champion Banner */}
      {championUnit && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="text-2xl font-bold">UNIT TERBAIK PENYELENGGARAAN BANGKOM</h2>
                <p className="text-yellow-100">
                  <span className="font-bold">{championUnit.unit}</span> memimpin dengan {championUnit.totalPeserta} peserta!
                </p>
                <p className="text-yellow-200 text-sm">
                  Dari {championUnit.totalKegiatan} kegiatan pelatihan
                </p>
              </div>
            </div>
            <div className="flex space-x-2 text-3xl">
              <span className="animate-bounce">🥇</span>
              <span className="animate-pulse">⭐</span>
              <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🎉</span>
            </div>
          </div>
        </div>
      )}

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
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>{card.label}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
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
                      width: `${Math.min(
                        (parseFloat(card.value.toString()) / Math.max(...summaryCards.map((c) => parseFloat(c.value.toString()) || 0))) *
                          100,
                        100
                      )}%`,
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
      {unitStats.length > 0 && (
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
                  icon: '🥇',
                },
                {
                  bg: 'from-gray-400 to-gray-500',
                  light: 'bg-gray-100',
                  text: 'text-gray-600',
                  dark: 'text-gray-800',
                  border: 'border-gray-500',
                  icon: '🥈',
                },
                {
                  bg: 'from-orange-400 to-orange-500',
                  light: 'bg-orange-100',
                  text: 'text-orange-600',
                  dark: 'text-orange-800',
                  border: 'border-orange-500',
                  icon: '🥉',
                },
              ][index]

              const percentage = ((unit.totalPeserta / totalPeserta) * 100).toFixed(1)

              return (
                <div
                  key={unit.unit}
                  onClick={() => handleUnitClick(unit.unit)}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden cursor-pointer`}
                >
                  <div className="p-6">
                    {index === 0 && (
                      <div className="text-center mb-3">
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                          🏆 CHAMPION
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${colors.dark} mb-1`}>{unit.unit}</p>
                        <p className={`text-3xl font-bold ${colors.text}`}>{unit.totalPeserta}</p>
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
                            width: `${(unit.totalPeserta / Math.max(...unitStats.map((u) => u.totalPeserta))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{unit.totalKegiatan} kegiatan</span>
                        <span className={`font-medium ${colors.text}`}>{percentage}% total peserta</span>
                      </div>
                    </div>
                    
                    {/* Click indicator */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-gray-200 transition-colors">
                        👆 Klik untuk detail
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Learning Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Pembelajaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold text-blue-600">
              {unitStats.length > 0 ? Math.max(...unitStats.map((u) => u.totalPeserta)) : 0}
            </div>
            <div className="text-sm text-blue-800">Peserta Tertinggi</div>
            <div className="text-xs text-blue-600 mt-1">Best Performance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {unitStats.length > 0 ? Math.max(...unitStats.map((u) => u.rataRataPeserta)).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-green-800">Rata-rata Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Per Kegiatan</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(jenisCount).length}</div>
            <div className="text-sm text-purple-800">Jenis Kegiatan</div>
            <div className="text-xs text-purple-600 mt-1">Variety</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter((u) => u.totalPeserta >= 100).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">100+ peserta</div>
          </div>
        </div>
      </div>      {/* Enhanced Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Filter Data Peserta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter Unit Kerja */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Unit Kerja:</label>
            <select
              value={selectedUnitKerja}
              onChange={(e) => setSelectedUnitKerja(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors"
            >
              <option value="Semua">Semua Unit Kerja</option>
              {unitKerjaList.map((nama, i) => (
                <option key={i} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis Pelatihan */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Jenis Pelatihan:</label>
            <select
              value={selectedJenisPelatihan}
              onChange={(e) => setSelectedJenisPelatihan(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors"
            >
              <option value="Semua">Semua Jenis Pelatihan</option>
              {jenisPelatihanList.map((jenis, i) => (
                <option key={i} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setSelectedUnitKerja('Semua')
                setSelectedJenisPelatihan('Semua')
                setSortField('')
                setSortDirection('asc')
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              🔄 Reset Filter
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedUnitKerja !== 'Semua' || selectedJenisPelatihan !== 'Semua' || sortField) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filter aktif:</span>
              {selectedUnitKerja !== 'Semua' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Unit: {selectedUnitKerja}
                  <button
                    onClick={() => setSelectedUnitKerja('Semua')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedJenisPelatihan !== 'Semua' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Jenis: {selectedJenisPelatihan}
                  <button
                    onClick={() => setSelectedJenisPelatihan('Semua')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortField && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sort: {sortField} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                  <button
                    onClick={() => {
                      setSortField('')
                      setSortDirection('asc')
                    }}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Table with Pagination */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Penyelenggaraan Bangkom</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap kegiatan bangkom non-pelatihan dan jumlah peserta</p>
              {/* Filter Summary */}
              {(selectedUnitKerja !== 'Semua' || selectedJenisPelatihan !== 'Semua') && (
                <div className="mt-2 text-blue-100 text-xs">
                  Filter: {selectedUnitKerja !== 'Semua' && `Unit: ${selectedUnitKerja}`}
                  {selectedUnitKerja !== 'Semua' && selectedJenisPelatihan !== 'Semua' && ' | '}
                  {selectedJenisPelatihan !== 'Semua' && `Jenis: ${selectedJenisPelatihan}`}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
              </div>
              <div className="text-xs text-blue-200">
                Halaman {currentPage} dari {totalPages}
              </div>
              {sortField && (
                <div className="text-xs text-blue-200 mt-1">
                  Diurutkan: {sortField} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                Memuat data...
              </div>
            </div>
          ) : (
            <table className="min-w-full">              <thead className="bg-gray-50 text-sm text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">No</th>
                  <th className="px-6 py-3 text-left font-medium">
                    <button
                      onClick={() => handleSort('namaKegiatan')}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Nama Kegiatan
                      <span className="ml-1 text-xs">{getSortIcon('namaKegiatan')}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <button
                      onClick={() => handleSort('tanggal')}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Tanggal
                      <span className="ml-1 text-xs">{getSortIcon('tanggal')}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <button
                      onClick={() => handleSort('jenis')}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Jenis
                      <span className="ml-1 text-xs">{getSortIcon('jenis')}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <button
                      onClick={() => handleSort('penyelenggara')}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Penyelenggara
                      <span className="ml-1 text-xs">{getSortIcon('penyelenggara')}</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    <button
                      onClick={() => handleSort('jumlahPeserta')}
                      className="flex items-center justify-end hover:text-blue-600 transition-colors w-full"
                    >
                      Jumlah Peserta
                      <span className="ml-1 text-xs">{getSortIcon('jumlahPeserta')}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {paginatedData.map((item, index) => {
                  const unitRank = unitStats.findIndex((u) => u.unit === (item.users?.unit_kerja || 'Lainnya'))
                  const isTopUnit = unitRank !== -1
                  const globalIndex = startIndex + index

                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">{globalIndex + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.namaKegiatan}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📚 {item.jenis_bangkom_non_pelatihan?.jenis_bangkom || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isTopUnit
                              ? unitRank === 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : unitRank === 1
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} {item.users?.unit_kerja || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.jumlahPeserta >= 50
                              ? 'bg-green-100 text-green-800'
                              : item.jumlahPeserta >= 20
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          👥 {item.jumlahPeserta}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {paginatedData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> hingga{' '}
                <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari{' '}
                <span className="font-medium">{filteredData.length}</span> hasil
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  ← Sebelumnya
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageClick(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      )}
                    </>
                  )}
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageClick(totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Top Kegiatan Berdasarkan Jumlah Peserta
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 100, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="peserta" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Jenis Kegiatan
          </h2>
          <div className="h-[400px]">
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
