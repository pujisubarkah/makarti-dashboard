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
  }
}

interface ProcessedData {
  id: number
  nama: string
  unit: string
  judul: string
  jam: number
  tanggal: string
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

  useEffect(() => {
    fetchPelatihanData()
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
        acc[item.unit] = { totalJam: 0, pegawai: new Set() }
      }
      acc[item.unit].totalJam += item.jam
      acc[item.unit].pegawai.add(item.nama)
      return acc
    }, {} as Record<string, { totalJam: number; pegawai: Set<string> }>)
  ).map(([unit, stats]) => ({
    unit,
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
  ]

  // Data untuk grafik
  const barData = unitStats.map(unit => ({
    unit: unit.unit,
    rataJam: parseFloat(unit.rataJam.toFixed(1)),
    totalJam: unit.totalJam,
    pegawai: unit.jumlahPegawai
  }))

  // Data untuk pie chart
  const pieData = Object.entries(
    dataPelatihan.reduce((acc, item) => {
      acc[item.unit] = (acc[item.unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([unit, count]) => ({ name: unit, value: count }))

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

      {/* Top Performing Units */}
      {topPerformingUnits.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Unit Terbaik (Rata-rata Jam Pelatihan Tertinggi)
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
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden`}
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
      </div>

      {/* Enhanced Charts */}
      {dataPelatihan.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Rata-rata Jam Pelatihan per Unit
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
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
              <span className="mr-2">🥧</span>
              Distribusi Pelatihan per Unit
            </h2>
            <div className="h-[350px]">
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
      )}
    </div>
  )
}

