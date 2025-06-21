// app/user/sosialisasi/page.tsx
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
  Megaphone, 
  Users, 
  Calendar, 
  TrendingUp, 
  Monitor, 
  Building,
  Instagram,
  Video,
  MessageSquare,
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

interface SosialisasiItem {
  id: number
  nama: string
  tanggal: string
  jenis: string
  platform: string
  peserta: number
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function SosialisasiPage() {
  // Dummy initial data
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

  // State for data, initialized with initialData
  const [data, setData] = useState<SosialisasiItem[]>(initialData)

  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    jenis: "Webinar",
    platform: "",
    peserta: 0,
  })

  const [userUnit, setUserUnit] = useState<string | null>(null)

  // Load data and userUnit from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sosialisasiData")
      if (saved) {
        setData(JSON.parse(saved))
      }
      setUserUnit(localStorage.getItem("userUnit"))
    }
  }, [])

  const jenisOptions = ["Webinar", "Tatap Muka", "Live IG", "FGD"]

  // Calculate statistics
  const totalKegiatan = data.length
  const totalPeserta = data.reduce((sum, item) => sum + item.peserta, 0)
  const kegiatanDaring = data.filter(item => item.jenis === 'Webinar' || item.jenis === 'Live IG').length
  const kegiatanLuring = data.filter(item => item.jenis === 'Tatap Muka' || item.jenis === 'FGD').length
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userUnit) {
      alert("Tidak dapat menentukan unit kerja")
      return
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      unit: userUnit,
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    if (typeof window !== "undefined") {
      localStorage.setItem("sosialisasiData", JSON.stringify(updatedData))
    }

    setFormData({
      nama: "",
      tanggal: "",
      jenis: "Webinar",
      platform: "",
      peserta: 0,
    })
    setShowModal(false)
  }

  // Handle input changes for form fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Sosialisasi</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan sosialisasi unit kerja</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Megaphone className="w-4 h-4 mr-2" />
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
                <Label>Nama Kegiatan</Label>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>

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

              {/* Jenis */}
              <div className="space-y-1">
                <Label>Jenis Kegiatan</Label>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jenis: value }))
                  }
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

              {/* Platform */}
              <div className="space-y-1">
                <Label>Platform</Label>
                <Input
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  placeholder="Zoom / Instagram / Offline"
                />
              </div>

              {/* Peserta */}
              <div className="space-y-1">
                <Label>Jumlah Peserta</Label>
                <Input
                  type="number"
                  name="peserta"
                  value={formData.peserta}
                  onChange={handleChange}
                  min={0}
                  required
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
                      width: `${Math.min((typeof card.value === 'number' ? card.value : parseInt(card.value.replace(/,/g, ''))) / Math.max(...summaryCards.map(c => typeof c.value === 'number' ? c.value : parseInt(c.value.toString().replace(/,/g, '')))) * 100, 100)}%` 
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
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.nama}</TableCell>
                  <TableCell className="text-gray-600">{item.tanggal}</TableCell>
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
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <Users className="w-3 h-3 mr-1" />
                      {item.peserta}
                    </span>
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
          <Calendar className="w-6 h-6 mr-2 text-purple-500" />
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="bg-blue-500 rounded-full p-2">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Webinar Transformasi Digital</h3>
              <p className="text-sm text-blue-600">200 peserta bergabung dalam sesi pembelajaran</p>
              <p className="text-xs text-blue-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
            <div className="bg-pink-500 rounded-full p-2">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-pink-800">Live Instagram ASN BerAKHLAK</h3>
              <p className="text-sm text-pink-600">Engagement tinggi dengan 500 viewer</p>
              <p className="text-xs text-pink-500 mt-1">1 minggu yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}