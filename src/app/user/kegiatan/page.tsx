"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart,Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RencanaMingguan {
  id: number
  minggu: number
  kegiatan: string
  unit_id: number
  jenis_belanja: string
  anggaran_rencana: number
  anggaran_cair: number
  created_at: string
  bulan: number
  status: string
}

interface SerapanData {
  total_realisasi: number
  detail_per_bulan: Array<{
    bulan: number
    pagu_anggaran: number
    realisasi: number
  }>
}

const bulanOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
]

const mingguOptions = [
  { value: 1, label: 'Minggu ke-1' },
  { value: 2, label: 'Minggu ke-2' },
  { value: 3, label: 'Minggu ke-3' },
  { value: 4, label: 'Minggu ke-4' },
  { value: 5, label: 'Minggu ke-5' },
  { value: 6, label: 'Minggu ke-6' }
]

const statusOptions = ["Direncanakan","Dilaksanakan", "Dibatalkan", "Ditunda", "Reschedule"]

const jenisBelanjaOptions = [
  { value: '51', label: '51 - Belanja Pegawai' },
  { value: '52', label: '52 - Belanja Barang Jasa' },
  { value: '53', label: '53 - Belanja Modal' }
]

export default function RencanaKegiatanPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<RencanaMingguan[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [serapanData, setSerapanData] = useState<SerapanData | null>(null)

  // Search, Filter, and Sort states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterBulan, setFilterBulan] = useState("all")
  const [filterJenisBelanja, setFilterJenisBelanja] = useState("all")
  const [sortField, setSortField] = useState<keyof RencanaMingguan | "">("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    bulan: '',
    minggu: '',
    kegiatan: '',
    jenis_belanja: '',
    anggaran_rencana: '',
    anggaran_cair: '',
    status: 'Direncanakan',
  })

  // Effect untuk mengubah anggaran_cair ketika status berubah
  useEffect(() => {
    if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(formData.status)) {
      setFormData(prev => ({ ...prev, anggaran_cair: '0' }))
    }
  }, [formData.status])

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const unitKerjaId = localStorage.getItem('id')
        
        if (!unitKerjaId) {
          throw new Error('Unit kerja ID tidak ditemukan. Silakan login ulang.')
        }
        
        // Fetch rencana mingguan data
        const rencanaResponse = await fetch(`/api/rencana-mingguan/${unitKerjaId}`)
        if (!rencanaResponse.ok) {
          throw new Error('Failed to fetch rencana data')
        }
        const rencanaResult = await rencanaResponse.json()
        setData(rencanaResult.data || [])

        // Fetch serapan anggaran data
        const serapanResponse = await fetch(`/api/serapan/${unitKerjaId}`)
        if (serapanResponse.ok) {
          const serapanResult = await serapanResponse.json()
          setSerapanData(serapanResult)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Gagal memuat data rencana kegiatan')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics
  const totalKegiatan = data.length
  const direncanakan = data.filter(item => item.status === 'Direncanakan').length
  const dilaksanakan = data.filter(item => item.status === 'Dilaksanakan').length
  const dibatalkan = data.filter(item => item.status === 'Dibatalkan').length
  const ditunda = data.filter(item => item.status === 'Ditunda').length
  const reschedule = data.filter(item => item.status === 'Reschedule').length

  // Get latest Pagu Anggaran and total realisasi from serapan data
  const getPaguAnggaranTerbaru = () => {
    if (!serapanData || !serapanData.detail_per_bulan || serapanData.detail_per_bulan.length === 0) {
      return 0
    }
    // Get the latest month's pagu anggaran
    const latestData = serapanData.detail_per_bulan[serapanData.detail_per_bulan.length - 1]
    return latestData.pagu_anggaran || 0
  }

  const getTotalRealisasiSerapan = () => {
    return serapanData?.total_realisasi || 0
  }

  // Data for charts
  const statusChartData = [
    { name: 'Direncanakan', value: direncanakan, color: '#60a5fa' },
    { name: 'Dilaksanakan', value: dilaksanakan, color: '#34d399' },
    { name: 'Dibatalkan', value: dibatalkan, color: '#ef4444' },
    { name: 'Ditunda', value: ditunda, color: '#fbbf24' },
    { name: 'Reschedule', value: reschedule, color: '#f472b6' }
  ].filter(item => item.value > 0)

  const anggaranPerBulan = bulanOptions.map(bulan => {
    const kegiatanBulan = data.filter(item => item.bulan === bulan.value)
    return {
      bulan: bulan.label,
      rencana: kegiatanBulan.reduce((sum, item) => sum + item.anggaran_rencana, 0),
      realisasi: kegiatanBulan.reduce((sum, item) => sum + item.anggaran_cair, 0)
    }
  }).filter(item => item.rencana > 0 || item.realisasi > 0)

  // Filter and search data
  const filteredData = data.filter(item => {
    const matchesSearch = item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jenis_belanja.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "" || filterStatus === "all" || item.status === filterStatus
    const matchesBulan = filterBulan === "" || filterBulan === "all" || item.bulan.toString() === filterBulan
    const matchesJenisBelanja = filterJenisBelanja === "" || filterJenisBelanja === "all" || item.jenis_belanja === filterJenisBelanja
    
    return matchesSearch && matchesStatus && matchesBulan && matchesJenisBelanja
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle sort
  const handleSort = (field: keyof RencanaMingguan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterBulan("all")
    setFilterJenisBelanja("all")
    setSortField("")
    setSortDirection("asc")
    setCurrentPage(1)
  }

  const summaryCards = [
    {
      title: "Total Kegiatan",
      value: totalKegiatan,
      icon: <Calendar className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      description: 'Total rencana kegiatan'
    },
    {
      title: "Pagu Anggaran",
      value: `Rp ${getPaguAnggaranTerbaru().toLocaleString('id-ID')}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      description: 'Pagu anggaran bulan terakhir'
    },
    {
      title: "Realisasi Anggaran",
      value: `Rp ${getTotalRealisasiSerapan().toLocaleString('id-ID')}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      description: 'Total realisasi kumulatif'
    },
    {
      title: "Direncanakan",
      value: direncanakan,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'cyan',
      bgGradient: 'from-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      textDark: 'text-cyan-800',
      borderColor: 'border-cyan-500',
      description: 'Kegiatan direncanakan'
    }
  ]

  const resetForm = () => {
    setFormData({
      bulan: '',
      minggu: '',
      kegiatan: '',
      jenis_belanja: '',
      anggaran_rencana: '',
      anggaran_cair: '',
      status: 'Direncanakan',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const unitKerjaId = localStorage.getItem('id')
      
      if (!unitKerjaId) {
        throw new Error('Unit kerja ID tidak ditemukan. Silakan login ulang.')
      }

      if (editingId) {
        // Update existing item
        const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update rencana kegiatan')
        }

        const result = await response.json()
        setData(prev => prev.map(item => 
          item.id === editingId ? result.data : item
        ))
        alert('Data berhasil diperbarui!')
      } else {
        // Create new item
        const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create rencana kegiatan')
        }

        const result = await response.json()
        setData(prev => [...prev, result.data])
        alert('Data berhasil disimpan!')
      }

      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving data:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (item: RencanaMingguan) => {
    setFormData({
      bulan: item.bulan.toString(),
      minggu: item.minggu.toString(),
      kegiatan: item.kegiatan,
      jenis_belanja: item.jenis_belanja,
      anggaran_rencana: item.anggaran_rencana.toString(),
      anggaran_cair: item.anggaran_cair.toString(),
      status: item.status,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return

    try {
      const unitKerjaId = localStorage.getItem('id')
      const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete data')
      }

      setData(prev => prev.filter(item => item.id !== id))
      alert('Data berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('Gagal menghapus data')
    }
  }

  const getBulanLabel = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan)
    return bulanObj ? bulanObj.label : `Bulan ${bulan}`
  }

  const getJenisBelanjaLabel = (jenisKode: string) => {
    const jenisObj = jenisBelanjaOptions.find(j => j.value === jenisKode)
    return jenisObj ? jenisObj.label : jenisKode
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Direncanakan':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'Dibatalkan':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'Ditunda':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'Reschedule':
        return <AlertTriangle className="w-4 h-4 text-pink-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render charts until component is mounted on client
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Rencana Kegiatan Mingguan
          </h1>
          <p className="text-gray-600">
            Kelola dan pantau rencana kegiatan mingguan beserta anggarannya
          </p>
        </div>
        
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rencana
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Rencana Kegiatan' : 'Tambah Rencana Kegiatan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulan" className="text-sm font-medium text-gray-700">
                    Bulan
                  </Label>
                  <Select value={formData.bulan} onValueChange={(value) => setFormData({...formData, bulan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {bulanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minggu" className="text-sm font-medium text-gray-700">
                    Minggu
                  </Label>
                  <Select value={formData.minggu} onValueChange={(value) => setFormData({...formData, minggu: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih minggu" />
                    </SelectTrigger>
                    <SelectContent>
                      {mingguOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="kegiatan" className="text-sm font-medium text-gray-700">
                  Kegiatan
                </Label>
                <Input
                  id="kegiatan"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
                  placeholder="Masukkan nama kegiatan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="jenis_belanja" className="text-sm font-medium text-gray-700">
                  Jenis Belanja
                </Label>
                <Select value={formData.jenis_belanja} onValueChange={(value) => setFormData({...formData, jenis_belanja: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis belanja" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisBelanjaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="anggaran_rencana" className="text-sm font-medium text-gray-700">
                  Anggaran Rencana
                </Label>
                <Input
                  id="anggaran_rencana"
                  type="number"
                  value={formData.anggaran_rencana}
                  onChange={(e) => setFormData({...formData, anggaran_rencana: e.target.value})}
                  placeholder="Masukkan anggaran rencana"
                  required
                />
              </div>

              <div>
                <Label htmlFor="anggaran_cair" className="text-sm font-medium text-gray-700">
                  Anggaran Realisasi (Cair)
                </Label>
                <Input
                  id="anggaran_cair"
                  type="number"
                  value={formData.anggaran_cair}
                  onChange={(e) => setFormData({...formData, anggaran_cair: e.target.value})}
                  placeholder="Masukkan anggaran realisasi"
                  disabled={['Dibatalkan', 'Ditunda', 'Reschedule'].includes(formData.status)}
                />
                {['Dibatalkan', 'Ditunda', 'Reschedule'].includes(formData.status) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Anggaran realisasi otomatis 0 untuk status ini
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.textColor} mb-2`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <PieChartIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Distribusi Status Kegiatan</h3>
          </div>
          {statusChartData.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>

        {/* Budget Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Anggaran per Bulan</h3>
          </div>
          {anggaranPerBulan.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anggaranPerBulan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number, name: number) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name.toString()]} />
                  <Legend />
                  <Bar dataKey="rencana" fill="#60a5fa" name="Anggaran Rencana" />
                  <Bar dataKey="realisasi" fill="#34d399" name="Anggaran Realisasi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Data Rencana Kegiatan</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari kegiatan atau jenis belanja..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filter Status */}
              <Select value={filterStatus} onValueChange={(value) => {
                setFilterStatus(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Bulan */}
              <Select value={filterBulan} onValueChange={(value) => {
                setFilterBulan(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanOptions.map((bulan) => (
                    <SelectItem key={bulan.value} value={bulan.value.toString()}>
                      {bulan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Jenis Belanja */}
              <Select value={filterJenisBelanja} onValueChange={(value) => {
                setFilterJenisBelanja(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Jenis Belanja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisBelanjaOptions.map((jenis) => (
                    <SelectItem key={jenis.value} value={jenis.value}>
                      {jenis.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="px-3"
                title="Bersihkan filter"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan {sortedData.length} dari {data.length} data
            {(searchTerm || (filterStatus !== "all") || (filterBulan !== "all") || (filterJenisBelanja !== "all")) && (
              <span className="ml-2 text-blue-600">(dengan filter)</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('bulan')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Bulan
                    {sortField === 'bulan' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('minggu')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Minggu
                    {sortField === 'minggu' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('kegiatan')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Kegiatan
                    {sortField === 'kegiatan' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('jenis_belanja')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Jenis Belanja
                    {sortField === 'jenis_belanja' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('anggaran_rencana')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Anggaran Rencana
                    {sortField === 'anggaran_rencana' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('anggaran_cair')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Anggaran Realisasi
                    {sortField === 'anggaran_cair' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Status
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{getBulanLabel(item.bulan)}</TableCell>
                    <TableCell>Minggu ke-{item.minggu}</TableCell>
                    <TableCell>{item.kegiatan}</TableCell>
                    <TableCell>{getJenisBelanjaLabel(item.jenis_belanja)}</TableCell>
                    <TableCell>Rp {item.anggaran_rencana.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {item.anggaran_cair.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`text-sm font-medium ${
                          item.status === 'Direncanakan' ? 'text-blue-600' :
                          item.status === 'Dilaksanakan' ? 'text-green-600' :
                          item.status === 'Dibatalkan' ? 'text-red-600' :
                          item.status === 'Ditunda' ? 'text-yellow-600' :
                          item.status === 'Reschedule' ? 'text-pink-600' : 'text-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="hover:bg-red-50 hover:border-red-300 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Belum ada data rencana kegiatan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} dari {sortedData.length} data
              {sortedData.length !== data.length && (
                <span className="text-gray-500"> (difilter dari {data.length} total)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(page)}
                  className={page === currentPage ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-50"}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
