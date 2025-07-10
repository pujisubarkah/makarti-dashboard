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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PelatihanData {
  id: number
  pegawai_id: number
  unit_kerja_id: number
  judul: string
  jam: number
  tanggal: string
  pegawai: {
    nama: string
  }
  users: {
    unit_kerja: string
    alias: string
  }
}

interface ProcessedData {
  id: number
  nama: string
  unit: string
  alias: string
  judul: string
  jam: number
  tanggal: string
}

// Tambahkan tipe untuk persen input unit
interface PersenInputUnit {
  unit_kerja: string
  total_pegawai: number
  jumlah_yang_input: number
  belum_input: number
  persentase_input: string
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

export default function PelatihanPage() {
  const [dataPelatihan, setDataPelatihan] = useState<ProcessedData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [searchName, setSearchName] = useState<string>('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProcessedData | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  // State untuk modal dan champion alert
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<string | null>(null)
  const [showChampionAlert, setShowChampionAlert] = useState(false)

  // Tambah state untuk data persentase input per unit
  const [persenInputUnits, setPersenInputUnits] = useState<PersenInputUnit[]>([])
  const [loadingPersenInput, setLoadingPersenInput] = useState(true)
  const [errorPersenInput, setErrorPersenInput] = useState<string | null>(null)

  useEffect(() => {
    fetchPelatihanData()
  }, [])

  // Show champion alert after data loads
  useEffect(() => {
    if (!loading && !error && dataPelatihan.length > 0) {
      const timer = setTimeout(() => {
        setShowChampionAlert(true)
      }, 2000) // Show after 2 seconds
      
      return () => clearTimeout(timer)
    }
  }, [loading, error, dataPelatihan.length])

  // Fetch data persentase input per unit
  useEffect(() => {
    const fetchPersenInput = async () => {
      try {
        setLoadingPersenInput(true)
        const res = await fetch('/api/pelatihan_pegawai/perPegawai')
        if (!res.ok) throw new Error('Gagal fetch data persentase input')
        const data: PersenInputUnit[] = await res.json()
        // Urutkan berdasarkan persentase_input (desc)
        const sorted = [...data].sort((a, b) => parseFloat(b.persentase_input) - parseFloat(a.persentase_input))
        setPersenInputUnits(sorted)
      } catch {
        setErrorPersenInput('Gagal memuat data persentase input')
      } finally {
        setLoadingPersenInput(false)
      }
    }
    fetchPersenInput()
  }, [])

  const fetchPelatihanData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pelatihan_pegawai')
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const data: PelatihanData[] = await response.json()
        // Transform API data to match component structure
      const processedData: ProcessedData[] = data.map(item => ({
        id: item.id,
        nama: item.pegawai?.nama || 'Unknown',
        unit: item.users?.unit_kerja || 'Unknown Unit',
        alias: item.users?.alias || 'Unknown',
        judul: item.judul,
        jam: item.jam,
        tanggal: new Date(item.tanggal).toLocaleDateString('id-ID')
      }))

      setDataPelatihan(processedData)
    } catch (err) {
      console.error('Error fetching pelatihan data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Sorting function
  const handleSort = (key: keyof ProcessedData) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1) // Reset to first page when sorting
  }
  // Get sorted and filtered data
  const getSortedAndFilteredData = () => {
    let filteredData = [...dataPelatihan]
    
    // Apply unit filter
    if (selectedUnit) {
      filteredData = filteredData.filter(item => item.unit === selectedUnit)
    }

    // Apply name search filter
    if (searchName.trim()) {
      filteredData = filteredData.filter(item => 
        item.nama.toLowerCase().includes(searchName.toLowerCase().trim())
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filteredData
  }

  // Get unique units for filter dropdown
  const uniqueUnits = Array.from(new Set(dataPelatihan.map(item => item.unit))).sort()

  // Helper function to highlight search term
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold text-yellow-800">
          {part}
        </span>
      ) : part
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600">Loading data pelatihan...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={fetchPelatihanData}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Ringkasan
  const totalJam = dataPelatihan.reduce((sum, item) => sum + item.jam, 0)
  const totalPegawai = new Set(dataPelatihan.map(d => d.nama)).size
  const totalUnit = new Set(dataPelatihan.map(d => d.unit)).size
  // Hitung rata-rata jam per unit untuk ranking
  const unitStats = Object.entries(
    dataPelatihan.reduce((acc, item) => {
      if (!acc[item.unit]) {
        acc[item.unit] = { totalJam: 0, pegawai: new Set(), alias: item.alias }
      }
      acc[item.unit].totalJam += item.jam
      acc[item.unit].pegawai.add(item.nama)
      return acc
    }, {} as Record<string, { totalJam: number; pegawai: Set<string>; alias: string }>)
  ).map(([unit, stats]) => ({
    unit,
    alias: stats.alias,
    totalJam: stats.totalJam,
    jumlahPegawai: stats.pegawai.size,
    rataJam: stats.totalJam / stats.pegawai.size
  })).sort((a, b) => b.rataJam - a.rataJam)
  const topPerformingUnits = unitStats.slice(0, 3)

  // Get filtered and sorted data
  const filteredAndSortedData = getSortedAndFilteredData()

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Function untuk membuka modal unit
  const handleUnitClick = (unitName: string) => {
    setSelectedUnitForModal(unitName)
    setShowUnitModal(true)
  }

  // Function untuk mendapatkan detail unit
  const getUnitDetails = (unitName: string) => {
    const unitData = dataPelatihan.filter(item => item.unit === unitName)
    const uniqueParticipants = [...new Set(unitData.map(item => item.nama))]
    
    // Breakdown by training hours
    const hoursBreakdown = unitData.reduce((acc, item) => {
      const range = item.jam >= 10 ? '10+ jam' : 
                   item.jam >= 7 ? '7-9 jam' : 
                   item.jam >= 4 ? '4-6 jam' : '1-3 jam'
      acc[range] = (acc[range] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Monthly breakdown
    const monthlyBreakdown = unitData.reduce((acc, item) => {
      const date = new Date(item.tanggal.split('/').reverse().join('-'))
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Training topics breakdown
    const topicsBreakdown = unitData.reduce((acc, item) => {
      acc[item.judul] = (acc[item.judul] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalHours = unitData.reduce((sum, item) => sum + item.jam, 0)
    const avgHours = uniqueParticipants.length > 0 ? totalHours / uniqueParticipants.length : 0

    return {
      totalPelatihan: unitData.length,
      totalParticipants: uniqueParticipants.length,
      totalHours,
      avgHours,
      hoursBreakdown: Object.entries(hoursBreakdown).map(([range, count]) => ({ name: range, value: count })),
      monthlyBreakdown: Object.entries(monthlyBreakdown)
        .sort()
        .map(([month, count]) => ({ month, value: count })),
      topTrainings: Object.entries(topicsBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count })),
      recentTrainings: unitData
        .sort((a, b) => new Date(b.tanggal.split('/').reverse().join('-')).getTime() - 
                       new Date(a.tanggal.split('/').reverse().join('-')).getTime())
        .slice(0, 5),
      unitRank: topPerformingUnits.findIndex(u => u.unit === unitName) + 1
    }
  }

  const summaryCards = [
    { 
      label: 'Total Pelatihan', 
      value: dataPelatihan.length,
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
      value: totalPegawai,
      icon: '👥',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    { 
      label: 'Rata-rata Jam per Pegawai', 
      value: totalPegawai > 0 ? (totalJam / totalPegawai).toFixed(1) : '0',
      icon: '⏰',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    { 
      label: 'Unit Terlibat', 
      value: totalUnit,
      icon: '🏢',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ]  // Data untuk grafik rata-rata jam pelatihan per unit
  const barDataRataJam = unitStats.map(unit => ({
    unitKerja: unit.alias,
    rataJam: parseFloat(unit.rataJam.toFixed(1)),
    totalJam: unit.totalJam,
    pegawai: unit.jumlahPegawai
  }))

  // Data untuk bar chart distribusi pelatihan per unit
  const barDataDistribusi = Object.entries(
    dataPelatihan.reduce((acc, item) => {
      acc[item.alias] = (acc[item.alias] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([alias, count]) => ({ unitKerja: alias, count }))

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Pelatihan & Learning</h1>
        <p className="text-blue-600">Pantau dan kelola program pelatihan pegawai di seluruh unit kerja</p>
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
                      width: `${Math.min((parseFloat(card.value.toString()) / Math.max(...summaryCards.map(c => parseFloat(c.value.toString())))) * 100, 100)}%` 
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

      {/* Champion Alert - appears after data loads */}
      {showChampionAlert && topPerformingUnits.length > 0 && (
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
                  🎉 Selamat kepada Unit Learning Champion!
                </h3>
                <p className="text-yellow-800 mb-2">
                  <span className="font-semibold">{topPerformingUnits[0].unit}</span> merupakan unit dengan 
                  rata-rata jam pelatihan tertinggi <span className="font-bold">{topPerformingUnits[0].rataJam.toFixed(1)} jam per pegawai</span>!
                </p>
                <p className="text-yellow-700 text-sm">
                  Unit ini menunjukkan komitmen luar biasa dalam pengembangan SDM dan pembelajaran berkelanjutan.
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <button
                onClick={() => {
                  handleUnitClick(topPerformingUnits[0].unit)
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
      {topPerformingUnits.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Unit Terbaik (Rata-rata Jam Pelatihan Tertinggi)
            <span className="ml-2 text-sm text-gray-500 font-normal">(Klik untuk detail)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformingUnits.map((unit, index) => {
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

              return (
                <div
                  key={unit.unit}
                  onClick={() => handleUnitClick(unit.unit)}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden cursor-pointer`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${colors.dark} mb-1`}>
                          {unit.unit}
                        </p>
                        <p className={`text-3xl font-bold ${colors.text}`}>
                          {unit.rataJam.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600">jam/pegawai</p>
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
                            width: `${(unit.rataJam / Math.max(...topPerformingUnits.map(u => u.rataJam))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{unit.jumlahPegawai} pegawai</span>
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

      {/* Persentase Penginputan Bangkom Terbaik */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📥</span>
          Unit dengan Persentase Penginputan Pelatihan Bangkom Terbaik
        </h2>
        {loadingPersenInput ? (
          <div className="text-blue-500">Loading...</div>
        ) : errorPersenInput ? (
          <div className="text-red-500">{errorPersenInput}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {persenInputUnits.slice(0, 3).map((unit, idx) => (
              <div key={unit.unit_kerja} className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 shadow group hover:scale-105 transition-all border-l-4 border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">{unit.unit_kerja}</p>
                    <p className="text-2xl font-bold text-green-600">{unit.persentase_input}</p>
                    <p className="text-xs text-gray-600">{unit.jumlah_yang_input} dari {unit.total_pegawai} pegawai</p>
                  </div>
                  <div className="bg-blue-200 p-2 rounded-full">
                    <span className="text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: unit.persentase_input }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Pembelajaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalJam}
            </div>
            <div className="text-sm text-blue-800">Total Jam</div>
            <div className="text-xs text-blue-600 mt-1">Learning Hours</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {unitStats.length > 0 ? Math.max(...unitStats.map(u => u.rataJam)).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-green-800">Jam Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Best Performance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">
              {dataPelatihan.length > 0 ? Math.round((totalJam / dataPelatihan.length) * 10) / 10 : '0'}
            </div>
            <div className="text-sm text-purple-800">Rata-rata/Pelatihan</div>
            <div className="text-xs text-purple-600 mt-1">Per Session</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter(u => u.rataJam >= 8).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">8+ jam rata-rata</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">            <div>
              <h2 className="text-xl font-bold">Detail Pelatihan Pegawai</h2>              <p className="text-blue-100 text-sm">
                Daftar lengkap pelatihan yang telah diikuti pegawai
                {selectedUnit && (
                  <span className="ml-2 px-2 py-1 bg-blue-400 rounded text-xs">
                    📍 Filter: {selectedUnit}
                  </span>
                )}
                {searchName && (
                  <span className="ml-2 px-2 py-1 bg-blue-400 rounded text-xs">
                    🔍 Search: {searchName}
                  </span>
                )}
                {sortConfig.key && (
                  <span className="ml-2 px-2 py-1 bg-blue-400 rounded text-xs">
                    🔤 Sort: {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </p>
            </div><div className="text-blue-100 text-sm">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} dari {filteredAndSortedData.length} data
            </div>
          </div>
        </div>        {/* Filter Controls */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="unit-filter" className="text-sm font-medium text-gray-700">
                Filter Unit:
              </label>
              <select
                id="unit-filter"
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value)
                  setCurrentPage(1) // Reset to first page when filtering
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Unit</option>
                {uniqueUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="name-search" className="text-sm font-medium text-gray-700">
                Cari Nama:
              </label>
              <input
                id="name-search"
                type="text"
                placeholder="Ketik nama pegawai..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
              />
              {searchName && (
                <button
                  onClick={() => {
                    setSearchName('')
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>              {selectedUnit && (
              <button
                onClick={() => setSelectedUnit('')}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                ✕ Clear Unit Filter
              </button>
            )}

            {(selectedUnit || searchName || sortConfig.key) && (
              <button
                onClick={() => {
                  setSelectedUnit('')
                  setSearchName('')
                  setSortConfig({ key: null, direction: 'asc' })
                  setCurrentPage(1)
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                🔄 Reset All
              </button>
            )}            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>💡 Tip: Gunakan filter unit & search nama, lalu klik header kolom untuk sorting A-Z</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">          {filteredAndSortedData.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-sm text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">No</th>
                  <th 
                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nama Pegawai</span>
                      {sortConfig.key === 'nama' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Unit</span>
                      {sortConfig.key === 'unit' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative"
                    onClick={() => handleSort('judul')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Judul Pelatihan</span>
                      {sortConfig.key === 'judul' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative"
                    onClick={() => handleSort('jam')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Jam</span>
                      {sortConfig.key === 'jam' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative"
                    onClick={() => handleSort('tanggal')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tanggal</span>
                      {sortConfig.key === 'tanggal' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {currentData.map((item, index) => {
                  const globalIndex = startIndex + index
                  const unitRank = topPerformingUnits.findIndex(u => u.unit === item.unit)
                  const isTopUnit = unitRank !== -1

                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">{globalIndex + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{highlightSearchTerm(item.nama, searchName)}</td>
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
                      <td className="px-6 py-4 text-gray-800">{item.judul}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.jam >= 10 ? 'bg-green-100 text-green-800' :
                          item.jam >= 7 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          ⏰ {item.jam} jam
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">
                {selectedUnit || searchName ? '�' : '�📚'}
              </div>
              <p className="text-gray-500">
                {selectedUnit || searchName 
                  ? 'Tidak ada data yang sesuai dengan filter/pencarian'
                  : 'Belum ada data pelatihan'}
              </p>
              {(selectedUnit || searchName) && (
                <button
                  onClick={() => {
                    setSelectedUnit('')
                    setSearchName('')
                    setCurrentPage(1)
                  }}
                  className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  🔄 Reset Filter
                </button>
              )}
            </div>
          )}
        </div>        {/* Pagination */}
        {filteredAndSortedData.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬅️ Prev
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ➡️
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last ⏭️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Enhanced Charts */}
      {dataPelatihan.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Rata-rata Jam Pelatihan per Unit
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer>
                <BarChart data={barDataRataJam}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="unitKerja" tick={{ fontSize: 12 }} />
                  <YAxis 
                    label={{ value: 'Jam', angle: -90, position: 'insideLeft' }} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      `${value} jam`,
                      name === 'rataJam' ? 'Rata-rata Jam' : name
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="rataJam" 
                    fill="url(#colorGradient)" 
                    name="Rata-rata Jam"
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

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Distribusi Pelatihan per Unit
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer>
                <BarChart data={barDataDistribusi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="unitKerja" tick={{ fontSize: 12 }} />
                  <YAxis 
                    label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      `${value} pelatihan`,
                      name === 'count' ? 'Jumlah Pelatihan' : name
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient2)" 
                    name="Jumlah Pelatihan"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Unit Detail Modal */}
      <Dialog open={showUnitModal} onOpenChange={setShowUnitModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-800">
              <span>📊</span>
              Detail Prestasi Learning - {selectedUnitForModal}
              {selectedUnitForModal && topPerformingUnits.length > 0 && topPerformingUnits[0].unit === selectedUnitForModal && (
                <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🏆 CHAMPION
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUnitForModal && (
            <div className="space-y-6 mt-4">
              {(() => {
                const unitDetails = getUnitDetails(selectedUnitForModal)
                const isChampion = topPerformingUnits.length > 0 && topPerformingUnits[0].unit === selectedUnitForModal
                
                return (
                  <>
                    {/* Champion Celebration Section */}
                    {isChampion && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🎉🏆🎉</div>
                          <h3 className="text-2xl font-bold text-yellow-800 mb-2">SELAMAT!</h3>
                          <p className="text-yellow-700 font-medium">
                            Unit ini adalah JUARA LEARNING dengan prestasi luar biasa!
                          </p>
                          <div className="flex justify-center space-x-3 mt-4">
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">🥇 Rank #1</span>
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">⭐ Champion</span>
                            <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">🚀 Top Learning Unit</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg text-center ${isChampion ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50'}`}>
                        <div className={`text-2xl font-bold ${isChampion ? 'text-yellow-600' : 'text-blue-600'}`}>
                          {unitDetails.totalPelatihan}
                        </div>
                        <div className={`text-sm ${isChampion ? 'text-yellow-800' : 'text-blue-800'}`}>
                          Total Pelatihan
                        </div>
                        {isChampion && <div className="text-xs text-yellow-600 mt-1">👑 Outstanding!</div>}
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {unitDetails.totalParticipants}
                        </div>
                        <div className="text-sm text-green-800">Total Peserta</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {unitDetails.avgHours.toFixed(1)}
                        </div>
                        <div className="text-sm text-purple-800">Rata-rata Jam</div>
                        <div className="text-xs text-purple-600 mt-1">per pegawai</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">#{unitDetails.unitRank}</div>
                        <div className="text-sm text-orange-800">Ranking</div>
                        <div className="text-xs text-orange-600 mt-1">
                          {unitDetails.unitRank === 1 ? '🏆 Best' : 
                           unitDetails.unitRank <= 3 ? '🥈🥉 Top 3' : '📈 Good'}
                        </div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Hours Breakdown */}
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Breakdown Durasi Pelatihan</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={unitDetails.hoursBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {unitDetails.hoursBreakdown.map((entry, index) => (
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

                    {/* Top Training Topics */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Pelatihan Favorit</h3>
                      <div className="space-y-3">
                        {unitDetails.topTrainings.map(({ topic, count }, index) => (
                          <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                #{index + 1}
                              </span>
                              <span className="text-sm text-gray-700 font-medium" title={topic}>
                                {topic.length > 40 ? `${topic.substring(0, 40)}...` : topic}
                              </span>
                            </div>
                            <span className="font-bold text-gray-800 text-sm">
                              {count} kali
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Training Activities */}
                    <div className="bg-white border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">5 Pelatihan Terbaru</h3>
                      <div className="space-y-3">
                        {unitDetails.recentTrainings.map((training, index) => (
                          <div key={training.id} className={`p-3 rounded-lg border-l-4 ${
                            isChampion ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <span className="font-medium text-gray-800">{training.nama}</span>
                                </div>
                                <div className="text-sm text-gray-700 font-medium mb-1">{training.judul}</div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>📅 {training.tanggal}</span>
                                  <span className={`px-2 py-1 rounded ${
                                    training.jam >= 10 ? 'bg-green-100 text-green-600' :
                                    training.jam >= 7 ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    ⏰ {training.jam} jam
                                  </span>
                                </div>
                              </div>
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

