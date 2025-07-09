'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { AlertTriangle, X, BookOpen, Search, ChevronUp, ChevronDown, FileText, Users, Target } from 'lucide-react'


interface KajianData {
  id: number
  created_at: string
  judul: string | null
  jenis: string | null
  status: string | null
  unit_kerja_id: number | null
  users: {
    id: number
    unit_kerja: string
    alias: string | null
  } | null
}

// Daftar jenis produk yang diharapkan (urutkan sesuai kebutuhan)
const JENIS_PRODUK_LIST = [
  'Policy Brief',
  'Policy Paper',
  'Telaah Kebijakan',
  'Evaluasi Kebijakan',
  'Laporan',
  'Buku',
  'Pedoman Teknis',
  'Produk Hukum',
  'Artikel Jurnal',
  'Lainnya',
];

// Get unique values for filters

const getUniqueStatus = (data: KajianData[]) => {
  const status = data.map(item => item.status).filter((s): s is string => Boolean(s))
  return [...new Set(status)].sort()
}

// Filter jenis produk yang ada di data
const getJenisProdukOptions = (data: KajianData[]) => {
  const jenisSet = new Set(data.map(item => item.jenis).filter((j): j is string => Boolean(j)));
  // Hanya tampilkan yang ada di JENIS_PRODUK_LIST dan urutkan sesuai array
  return JENIS_PRODUK_LIST.filter(jenis => jenisSet.has(jenis));
};

export default function KajianPage() {
  const [dataKajian, setDataKajian] = useState<KajianData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [jenisFilter, setJenisFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof KajianData | 'users.unit_kerja' | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  // Filter and sort functions
  const filteredAndSortedData = () => {
    const filtered = dataKajian.filter(item => {
      // Search filter
      const matchesSearch = (item.users?.unit_kerja?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (item.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (item.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      
      // Jenis filter
      const matchesJenis = jenisFilter === 'all' || item.jenis === jenisFilter
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      
      return matchesSearch && matchesJenis && matchesStatus
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date
        let bValue: string | number | Date

        if (sortConfig.key === 'users.unit_kerja') {
          aValue = a.users?.unit_kerja || ''
          bValue = b.users?.unit_kerja || ''
        } else {
          const key = sortConfig.key as keyof KajianData
          aValue = a[key] as string | number
          bValue = b[key] as string | number
        }

        // Handle different data types
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue as string)
          bValue = new Date(bValue as string)
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = filteredAndSortedData().length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredAndSortedData().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page change
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset to page 1 if filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, jenisFilter, statusFilter, itemsPerPage]);

  // Pagination rendering helpers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    if (startPage > 1) {
      pageNumbers.push(
        <button key={1} onClick={() => goToPage(1)} className={`px-3 py-1 rounded-lg mx-1 ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}>1</button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="start-ellipsis" className="mx-1">...</span>);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button key={i} onClick={() => goToPage(i)} className={`px-3 py-1 rounded-lg mx-1 ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}>{i}</button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="end-ellipsis" className="mx-1">...</span>);
      }
      pageNumbers.push(
        <button key={totalPages} onClick={() => goToPage(totalPages)} className={`px-3 py-1 rounded-lg mx-1 ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}>{totalPages}</button>
      );
    }
    return pageNumbers;
  }

  useEffect(() => {
    const fetchKajianData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/kajian')
        if (!response.ok) {
          throw new Error('Failed to fetch kajian data')
        }
        const result = await response.json()
        setDataKajian(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchKajianData()
  }, [])
  // Function to identify high-impact policy analysis
  const getHighImpactAnalysis = () => {
    return dataKajian.filter(item =>
      item.jenis === 'Telaah Kebijakan' ||
      item.jenis === 'Policy Paper' ||
      item.jenis === 'Policy Brief' ||
      (
        item.jenis === 'Lainnya' && (
        item.judul?.toLowerCase().includes('analisis') ||
        item.judul?.toLowerCase().includes('evaluasi') ||
        item.judul?.toLowerCase().includes('assessment') ||
        item.judul?.toLowerCase().includes('kajian')
        )
      ) ||
      (
        item.jenis !== 'Telaah Kebijakan' &&
        item.jenis !== 'Policy Paper' &&
        item.jenis !== 'Policy Brief' && (
        item.jenis === 'Evaluasi Kebijakan' ||
        item.judul?.toLowerCase().includes('strategis') ||
        item.judul?.toLowerCase().includes('nasional') ||
        item.judul?.toLowerCase().includes('reformasi') ||
        item.judul?.toLowerCase().includes('transformasi') ||
        item.judul?.toLowerCase().includes('inovasi')
        )
      )
    )
  }
  // Get top 3 units with most kajian for Strategic Analysis Hub
  const getTop3UnitsWithMostKajian = useCallback(() => {
    // Group all kajian by unit
    const grouped = dataKajian.reduce((acc, item) => {
      const unitName = item.users?.unit_kerja || 'Unit Tidak Diketahui'
      if (!acc[unitName]) {
        acc[unitName] = []
      }
      acc[unitName].push(item)
      return acc
    }, {} as Record<string, KajianData[]>)
    
    return Object.entries(grouped)
      .map(([unit, kajians]) => {
        // Group by jenis
        const jenisCounts = kajians.reduce((acc, kajian) => {
          const jenis = kajian.jenis || 'Tidak Diketahui'
          acc[jenis] = (acc[jenis] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Group by status
        const statusCounts = kajians.reduce((acc, kajian) => {
          const status = kajian.status || 'Tidak Diketahui'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return {
          unit,
          totalKajian: kajians.length,
          jenisList: Object.entries(jenisCounts).map(([jenis, count]) => ({ jenis, count })),
          statusList: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
          completionRate: (kajians.filter(k => k.status === 'Selesai').length / kajians.length) * 100
        }
      })
      .sort((a, b) => b.totalKajian - a.totalKajian)
      .slice(0, 3) // Only top 3
  }, [dataKajian])
  // Auto-show analysis modal when data is loaded
  useEffect(() => {
    if (dataKajian.length > 0 && !loading && !error) {
      const top3Units = getTop3UnitsWithMostKajian()
      
      if (top3Units.length > 0) {
        const timer = setTimeout(() => {
          setShowAnalysisModal(true)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [dataKajian, loading, error, getTop3UnitsWithMostKajian])

  const handleSort = (key: keyof KajianData | 'users.unit_kerja') => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (columnKey: keyof KajianData | 'users.unit_kerja') => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kajian & analisis kebijakan data...</p>
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
            <p className="text-gray-600 mb-2">Error loading kajian data</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dataKajian || dataKajian.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Kajian & Analisis Kebijakan</h1>
          <p className="text-blue-600">Kelola dan monitor Produk Kajian/Analisis Kebijakan/Telaah Kebijakan</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 mb-2">Belum ada data kajian & analisis kebijakan</p>
            <p className="text-gray-500 text-sm">Data kajian akan ditampilkan setelah ada input data</p>
          </div>
        </div>
      </div>
    )
  }

  const summaryCards = [
    { 
      label: 'Total Kajian', 
      value: dataKajian.length,
      icon: '📚',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    { 
      label: 'Kajian Selesai', 
      value: dataKajian.filter(d => d.status === 'Selesai').length,
      icon: '✅',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    { 
      label: 'Kajian In Progress', 
      value: dataKajian.length - dataKajian.filter(d => d.status === 'Selesai').length,
      icon: '🎯',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    { 
      label: 'Unit Terlibat', 
      value: new Set(dataKajian.map(d => d.users?.unit_kerja).filter(Boolean)).size,
      icon: '🏢',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ]

  const pieData = Object.entries(
    dataKajian.reduce((acc, curr) => {
      const jenis = curr.jenis || 'Tidak Diketahui'
      acc[jenis] = (acc[jenis] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({ name: key, value }))
  const barData = Object.entries(
    dataKajian.reduce((acc, curr) => {
      const unit = curr.users?.alias || curr.users?.unit_kerja || 'Tidak Diketahui'
      acc[unit] = (acc[unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([unit, jumlah]) => ({ unit, jumlah }))

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Kajian & Analisis Kebijakan</h1>
        <p className="text-blue-600">Kelola dan monitor Produk Kajian/Analisis Kebijakan/Telaah Kebijakan</p>
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

      {/* Additional Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Statistik Kajian & Analisis
          </h2>
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Strategic Analysis Hub
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {getHighImpactAnalysis().length}
            </span>
          </button>
        </div>        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-xl font-bold text-gray-600">
              {dataKajian.filter(d => d.status === 'Draft').length}
            </div>
            <div className="text-xs text-gray-800">Draft</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl mb-2">�</div>
            <div className="text-xl font-bold text-blue-600">
              {dataKajian.filter(d => d.status === 'Reviu').length}
            </div>
            <div className="text-xs text-blue-800">Reviu</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-xl font-bold text-yellow-600">
              {dataKajian.filter(d => d.status === 'Revisi').length}
            </div>
            <div className="text-xs text-yellow-800">Revisi</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-xl font-bold text-green-600">
              {dataKajian.filter(d => d.status === 'Selesai').length}
            </div>
            <div className="text-xs text-green-800">Selesai</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <div className="text-2xl mb-2">⏸️</div>
            <div className="text-xl font-bold text-red-600">
              {dataKajian.filter(d => d.status === 'Ditunda').length}
            </div>
            <div className="text-xs text-red-800">Ditunda</div>
          </div>
        </div>
      </div>      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart - Distribution by Type */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Distribusi Jenis Kajian
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Tidak ada data untuk ditampilkan
            </div>
          )}
        </div>

        {/* Bar Chart - Distribution by Unit */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Distribusi per Unit Kerja
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="unit" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              Tidak ada data untuk ditampilkan
            </div>
          )}
        </div>
      </div>      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Data Kajian & Analisis Kebijakan</h2>
              <p className="text-purple-100 text-sm">Daftar lengkap kajian dan analisis kebijakan per unit kerja</p>
            </div>            <div className="text-purple-100 text-sm">
              Menampilkan {filteredAndSortedData().length} dari {dataKajian.length} kajian
              {(jenisFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <span className="text-purple-200 ml-1">
                  (dengan filter)
                </span>
              )}
            </div>
          </div>
        </div>        {/* Search and Filter Section */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          {/* Filter Dropdowns */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Jenis Filter */}
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Jenis Produk
                </label>
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                >
                  <option value="all">Semua Jenis</option>
                  {getJenisProdukOptions(dataKajian).map((jenis) => (
                    <option key={jenis} value={jenis}>
                      {jenis}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                >
                  <option value="all">Semua Status</option>
                  {getUniqueStatus(dataKajian).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(jenisFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setJenisFilter('all')
                      setStatusFilter('all')
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-300"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul kajian atau unit kerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  <button
                    onClick={() => handleSort('judul')}
                    className="flex items-center hover:text-gray-900 transition-colors"
                  >
                    Judul Kajian
                    {getSortIcon('judul')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <button
                    onClick={() => handleSort('users.unit_kerja')}
                    className="flex items-center hover:text-gray-900 transition-colors"
                  >
                    Unit Kerja
                    {getSortIcon('users.unit_kerja')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <button
                    onClick={() => handleSort('jenis')}
                    className="flex items-center hover:text-gray-900 transition-colors"
                  >
                    Jenis Produk
                    {getSortIcon('jenis')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-900 transition-colors"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((kajian) => (
                <tr key={kajian.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {kajian.judul || 'Tidak ada judul'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-medium text-gray-900">
                    {kajian.users?.unit_kerja || 'Tidak diketahui'}
                  </td>                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      kajian.jenis === 'Buku'
                        ? 'bg-indigo-100 text-indigo-800'
                        : kajian.jenis === 'Lainnya'
                        ? 'bg-gray-100 text-gray-800'
                        : kajian.jenis === 'Produk Hukum'
                        ? 'bg-red-100 text-red-800'
                        : kajian.jenis === 'Policy Brief'
                        ? 'bg-blue-100 text-blue-800'
                        : kajian.jenis === 'Laporan'
                        ? 'bg-green-100 text-green-800'
                        : kajian.jenis === 'Policy Paper'
                        ? 'bg-purple-100 text-purple-800'
                        : kajian.jenis === 'Pedoman Teknis'
                        ? 'bg-orange-100 text-orange-800'
                        : kajian.jenis === 'Artikel Jurnal'
                        ? 'bg-pink-100 text-pink-800'
                        : kajian.jenis === 'Telaah Kebijakan'
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kajian.jenis || 'Tidak diketahui'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      kajian.status === 'Draft'
                        ? 'bg-slate-100 text-slate-800'
                        : kajian.status === 'Review'
                        ? 'bg-blue-100 text-blue-800'
                        : kajian.status === 'Revisi'
                        ? 'bg-amber-100 text-amber-800'
                        : kajian.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : kajian.status === 'Ditunda'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kajian.status || 'Tidak diketahui'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedData().length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Tidak ada data yang sesuai</p>
              <p className="text-sm">Coba gunakan kata kunci pencarian yang berbeda</p>
            </div>
          )}
          {/* Manual Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 px-2 border-t mt-4">
              {/* Info text */}
              <div className="text-sm text-gray-700">
                Menampilkan {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage + 1)} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} hasil
              </div>
              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {[5, 10, 25, 50].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
              {/* Pagination controls */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg mx-1 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                  aria-label="Sebelumnya"
                >
                  &laquo;
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg mx-1 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                  aria-label="Berikutnya"
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>      {/* Strategic Analysis Hub Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    🏆 Top 3 Unit Kajian Terbanyak
                  </h2>
                  <p className="text-purple-100 text-sm">Unit kerja dengan kontribusi kajian terbesar</p>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>            <div className="p-4">
              {getTop3UnitsWithMostKajian().length > 0 ? (
                <div className="space-y-4">
                  {/* Layout Landscape - 3 cards in row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {getTop3UnitsWithMostKajian().map((unit, index) => {
                      const medalColors = [
                        { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-white', medal: '🥇', rank: '1st', border: 'border-yellow-400' },
                        { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-white', medal: '🥈', rank: '2nd', border: 'border-gray-400' },
                        { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-white', medal: '🥉', rank: '3rd', border: 'border-orange-400' }
                      ]
                      const medalStyle = medalColors[index]

                      return (
                        <div
                          key={unit.unit}
                          className={`bg-white border-2 ${medalStyle.border} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          {/* Compact Header with Medal */}
                          <div className={`${medalStyle.bg} ${medalStyle.text} p-3`}>
                            <div className="text-center">
                              <div className="text-3xl mb-1">{medalStyle.medal}</div>
                              <h4 className="text-sm font-bold truncate" title={unit.unit}>{unit.unit}</h4>
                              <p className="text-xs opacity-90">{unit.totalKajian} Kajian</p>
                            </div>
                          </div>

                          {/* Compact Content */}
                          <div className="p-3 space-y-3">
                            {/* Completion Rate */}
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{unit.completionRate.toFixed(0)}%</div>
                              <div className="text-xs text-gray-600">Completion Rate</div>
                            </div>

                            {/* Top Jenis Kajian (max 3) */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <BookOpen className="w-3 h-3 mr-1 text-blue-600" />
                                Top Jenis
                              </h5>
                              <div className="space-y-1">
                                {unit.jenisList.slice(0, 3).map(({ jenis, count }) => (
                                  <div key={jenis} className="flex items-center justify-between text-xs">
                                    <span className={`px-2 py-1 rounded-full truncate max-w-20 ${
                                      jenis === 'Buku' ? 'bg-indigo-100 text-indigo-700' :
                                      jenis === 'Lainnya' ? 'bg-gray-100 text-gray-700' :
                                      jenis === 'Produk Hukum' ? 'bg-red-100 text-red-700' :
                                      jenis === 'Policy Brief' ? 'bg-blue-100 text-blue-700' :
                                      jenis === 'Laporan' ? 'bg-green-100 text-green-700' :
                                      jenis === 'Policy Paper' ? 'bg-purple-100 text-purple-700' :
                                      jenis === 'Pedoman Teknis' ? 'bg-orange-100 text-orange-700' :
                                      jenis === 'Artikel Jurnal' ? 'bg-pink-100 text-pink-700' :
                                      jenis === 'Telaah Kebijakan' ? 'bg-cyan-100 text-cyan-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`} title={jenis}>
                                      {jenis.length > 20 ? jenis.substring(0, 8) + '...' : jenis}
                                    </span>
                                    <span className="font-medium text-gray-700">{count}</span>
                                  </div>
                                ))}
                                {unit.jenisList.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{unit.jenisList.length - 3} lainnya
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Summary */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <Target className="w-3 h-3 mr-1 text-green-600" />
                                Status
                              </h5>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {unit.statusList.slice(0, 4).map(({ status, count }) => (
                                  <div key={status} className="flex items-center justify-between">
                                    <span className={`px-1 py-0.5 rounded text-xs ${
                                      status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                                      status === 'Reviu' ? 'bg-blue-100 text-blue-700' :
                                      status === 'Revisi' ? 'bg-amber-100 text-amber-700' :
                                      status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                                      status === 'Ditunda' ? 'bg-rose-100 text-rose-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {status.substring(0, 10)}
                                    </span>
                                    <span className="font-medium text-gray-700">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Compact Footer Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        🎯 Ranking berdasarkan total kontribusi kajian dari masing-masing unit kerja
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Belum Ada Data Kajian
                  </h3>
                  <p className="text-gray-500">
                    Belum ada data kajian yang tersedia untuk ditampilkan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
