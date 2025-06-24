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
  Calendar,
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

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

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
  const [unitKerjaId, setUnitKerjaId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
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
      refreshInterval: 30000, // Refresh setiap 30 detik
      revalidateOnFocus: true,
    }
  )

  const data: NetworkingItem[] = apiData || []

  // Calculate statistics
  const totalKegiatan = data.length
  const selesai = data.filter(item => item.status === 'Selesai').length
  const mouDitandatangani = data.filter(item => item.status === 'MoU Ditandatangani').length
  const inProgress = data.filter(item => item.status === 'In Progress').length
  const menungguTindakLanjut = data.filter(item => item.status === 'Menunggu Tindak Lanjut').length

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!unitKerjaId) {
      alert("Unit kerja ID tidak ditemukan. Silakan login ulang.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/networking/${unitKerjaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Gagal menyimpan data')
      }

      // Refresh data dengan SWR mutate
      await mutate()

      // Reset form and close modal
      setFormData({
        instansi: "",
        jenis: "Joint Seminar",
        status: "In Progress",
        catatan: "",
      })
      setShowModal(false)
      alert('Data berhasil disimpan!')

    } catch (error) {
      console.error('Error saving data:', error)
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsSubmitting(false)
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
              {/* Instansi */}
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

              {/* Jenis Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Kegiatan</Label>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onValueChange={(value) => handleSelectChange("jenis", value)}
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
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
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
              
              {/* Progress Bar */}
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data untuk ditampilkan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Belum ada data networking
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Handshake className="w-6 h-6 mr-2 text-purple-500" />
          Kegiatan Networking Terbaru
        </h2>
        <div className="space-y-4">
          {data.slice(0, 3).map((item, index) => (
            <div key={item.id} className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
              item.status === 'Selesai' ? 'bg-green-50 border-green-500' :
              item.status === 'MoU Ditandatangani' ? 'bg-purple-50 border-purple-500' :
              item.status === 'In Progress' ? 'bg-yellow-50 border-yellow-500' :
              'bg-gray-50 border-gray-500'
            }`}>
              <div className={`rounded-full p-2 ${
                item.status === 'Selesai' ? 'bg-green-500' :
                item.status === 'MoU Ditandatangani' ? 'bg-purple-500' :
                item.status === 'In Progress' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}>
                {item.status === 'Selesai' ? <CheckCircle className="w-4 h-4 text-white" /> :
                 item.status === 'MoU Ditandatangani' ? <Award className="w-4 h-4 text-white" /> :
                 <Clock className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  item.status === 'Selesai' ? 'text-green-800' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-800' :
                  item.status === 'In Progress' ? 'text-yellow-800' :
                  'text-gray-800'
                }`}>
                  {item.jenis} dengan {item.instansi}
                </h3>
                <p className={`text-sm ${
                  item.status === 'Selesai' ? 'text-green-600' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-600' :
                  item.status === 'In Progress' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {item.catatan || 'Tidak ada catatan'}
                </p>
                <p className={`text-xs mt-1 ${
                  item.status === 'Selesai' ? 'text-green-500' :
                  item.status === 'MoU Ditandatangani' ? 'text-purple-500' :
                  item.status === 'In Progress' ? 'text-yellow-500' :
                  'text-gray-500'
                }`}>
                  Status: {item.status}
                </p>
              </div>
            </div>
          ))}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada kegiatan networking terbaru
            </div>
          )}
        </div>
      </div>
    </div>
  )
}