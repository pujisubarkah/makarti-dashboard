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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Target
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

interface PelatihanItem {
  id: number
  nama: string
  judul: string
  jam: number
  tanggal: string
  unit: string // Tetap disimpan, tapi tidak ditampilkan
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function PelatihanPage() {
  // Dummy initial data
  const initialData: PelatihanItem[] = [
    {
      id: 1,
      nama: "Budi Santoso",
      judul: "Pelatihan UI/UX Design",
      jam: 8,
      tanggal: "2025-05-15",
      unit: "Pusdatin"
    },
    {
      id: 2,
      nama: "Sari Dewi",
      judul: "Workshop Data Analytics",
      jam: 6,
      tanggal: "2025-05-18",
      unit: "Pusdatin"
    },
    {
      id: 3,
      nama: "Ahmad Rahman",
      judul: "Sertifikasi Project Management",
      jam: 16,
      tanggal: "2025-05-20",
      unit: "Pusdatin"
    },
    {
      id: 4,
      nama: "Rina Kartika",
      judul: "Pelatihan Digital Marketing",
      jam: 4,
      tanggal: "2025-05-22",
      unit: "Pusdatin"
    },
  ]

  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<PelatihanItem[]>(initialData)

  const [formData, setFormData] = useState({
    nama: '',
    judul: '',
    jam: 0,
    tanggal: ''
  })

  // Load data dari localStorage saat pertama kali halaman dimuat
  useEffect(() => {
    const savedData = localStorage.getItem("pelatihanData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  // Calculate statistics
  const totalPelatihan = data.length
  const totalPeserta = data.length // assuming 1 person per training
  const totalJam = data.reduce((sum, item) => sum + item.jam, 0)
  const rataRataJam = totalPelatihan > 0 ? Math.round(totalJam / totalPelatihan) : 0

  // Data for charts
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    pelatihan: count,
  }))

  // Group by training type (simplified categorization)
  const trainingTypes = data.reduce((acc, item) => {
    let category = 'Lainnya'
    if (item.judul.toLowerCase().includes('ui') || item.judul.toLowerCase().includes('design')) {
      category = 'Design'
    } else if (item.judul.toLowerCase().includes('data') || item.judul.toLowerCase().includes('analytics')) {
      category = 'Data & Analytics'
    } else if (item.judul.toLowerCase().includes('management') || item.judul.toLowerCase().includes('project')) {
      category = 'Management'
    } else if (item.judul.toLowerCase().includes('marketing') || item.judul.toLowerCase().includes('digital')) {
      category = 'Digital Marketing'
    }
    
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(trainingTypes).map(([key, value]) => ({
    name: key,
    value,
  }))

  const summaryCards = [
    {
      title: "Total Pelatihan",
      value: totalPelatihan,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+20%',
      description: 'Kegiatan pelatihan total'
    },
    {
      title: "Total Peserta",
      value: totalPeserta,
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+15%',
      description: 'Pegawai yang mengikuti'
    },
    {
      title: "Total Jam",
      value: `${totalJam} jam`,
      icon: <Clock className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+25%',
      description: 'Jam pembelajaran'
    },
    {
      title: "Rata-rata Jam",
      value: `${rataRataJam} jam`,
      icon: <Target className="w-6 h-6" />,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
      change: '+8%',
      description: 'Per pelatihan'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData,
      jam: Number(formData.jam),
      unit: 'Pusdatin' // Unit tetap untuk semua entri
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("pelatihanData", JSON.stringify(updatedData))

    // Reset form dan tutup modal
    setFormData({
      nama: '',
      judul: '',
      jam: 0,
      tanggal: ''
    })
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Pengembangan Kompetensi</h1>
          <p className="text-blue-600">Kelola dan monitor kegiatan pelatihan pegawai</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <GraduationCap className="w-4 h-4 mr-2" />
              Tambah Pelatihan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Form Pengisian Pelatihan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Pegawai */}
              <div className="space-y-1">
                <Label htmlFor="nama">Nama Pegawai</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama pegawai"
                />
              </div>

              {/* Judul Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="judul">Judul Pelatihan</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Pelatihan UI/UX Design"
                />
              </div>

              {/* Jam Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="jam">Jam Pelatihan</Label>
                <Input
                  id="jam"
                  type="number"
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  required
                  placeholder="Misal: 6"
                />
              </div>

              {/* Tanggal Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="tanggal">Tanggal Pelatihan</Label>
                <Input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Tombol Submit & Batal */}
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
                      width: `${Math.min((typeof card.value === 'string' ? parseInt(card.value) : card.value) / Math.max(...summaryCards.map(c => typeof c.value === 'string' ? parseInt(c.value) : c.value)) * 100, 100)}%` 
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
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            Tren Pelatihan Bulanan
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
                  dataKey="pelatihan" 
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

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Kategori Pelatihan
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

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Pengembangan Kompetensi Pegawai</h2>
          <p className="text-blue-100 text-sm">Monitoring pelatihan dan pengembangan SDM</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Pegawai</TableHead>
                <TableHead className="font-medium">Judul Pelatihan</TableHead>
                <TableHead className="text-center font-medium">Jam</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="text-center font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.nama}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.judul}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jam >= 16 ? 'bg-green-100 text-green-800' :
                      item.jam >= 8 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {item.jam} jam
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {item.tanggal}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      Selesai
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
          <BookOpen className="w-6 h-6 mr-2 text-purple-500" />
          Aktivitas Pelatihan Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="bg-blue-500 rounded-full p-2">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Pelatihan UI/UX Design</h3>
              <p className="text-sm text-blue-600">Budi Santoso menyelesaikan pelatihan 8 jam</p>
              <p className="text-xs text-blue-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="bg-green-500 rounded-full p-2">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Sertifikasi Project Management</h3>
              <p className="text-sm text-green-600">Ahmad Rahman mendapatkan sertifikat 16 jam</p>
              <p className="text-xs text-green-500 mt-1">3 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <div className="bg-purple-500 rounded-full p-2">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">Workshop Data Analytics</h3>
              <p className="text-sm text-purple-600">Sari Dewi mengikuti workshop analisis data</p>
              <p className="text-xs text-purple-500 mt-1">1 minggu yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}