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
  Users,
  Calendar,
  TrendingUp,
  GraduationCap,
  Monitor,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
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

interface PelatihanPeserta {
  id: number
  nama: string
  tanggal: string
  jenis: string
  jumlahPeserta: number
  unit: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function FormPelatihanPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<PelatihanPeserta[]>([])

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenis: 'Webinar',
    jumlahPeserta: 0,
  })

  // Get unit from localStorage
  const unit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") || "Pusdatin" : "Pusdatin"

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("pelatihanPesertaData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  // Calculate statistics
  const totalKegiatan = data.length
  const totalPeserta = data.reduce((sum, item) => sum + item.jumlahPeserta, 0)
  const rataRataPeserta = totalKegiatan > 0 ? Math.round(totalPeserta / totalKegiatan) : 0
  const bulanIni = data.filter(item => {
    const today = new Date()
    const itemDate = new Date(item.tanggal)
    return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()
  }).length

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
    acc[month] = (acc[month] || 0) + item.jumlahPeserta
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
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+18%',
      description: 'Kegiatan pelatihan total'
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
      change: '+24%',
      description: 'Peserta keseluruhan'
    },
    {
      title: "Rata-rata Peserta",
      value: rataRataPeserta,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+12%',
      description: 'Per kegiatan'
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
      description: 'Kegiatan periode ini'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, jenis: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData,
      jumlahPeserta: Number(formData.jumlahPeserta),
      unit: unit // Add unit from localStorage
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("pelatihanPesertaData", JSON.stringify(updatedData))

    // Reset form and close modal
    setFormData({
      nama: '',
      tanggal: '',
      jenis: 'Webinar',
      jumlahPeserta: 0,
    })
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Penyelenggaraan Bangkom</h1>
          <p className="text-blue-600">Kelola dan monitor penyelenggaraan kegiatan pelatihan</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <GraduationCap className="w-4 h-4 mr-2" />
              Isi Data Pelatihan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Form Pengisian Pelatihan</DialogTitle>
            </DialogHeader>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="nama">Nama Kegiatan</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Webinar Transformasi Digital"
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

              {/* Jenis Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Pelatihan</Label>
                <Select onValueChange={handleSelectChange} defaultValue={formData.jenis}>
                  <SelectTrigger id="jenis">
                    <SelectValue placeholder="Pilih jenis pelatihan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
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
                  placeholder="Misal: 80"
                />
              </div>

              {/* Submit & Cancel Buttons */}
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
        {/* Bar Chart */}
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

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Jenis Pelatihan
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
          <h2 className="text-xl font-bold">Data Penyelenggaraan Bangkom</h2>
          <p className="text-blue-100 text-sm">Monitoring kegiatan pelatihan dan peserta</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Kegiatan</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Unit</TableHead>
                <TableHead className="text-right font-medium">Jumlah Peserta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.nama}</TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {item.tanggal}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Webinar' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Seminar' ? 'bg-green-100 text-green-800' :
                      item.jenis === 'Zoom' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.jenis === 'Webinar' ? <Monitor className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Seminar' ? <GraduationCap className="w-3 h-3 mr-1" /> :
                       item.jenis === 'Zoom' ? <Monitor className="w-3 h-3 mr-1" /> :
                       <Award className="w-3 h-3 mr-1" />}
                      {item.jenis}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.unit}</TableCell>
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
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          {data.slice(-3).map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="bg-blue-500 rounded-full p-2">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">{item.nama}</h3>
                <p className="text-sm text-blue-600">{item.jumlahPeserta} peserta mengikuti {item.jenis}</p>
                <p className="text-xs text-blue-500 mt-1">{item.tanggal}</p>
              </div>
            </div>
          ))}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data pelatihan. Tambahkan data pertama Anda!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}