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
  Users,
  Calendar,
  TrendingUp,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  Clock,
  Plus,
  Edit2,
  Trash2
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

interface PenyelenggaraanItem {
  id: number
  namaKegiatan: string
  tanggal: string
  jumlahPeserta: number
  jenis_bangkom_non_pelatihan?: {
    jenis_bangkom: string
  }
  users?: {
    unit_kerja: string
  }
}

interface JenisBangkomOption {
  id: number
  jenis_bangkom: string
  created_at: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function PenyelenggaraanBangkomPage() {
  // All useState hooks - keep them at the top and in consistent order
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [data, setData] = useState<PenyelenggaraanItem[]>([])
  const [options, setOptions] = useState<JenisBangkomOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingItem, setEditingItem] = useState<PenyelenggaraanItem | null>(null)
  const [filterJenis, setFilterJenis] = useState<string>('all') 
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const [formData, setFormData] = useState({
    namaKegiatan: '',
    tanggal: '',
    jenis_bangkom_id: '',
    jumlahPeserta: ''
  })

  // All useEffect hooks - keep them together after useState
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const unitKerjaId = localStorage.getItem("id")
        
        if (!unitKerjaId) {
          throw new Error("Unit kerja ID tidak ditemukan di localStorage. Silakan login ulang.")
        }

        const [penyelenggaraanResponse, jenisBangkomResponse] = await Promise.all([
          fetch(`/api/penyelenggaraan/${unitKerjaId}`),
          fetch('/api/jenis_bangkom')
        ])

        if (!penyelenggaraanResponse.ok) {
          if (penyelenggaraanResponse.status === 404) {
            throw new Error("Data penyelenggaraan tidak ditemukan untuk unit kerja ini.")
          } else {
            throw new Error(`HTTP error! status: ${penyelenggaraanResponse.status}`)
          }
        }

        if (!jenisBangkomResponse.ok) {
          throw new Error(`HTTP error! status: ${jenisBangkomResponse.status}`)
        }

        const penyelenggaraanData = await penyelenggaraanResponse.json()
        const jenisBangkomData = await jenisBangkomResponse.json()

        setData(penyelenggaraanData)
        setOptions(jenisBangkomData)
        setError(null)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
        setData([])
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      fetchData()
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterJenis])

  // Calculate statistics - move calculations after hooks
  const totalKegiatan = data.length
  const totalPeserta = data.reduce((sum, item) => sum + item.jumlahPeserta, 0)
  const rataRataPeserta = totalKegiatan > 0 ? Math.round(totalPeserta / totalKegiatan) : 0
  const bulanIni = data.filter(item => {
    const today = new Date()
    const itemDate = new Date(item.tanggal)
    return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()
  }).length

  // Filter data based on selected jenis
  const filteredData = filterJenis && filterJenis !== 'all'
    ? data.filter(item => item.jenis_bangkom_non_pelatihan?.jenis_bangkom === filterJenis)
    : data

  // Get unique jenis bangkom for filter options
  const uniqueJenisBangkom = Array.from(
    new Set(
      data
        .map(item => item.jenis_bangkom_non_pelatihan?.jenis_bangkom)
        .filter((jenis): jenis is string => typeof jenis === 'string')
    )
  ).sort()

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Data for charts
  const jenisCount = data.reduce((acc, item) => {
    const jenis = item.jenis_bangkom_non_pelatihan?.jenis_bangkom
    if (jenis) {
      acc[jenis] = (acc[jenis] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(jenisCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    acc[month] = (acc[month] || 0) + item.jumlahPeserta
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData).map(([month, peserta]) => ({
    month,
    peserta,
  }))

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Kegiatan",
      value: totalKegiatan.toLocaleString(),
      icon: <GraduationCap className="w-8 h-8" />,
      bgLight: "bg-blue-100",
      textColor: "text-blue-600",
      textDark: "text-blue-800",
      borderColor: "border-blue-500",
      bgGradient: "from-blue-400 to-blue-600",
      change: "+12.5%",
      description: "Total kegiatan terdaftar"
    },
    {
      title: "Total Peserta",
      value: totalPeserta.toLocaleString(),
      icon: <Users className="w-8 h-8" />,
      bgLight: "bg-green-100",
      textColor: "text-green-600",
      textDark: "text-green-800",
      borderColor: "border-green-500",
      bgGradient: "from-green-400 to-green-600",
      change: "+8.2%",
      description: "Peserta keseluruhan"
    },
    {
      title: "Rata-rata Peserta",
      value: rataRataPeserta.toLocaleString(),
      icon: <BarChart3 className="w-8 h-8" />,
      bgLight: "bg-yellow-100",
      textColor: "text-yellow-600",
      textDark: "text-yellow-800",
      borderColor: "border-yellow-500",
      bgGradient: "from-yellow-400 to-yellow-600",
      change: "+3.1%",
      description: "Per kegiatan"
    },
    {
      title: "Kegiatan Bulan Ini",
      value: bulanIni.toLocaleString(),
      icon: <Calendar className="w-8 h-8" />,
      bgLight: "bg-purple-100",
      textColor: "text-purple-600",
      textDark: "text-purple-800",
      borderColor: "border-purple-500",
      bgGradient: "from-purple-400 to-purple-600",
      change: "+15.3%",
      description: "Periode berjalan"
    }
  ]

  // Event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, jenis_bangkom_id: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const loadingPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const unitKerjaId = localStorage.getItem("id")
          if (!unitKerjaId) {
            throw new Error("Unit kerja ID tidak ditemukan")
          }

          const response = await fetch(`/api/penyelenggaraan/${unitKerjaId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              namaKegiatan: formData.namaKegiatan,
              tanggal: formData.tanggal,
              jenis_bangkom_id: parseInt(formData.jenis_bangkom_id),
              jumlahPeserta: parseInt(formData.jumlahPeserta),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
          }

          const newItem = await response.json()
          
          if (newItem && newItem.jenis_bangkom_non_pelatihan) {
            setData(prev => [newItem, ...prev])
          } else {
            const refreshResponse = await fetch(`/api/penyelenggaraan/${unitKerjaId}`)
            if (refreshResponse.ok) {
              const refreshedData = await refreshResponse.json()
              setData(refreshedData)
            }
          }

          setFormData({
            namaKegiatan: '',
            tanggal: '',
            jenis_bangkom_id: '',
            jumlahPeserta: ''
          })
          setShowModal(false)

          resolve(newItem)
        } catch (err) {
          console.error('Error saving data:', err)
          reject(err)
        } finally {
          setIsSubmitting(false)
        }
      }, 500)
    })

    toast.promise(loadingPromise, {
      loading: 'Menyimpan data kegiatan...',
      success: 'Data berhasil ditambahkan!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`,
    })
  }
  const handleEdit = (item: PenyelenggaraanItem) => {
    setEditingItem(item)
    
    // Format tanggal untuk input HTML date (YYYY-MM-DD)
    const formattedDate = new Date(item.tanggal).toISOString().split('T')[0]
    
    setFormData({
      namaKegiatan: item.namaKegiatan,
      tanggal: formattedDate,
      jenis_bangkom_id: item.jenis_bangkom_non_pelatihan ? 
        options.find(opt => opt.jenis_bangkom === item.jenis_bangkom_non_pelatihan?.jenis_bangkom)?.id.toString() || '' : '',
      jumlahPeserta: item.jumlahPeserta.toString()
    })
    setShowEditModal(true)
  }
  const handleDelete = async (item: PenyelenggaraanItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${item.namaKegiatan}"?`)) {
      return
    }

    setIsDeleting(true)

    const loadingPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const unitKerjaId = localStorage.getItem("id")
          if (!unitKerjaId) {
            throw new Error("Unit kerja ID tidak ditemukan")
          }

          const response = await fetch(`/api/penyelenggaraan/${unitKerjaId}/${item.id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
          }

          setData(prev => prev.filter(dataItem => dataItem.id !== item.id))
          resolve({ success: true })
        } catch (err) {
          console.error('Error deleting data:', err)
          reject(err)
        } finally {
          setIsDeleting(false)
        }
      }, 300)
    })

    toast.promise(loadingPromise, {
      loading: 'Menghapus kegiatan...',
      success: 'Kegiatan berhasil dihapus!',      error: (err) => `Gagal menghapus: ${err.message || 'Terjadi kesalahan'}`,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem) return
    
    setIsEditing(true)

    const loadingPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const unitKerjaId = localStorage.getItem("id")
          if (!unitKerjaId) {
            throw new Error("Unit kerja ID tidak ditemukan")
          }

          const requestData = {
            namaKegiatan: formData.namaKegiatan,
            tanggal: formData.tanggal,
            jenis_bangkom_id: parseInt(formData.jenis_bangkom_id),
            jumlahPeserta: parseInt(formData.jumlahPeserta),
          }

          console.log('Sending PUT request with data:', requestData)
          console.log('URL:', `/api/penyelenggaraan/${unitKerjaId}/${editingItem.id}`)

          const response = await fetch(`/api/penyelenggaraan/${unitKerjaId}/${editingItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('API Error Response:', errorData)
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
          }

          const updatedItem = await response.json()
          console.log('Received updated item:', updatedItem)
          
          setData(prev => prev.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ))

          setFormData({
            namaKegiatan: '',
            tanggal: '',
            jenis_bangkom_id: '',
            jumlahPeserta: ''
          })
          setEditingItem(null)
          setShowEditModal(false)

          resolve(updatedItem)
        } catch (err) {
          console.error('Error updating data:', err)
          reject(err)
        } finally {
          setIsEditing(false)
        }
      }, 500)
    })

    toast.promise(loadingPromise, {
      loading: 'Memperbarui data kegiatan...',
      success: 'Data berhasil diperbarui!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat memperbarui data'}`,
    })
  }

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data penyelenggaraan...</p>
            <p className="text-sm text-gray-500 mt-2">Mengambil informasi dari database...</p>
          </div>
        </div>
      </div>
    )
  }

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

      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Penyelenggaraan Bangkom</h1>
          <p>Kelola dan monitor penyelenggaraan kegiatan bangkom:
            <br/>
            <span>(Seminar, Webinar, Bimtek, Talkshow, Penilaian Kompetensi,</span>
            <br/>
            <span>Lab inovasi, Sosialisasi, dan lainnya)</span>
          </p>
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
              <DialogTitle className="text-blue-700">Form Penyelenggaraan Bangkom</DialogTitle>
            </DialogHeader>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                <Input
                  id="namaKegiatan"
                  name="namaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Lab. Inovasi Kab. Tanjung Jabung Timur"
                />
              </div>

              {/* Tanggal Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="tanggal">Tanggal Kegiatan</Label>
                <Input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Jenis Bangkom */}
              <div className="space-y-1">
                <Label htmlFor="jenis_bangkom">Jenis Bangkom</Label>
                <Select 
                  onValueChange={handleSelectChange} 
                  value={formData.jenis_bangkom_id}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="jenis_bangkom">
                    <SelectValue placeholder="Pilih jenis bangkom" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.jenis_bangkom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jumlah Peserta */}
              <div className="space-y-1">
                <Label htmlFor="jumlahPeserta">Jumlah Peserta</Label>
                <Input
                  id="jumlahPeserta"
                  type="number"
                  name="jumlahPeserta"
                  value={formData.jumlahPeserta}
                  onChange={handleChange}
                  min="1"
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: 30"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
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
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((typeof card.value === 'string' ? parseInt(card.value.replace(/,/g, '')) : card.value) / Math.max(...summaryCards.map(c => typeof c.value === 'string' ? parseInt(c.value.replace(/,/g, '')) : c.value)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>{card.description}</span>
                  <span className={`font-medium ${card.textColor}`}>
                    📈 Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            Peserta per Bulan
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="peserta" 
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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Jenis Bangkom
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
      </div>

      {/* Enhanced Table with Filter and Pagination */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Penyelenggaraan Bangkom</h2>
          <p className="text-blue-100 text-sm">Monitoring kegiatan bangkom non-pelatihan dan peserta</p>
        </div>
        
        {/* Filter Section */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Label htmlFor="filterJenis" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter Jenis:
              </Label>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger id="filterJenis" className="w-64">
                  <SelectValue placeholder="Semua Jenis Bangkom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis Bangkom</SelectItem>
                  {uniqueJenisBangkom.map((jenis) => (
                    <SelectItem key={jenis} value={jenis}>
                      {jenis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Per halaman:
                </Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger id="itemsPerPage" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Menampilkan:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {filteredData.length} dari {data.length} kegiatan
                </span>
                {filterJenis && filterJenis !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterJenis('all')}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-2"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Kegiatan</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis Bangkom</TableHead>
                <TableHead className="text-right font-medium">Jumlah Peserta</TableHead>
                <TableHead className="text-center font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{startIndex + index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.namaKegiatan}</TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      {item.jenis_bangkom_non_pelatihan?.jenis_bangkom ?? "Tidak diketahui"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jumlahPeserta >= 100 ? 'bg-green-100 text-green-800' :
                      item.jumlahPeserta >= 50 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Users className="w-3 h-3 mr-1" />
                      {item.jumlahPeserta}
                    </span>
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
        {filteredData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  ⟪
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  ‹
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNumber 
                            ? "bg-blue-600 text-white" 
                            : "hover:bg-blue-50"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  ⟫
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredData.length === 0 && data.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">🔍</div>
            <p>Tidak ada kegiatan untuk jenis &quot;{filterJenis}&quot;</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterJenis('all')}
              className="text-blue-600 hover:text-blue-800 mt-2"
            >
              Tampilkan Semua
            </Button>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada data penyelenggaraan. Tambahkan kegiatan pertama Anda!
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Edit Penyelenggaraan Bangkom</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="editNamaKegiatan">Nama Kegiatan</Label>
              <Input
                id="editNamaKegiatan"
                name="namaKegiatan"
                value={formData.namaKegiatan}
                onChange={handleChange}
                required
                disabled={isEditing}
                placeholder="Contoh: Lab. Inovasi Kab. Tanjung Jabung Timur"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editTanggal">Tanggal Kegiatan</Label>
              <Input
                id="editTanggal"
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
                disabled={isEditing}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editJenisBangkom">Jenis Bangkom</Label>
              <Select 
                onValueChange={handleSelectChange} 
                value={formData.jenis_bangkom_id}
                disabled={isEditing}
              >
                <SelectTrigger id="editJenisBangkom">
                  <SelectValue placeholder="Pilih jenis bangkom" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.jenis_bangkom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="editJumlahPeserta">Jumlah Peserta</Label>
              <Input
                id="editJumlahPeserta"
                type="number"
                name="jumlahPeserta"
                value={formData.jumlahPeserta}
                onChange={handleChange}
                min="1"
                required
                disabled={isEditing}
                placeholder="Contoh: 30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
                  setFormData({
                    namaKegiatan: '',
                    tanggal: '',
                    jenis_bangkom_id: '',
                    jumlahPeserta: ''
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
          <Clock className="w-6 h-6 mr-2 text-purple-500" />
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          {data
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
            .slice(0, 3)
            .map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="bg-blue-500 rounded-full p-2">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">{item.namaKegiatan}</h3>
                <p className="text-sm text-blue-600">
                  {item.jumlahPeserta} peserta • {item.jenis_bangkom_non_pelatihan?.jenis_bangkom ?? "Tidak diketahui"}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
