'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const COLORS = ['#60a5fa', '#34d399', '#facc15']

// Interface untuk data koordinasi dari API
interface KoordinasiData {
  id: number;
  tanggal: string;
  instansi: string;
  jenisInstansi: string;
  topik: string;
  catatan: string | null;
  unit_kerja_id: number;
  createdAt: string;
  Status: string | null;
  users: {
    unit_kerja: string;
  };
}

const allMonths = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

export default function KoordinasiDashboardPage() {
  // State untuk data API
  const [rawData, setRawData] = useState<KoordinasiData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State untuk filters
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedJenis, setSelectedJenis] = useState('all')
  
  // State untuk pagination top units
  const [currentTopUnitsPage, setCurrentTopUnitsPage] = useState(1)
  const [topUnitsPerPage] = useState(6) // Show 6 units per page

  // State untuk pagination table
  const [currentTablePage, setCurrentTablePage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // State untuk modal
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State untuk champion alert
  const [showChampionAlert, setShowChampionAlert] = useState(false)

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/koordinasi')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: KoordinasiData[] = await response.json()
        setRawData(data)
        
      } catch (err) {
        console.error('Error fetching koordinasi data:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
        setRawData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Show champion alert after data loads
  useEffect(() => {
    if (!loading && !error && rawData.length > 0) {
      const timer = setTimeout(() => {
        setShowChampionAlert(true)
      }, 1500) // Show after 1.5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [loading, error, rawData.length])

  // Generate options from API data
  const allUnits = useMemo(() => {
    return [...new Set(rawData.map((d) => d.users.unit_kerja))].sort()
  }, [rawData])

  const allJenisInstansi = useMemo(() => {
    return [...new Set(rawData.map((d) => d.jenisInstansi))].sort()
  }, [rawData])

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const itemDate = new Date(item.tanggal)
      const monthMatch =
        selectedMonth === 'all' || (itemDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth
      const unitMatch = selectedUnit === 'all' || item.users.unit_kerja === selectedUnit
      const jenisMatch = selectedJenis === 'all' || item.jenisInstansi === selectedJenis
      return monthMatch && unitMatch && jenisMatch
    })
  }, [selectedMonth, selectedUnit, selectedJenis, rawData])

  const pieData = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      count[d.jenisInstansi] = (count[d.jenisInstansi] || 0) + 1
    })
    return Object.entries(count).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const barData = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      const itemDate = new Date(d.tanggal)
      const monthYear = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, '0')}`
      count[monthYear] = (count[monthYear] || 0) + 1
    })
    return Object.entries(count)
      .sort()
      .map(([name, value]) => ({ name, value }))
  }, [filteredData])

  // Hitung semua unit dengan koordinasi
  const allUnitCount = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      const unitKerja = d.users.unit_kerja
      count[unitKerja] = (count[unitKerja] || 0) + 1
    })
    return Object.entries(count).sort(([, a], [, b]) => b - a)
  }, [filteredData])

  // Function untuk mendapatkan detail unit yang dipilih
  const getUnitDetails = (unitName: string) => {
    const unitData = rawData.filter(d => d.users.unit_kerja === unitName)
    const jenisInstansiCount: Record<string, number> = {}
    const statusCount: Record<string, number> = {}
    const monthlyCount: Record<string, number> = {}
    const mitraInstansi: Record<string, number> = {}
    
    unitData.forEach(d => {
      // Count by jenis instansi
      jenisInstansiCount[d.jenisInstansi] = (jenisInstansiCount[d.jenisInstansi] || 0) + 1
      
      // Count by status (if available)
      if (d.Status) {
        statusCount[d.Status] = (statusCount[d.Status] || 0) + 1
      }
      
      // Count by month
      const date = new Date(d.tanggal)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1
      
      // Count by mitra instansi (unique instansi)
      mitraInstansi[d.instansi] = (mitraInstansi[d.instansi] || 0) + 1
    })

    return {
      totalKoordinasi: unitData.length,
      jenisInstansiBreakdown: Object.entries(jenisInstansiCount).map(([name, value]) => ({ name, value })),
      statusBreakdown: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
      monthlyBreakdown: Object.entries(monthlyCount).sort().map(([month, value]) => ({ month, value })),
      mitraInstansiBreakdown: Object.entries(mitraInstansi)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 mitra
        .map(([name, value]) => ({ name, value })),
      recentActivities: unitData
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        .slice(0, 5),
      avgPerMonth: unitData.length / Math.max(Object.keys(monthlyCount).length, 1),
      uniqueMitra: Object.keys(mitraInstansi).length,
      activeMonths: Object.keys(monthlyCount).length
    }
  }

  // Function untuk membuka modal
  const openUnitModal = (unitName: string) => {
    setSelectedUnitForModal(unitName)
    setIsModalOpen(true)
  }

  // Get top 3 for quick summary
  const topThreeUnits = useMemo(() => {
    return allUnitCount.slice(0, 3)
  }, [allUnitCount])

  // Get champion unit (most active unit)
  const championUnit = useMemo(() => {
    return allUnitCount.length > 0 ? allUnitCount[0] : null
  }, [allUnitCount])

  // Pagination untuk semua unit
  const totalTopUnitsPages = Math.ceil(allUnitCount.length / topUnitsPerPage)
  const startTopUnitsIndex = (currentTopUnitsPage - 1) * topUnitsPerPage
  const endTopUnitsIndex = startTopUnitsIndex + topUnitsPerPage
  const currentTopUnitsData = allUnitCount.slice(startTopUnitsIndex, endTopUnitsIndex)

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentTopUnitsPage(1)
    setCurrentTablePage(1) // Reset table pagination too
  }, [filteredData.length])

  // Summary cards data
  const summaryCards = [
    {
      label: 'Total Koordinasi',
      value: filteredData.length,
      icon: '🤝',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Instansi Pusat',
      value: filteredData.filter(d => d.jenisInstansi === 'Pusat').length,
      icon: '🏛️',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    {
      label: 'Instansi Daerah',
      value: filteredData.filter(d => d.jenisInstansi === 'Daerah').length,
      icon: '🏢',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Akademisi',
      value: filteredData.filter(d => d.jenisInstansi === 'Akademisi').length,
      icon: '🎓',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ]

  // Pagination calculations for table
  const totalTablePages = Math.ceil(filteredData.length / itemsPerPage)
  const startTableIndex = (currentTablePage - 1) * itemsPerPage
  const endTableIndex = startTableIndex + itemsPerPage
  const currentTableData = filteredData.slice(startTableIndex, endTableIndex)

  // Pagination handlers
  const handleTablePageChange = (page: number) => {
    setCurrentTablePage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentTablePage(1) // Reset to first page when changing items per page
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Koordinasi & Networking</h1>
        <p className="text-blue-600">Pantau dan kelola kegiatan koordinasi antar instansi</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data koordinasi...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mb-8">
          <div className="flex items-center mb-4">
            <div className="text-red-600 mr-3 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium text-lg">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Content - only show when not loading and no error */}
      {!loading && !error && rawData.length > 0 && (
        <>
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

      {/* Champion Alert - appears after data loads */}
      {showChampionAlert && championUnit && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 mb-8 relative overflow-hidden">
          <button
            onClick={() => setShowChampionAlert(false)}
            className="absolute top-4 right-4 text-yellow-800 hover:text-yellow-900 text-xl font-bold"
          >
            ×
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-900 mb-1">
                  🎉 Selamat kepada Unit Champion!
                </h3>
                <p className="text-yellow-800 mb-2">
                  <span className="font-semibold">{championUnit[0]}</span> merupakan unit paling aktif 
                  dengan <span className="font-bold">{championUnit[1]} kegiatan koordinasi</span>!
                </p>
                <p className="text-yellow-700 text-sm">
                  Unit ini menunjukkan komitmen luar biasa dalam networking dan koordinasi antar instansi.
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <button
                onClick={() => {
                  openUnitModal(championUnit[0])
                  setShowChampionAlert(false)
                }}
                className="bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors shadow-md"
              >
                🏅 Lihat Detail Prestasi
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 opacity-10">
            <span className="text-6xl">🎊</span>
          </div>
          <div className="absolute bottom-0 left-0 opacity-10">
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      )}

      {/* Top Performing Units */}
      {topThreeUnits.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Top 3 Unit Paling Aktif dalam Koordinasi
            <span className="ml-2 text-sm text-gray-500 font-normal">(Klik untuk detail)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThreeUnits.map(([unit, count]: [string, number], index: number) => {
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

              const percentage = ((count / filteredData.length) * 100).toFixed(1)

              return (
                <div
                  key={unit}
                  onClick={() => openUnitModal(unit)}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden cursor-pointer`}
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
                            width: `${(count / Math.max(...topThreeUnits.map(([, c]: [string, number]) => c))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{percentage}% total koordinasi</span>
                        <span className={`font-medium ${colors.text}`}>
                          Rank #{index + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Click indicator */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
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

      {/* All Units Performance with Pagination */}
      {allUnitCount.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Semua Unit Kerja - Performance Koordinasi
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Total: {allUnitCount.length} unit kerja aktif
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Halaman {currentTopUnitsPage} dari {totalTopUnitsPages}
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 font-semibold text-sm">Top Performers</div>
              <div className="text-green-800 text-2xl font-bold">
                {allUnitCount.filter(([, count]) => count >= (allUnitCount[0]?.[1] || 0) * 0.7).length}
              </div>
              <div className="text-green-600 text-xs">≥70% dari terbaik</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-600 font-semibold text-sm">Active Units</div>
              <div className="text-blue-800 text-2xl font-bold">
                {allUnitCount.filter(([, count]) => count >= 3).length}
              </div>
              <div className="text-blue-600 text-xs">≥3 koordinasi</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-purple-600 font-semibold text-sm">Avg Performance</div>
              <div className="text-purple-800 text-2xl font-bold">
                {(allUnitCount.reduce((sum, [, count]) => sum + count, 0) / allUnitCount.length).toFixed(1)}
              </div>
              <div className="text-purple-600 text-xs">koordinasi/unit</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-orange-600 font-semibold text-sm">Total Koordinasi</div>
              <div className="text-orange-800 text-2xl font-bold">
                {allUnitCount.reduce((sum, [, count]) => sum + count, 0)}
              </div>
              <div className="text-orange-600 text-xs">keseluruhan</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTopUnitsData.map(([unit, count]: [string, number], index: number) => {
              const globalIndex = startTopUnitsIndex + index
              const percentage = ((count / filteredData.length) * 100).toFixed(1)
              
              // Dynamic colors based on performance
              const getColorByRank = (rank: number) => {
                if (rank < 3) {
                  return {
                    bg: 'from-green-400 to-green-500',
                    light: 'bg-green-100',
                    text: 'text-green-600',
                    dark: 'text-green-800',
                    border: 'border-green-500'
                  }
                } else if (rank < 6) {
                  return {
                    bg: 'from-blue-400 to-blue-500',
                    light: 'bg-blue-100',
                    text: 'text-blue-600',
                    dark: 'text-blue-800',
                    border: 'border-blue-500'
                  }
                } else {
                  return {
                    bg: 'from-gray-400 to-gray-500',
                    light: 'bg-gray-100',
                    text: 'text-gray-600',
                    dark: 'text-gray-800',
                    border: 'border-gray-500'
                  }
                }
              }

              const colors = getColorByRank(globalIndex)
              const maxCount = Math.max(...allUnitCount.map(([, c]: [string, number]) => c))

              return (
                <div
                  key={unit}
                  onClick={() => openUnitModal(unit)}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden cursor-pointer`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${colors.light} ${colors.text} font-medium`}>
                            #{globalIndex + 1}
                          </span>
                          {globalIndex < 3 && (
                            <span className="text-lg">
                              {['🥇', '🥈', '🥉'][globalIndex]}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-medium ${colors.dark} mb-2 leading-tight`}>
                          {unit}
                        </p>
                        <p className={`text-2xl font-bold ${colors.text}`}>
                          {count} koordinasi
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Performance</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-500`}
                            style={{ 
                              width: `${(count / maxCount) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>{percentage}% dari total</span>
                        <span className={`font-medium ${colors.text}`}>
                          {globalIndex < 3 ? '🌟 Top Performer' : 
                           globalIndex < 6 ? '⭐ Active' : '📈 Contributing'}
                        </span>
                      </div>
                      
                      {/* Click indicator */}
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                          👆 Klik untuk detail
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination for Units */}
          {totalTopUnitsPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan {startTopUnitsIndex + 1} hingga {Math.min(endTopUnitsIndex, allUnitCount.length)} dari {allUnitCount.length} unit
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTopUnitsPage(Math.max(1, currentTopUnitsPage - 1))}
                  disabled={currentTopUnitsPage === 1}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentTopUnitsPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  ← Sebelumnya
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalTopUnitsPages, 5) }, (_, i) => {
                    const pageNum = currentTopUnitsPage <= 3 ? i + 1 : 
                                   currentTopUnitsPage >= totalTopUnitsPages - 2 ? totalTopUnitsPages - 4 + i :
                                   currentTopUnitsPage - 2 + i
                    
                    if (pageNum < 1 || pageNum > totalTopUnitsPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentTopUnitsPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentTopUnitsPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentTopUnitsPage(Math.min(totalTopUnitsPages, currentTopUnitsPage + 1))}
                  disabled={currentTopUnitsPage === totalTopUnitsPages}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentTopUnitsPage === totalTopUnitsPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Filter Data Koordinasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <Select onValueChange={setSelectedMonth} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {allMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Kerja</label>
            <Select onValueChange={setSelectedUnit} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Unit Kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Unit</SelectItem>
                {allUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Instansi</label>
            <Select onValueChange={setSelectedJenis} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Jenis Instansi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {allJenisInstansi.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {jenis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Kegiatan Koordinasi</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap kegiatan koordinasi antar instansi</p>
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
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Unit Kerja</th>
                <th className="px-6 py-3 text-left font-medium">Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Jenis Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Topik</th>
                <th className="px-6 py-3 text-left font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {currentTableData.map((item, idx) => {
                const unitRank = allUnitCount.findIndex(([unit]: [string, number]) => unit === item.users.unit_kerja)
                const isTopUnit = unitRank !== -1 && unitRank < 3
                const globalIndex = startTableIndex + idx + 1 // Global row number

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{globalIndex}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
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
                        {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} {item.users.unit_kerja}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.instansi.includes('Kementerian') && <span className="mr-1">🏛️</span>}
                      {item.instansi.includes('Universitas') && <span className="mr-1">🎓</span>}
                      {item.instansi.includes('Pemerintah') && <span className="mr-1">🏢</span>}
                      {item.instansi}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenisInstansi === 'Pusat' ? 'bg-green-100 text-green-800' :
                        item.jenisInstansi === 'Daerah' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.jenisInstansi === 'Pusat' ? '🏛️' :
                         item.jenisInstansi === 'Daerah' ? '🏢' : '🎓'} {item.jenisInstansi}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.topik}</td>
                    <td className="px-6 py-4 text-gray-600">{item.catatan || '-'}</td>
                  </tr>
                )
              })}
              {currentTableData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {filteredData.length === 0 
                      ? "Tidak ada data koordinasi untuk filter yang dipilih"
                      : "Tidak ada data pada halaman ini"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startTableIndex + 1}</span> sampai{' '}
                <span className="font-medium">{Math.min(endTableIndex, filteredData.length)}</span> dari{' '}
                <span className="font-medium">{filteredData.length}</span> hasil
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handleTablePageChange(currentTablePage - 1)}
                disabled={currentTablePage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Sebelumnya
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {/* First page */}
                {currentTablePage > 3 && (
                  <>
                    <button
                      key="first-page"
                      onClick={() => handleTablePageChange(1)}
                      className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentTablePage > 4 && <span key="start-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                  </>
                )}
                
                {/* Pages around current page */}
                {(() => {
                  const pages = [];
                  const startPage = Math.max(1, currentTablePage - 2);
                  const endPage = Math.min(totalTablePages, currentTablePage + 2);
                  
                  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                    pages.push(
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handleTablePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                          currentTablePage === pageNum
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
                {currentTablePage < totalTablePages - 2 && (
                  <>
                    {currentTablePage < totalTablePages - 3 && <span key="end-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                    <button
                      key="last-page"
                      onClick={() => handleTablePageChange(totalTablePages)}
                      className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {totalTablePages}
                    </button>
                  </>
                )}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handleTablePageChange(currentTablePage + 1)}
                disabled={currentTablePage === totalTablePages}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Proporsi Jenis Instansi
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

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Tren Kegiatan per Bulan
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="value" 
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
        </>
      )}

      {/* Empty State */}
      {!loading && !error && rawData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Belum Ada Data Koordinasi</h3>
          <p className="text-gray-600 mb-4">Data koordinasi belum tersedia atau belum ada yang ditambahkan.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      )}

      {/* Unit Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-800">
              <span>📊</span>
              Detail Koordinasi - {selectedUnitForModal}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUnitForModal && (
            <div className="space-y-6 mt-4">
              {(() => {
                const unitDetails = getUnitDetails(selectedUnitForModal)
                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-semibold text-sm">Total Koordinasi</div>
                        <div className="text-blue-800 text-2xl font-bold">{unitDetails.totalKoordinasi}</div>
                        <div className="text-blue-600 text-xs">kegiatan koordinasi</div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-green-600 font-semibold text-sm">Rata-rata/Bulan</div>
                        <div className="text-green-800 text-2xl font-bold">{unitDetails.avgPerMonth.toFixed(1)}</div>
                        <div className="text-green-600 text-xs">koordinasi per bulan</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-semibold text-sm">Mitra Instansi</div>
                        <div className="text-purple-800 text-2xl font-bold">{unitDetails.uniqueMitra}</div>
                        <div className="text-purple-600 text-xs">instansi berbeda</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-orange-600 font-semibold text-sm">Bulan Aktif</div>
                        <div className="text-orange-800 text-2xl font-bold">{unitDetails.activeMonths}</div>
                        <div className="text-orange-600 text-xs">bulan dengan aktivitas</div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Jenis Instansi Breakdown */}
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Breakdown Jenis Instansi</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={unitDetails.jenisInstansiBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {unitDetails.jenisInstansiBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Monthly Trend */}
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Trend Bulanan</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={unitDetails.monthlyBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Additional Breakdowns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status Breakdown */}
                      {unitDetails.statusBreakdown.length > 0 && (
                        <div className="bg-white border rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Koordinasi</h3>
                          <div className="space-y-3">
                            {unitDetails.statusBreakdown.map(({ name, value }, index) => (
                              <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  ></div>
                                  <span className="text-sm text-gray-600">{name}</span>
                                </div>
                                <span className="font-medium text-gray-800">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top Mitra Instansi */}
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Mitra Instansi</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {unitDetails.mitraInstansiBreakdown.map(({ name, value }, index) => (
                            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                  #{index + 1}
                                </span>
                                <span className="text-sm text-gray-700 truncate" title={name}>
                                  {name.length > 30 ? `${name.substring(0, 30)}...` : name}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {value} kegiatan
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">5 Aktivitas Koordinasi Terbaru</h3>
                      <div className="space-y-3">
                        {unitDetails.recentActivities.map((activity, index) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800">{activity.instansi}</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                  {activity.jenisInstansi}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{activity.topik}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>📅 {new Date(activity.tanggal).toLocaleDateString('id-ID')}</span>
                                {activity.Status && (
                                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded">
                                    {activity.Status}
                                  </span>
                                )}
                              </div>
                              {activity.catatan && (
                                <p className="text-xs text-gray-500 mt-1 italic">&quot;{activity.catatan}&quot;</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
