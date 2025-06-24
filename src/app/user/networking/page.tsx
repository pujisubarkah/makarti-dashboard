// app/user/networking/tambah/page.tsx
"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'
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
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Handshake,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  AlertCircle,
  RefreshCw,
  Edit,
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

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6', '#06b6d4']

// Fetcher function untuk SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  return res.json()
}

export default function NetworkingPage() {
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<NetworkingItem | null>(null)
  const [unitKerjaId, setUnitKerjaId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    instansi: "",
    jenis: "Joint Seminar",
    status: "In Progress",
    catatan: "",
  })

  const [editFormData, setEditFormData] = useState({
    instansi: "",
    jenis: "Joint Seminar", 
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

  // Get unit_kerja_id from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('id')
      setUnitKerjaId(id)
    }
  }, [])

  // SWR hook untuk fetch data
  const { 
    data: apiData, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    unitKerjaId ? `/api/networking/${unitKerjaId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  const data: NetworkingItem[] = apiData || []

  // Calculate statistics
  const totalKegiatan = data.length
  const selesai = data.filter(item => item.status === 'Selesai').length
  const mouDitandatangani = data.filter(item => item.status === 'MoU Ditandatangani').length
  const inProgress = data.filter(item => item.status === 'In Progress').length
  

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
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+10%',
      description: 'Sedang berlangsung'
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
      title: "MoU Aktif",
      value: mouDitandatangani,
      icon: <Award className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+25%',
      description: 'Kerjasama resmi'
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

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle Submit untuk Tambah Data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!unitKerjaId) {
      alert("Unit kerja ID tidak ditemukan. Silakan login ulang.")
      return
    }

    if (!formData.instansi.trim()) {
      alert("Nama instansi harus diisi.")
      return
    }

    setIsSubmitting(true)

    try {
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

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          alert(`Data networking sudah ada!\n\nInstansi: ${formData.instansi}\nJenis: ${formData.jenis}\n\nSilakan cek data yang sudah ada atau gunakan nama instansi yang berbeda.`)
        } else if (response.status === 400) {
          alert(`Data tidak valid:\n${result.error || 'Periksa kembali data yang dimasukkan'}`)
        } else if (response.status === 404) {
          alert("Unit kerja tidak ditemukan. Silakan login ulang.")
        } else {
          throw new Error(result.error || result.message || 'Gagal menyimpan data')
        }
        return
      }

      // Refresh data
      await mutate()

      // Reset form and close modal
      setFormData({
        instansi: "",
        jenis: "Joint Seminar",
        status: "In Progress",
        catatan: "",
      })
      setShowModal(false)
      
      alert('✅ Data berhasil disimpan!')

    } catch (error) {
      console.error('Error saving data:', error)
      alert(`❌ Terjadi kesalahan: ${error instanceof Error ? error.message : 'Gagal menyimpan data'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Edit Data
  const handleEdit = (item: NetworkingItem) => {
    setEditingItem(item)
    setEditFormData({
      instansi: item.instansi,
      jenis: item.jenis,
      status: item.status,
      catatan: item.catatan,
    })
    setShowEditModal(true)
  }

  // Handle Update Data
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!unitKerjaId || !editingItem) {
      alert("Data tidak valid untuk diupdate.")
      return
    }

    if (!editFormData.instansi.trim()) {
      alert("Nama instansi harus diisi.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/networking/${unitKerjaId}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instansi: editFormData.instansi.trim(),
          jenis: editFormData.jenis,
          status: editFormData.status,
          catatan: editFormData.catatan.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          alert(`Data networking sudah ada!\n\nInstansi: ${editFormData.instansi}\nJenis: ${editFormData.jenis}\n\nSilakan gunakan nama instansi yang berbeda.`)
        } else if (response.status === 400) {
          alert(`Data tidak valid:\n${result.error || 'Periksa kembali data yang dimasukkan'}`)
        } else if (response.status === 404) {
          alert("Data networking tidak ditemukan atau Anda tidak memiliki akses.")
        } else {
          throw new Error(result.error || result.message || 'Gagal mengupdate data')
        }
        return
      }

      // Refresh data
      await mutate()

      // Close modal and reset
      setShowEditModal(false)
      setEditingItem(null)
      
      alert('✅ Data berhasil diupdate!')

    } catch (error) {
      console.error('Error updating data:', error)
      alert(`❌ Terjadi kesalahan: ${error instanceof Error ? error.message : 'Gagal mengupdate data'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Data
  const handleDelete = async (item: NetworkingItem) => {
    if (!unitKerjaId) {
      alert("Unit kerja ID tidak ditemukan.")
      return
    }

    const confirmDelete = confirm(
      `⚠️ KONFIRMASI HAPUS DATA\n\n` +
      `Instansi: ${item.instansi}\n` +
      `Jenis: ${item.jenis}\n` +
      `Status: ${item.status}\n\n` +
      `Apakah Anda yakin ingin menghapus data ini?\n` +
      `Data yang dihapus tidak dapat dikembalikan.`
    )
    
    if (!confirmDelete) return

    setIsDeleting(item.id)

    try {
      const response = await fetch(`/api/networking/${unitKerjaId}/${item.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          alert("Data tidak ditemukan atau sudah dihapus.")
        } else if (response.status === 409) {
          alert("Data tidak dapat dihapus karena masih memiliki relasi dengan data lain.")
        } else {
          throw new Error(result.error || result.message || 'Gagal menghapus data')
        }
        return
      }

      // Refresh data
      await mutate()
      
      alert('✅ Data berhasil dihapus!')

    } catch (error) {
      console.error('Error deleting data:', error)
      alert(`❌ Terjadi kesalahan: ${error instanceof Error ? error.message : 'Gagal menghapus data'}`)
    } finally {
      setIsDeleting(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data networking...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Gagal memuat data networking</p>
            <p className="text-red-500 text-sm mb-4">{error.message}</p>
            <Button 
              onClick={() => mutate()} 
              className="bg-red-600 hover:bg-red-700"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Kegiatan Networking</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan networking dengan instansi lain</p>
        </div>
        
        {/* Modal Tambah Kegiatan */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Handshake className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Tambah Kegiatan Networking</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="instansi">Instansi / Pihak Terkait</Label>
                <Input
                  id="instansi"
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Jclair, Pemda Indonesia-Jepang"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Kegiatan</Label>
                <Select
                  value={formData.jenis}
                  onValueChange={(value) => handleSelectChange("jenis", value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
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

              <div className="space-y-1">
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                  id="catatan"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Kesepakatan tema, waktu dan penganggaran"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
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
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((card.value / Math.max(...summaryCards.map(c => c.value), 1)) * 100, 100)}%` 
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
            {pieData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data untuk ditampilkan
              </div>
            )}
          </div>
        </div>
    
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Kegiatan per Jenis
          </h2>
          <div className="h-[300px]">
            {barData.length > 0 ? (
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
                  <Bar dataKey="kegiatan">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data untuk ditampilkan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Kegiatan Networking</h2>
          <p className="text-blue-100 text-sm">Monitoring kegiatan networking dengan instansi lain</p>
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
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
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
                        item.jenis === 'Joint Seminar' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.jenis === 'Kunjungan' ? <MapPin className="w-3 h-3 mr-1" /> :
                         item.jenis === 'Kerjasama' ? <Handshake className="w-3 h-3 mr-1" /> :
                         <Users className="w-3 h-3 mr-1" />}
                        {item.jenis}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        item.status === 'MoU Ditandatangani' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                         item.status === 'MoU Ditandatangani' ? <Award className="w-3 h-3 mr-1" /> :
                         <Clock className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {item.catatan || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting === item.id}
                          className="hover:bg-red-50 hover:border-red-300"
                        >
                          {isDeleting === item.id ? (
                            <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Belum ada data networking
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Edit Kegiatan */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Edit Kegiatan Networking</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="edit-instansi">Instansi / Pihak Terkait</Label>
              <Input
                id="edit-instansi"
                name="instansi"
                value={editFormData.instansi}
                onChange={handleEditChange}
                required
                placeholder="Contoh: Jclair, Pemda Indonesia-Jepang"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-jenis">Jenis Kegiatan</Label>
              <Select
                value={editFormData.jenis}
                onValueChange={(value) => handleEditSelectChange("jenis", value)}
              >
                <SelectTrigger>
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

            <div className="space-y-1">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => handleEditSelectChange("status", value)}
              >
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

            <div className="space-y-1">
              <Label htmlFor="edit-catatan">Catatan</Label>
              <textarea
                id="edit-catatan"
                name="catatan"
                value={editFormData.catatan}
                onChange={handleEditChange}
                placeholder="Contoh: Kesepakatan tema, waktu dan penganggaran"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
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
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Mengupdate...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
