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
  Package,
  Monitor,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Archive,
  Calendar,
  FileText,
  Edit,
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
import { toast } from "sonner"

interface ProdukInovasiItem {
  id: number
  nama: string
  jenis: string
  status_id: number
  status: string
  tanggalRilis: string
  keterangan: string
}

interface StatusInovasi {
  id: number
  status: string
}

interface ApiProdukInovasiResponse {
  id: number
  nama: string
  jenis: string
  status_id: number
  tanggalRilis: string
  keterangan: string
  status_inovasi?: {
    status: string
  }
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function ProdukInovasiPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<ProdukInovasiItem[]>([])
  const [statusOptions, setStatusOptions] = useState<StatusInovasi[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for motivational popup
  const [showMotivationModal, setShowMotivationModal] = useState(false)
  const [motivationShown, setMotivationShown] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // 4D Innovation Process
  const innovationSteps = [
    { step: "Drum Up", icon: "🥁", color: "from-red-500 to-pink-600", description: "Ide-ide brilian" },
    { step: "Diagnose", icon: "🔍", color: "from-blue-500 to-cyan-600", description: "Masalah mendalam" },
    { step: "Design", icon: "🎨", color: "from-purple-500 to-indigo-600", description: "Solusi inovatif" },
    { step: "Deliver & Display", icon: "🚀", color: "from-green-500 to-emerald-600", description: "Bukti nyata" }
  ]

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const id = typeof window !== 'undefined' ? localStorage.getItem('id') : null
        if (!id) throw new Error('ID unit kerja tidak ditemukan di localStorage')
        
        // Fetch status options
        const statusRes = await fetch('/api/status-inovasi')
        if (!statusRes.ok) throw new Error('Gagal mengambil data status inovasi')
        const statusData: StatusInovasi[] = await statusRes.json()
        setStatusOptions(statusData)
        
        // Fetch product data
        const res = await fetch(`/api/produkinovasi/${id}`)
        if (!res.ok) throw new Error('Gagal mengambil data produk inovasi dari server')
        const apiData = await res.json()
        
        const transformedData: ProdukInovasiItem[] = apiData.map((item: ApiProdukInovasiResponse) => ({
          id: item.id,
          nama: item.nama,
          jenis: item.jenis,
          status_id: item.status_id,
          status: item.status_inovasi?.status || 'Unknown',
          tanggalRilis: item.tanggalRilis.split('T')[0],
          keterangan: item.keterangan,
        }))
        
        setData(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Show motivational popup after 3 seconds if not shown yet
    if (!motivationShown) {
      const timer = setTimeout(() => {
        setShowMotivationModal(true)
        setMotivationShown(true)
        setIsAnimating(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [motivationShown])

  // 4D Process Animation
  useEffect(() => {
    if (isAnimating && showMotivationModal) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % innovationSteps.length
          if (next === 0) {
            setIsAnimating(false)
            setTimeout(() => setIsAnimating(true), 2000) // Restart after 2s pause
          }
          return next
        })
      }, 1500) // Change step every 1.5 seconds
      
      return () => clearInterval(interval)
    }
  }, [isAnimating, showMotivationModal, innovationSteps.length])

  const [formData, setFormData] = useState({
    nama: '',
    jenis: 'Aplikasi Digital',
    status_id: 1,
    tanggalRilis: '',
    keterangan: '',
  })

  const jenisOptions = ["Aplikasi Digital", "Dashboard", "Modul Pelatihan", "SOP"]  // Update form data when status options are loaded
  useEffect(() => {
    if (statusOptions.length > 0 && formData.status_id === 1 && !editingId) {
      setFormData(prev => ({ ...prev, status_id: statusOptions[0].id }))
    }
  }, [statusOptions, formData.status_id, editingId])

  // Calculate statistics
  const totalProduk = data.length
  const aktifDigunakan = data.filter(item => item.status === 'Aktif Digunakan').length
  const ujiCoba = data.filter(item => item.status === 'Uji Coba').length
  const arsip = data.filter(item => item.status === 'Arsip').length

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
    produk: count,
  }))

  const summaryCards = [
    {
      title: "Total Produk",
      value: totalProduk,
      icon: <Package className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+15%',
      description: 'Produk inovasi keseluruhan'
    },
    {
      title: "Aktif Digunakan",
      value: aktifDigunakan,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+20%',
      description: 'Produk yang beroperasi'
    },
    {
      title: "Uji Coba",
      value: ujiCoba,
      icon: <Settings className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+10%',
      description: 'Dalam tahap pengujian'
    },
    {
      title: "Arsip",
      value: arsip,
      icon: <Archive className="w-6 h-6" />,
      color: 'gray',
      bgGradient: 'from-gray-500 to-gray-600',
      bgLight: 'bg-gray-100',
      textColor: 'text-gray-600',
      textDark: 'text-gray-800',
      borderColor: 'border-gray-500',
      change: '+5%',
      description: 'Produk tidak aktif'
    },
  ]

  const handleEdit = (item: ProdukInovasiItem) => {
    setFormData({
      nama: item.nama,
      jenis: item.jenis,
      status_id: item.status_id,
      tanggalRilis: item.tanggalRilis,
      keterangan: item.keterangan,
    })
    setEditingId(item.id)
    setShowModal(true)
  }
  const handleDelete = async (id: number) => {
    toast(
      "Apakah Anda yakin ingin menghapus data ini?",
      {
        action: {
          label: "Hapus",
          onClick: async () => {
            try {
              const unitKerjaId = localStorage.getItem('id')
              const response = await fetch(`/api/produkinovasi/${unitKerjaId}/${id}`, {
                method: 'DELETE',
              })
              
              if (!response.ok) {
                throw new Error('Gagal menghapus data dari server')
              }
              
              const updatedData = data.filter(item => item.id !== id)
              setData(updatedData)
              toast.success("Data berhasil dihapus!")
            } catch (error) {
              console.error('Error deleting:', error)
              toast.error("Gagal menghapus data!")
            }
          }
        },
        cancel: {
          label: "Batal",
          onClick: () => toast("Penghapusan dibatalkan")
        },
        duration: 6000
      }
    )
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const unitKerjaId = localStorage.getItem('id')
      if (!unitKerjaId) throw new Error('ID unit kerja tidak ditemukan')

      const requestData = {
        nama: formData.nama,
        jenis: formData.jenis,
        status_id: formData.status_id,
        tanggalRilis: formData.tanggalRilis,
        keterangan: formData.keterangan,
      }

      let response
      let updatedData
      
      if (editingId) {
        // Update existing item
        response = await fetch(`/api/produkinovasi/${unitKerjaId}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
        
        if (!response.ok) throw new Error('Gagal memperbarui data di server')
        
        // Find the status name for the updated item
        const statusName = statusOptions.find(s => s.id === formData.status_id)?.status || 'Unknown'
        
        updatedData = data.map(item => 
          item.id === editingId 
            ? { ...item, ...formData, status: statusName }
            : item
        )
      } else {
        // Add new item
        response = await fetch(`/api/produkinovasi/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
        
        if (!response.ok) throw new Error('Gagal menyimpan data ke server')
        
        const newItem = await response.json()
        const statusName = statusOptions.find(s => s.id === formData.status_id)?.status || 'Unknown'
        
        const newItemFormatted = {
          id: newItem.id,
          nama: newItem.nama,
          jenis: newItem.jenis,
          status_id: newItem.status_id,
          status: statusName,
          tanggalRilis: newItem.tanggalRilis.split('T')[0],
          keterangan: newItem.keterangan,
        }
        updatedData = [...data, newItemFormatted]
      }

      setData(updatedData)      // Reset form and close modal
      setFormData({
        nama: '',
        jenis: 'Aplikasi Digital',
        status_id: statusOptions.length > 0 ? statusOptions[0].id : 1,
        tanggalRilis: '',
        keterangan: '',
      })
      setEditingId(null)
      setShowModal(false)
      toast.success(editingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!')
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data.')
    }
  }

  // Loading & error state
  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data produk inovasi...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  // Produk terbaru: ambil 3 produk terbaru dari data API, urutkan berdasarkan tanggalRilis desc
  const produkTerbaru = [...data]
    .sort((a, b) => new Date(b.tanggalRilis).getTime() - new Date(a.tanggalRilis).getTime())
    .slice(0, 3)

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Produk Inovasi</h1>
          <p className="text-blue-600">Kelola dan pantau seluruh produk inovasi yang dikembangkan oleh unit kerja untuk memastikan kemanfaatan, keberlanjutan, dan dampaknya</p>
        </div>        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              nama: '',
              jenis: 'Aplikasi Digital',
              status_id: statusOptions.length > 0 ? statusOptions[0].id : 1,
              tanggalRilis: '',
              keterangan: '',
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Package className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Produk Inovasi' : 'Tambah Produk Inovasi'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Produk</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama produk inovasi"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="jenis">Jenis Produk</Label>
                <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisOptions.map((jenis) => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status_id.toString()} onValueChange={(value) => setFormData({...formData, status_id: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>{status.status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tanggalRilis">Tanggal Rilis</Label>
                <Input
                  id="tanggalRilis"
                  type="date"
                  value={formData.tanggalRilis}
                  onChange={(e) => setFormData({...formData, tanggalRilis: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  placeholder="Masukkan keterangan produk"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update' : 'Tambah'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Batal
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
                    📦 Aktif
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
            Distribusi Status Produk
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
            Produk per Jenis
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
                  dataKey="produk" 
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

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Produk Inovasi</h2>
          <p className="text-blue-100 text-sm">Monitoring produk inovasi di unit kerja</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Produk</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Tanggal Rilis</TableHead>
                <TableHead className="font-medium">Keterangan</TableHead>
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <Package className="w-3 h-3 mr-1 text-gray-400" />
                      {item.nama}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Aplikasi Digital' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Dashboard' ? 'bg-green-100 text-green-800' :
                      item.jenis === 'Modul Pelatihan' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.jenis === 'Aplikasi Digital' ? <Monitor className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Dashboard' ? <BarChart3 className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Modul Pelatihan' ? <FileText className="w-3 h-3 mr-1" /> :
                       <FileText className="w-3 h-3 mr-1" />}
                      {item.jenis}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Aktif Digunakan' ? 'bg-green-100 text-green-800' :
                      item.status === 'Uji Coba' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'Aktif Digunakan' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'Uji Coba' ? <Clock className="w-3 h-3 mr-1" /> :
                       <Archive className="w-3 h-3 mr-1" />}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {item.tanggalRilis}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.keterangan}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Package className="w-6 h-6 mr-2 text-purple-500" />
          Produk Terbaru
        </h2>
        <div className="space-y-4">
          {produkTerbaru.map((item) => (
            <div
              key={item.id}
              className={`flex items-start space-x-3 p-4 ${
                item.status === 'Aktif Digunakan'
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : item.status === 'Uji Coba'
                  ? 'bg-yellow-50 border-l-4 border-yellow-500'
                  : 'bg-gray-50 border-l-4 border-gray-400'
              } rounded-lg`}
            >
              <div className={
                item.status === 'Aktif Digunakan'
                  ? 'bg-green-500 rounded-full p-2'
                  : item.status === 'Uji Coba'
                  ? 'bg-yellow-500 rounded-full p-2'
                  : 'bg-gray-400 rounded-full p-2'
              }>
                {item.status === 'Aktif Digunakan' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : item.status === 'Uji Coba' ? (
                  <Clock className="w-4 h-4 text-white" />
                ) : (
                  <Archive className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  item.status === 'Aktif Digunakan'
                    ? 'text-green-800'
                    : item.status === 'Uji Coba'
                    ? 'text-yellow-800'
                    : 'text-gray-800'
                }`}>{item.nama}</h3>
                <p className={`text-sm ${
                  item.status === 'Aktif Digunakan'
                    ? 'text-green-600'
                    : item.status === 'Uji Coba'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}>{item.keterangan}</p>
                <p className={`text-xs mt-1 ${
                  item.status === 'Aktif Digunakan'
                    ? 'text-green-500'
                    : item.status === 'Uji Coba'
                    ? 'text-yellow-500'
                    : 'text-gray-500'
                }`}>{item.tanggalRilis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 4D Innovation Hub - Motivational Popup */}
      {showMotivationModal && (
        <Dialog open={showMotivationModal} onOpenChange={setShowMotivationModal}>
          <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
            <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
              </div>
              
              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className={`absolute w-2 h-2 bg-white/30 rounded-full animate-bounce`}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + (i % 3) * 30}%`,
                    animationDelay: `${i * 300}ms`,
                    animationDuration: '3s'
                  }}
                ></div>
              ))}
              
              <div className="relative p-8 text-white">
                <DialogTitle className="sr-only">5D+1 Innovation Hub - Inspirasi Inovasi</DialogTitle>
                
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    <span className="text-xl">🚀</span>
                    5D+1 Innovation Hub
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-4">
                    Inspirasi Inovasi
                  </h2>
                </div>
                
                {/* Main Quote */}
                <div className="text-center mb-8">
                  <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed mb-4">
                    &ldquo;Kerja bisa ditiru. Tapi inovasi… tak bisa dicopy-paste. 
                    <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Inovasi harga mati!&rdquo;
                    </span>
                  </blockquote>
                  <cite className="text-gray-300 text-sm">— Tim Inovasi Makarti</cite>
                </div>
                
                {/* 4D Process Visualization */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-center mb-6 text-yellow-300">Proses 5D+1 Innovation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {innovationSteps.map((step, index) => (
                      <div 
                        key={index}
                        className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-500 transform ${
                          currentStep === index 
                            ? 'scale-110 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 shadow-lg' 
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className={`text-3xl mb-2 transition-transform duration-300 ${
                          currentStep === index ? 'animate-bounce' : ''
                        }`}>
                          {step.icon}
                        </div>
                        <h4 className="font-bold text-sm mb-1">{step.step}</h4>
                        <p className="text-xs text-gray-300">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-2">
                    {innovationSteps.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentStep === index 
                            ? 'bg-yellow-400 scale-125' 
                            : 'bg-gray-400/50'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowMotivationModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Mulai Berinovasi! 🌟
                  </button>
                  <button
                    onClick={() => setShowMotivationModal(false)}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Existing Modal */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              nama: '',
              jenis: 'Aplikasi Digital',
              status_id: statusOptions.length > 0 ? statusOptions[0].id : 1,
              tanggalRilis: '',
              keterangan: '',
            })
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Produk Inovasi' : 'Tambah Produk Inovasi'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Produk</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama produk inovasi"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="jenis">Jenis Produk</Label>
                <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisOptions.map((jenis) => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status_id.toString()} onValueChange={(value) => setFormData({...formData, status_id: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>{status.status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tanggalRilis">Tanggal Rilis</Label>
                <Input
                  id="tanggalRilis"
                  type="date"
                  value={formData.tanggalRilis}
                  onChange={(e) => setFormData({...formData, tanggalRilis: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  placeholder="Masukkan keterangan produk"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update' : 'Tambah'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}