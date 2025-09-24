'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Search, Calendar, Building, BarChart3, PieChart as PieChartIcon, Filter, ArrowUpDown, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KegiatanData {
  id: number
  type: 'rencana_mingguan' | 'event_schedule'
  kegiatan: string
  minggu?: number
  bulan?: number
  status?: string
  jenis_belanja?: string
  anggaran_rencana?: number
  anggaran_cair?: number
  tanggal?: string
  lokasi?: string
  waktu?: string
  prioritas?: string
  peserta?: number
  deskripsi?: string
  created_at: string
  unit_kerja: string | null
  unit_alias: string | null
  unit_kerja_id: number
}

interface UnitStatistics {
  unit_kerja: string
  unit_alias: string
  unit_kerja_id: number
  rencana_mingguan: number
  event_schedule: number
  total_kegiatan: number
  status_breakdown: Record<string, number>
  total_anggaran_rencana: number
  total_anggaran_cair: number
}

interface ApiResponse {
  success: boolean
  data: {
    rencana_mingguan: KegiatanData[]
    event_schedule: KegiatanData[]
    combined: KegiatanData[]
  }
  statistics: {
    total_kegiatan: number
    total_rencana_mingguan: number
    total_event_schedule: number
    status_breakdown: Record<string, number>
    monthly_breakdown: Record<string, number>
    unit_statistics: UnitStatistics[]
  }
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

export default function AdminKegiatanPage() {
  const [data, setData] = useState<KegiatanData[]>([])
  const [statistics, setStatistics] = useState<ApiResponse['statistics'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedBulan, setSelectedBulan] = useState<string>('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof KegiatanData | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'desc' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/kegiatan')
      if (!response.ok) {
        throw new Error('Gagal mengambil data kegiatan')
      }
      const result: ApiResponse = await response.json()
      setData(result.data.combined)
      setStatistics(result.statistics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get filtered and sorted data (hanya rencana mingguan)
  const getFilteredAndSortedData = () => {
    const filteredData = data.filter(item => {
      // Hanya tampilkan rencana mingguan
      if (item.type !== 'rencana_mingguan') return false;
      
      const matchesSearch = searchTerm === '' || 
        item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.unit_kerja && item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.unit_alias && item.unit_alias.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesUnit = selectedUnit === '' || selectedUnit === 'all' || 
        item.unit_kerja === selectedUnit
      
      const matchesType = selectedType === '' || selectedType === 'all' || 
        item.type === selectedType
      
      const matchesStatus = selectedStatus === '' || selectedStatus === 'all' || 
        item.status === selectedStatus
      
      const matchesBulan = selectedBulan === '' || selectedBulan === 'all' || 
        (item.bulan && item.bulan.toString() === selectedBulan)

      return matchesSearch && matchesUnit && matchesType && matchesStatus && matchesBulan
    })

    // Sort data
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        // Special handling for periode (bulan) sorting
        if (sortConfig.key === 'bulan') {
          const aBulan = a.bulan || 0
          const bBulan = b.bulan || 0
          
          if (aBulan !== bBulan) {
            return sortConfig.direction === 'asc' ? aBulan - bBulan : bBulan - aBulan
          }
          
          // If bulan is the same, sort by minggu
          const aMinggu = a.minggu || 0
          const bMinggu = b.minggu || 0
          return sortConfig.direction === 'asc' ? aMinggu - bMinggu : bMinggu - aMinggu
        }
        
        // Standard sorting for other columns
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    } else {
      // Default sorting: berdasarkan bulan dulu (descending), kemudian minggu (descending)
      filteredData.sort((a, b) => {
        // Sort by bulan first (descending)
        const aBulan = a.bulan || 0
        const bBulan = b.bulan || 0
        
        if (aBulan !== bBulan) {
          return bBulan - aBulan // descending
        }
        
        // If bulan is the same, sort by minggu (descending)
        const aMinggu = a.minggu || 0
        const bMinggu = b.minggu || 0
        return bMinggu - aMinggu // descending
      })
    }

    return filteredData
  }

  const handleSort = (key: keyof KegiatanData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get unique values for filters (hanya dari rencana mingguan)
  const rencanaMinggguanData = data.filter(item => item.type === 'rencana_mingguan')
  const uniqueUnits = Array.from(new Set(rencanaMinggguanData.map(item => item.unit_kerja).filter((unit): unit is string => typeof unit === 'string' && unit !== null))).sort()
  const uniqueStatuses = Array.from(new Set(rencanaMinggguanData.filter(item => item.status).map(item => item.status!))).sort()
  
  // Get unique bulan yang ada di data rencana mingguan
  const uniqueBulanFromData = Array.from(new Set(rencanaMinggguanData.filter(item => item.bulan).map(item => item.bulan!.toString()))).sort((a, b) => parseInt(a) - parseInt(b))

  const bulanOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<'Direncanakan' | 'Dilaksanakan' | 'Dibatalkan' | 'Ditunda' | 'Reschedule', string> = {
      'Direncanakan': 'bg-blue-100 text-blue-800',
      'Dilaksanakan': 'bg-green-100 text-green-800',
      'Dibatalkan': 'bg-red-100 text-red-800',
      'Ditunda': 'bg-yellow-100 text-yellow-800',
      'Reschedule': 'bg-purple-100 text-purple-800',
    };
    return statusColors[status as 'Direncanakan' | 'Dilaksanakan' | 'Dibatalkan' | 'Ditunda' | 'Reschedule'] ?? 'bg-gray-100 text-gray-800';
  }

  // Pagination
  const filteredAndSortedData = getFilteredAndSortedData()
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Chart data preparations
  const statusChartData = statistics?.status_breakdown ? 
    Object.entries(statistics.status_breakdown).map(([status, count]) => ({
      name: status,
      value: count
    })) : []

  const unitChartData = statistics?.unit_statistics ? 
    statistics.unit_statistics
      .filter(unit => unit.rencana_mingguan > 0) // Hanya unit dengan rencana mingguan
      .sort((a, b) => b.rencana_mingguan - a.rencana_mingguan) // Sort berdasarkan rencana mingguan
      .slice(0, 10)
      .map(unit => ({
        name: unit.unit_alias || unit.unit_kerja || 'Unknown',
        rencana: unit.rencana_mingguan,
        total: unit.rencana_mingguan
      })) : []

  // Hitung unit aktif yang memiliki rencana mingguan
  const unitAktifRencanaMingguan = statistics?.unit_statistics ? 
    statistics.unit_statistics.filter(unit => unit.rencana_mingguan > 0).length : 0

  const monthlyChartData = statistics?.monthly_breakdown ?
    Object.entries(statistics.monthly_breakdown).map(([month, count]) => ({
      name: bulanOptions.find(b => b.value === month)?.label || `Bulan ${month}`,
      value: count
    })).sort((a, b) => {
      const aMonth = bulanOptions.find(option => option.label === a.name)?.value || '0'
      const bMonth = bulanOptions.find(option => option.label === b.name)?.value || '0'
      return parseInt(aMonth) - parseInt(bMonth)
    }) : []

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600">Loading data kegiatan...</span>
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
            onClick={fetchData}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Rencana Kegiatan Mingguan</h1>
        <p className="text-blue-600">Monitoring rencana kegiatan mingguan semua unit kerja</p>
      </div>

      {/* Enhanced Summary Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Rencana Mingguan */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:scale-105 group overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Total Rencana Mingguan
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {statistics.total_rencana_mingguan}
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm font-medium text-blue-600">Aktif</span>
                    <span className="text-xs text-gray-500 ml-1">periode ini</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Progress</span>
                  <span className="font-medium text-blue-600 flex items-center">📅 Terjadwal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Aktif */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 hover:scale-105 group overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Unit Aktif
                  </p>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {unitAktifRencanaMingguan}
                  </p>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">Unit</span>
                    <span className="text-xs text-gray-500 ml-1">berpartisipasi</span>
                  </div>
                </div>
                <div className="bg-green-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Partisipasi</span>
                  <span className="font-medium text-green-600 flex items-center">🏢 Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dilaksanakan */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500 hover:scale-105 group overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 mb-1">
                    Dilaksanakan
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 mb-2">
                    {statistics.status_breakdown['Dilaksanakan'] || 0}
                  </p>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm font-medium text-emerald-600">Selesai</span>
                    <span className="text-xs text-gray-500 ml-1">terlaksana</span>
                  </div>
                </div>
                <div className="bg-emerald-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(((statistics.status_breakdown['Dilaksanakan'] || 0) / statistics.total_rencana_mingguan) * 100, 100)}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Completion</span>
                  <span className="font-medium text-emerald-600 flex items-center">✅ Done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direncanakan */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500 hover:scale-105 group overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Direncanakan
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 mb-2">
                    {statistics.status_breakdown['Direncanakan'] || 0}
                  </p>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                    <span className="text-xs text-gray-500 ml-1">menunggu</span>
                  </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <PieChartIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(((statistics.status_breakdown['Direncanakan'] || 0) / statistics.total_rencana_mingguan) * 100, 100)}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Planning</span>
                  <span className="font-medium text-yellow-600 flex items-center">⏳ Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Kegiatan</CardTitle>
            <CardDescription>Breakdown kegiatan berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Units Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Teratas - Rencana Mingguan</CardTitle>
            <CardDescription>Unit dengan rencana kegiatan mingguan terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rencana" fill="#60a5fa" name="Rencana Mingguan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Kegiatan Per Bulan</CardTitle>
          <CardDescription>Rencana kegiatan mingguan per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Filter data dari {rencanaMinggguanData.length} rencana kegiatan mingguan yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls - Single Row Layout */}
          <div className="grid grid-cols-12 gap-3 items-end">
            {/* Search - 4/12 width */}
            <div className="col-span-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari kegiatan atau unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Unit Kerja - 2/12 width */}
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Unit Kerja 
              </label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Semua Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  {uniqueUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status - 2/12 width */}
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulan - 2/12 width */}
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulan
              </label>
              <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {uniqueBulanFromData.map(bulan => {
                    const bulanLabel = bulanOptions.find(b => b.value === bulan)?.label || `Bulan ${bulan}`
                    return (
                      <SelectItem key={bulan} value={bulan}>{bulanLabel}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter - 2/12 width */}
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Aksi</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedUnit('')
                  setSelectedType('')
                  setSelectedStatus('')
                  setSelectedBulan('')
                }}
                className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Filter className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {(searchTerm || selectedUnit || selectedStatus || selectedBulan) && (
            <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Filter aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Pencarian: &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedUnit && selectedUnit !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                  Unit: {selectedUnit}
                </span>
              )}
              {selectedStatus && selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedBulan && selectedBulan !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                  Bulan: {bulanOptions.find(b => b.value === selectedBulan)?.label || selectedBulan}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rencana Mingguan Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rencana Kegiatan Mingguan</CardTitle>
          <CardDescription>
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} dari {filteredAndSortedData.length} rencana kegiatan mingguan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('unit_kerja')}>
                    <div className="flex items-center">
                      Unit Kerja
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('bulan')}>
                    <div className="flex items-center">
                      Periode
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                      {sortConfig.key === null && (
                        <span className="ml-1 text-xs text-blue-600">↓</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('kegiatan')}>
                    <div className="flex items-center">
                      Kegiatan
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jenis Belanja</TableHead>
                  <TableHead>Anggaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.unit_alias || item.unit_kerja || '-'}</div>
                        <div className="text-sm text-gray-500">{item.unit_kerja}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {bulanOptions.find(b => b.value === String(item.bulan))?.label || `Bulan ${item.bulan}`}, Minggu {item.minggu}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div>
                        <div className="font-semibold break-words whitespace-normal leading-tight">{item.kegiatan}</div>
                        {item.deskripsi && (
                          <div className="text-sm text-gray-500 mt-1 break-words whitespace-normal">{item.deskripsi}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.status && (
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.jenis_belanja || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          <strong>Rencana:</strong> {formatCurrency(item.anggaran_rencana || 0)}
                        </div>
                        <div className="text-sm">
                          <strong>Realisasi:</strong> {formatCurrency(item.anggaran_cair || 0)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Menampilkan {startIndex + 1} sampai {Math.min(endIndex, filteredAndSortedData.length)} dari{" "}
                {filteredAndSortedData.length} rencana kegiatan mingguan
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : 
                                 currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                                 currentPage - 2 + i
                  
                  if (pageNum < 1 || pageNum > totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
