// app/user/networking/tambah/page.tsx
"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "sonner"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Handshake,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Plus,
  Activity,
  FileText,
  Edit2,
  Trash2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface NetworkingItem {
  id: number
  instansi: string
  jenis: string
  status: string
  catatan: string
  unit_kerja: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function NetworkingPage() {
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [data, setData] = useState<NetworkingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<NetworkingItem | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Items per page
  const [goToPage, setGoToPage] = useState("")

  const [formData, setFormData] = useState({
    instansi: "",
    jenis: "Kunjungan",
    status: "In Progress",
    catatan: "",
  })

  const jenisOptions = [
    "Joint Seminar", 
    "Kunjungan", 
    "Kerjasama", 
    "Koordinasi", 
    "Workshop", 
    "Pelatihan"
  ]

  const statusOptions = [
    "In Progress", 
    "Selesai", 
    "MoU Ditandatangani", 
    "Menunggu Tindak Lanjut", 
    "Direncanakan"
  ]

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const unitKerjaId = localStorage.getItem("id")
        
        if (!unitKerjaId) {
          throw new Error("Unit kerja ID tidak ditemukan di localStorage. Silakan login ulang.")
        }

        const response = await fetch(`/api/networking/${unitKerjaId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data networking tidak ditemukan untuk unit kerja ini.")
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }

        const networkingData = await response.json()
        setData(networkingData)
        setError(null)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      fetchData()
    }
  }, [])

  // Calculate statistics
  const totalKegiatan = data.length
  const inProgress = data.filter(item => item.status === 'In Progress').length
  const selesai = data.filter(item => item.status === 'Selesai').length
  const direncanakan = data.filter(item => item.status === 'Direncanakan').length

  // Data for charts
  const statusCount = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(statusCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(jenisCount).map(([jenis, count]) => ({
    jenis,
    kegiatan: count,
  }))

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // Reset to first page when data changes or page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: string) => {
    setItemsPerPage(parseInt(size))
    setCurrentPage(1)
  }

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(goToPage)
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        setGoToPage("")
      } else {
        toast.error(`Halaman harus antara 1 dan ${totalPages}`)
      }
    }
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i)
        }
      }
    }
    
    return pageNumbers
  }

  const summaryCards = [
    {
      title: "Total Kegiatan",
      value: totalKegiatan,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+15%',
      description: 'Networking keseluruhan'
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: <Activity className="w-6 h-6" />,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
      change: '+12%',
      description: 'Sedang berjalan'
    },
    {
      title: "Selesai",
      value: selesai,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+20%',
      description: 'Kegiatan terlaksana'
    },
    {
      title: "Direncanakan",
      value: direncanakan,
      icon: <Clock className="w-6 h-6" />,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      textDark: 'text-indigo-800',
      borderColor: 'border-indigo-500',
      change: '+8%',
      description: 'Dalam perencanaan'
    },
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const loadingPromise = new Promise(async (resolve, reject) => {
      try {
        const unitKerjaId = localStorage.getItem("id")
        if (!unitKerjaId) {
          throw new Error("Unit kerja ID tidak ditemukan")
        }

        const response = await fetch(`/api/networking/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instansi: formData.instansi.trim(),
            jenis: formData.jenis,
            status: formData.status,
            catatan: formData.catatan.trim(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        const newItem = result.data

        // Add new item to the data
        setData(prev => [newItem, ...prev])

        // Reset form
        setFormData({
          instansi: "",
          jenis: "Kunjungan",
          status: "In Progress",
          catatan: "",
        })
        setShowModal(false)

        resolve(newItem)
      } catch (err) {
        console.error('Error saving data:', err)
        reject(err)
      } finally {
        setIsSubmitting(false)
      }
    })

    toast.promise(loadingPromise, {
      loading: 'Menyimpan data networking...',
      success: 'Data berhasil ditambahkan!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`,
    })
  }

  const handleEdit = (item: NetworkingItem) => {
    setEditingItem(item)
    setFormData({
      instansi: item.instansi,
      jenis: item.jenis,
      status: item.status,
      catatan: item.catatan || "",
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem) return
    
    setIsEditing(true)

    try {
      const unitKerjaId = localStorage.getItem("id")
      if (!unitKerjaId) {
        throw new Error("Unit kerja ID tidak ditemukan")
      }

      const response = await fetch(`/api/networking/${unitKerjaId}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instansi: formData.instansi.trim(),
          jenis: formData.jenis,
          status: formData.status,
          catatan: formData.catatan.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const updatedItem = result.data

      setData(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ))

      setFormData({
        instansi: "",
        jenis: "Kunjungan",
        status: "In Progress",
        catatan: "",
      })
      setEditingItem(null)
      setShowEditModal(false)

      toast.success('Data berhasil diperbarui!')
      
    } catch (err) {
      console.error('Error updating data:', err)
      toast.error(`Gagal memperbarui: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async (item: NetworkingItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${item.jenis}" dengan "${item.instansi}"?`)) {
      return
    }

    setIsDeleting(true)

    try {
      const unitKerjaId = localStorage.getItem("id")
      if (!unitKerjaId) {
        throw new Error("Unit kerja ID tidak ditemukan")
      }

      const response = await fetch(`/api/networking/${unitKerjaId}/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      setData(prev => prev.filter(dataItem => dataItem.id !== item.id))
      toast.success('Kegiatan berhasil dihapus!')
      
    } catch (err) {
      console.error('Error deleting data:', err)
      toast.error(`Gagal menghapus: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data networking...</p>
            <p className="text-sm text-gray-500 mt-2">Mengambil informasi dari database...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="text-red-600 mr-3 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium text-lg">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => {
                window.location.reload()
                toast.info("Memuat ulang halaman...")
              }} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Sonner Toaster */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={true}
        duration={4000}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Kegiatan Networking</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan networking dengan instansi lain</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Tambah Kegiatan Networking</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Instansi */}
              <div className="space-y-1">
                <Label htmlFor="instansi">Instansi / Pihak Terkait</Label>
                <Input
                  id="instansi"
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Kementerian PANRB"
                />
              </div>

              {/* Jenis Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Kegiatan</Label>
                <Select
                  value={formData.jenis}
                  onValueChange={(value) => handleSelectChange("jenis", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="jenis">
                    <SelectValue placeholder="Pilih jenis kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
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

              {/* Catatan */}
              <div className="space-y-1">
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                  id="catatan"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({
                      instansi: "",
                      jenis: "Kunjungan",
                      status: "In Progress",
                      catatan: "",
                    })
                    toast.info("Form dibatalkan")
                  }}
                  type="button"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Summary Cards */}
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
                  <p className={`text-3xl font-bold ${card.textColor} mb-2`}>
                    {card.value}
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">
                      {card.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                  </div>
                </div>
                <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  <div className={card.textColor}>
                    {card.icon}
                  </div>
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
                  <span>{card.description}</span>
                  <span className={`font-medium ${card.textColor}`}>
                    🤝 Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Status Kegiatan
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
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

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Kegiatan per Jenis
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="jenis" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="kegiatan" 
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

      {/* Enhanced Table with Actions */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Data Kegiatan Networking</h2>
              <p className="text-blue-100 text-sm">Monitoring kegiatan networking dengan instansi lain</p>
            </div>
            {data.length > 0 && (
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total: {data.length} kegiatan</p>
                {totalPages > 1 && (
                  <p className="text-blue-200 text-xs">Halaman {currentPage} dari {totalPages}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Instansi</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Catatan</TableHead>
                <TableHead className="text-center font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{startIndex + index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <Building className="w-3 h-3 mr-1 text-gray-400" />
                      {item.instansi}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Kunjungan' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Kerjasama' ? 'bg-purple-100 text-purple-800' :
                      item.jenis === 'Koordinasi' ? 'bg-green-100 text-green-800' :
                      item.jenis === 'Joint Seminar' ? 'bg-indigo-100 text-indigo-800' :
                      item.jenis === 'Workshop' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.jenis === 'Kunjungan' ? <MapPin className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Kerjasama' ? <Handshake className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Koordinasi' ? <Users className="w-3 h-3 mr-1" /> :
                       <FileText className="w-3 h-3 mr-1" />}
                      {item.jenis}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      item.status === 'MoU Ditandatangani' ? 'bg-purple-100 text-purple-800' :
                      item.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                      item.status === 'Direncanakan' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'MoU Ditandatangani' ? <Award className="w-3 h-3 mr-1" /> :
                       item.status === 'In Progress' ? <Activity className="w-3 h-3 mr-1" /> :
                       <Clock className="w-3 h-3 mr-1" />}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {item.catatan || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        disabled={isDeleting}
                        className="h-8 px-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        className="h-8 px-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info and Page Size Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} hingga {Math.min(endIndex, data.length)} dari {data.length} data
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampilkan:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">per halaman</span>
                </div>
                {totalPages > 5 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Ke halaman:</span>
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      onKeyDown={handleGoToPage}
                      placeholder={currentPage.toString()}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-gray-600">dari {totalPages}</span>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={`cursor-pointer hover:bg-blue-50 ${
                          currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                        }`}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={`cursor-pointer hover:bg-blue-50 ${
                          currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada data networking. Tambahkan kegiatan pertama Anda!
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Edit Kegiatan Networking</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Instansi */}
            <div className="space-y-1">
              <Label htmlFor="editInstansi">Instansi / Pihak Terkait</Label>
              <Input
                id="editInstansi"
                name="instansi"
                value={formData.instansi}
                onChange={handleChange}
                required
                disabled={isEditing}
                placeholder="Contoh: Kementerian PANRB"
              />
            </div>

            {/* Jenis Kegiatan */}
            <div className="space-y-1">
              <Label htmlFor="editJenis">Jenis Kegiatan</Label>
              <Select
                value={formData.jenis}
                onValueChange={(value) => handleSelectChange("jenis", value)}
                disabled={isEditing}
              >
                <SelectTrigger id="editJenis">
                  <SelectValue placeholder="Pilih jenis kegiatan" />
                </SelectTrigger>
                <SelectContent>
                  {jenisOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isEditing}
              >
                <SelectTrigger id="editStatus">
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

            {/* Catatan */}
            <div className="space-y-1">
              <Label htmlFor="editCatatan">Catatan</Label>
              <textarea
                id="editCatatan"
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                disabled={isEditing}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
                  setFormData({
                    instansi: "",
                    jenis: "Kunjungan",
                    status: "In Progress",
                    catatan: "",
                  })
                }}
                type="button"
                disabled={isEditing}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memperbarui...
                  </>
                ) : (
                  'Perbarui'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Handshake className="w-6 h-6 mr-2 text-purple-500" />
          Kegiatan Networking Terbaru
        </h2>
        <div className="space-y-4">
          {data
            .slice(0, 3)
            .map((item) => (
            <div key={item.id} className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
              item.status === 'Selesai' ? 'bg-green-50 border-green-500' :
              item.status === 'MoU Ditandatangani' ? 'bg-purple-50 border-purple-500' :
              item.status === 'In Progress' ? 'bg-orange-50 border-orange-500' :
              'bg-yellow-50 border-yellow-500'
            }`}>
              <div className={`rounded-full p-2 ${
                item.status === 'Selesai' ? 'bg-green-500' :
                item.status === 'MoU Ditandatangani' ? 'bg-purple-500' :
                item.status === 'In Progress' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}>
                {item.status === 'Selesai' ? <CheckCircle className="w-4 h-4 text-white" /> :
                 item.status === 'MoU Ditandatangani' ? <Award className="w-4 h-4 text-white" /> :
                 item.status === 'In Progress' ? <Activity className="w-4 h-4 text-white" /> :
                 <Clock className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  item.status === 'Selesai' ? 'text-green-800' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-800' :
                  item.status === 'In Progress' ? 'text-orange-800' :
                  'text-yellow-800'
                }`}>
                  {item.jenis} dengan {item.instansi}
                </h3>
                <p className={`text-sm ${
                  item.status === 'Selesai' ? 'text-green-600' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-600' :
                  item.status === 'In Progress' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  {item.catatan || `Status: ${item.status}`}
                </p>
                <p className={`text-xs mt-1 ${
                  item.status === 'Selesai' ? 'text-green-500' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-500' :
                  item.status === 'In Progress' ? 'text-orange-500' :
                  'text-yellow-500'
                }`}>
                  {item.status}
                </p>
              </div>
            </div>
          ))}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada aktivitas terbaru. Tambahkan kegiatan pertama Anda!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
