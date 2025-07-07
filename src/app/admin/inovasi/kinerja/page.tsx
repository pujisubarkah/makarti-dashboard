'use client'

import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, X, Award, Lightbulb, Star, Search, ChevronUp, ChevronDown } from 'lucide-react'

interface InovasiData {
  id: number
  judul: string
  tahap: string
  tanggal: string
  indikator: string
  unit_kerja_id: number
  users: {
    unit_kerja: string
  }
}

const COLORS = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6']

export default function InovasiPage() {  const [dataInovasi, setDataInovasi] = useState<InovasiData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBrilliantModal, setShowBrilliantModal] = useState(false)
  
  // Table filtering and sorting states
  const [searchUnit, setSearchUnit] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchInovasiData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/inovasi')
        if (!response.ok) {
          throw new Error('Failed to fetch innovation data')
        }
        const data = await response.json()
        setDataInovasi(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInovasiData()
  }, [])

  // Function to identify brilliant innovations
  const getBrilliantInnovations = () => {
    return dataInovasi.filter(item => 
      item.tahap === 'Implementasi' || 
      item.indikator.toLowerCase().includes('meningkat') ||
      item.indikator.toLowerCase().includes('kualitas') ||
      item.indikator.toLowerCase().includes('efisien') ||
      item.indikator.toLowerCase().includes('optimal') ||
      item.judul.toLowerCase().includes('digital') ||
      item.judul.toLowerCase().includes('otomasi') ||
      item.judul.toLowerCase().includes('smart')
    )
  }

  // Group brilliant innovations by unit
  const getBrilliantByUnit = () => {
    const brilliant = getBrilliantInnovations()
    const grouped = brilliant.reduce((acc, item) => {
      const unitName = item.users.unit_kerja
      if (!acc[unitName]) {
        acc[unitName] = []
      }
      acc[unitName].push(item)
      return acc
    }, {} as Record<string, InovasiData[]>)
    
    return Object.entries(grouped)
      .map(([unit, innovations]) => ({
        unit,
        innovations,
        count: innovations.length,
        implementationRate: (innovations.filter(i => i.tahap === 'Implementasi').length / innovations.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
  }
  // Auto-show brilliant ideas modal when data is loaded
  useEffect(() => {
    if (dataInovasi.length > 0 && !loading && !error) {
      const brilliantInnovations = dataInovasi.filter(item => 
        item.tahap === 'Implementasi' || 
        item.indikator.toLowerCase().includes('meningkat') ||
        item.indikator.toLowerCase().includes('kualitas') ||
        item.indikator.toLowerCase().includes('efisien') ||
        item.indikator.toLowerCase().includes('optimal') ||
        item.judul.toLowerCase().includes('digital') ||
        item.judul.toLowerCase().includes('otomasi') ||
        item.judul.toLowerCase().includes('smart')
      )
      
      if (brilliantInnovations.length > 0) {
        // Show popup with a slight delay for better UX
        const timer = setTimeout(() => {
          setShowBrilliantModal(true)
        }, 1500) // 1.5 second delay

        return () => clearTimeout(timer)
      }
    }
  }, [dataInovasi, loading, error])
  // Filter and sort data
  const getFilteredAndSortedData = () => {
    const filtered = dataInovasi.filter(item =>
      item.users.unit_kerja.toLowerCase().includes(searchUnit.toLowerCase())
    )

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date
        let bValue: string | number | Date

        switch (sortColumn) {
          case 'judul':
            aValue = a.judul.toLowerCase()
            bValue = b.judul.toLowerCase()
            break
          case 'unit_kerja':
            aValue = a.users.unit_kerja.toLowerCase()
            bValue = b.users.unit_kerja.toLowerCase()
            break
          case 'tahap':
            aValue = a.tahap.toLowerCase()
            bValue = b.tahap.toLowerCase()
            break
          case 'tanggal':
            aValue = new Date(a.tanggal)
            bValue = new Date(b.tanggal)
            break
          case 'indikator':
            aValue = a.indikator.toLowerCase()
            bValue = b.indikator.toLowerCase()
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading innovation data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Error loading innovation data</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dataInovasi || dataInovasi.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Inovasi & Kinerja</h1>
          <p className="text-blue-600">Pantau perkembangan inovasi di seluruh unit kerja</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">💡</div>
            <p className="text-gray-600 mb-2">Belum ada data inovasi</p>
            <p className="text-gray-500 text-sm">Data inovasi akan ditampilkan setelah ada input data</p>
          </div>
        </div>
      </div>
    )
  }

  const summaryCards = [
    { 
      label: 'Total Inovasi', 
      value: dataInovasi.length,
      icon: '💡',
      color: 'blue',
      bgColor: 'bg-blue-500',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800'
    },
    {
      label: 'Tahap Ide',
      value: dataInovasi.filter(d => d.tahap === 'Ide').length,
      icon: '🧠',
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800'
    },
    {
      label: 'Tahap Uji Coba',
      value: dataInovasi.filter(d => d.tahap === 'Uji Coba').length,
      icon: '🔬',
      color: 'orange',
      bgColor: 'bg-orange-500',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800'
    },
    {
      label: 'Sudah Implementasi',
      value: dataInovasi.filter(d => d.tahap === 'Implementasi').length,
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-500',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800'
    },
  ]

  const tahapCount = dataInovasi.reduce((acc, curr) => {
    acc[curr.tahap] = (acc[curr.tahap] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(tahapCount).map(([key, value]) => ({
    name: key,
    value,
  }))
  return (
    <div className="p-6">
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.8; transform: scale(1.1) rotate(90deg); }
          50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
          75% { opacity: 0.8; transform: scale(1.1) rotate(270deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.3); }
          50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.6), 0 0 40px rgba(234, 179, 8, 0.3); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Inovasi & Kinerja</h1>
        <p className="text-blue-600">Pantau perkembangan inovasi di seluruh unit kerja</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 hover:scale-105 group"
            style={{ borderLeftColor: card.bgColor.replace('bg-', '#') === 'blue' ? '#3b82f6' : 
                     card.bgColor.replace('bg-', '#') === 'yellow' ? '#eab308' :
                     card.bgColor.replace('bg-', '#') === 'orange' ? '#f97316' : '#10b981' }}
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
              <div className="mt-4">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-1">📊</span>
                  {card.value > 0 ? (
                    <span>
                      {((card.value / dataInovasi.length) * 100).toFixed(0)}% dari total
                    </span>
                  ) : (
                    <span>Belum ada data</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📈</span>
            Progress Inovasi
          </h2>
          <button
            onClick={() => setShowBrilliantModal(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Ide Brilian
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {getBrilliantInnovations().length}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-lg font-bold text-blue-600">
              {((dataInovasi.filter(d => d.tahap === 'Implementasi').length / dataInovasi.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-blue-800">Tingkat Implementasi</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl mb-2">💪</div>
            <div className="text-lg font-bold text-green-600">
              {dataInovasi.filter(d => d.tahap === 'Implementasi' || d.tahap === 'Uji Coba').length}
            </div>
            <div className="text-sm text-green-800">Inovasi Aktif</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-bold text-purple-600">
              {new Set(dataInovasi.map(d => d.users.unit_kerja)).size}
            </div>
            <div className="text-sm text-purple-800">Unit Terlibat</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-lg font-bold text-orange-600">
              {dataInovasi.filter(d => d.indikator.toLowerCase().includes('meningkat') || d.indikator.toLowerCase().includes('kualitas')).length}
            </div>
            <div className="text-sm text-orange-800">Dengan Target Kualitas</div>
          </div>
        </div>
      </div>      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Inovasi per Unit</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap inovasi dan status perkembangannya</p>
            </div>
            
            {/* Search and Filter Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari unit kerja..."
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="text-white/80 text-sm">
                {getFilteredAndSortedData().length} dari {dataInovasi.length} data
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th 
                  className="px-6 py-3 text-left font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSort('judul')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Judul Inovasi</span>
                    {getSortIcon('judul')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSort('unit_kerja')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Unit Kerja</span>
                    {getSortIcon('unit_kerja')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSort('tahap')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Tahap</span>
                    {getSortIcon('tahap')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSort('tanggal')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Tanggal</span>
                    {getSortIcon('tanggal')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSort('indikator')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Indikator Kinerja</span>
                    {getSortIcon('indikator')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {getFilteredAndSortedData().length > 0 ? (
                getFilteredAndSortedData().map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.judul}</td>
                    <td className="px-6 py-4 text-gray-600">{item.users.unit_kerja}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.tahap === 'Implementasi' ? 'bg-green-100 text-green-800' :
                        item.tahap === 'Uji Coba' ? 'bg-orange-100 text-orange-800' :
                        item.tahap === 'Perencanaan' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.tahap === 'Implementasi' ? '✅' :
                         item.tahap === 'Uji Coba' ? '🔬' :
                         item.tahap === 'Perencanaan' ? '📋' : '💡'} {item.tahap}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.indikator}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Search className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">Tidak ada data yang ditemukan</p>
                      <p className="text-sm">Coba ubah kata kunci pencarian atau hapus filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer with Statistics */}
        {searchUnit && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Hasil pencarian untuk: <span className="font-medium text-gray-800">"{searchUnit}"</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {getFilteredAndSortedData().length} hasil ditemukan
                </span>
                <button
                  onClick={() => setSearchUnit('')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Hapus Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          Distribusi Tahapan Inovasi
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
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
            <h3 className="font-medium text-gray-800 mb-3">Ringkasan Tahapan</h3>
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
                    {((item.value / dataInovasi.length) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brilliant Ideas Modal - Ultra Enhanced */}
      {showBrilliantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-700 scale-100 animate-in slide-in-from-bottom-8 zoom-in-95 border-2 border-yellow-200">
            {/* Modal Header - Ultra Enhanced */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 text-white p-10 relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent animate-pulse"></div>
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/20 rounded-full animate-ping"></div>
              <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-white/15 rounded-full animate-pulse delay-500"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-start space-x-6">
                  <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-sm shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <Award className="w-12 h-12 text-white drop-shadow-lg animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold mb-3 drop-shadow-md bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                      🏆 Unit Kerja Terbaik
                    </h2>
                    <p className="text-yellow-100 text-xl font-medium drop-shadow-sm mb-4">
                      ✨ Inovator Terdepan dengan Ide-Ide Revolusioner ✨
                    </p>
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          🚀 <span className="ml-2 text-xl">{getBrilliantInnovations().length}</span> <span className="ml-1">Ide Brilian</span>
                        </span>
                      </div>
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          ⭐ <span className="ml-2 text-xl">{getBrilliantByUnit().length}</span> <span className="ml-1">Unit Unggulan</span>
                        </span>
                      </div>
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          ⚡ <span className="ml-2 text-xl">{((getBrilliantInnovations().filter(i => i.tahap === 'Implementasi').length / getBrilliantInnovations().length) * 100).toFixed(0)}%</span> <span className="ml-1">Implementasi</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowBrilliantModal(false)}
                  className="text-white hover:bg-white/25 rounded-2xl p-4 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm shadow-lg"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              
              {/* Floating Success Indicators */}
              <div className="absolute bottom-4 right-4 flex space-x-2 animate-bounce">
                <span className="text-3xl">🎯</span>
                <span className="text-3xl">💡</span>
                <span className="text-3xl">🌟</span>
              </div>
            </div>

            {/* Modal Content - Ultra Enhanced */}
            <div className="p-10 overflow-y-auto max-h-[calc(95vh-320px)] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
              {getBrilliantByUnit().length > 0 ? (
                <div className="space-y-10">
                  {getBrilliantByUnit().map((unitData, index) => (
                    <div 
                      key={unitData.unit} 
                      className="bg-white rounded-3xl p-10 relative shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.02] border-2 border-gradient-to-r from-yellow-200 to-orange-200 group"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #f59e0b 70%, #d97706 100%)' :
                                   index === 1 ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #94a3b8 70%, #64748b 100%)' :
                                   index === 2 ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 30%, #ea580c 70%, #c2410c 100%)' :
                                   'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 30%, #3b82f6 70%, #1d4ed8 100%)',
                        animation: `cardFloat ${3 + index * 0.5}s ease-in-out infinite alternate`
                      }}
                    >
                      {/* Enhanced Ranking Badge */}
                      <div className="absolute -top-6 -left-6 z-30">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 animate-pulse' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600' : 
                          index === 2 ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700' : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                        }`}>
                          <span className="drop-shadow-lg">#{index + 1}</span>
                        </div>
                        {/* Sparkle effect for top 3 */}
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 text-2xl animate-spin">✨</div>
                        )}
                      </div>

                      {/* Enhanced Crown for #1 */}
                      {index === 0 && (
                        <div className="absolute -top-4 -right-4 z-20">
                          <div className="text-5xl animate-bounce transform hover:scale-125 transition-transform duration-300">👑</div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-yellow-600 font-bold text-xs bg-white px-2 py-1 rounded-full shadow-lg">
                            CHAMPION
                          </div>
                        </div>
                      )}

                      {/* Special effects for top performers */}
                      {index === 1 && (
                        <div className="absolute -top-3 -right-3 z-20">
                          <div className="text-4xl animate-pulse">🥈</div>
                        </div>
                      )}
                      
                      {index === 2 && (
                        <div className="absolute -top-3 -right-3 z-20">
                          <div className="text-4xl animate-bounce delay-200">🥉</div>
                        </div>
                      )}

                      {/* Unit Header - Ultra Enhanced */}
                      <div className="mb-8 relative">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-3xl font-bold text-gray-800 flex items-center group">
                            <div className="bg-white/40 p-3 rounded-2xl mr-4 backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                              <Star className="w-8 h-8 text-yellow-600 animate-pulse" />
                            </div>
                            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              {unitData.unit}
                            </span>
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                              <span className="text-gray-800 font-bold text-lg flex items-center">
                                💡 <span className="ml-2 text-2xl text-blue-600">{unitData.count}</span> <span className="ml-1">Inovasi</span>
                              </span>
                            </div>
                            <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                              <span className="text-gray-800 font-bold text-lg flex items-center">
                                ✅ <span className="ml-2 text-2xl text-green-600">{unitData.implementationRate.toFixed(0)}%</span> <span className="ml-1">Sukses</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar with Animation */}
                        <div className="relative mb-4">
                          <div className="w-full bg-white/50 rounded-2xl h-6 shadow-inner backdrop-blur-sm border border-white/30">
                            <div 
                              className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-6 rounded-2xl transition-all duration-2000 ease-out shadow-lg relative overflow-hidden"
                              style={{ width: `${Math.min(unitData.implementationRate, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-green-300/0 via-green-200/50 to-green-300/0 animate-shimmer"></div>
                            </div>
                          </div>
                          <div className="absolute right-0 -top-10">
                            <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/40">
                              <span className="text-sm font-bold text-gray-700 flex items-center">
                                🎯 {unitData.implementationRate.toFixed(1)}% Success Rate
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Achievement Badges */}
                        <div className="flex items-center space-x-2 mb-4">
                          {unitData.implementationRate >= 80 && (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                              🚀 High Performer
                            </div>
                          )}
                          {unitData.count >= 5 && (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                              💡 Innovation Leader
                            </div>
                          )}
                          {index === 0 && (
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                              👑 Best Unit
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Innovations Grid - Ultra Enhanced */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {unitData.innovations.map((innovation, idx) => (
                          <div 
                            key={innovation.id} 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden group cursor-pointer"
                            style={{
                              background: innovation.tahap === 'Implementasi' ? 
                                'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))' :
                                'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                              animation: `cardPulse ${2 + idx * 0.3}s ease-in-out infinite alternate`
                            }}
                          >
                            {/* Enhanced Hover Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-200/30 to-yellow-200/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            
                            {/* Innovation Status Indicator */}
                            <div className="absolute top-4 right-4">
                              <div className={`w-4 h-4 rounded-full animate-pulse ${
                                innovation.tahap === 'Implementasi' ? 'bg-green-500' :
                                innovation.tahap === 'Uji Coba' ? 'bg-orange-500' :
                                innovation.tahap === 'Perencanaan' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}></div>
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {idx + 1}
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-base leading-tight flex-1">
                                    {innovation.judul}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg transition-transform duration-300 hover:scale-105 ${
                                  innovation.tahap === 'Implementasi' ? 'bg-green-500 text-white' :
                                  innovation.tahap === 'Uji Coba' ? 'bg-orange-500 text-white' :
                                  innovation.tahap === 'Perencanaan' ? 'bg-blue-500 text-white' :
                                  'bg-yellow-500 text-white'
                                }`}>
                                  <span className="mr-2">
                                    {innovation.tahap === 'Implementasi' ? '🚀' :
                                     innovation.tahap === 'Uji Coba' ? '🔬' :
                                     innovation.tahap === 'Perencanaan' ? '📋' : '💡'}
                                  </span>
                                  {innovation.tahap}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-white/50 p-3 rounded-xl">
                                {innovation.indikator}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-gray-500 text-xs font-medium flex items-center bg-gray-100 px-3 py-2 rounded-xl">
                                  📅 {new Date(innovation.tanggal).toLocaleDateString('id-ID')}
                                </p>
                                <div className="flex space-x-2">
                                  {innovation.tahap === 'Implementasi' && (
                                    <span className="text-2xl animate-bounce" title="Sudah Diimplementasi">⭐</span>
                                  )}
                                  {innovation.indikator.toLowerCase().includes('kualitas') && (
                                    <span className="text-2xl animate-pulse" title="Fokus Kualitas">🏆</span>
                                  )}
                                  {innovation.judul.toLowerCase().includes('digital') && (
                                    <span className="text-2xl animate-bounce delay-200" title="Inovasi Digital">💻</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                    <Lightbulb className="w-20 h-20 text-gray-400 animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-6 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    🔍 Belum Ada Ide Brilian Terdeteksi
                  </h3>                  <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                    Sistem sedang mencari inovasi yang sudah diimplementasi atau memiliki indikator kualitas tinggi untuk ditampilkan di sini
                  </p>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
                    <span className="font-bold">💡 Terus berinovasi untuk muncul di sini!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Ultra Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 px-10 py-8 flex justify-between items-center border-t-2 border-yellow-300">
              <div className="flex items-center space-x-6">
                <div className="text-xl text-gray-700 flex items-center">
                  <span className="font-bold text-yellow-600 text-2xl">{getBrilliantInnovations().length}</span>
                  <span className="mx-2">dari</span>
                  <span className="font-bold text-blue-600 text-2xl">{dataInovasi.length}</span>
                  <span className="ml-2">inovasi tergolong brilian</span>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-xl hover:scale-105 transition-transform duration-300">
                  🎯 {((getBrilliantInnovations().length / dataInovasi.length) * 100).toFixed(1)}% Success Rate
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-xl animate-pulse">
                  ⚡ {getBrilliantInnovations().filter(i => i.tahap === 'Implementasi').length} Implementasi
                </div>
              </div>
              <button
                onClick={() => setShowBrilliantModal(false)}
                className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                ✨ Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
