// app/user/sosialisasi/page.tsx
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
  Megaphone, 
  Users, 
  Calendar, 
  TrendingUp, 
  Monitor, 
  Building,
  Instagram,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
  Plus,
  Clock
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

interface SosialisasiItem {
  id: number
  nama: string
  tanggal: string
  jenis: string
  platform: string
  peserta: number
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function SosialisasiPage() {
  const [data, setData] = useState<SosialisasiItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    jenis: "Webinar",
    platform: "",
    peserta: 0,
  })

  // Initial dummy data
  const initialData: SosialisasiItem[] = [
    {
      id: 1,
      nama: "Webinar SPBE dan Inovasi Digital",
      tanggal: "2025-05-10",
      jenis: "Webinar",
      platform: "Zoom",
      peserta: 200,
    },
    {
      id: 2,
      nama: "Sosialisasi Reformasi Birokrasi",
      tanggal: "2025-05-12",
      jenis: "Tatap Muka",
      platform: "Kantor LAN Pusat",
      peserta: 80,
    },
    {
      id: 3,
      nama: "Live Instagram ASN BerAKHLAK",
      tanggal: "2025-05-14",
      jenis: "Live IG",
      platform: "@lanri_official",
      peserta: 500,
    },
    {
      id: 4,
      nama: "FGD Strategi Inovasi Pelayanan",
      tanggal: "2025-05-16",
      jenis: "FGD",
      platform: "Offline",
      peserta: 30,
    },
  ]

  // Load data on client side
  useEffect(() => {
    const loadData = () => {
      try {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("sosialisasiData")
          if (saved) {
            setData(JSON.parse(saved))
          } else {
            setData(initialData)
            localStorage.setItem("sosialisasiData", JSON.stringify(initialData))
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setData(initialData)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const jenisOptions = ["Webinar", "Tatap Muka", "Live IG", "FGD"]

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data sosialisasi...</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalKegiatan = data.length
  const totalPeserta = data.reduce((sum, item) => sum + item.peserta, 0)
  const kegiatanDaring = data.filter(item => item.jenis === 'Webinar' || item.jenis === 'Live IG').length
  const rataRataPeserta = totalKegiatan > 0 ? Math.round(totalPeserta / totalKegiatan) : 0

  // Data for charts
  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(jenisCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    acc[month] = (acc[month] || 0) + item.peserta
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData).map(([month, peserta]) => ({
    month,
    peserta,
  }))

  const summaryCards = [
    {
      title: "Total Kegiatan",
      value: totalKegiatan,
      icon: <Megaphone className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+15%',
      description: 'Kegiatan sosialisasi'
    },
    {
      title: "Total Peserta",
      value: totalPeserta.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+22%',
      description: 'Partisipan aktif'
    },
    {
      title: "Kegiatan Daring",
      value: kegiatanDaring,
      icon: <Monitor className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+30%',
      description: 'Webinar & Live IG'
    },
    {
      title: "Rata-rata Peserta",
      value: rataRataPeserta,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
      change: '+8%',
      description: 'Per kegiatan'
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newItem: SosialisasiItem = {
        id: Date.now(),
        nama: formData.nama,
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        platform: formData.platform,
        peserta: formData.peserta,
      }

      const updatedData = [newItem, ...data]
      setData(updatedData)

      if (typeof window !== "undefined") {
        localStorage.setItem("sosialisasiData", JSON.stringify(updatedData))
      }

      // Reset form
      setFormData({
        nama: "",
        tanggal: "",
        jenis: "Webinar",
        platform: "",
        peserta: 0,
      })
      setShowModal(false)

      toast.success("Data kegiatan sosialisasi berhasil ditambahkan!")

    } catch (error) {
      console.error("Error saving data:", error)
      toast.error("Terjadi kesalahan saat menyimpan data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Sosialisasi</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan sosialisasi unit kerja</p>
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
              <DialogTitle className="text-blue-700">Tambah Kegiatan Sosialisasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1">
                <Label htmlFor="nama">Nama Kegiatan</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Webinar SPBE dan Inovasi Digital"
                />
              </div>

              {/* Tanggal */}
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

              {/* Jenis */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Kegiatan</Label>
                <Select
                  value={formData.jenis}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jenis: value }))
                  }
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

              {/* Platform */}
              <div className="space-y-1">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Zoom / Instagram / Offline"
                />
              </div>

              {/* Peserta */}
              <div className="space-y-1">
                <Label htmlFor="peserta">Jumlah Peserta</Label>
                <Input
                  id="peserta"
                  type="number"
                  name="peserta"
                  value={formData.peserta}
                  onChange={handleChange}
                  min={0}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: 200"
                />
              </div>

              {/* Tombol Simpan & Batal */}
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
                      width: `${Math.min((typeof card.value === 'number' ? card.value : parseInt(card.value.toString().replace(/,/g, ''))) / Math.max(...summaryCards.map(c => typeof c.value === 'number' ? c.value : parseInt(c.value.toString().replace(/,/g, '')))) * 100, 100)}%` 
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
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Jenis Kegiatan
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
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Daftar Kegiatan Sosialisasi</h2>
          <p className="text-blue-100 text-sm">Monitoring kegiatan sosialisasi dan komunikasi</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Kegiatan</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Platform</TableHead>
                <TableHead className="text-right font-medium">Peserta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data
                .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                .map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.nama}</TableCell>
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Webinar' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Live IG' ? 'bg-pink-100 text-pink-800' :
                      item.jenis === 'Tatap Muka' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.jenis === 'Webinar' ? <Monitor className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Live IG' ? <Instagram className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Tatap Muka' ? <Building className="w-3 h-3 mr-1" /> :
                       <MessageSquare className="w-3 h-3 mr-1" />}
                      {item.jenis}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.platform}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.peserta >= 200 ? 'bg-green-100 text-green-800' :
                      item.peserta >= 100 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Users className="w-3 h-3 mr-1" />
                      {item.peserta.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada data kegiatan sosialisasi. Tambahkan kegiatan pertama Anda!
          </div>
        )}
      </div>

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
                {item.jenis === 'Webinar' ? <Monitor className="w-4 h-4 text-white" /> :
                 item.jenis === 'Live IG' ? <Instagram className="w-4 h-4 text-white" /> :
                 item.jenis === 'Tatap Muka' ? <Building className="w-4 h-4 text-white" /> :
                 <MessageSquare className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">{item.nama}</h3>
                <p className="text-sm text-blue-600">
                  {item.peserta.toLocaleString()} peserta • {item.jenis}
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