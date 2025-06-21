// app/user/koordinasi/tambah/page.tsx
"use client"

import React, { useState } from "react"
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
  Building, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon
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

interface KoordinasiItem {
  id: number
  tanggal: string
  instansi: string
  jenisInstansi: string
  topik: string
  catatan: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function TambahKoordinasiPage() {
  // Dummy initial data
  const initialData: KoordinasiItem[] = [
    {
      id: 1,
      tanggal: "2025-05-15",
      instansi: "Kementerian PANRB",
      jenisInstansi: "Pusat",
      topik: "Koordinasi Indikator SPBE",
      catatan: "Disepakati timeline pelaporan"
    },
    {
      id: 2,
      tanggal: "2025-05-18",
      instansi: "Pemprov DKI Jakarta",
      jenisInstansi: "Daerah",
      topik: "Sinkronisasi RB",
      catatan: "Menunggu dokumen pendukung"
    },
    {
      id: 3,
      tanggal: "2025-05-20",
      instansi: "Universitas Indonesia",
      jenisInstansi: "Akademisi",
      topik: "Kerjasama Riset",
      catatan: "MoU dalam proses penyusunan"
    },
    {
      id: 4,
      tanggal: "2025-05-22",
      instansi: "Kementerian Dalam Negeri",
      jenisInstansi: "Pusat",
      topik: "Harmonisasi Regulasi",
      catatan: "Perlu tindak lanjut revisi"
    },
    {
      id: 5,
      tanggal: "2025-05-25",
      instansi: "Pemprov Jawa Barat",
      jenisInstansi: "Daerah",
      topik: "Best Practice Inovasi",
      catatan: "Sharing session berhasil"
    }
  ]

  // Load data from localStorage if available (client-side only)
  const [data, setData] = useState<KoordinasiItem[]>(initialData)

  // Hydrate from localStorage on client
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("koordinasiData")
      if (saved) {
        setData(JSON.parse(saved))
      }
    }
  }, [])

  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    tanggal: "",
    instansi: "",
    jenisInstansi: "Pusat",
    topik: "",
    catatan: "",
  })

  const jenisOptions = ["Pusat", "Daerah", "Akademisi"]

  // Calculate statistics
  const totalKoordinasi = data.length
  const instansiPusat = data.filter(item => item.jenisInstansi === 'Pusat').length
  const instansiDaerah = data.filter(item => item.jenisInstansi === 'Daerah').length
  const bulanIni = data.filter(item => {
    const today = new Date()
    const itemDate = new Date(item.tanggal)
    return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()
  }).length

  // Data for charts
  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenisInstansi] = (acc[item.jenisInstansi] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(jenisCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    koordinasi: count,
  }))

  const summaryCards = [
    {
      title: "Total Koordinasi",
      value: totalKoordinasi,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+18%',
      description: 'Kegiatan koordinasi total'
    },
    {
      title: "Instansi Pusat",
      value: instansiPusat,
      icon: <Building className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+25%',
      description: 'Koordinasi tingkat pusat'
    },
    {
      title: "Instansi Daerah",
      value: instansiDaerah,
      icon: <Users className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+12%',
      description: 'Koordinasi tingkat daerah'
    },
    {
      title: "Bulan Ini",
      value: bulanIni,
      icon: <Calendar className="w-6 h-6" />,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
      change: '+30%',
      description: 'Koordinasi periode ini'
    },
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("koordinasiData", JSON.stringify(updatedData))

    setFormData({
      tanggal: "",
      instansi: "",
      jenisInstansi: "Pusat",
      topik: "",
      catatan: "",
    })
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Koordinasi</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan koordinasi lintas instansi</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <MessageSquare className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Tambah Kegiatan Koordinasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tanggal */}
              <div className="space-y-1">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Instansi */}
              <div className="space-y-1">
                <Label>Instansi / Pihak Terkait</Label>
                <Input
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Kementerian PANRB"
                />
              </div>

              {/* Jenis Instansi */}
              <div className="space-y-1">
                <Label>Jenis Instansi</Label>
                <Select
                  name="jenisInstansi"
                  value={formData.jenisInstansi}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jenisInstansi: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis instansi" />
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

              {/* Topik */}
              <div className="space-y-1">
                <Label>Topik Koordinasi</Label>
                <Input
                  name="topik"
                  value={formData.topik}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Sinkronisasi indikator SPBE"
                />
              </div>

              {/* Catatan */}
              <div className="space-y-1">
                <Label>Catatan</Label>
                <Input
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Disepakati timeline pelaporan"
                />
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Simpan
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
            Distribusi Jenis Instansi
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
            Tren Koordinasi Bulanan
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
                  dataKey="koordinasi" 
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
          <h2 className="text-xl font-bold">Daftar Kegiatan Koordinasi</h2>
          <p className="text-blue-100 text-sm">Monitoring koordinasi lintas instansi</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Instansi</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Topik</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="text-gray-600">{item.tanggal}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.instansi}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenisInstansi === 'Pusat' ? 'bg-blue-100 text-blue-800' :
                      item.jenisInstansi === 'Daerah' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.jenisInstansi === 'Pusat' ? <Building className="w-3 h-3 mr-1" /> :
                       item.jenisInstansi === 'Daerah' ? <Users className="w-3 h-3 mr-1" /> :
                       <BookOpen className="w-3 h-3 mr-1" />}
                      {item.jenisInstansi}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{item.topik}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.catatan.includes('berhasil') || item.catatan.includes('disepakati') 
                        ? 'bg-green-100 text-green-800' 
                        : item.catatan.includes('menunggu') || item.catatan.includes('proses')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.catatan.includes('berhasil') || item.catatan.includes('disepakati') 
                        ? <CheckCircle className="w-3 h-3 mr-1" />
                        : <Clock className="w-3 h-3 mr-1" />}
                      {item.catatan.includes('berhasil') || item.catatan.includes('disepakati') 
                        ? 'Selesai' 
                        : item.catatan.includes('menunggu') || item.catatan.includes('proses')
                        ? 'Progress'
                        : 'Tindak Lanjut'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.catatan || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-purple-500" />
          Aktivitas Koordinasi Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="bg-blue-500 rounded-full p-2">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Koordinasi dengan Kementerian</h3>
              <p className="text-sm text-blue-600">Sinkronisasi indikator SPBE telah disepakati</p>
              <p className="text-xs text-blue-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="bg-green-500 rounded-full p-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Meeting dengan Pemda</h3>
              <p className="text-sm text-green-600">Best practice sharing session berhasil dilaksanakan</p>
              <p className="text-xs text-green-500 mt-1">3 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <div className="bg-purple-500 rounded-full p-2">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">Kerjasama Akademisi</h3>
              <p className="text-sm text-purple-600">MoU riset dengan universitas dalam tahap finalisasi</p>
              <p className="text-xs text-purple-500 mt-1">1 minggu yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}