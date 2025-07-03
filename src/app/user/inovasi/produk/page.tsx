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
  status: string
  tanggalRilis: string
  keterangan: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function ProdukInovasiPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<ProdukInovasiItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const id = typeof window !== 'undefined' ? localStorage.getItem('id') : null
        if (!id) throw new Error('ID unit kerja tidak ditemukan di localStorage')
        const res = await fetch(`/api/produkinovasi/${id}`)
        if (!res.ok) throw new Error('Gagal mengambil data produk inovasi dari server')
        const apiData: ProdukInovasiItem[] = await res.json()
        setData(apiData.map((item: ProdukInovasiItem) => ({
          id: item.id,
          nama: item.nama,
          jenis: item.jenis,
          status: item.status,
          tanggalRilis: item.tanggalRilis.split('T')[0],
          keterangan: item.keterangan,
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const [formData, setFormData] = useState({
    nama: '',
    jenis: 'Aplikasi Digital',
    status: 'Aktif Digunakan',
    tanggalRilis: '',
    keterangan: '',
  })

  const jenisOptions = ["Aplikasi Digital", "Dashboard", "Modul Pelatihan", "SOP"]
  const statusOptions = ["Aktif Digunakan", "Uji Coba", "Arsip"]

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = (item: ProdukInovasiItem) => {
    setFormData({
      nama: item.nama,
      jenis: item.jenis,
      status: item.status,
      tanggalRilis: item.tanggalRilis,
      keterangan: item.keterangan,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    toast(
      "Apakah Anda yakin ingin menghapus data ini?",
      {
        action: {
          label: "Hapus",
          onClick: () => {
            const updatedData = data.filter(item => item.id !== id)
            setData(updatedData)
            toast.success("Data berhasil dihapus!")
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
      let updatedData
      
      if (editingId) {
        // Update existing item
        updatedData = data.map(item => 
          item.id === editingId 
            ? { ...item, ...formData }
            : item
        )
      } else {
        // Add new item
        const newItem = {
          id: Date.now(),
          ...formData
        }
        updatedData = [...data, newItem]
      }

      setData(updatedData)
      // No localStorage update, only update state

      // Reset form and close modal
      setFormData({
        nama: '',
        jenis: 'Aplikasi Digital',
        status: 'Aktif Digunakan',
        tanggalRilis: '',
        keterangan: '',
      })
      setEditingId(null)
      setShowModal(false)
      toast.success(editingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!')
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data.')
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
        </div>
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              nama: '',
              jenis: 'Aplikasi Digital',
              status: 'Aktif Digunakan',
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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">
                {editingId ? 'Edit Produk Inovasi' : 'Form Produk Inovasi'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Produk */}
              <div className="space-y-1">
                <Label htmlFor="nama">Nama Produk</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Sistem e-Integritas"
                />
              </div>

              {/* Jenis Produk */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Produk</Label>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onValueChange={(value) => handleSelectChange("jenis", value)}
                >
                  <SelectTrigger id="jenis">
                    <SelectValue placeholder="Pilih jenis produk" />
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

              {/* Status Produk */}
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status produk" />
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

              {/* Tanggal Rilis */}
              <div className="space-y-1">
                <Label htmlFor="tanggalRilis">Tanggal Rilis</Label>
                <Input
                  id="tanggalRilis"
                  type="date"
                  name="tanggalRilis"
                  value={formData.tanggalRilis}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Keterangan */}
              <div className="space-y-1">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  placeholder="Contoh: Sistem pelaporan benturan kepentingan"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
    </div>
  )
}
