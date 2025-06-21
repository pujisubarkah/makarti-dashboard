// app/user/networking/tambah/page.tsx
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
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Handshake,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  FileText
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
  tanggal: string
  status: string
  unit: string | null
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

const initialData: NetworkingItem[] = [
  {
    id: 1,
    instansi: 'Kementerian PANRB',
    jenis: 'Kunjungan',
    tanggal: '2024-05-15',
    status: 'Selesai',
    unit: 'Pusat A'
  },
  {
    id: 2,
    instansi: 'BPKP',
    jenis: 'Kerjasama',
    tanggal: '2024-05-20',
    status: 'MoU Ditandatangani',
    unit: 'Pusat A'
  },
  {
    id: 3,
    instansi: 'Kemendagri',
    jenis: 'Koordinasi',
    tanggal: '2024-06-01',
    status: 'Menunggu Tindak Lanjut',
    unit: 'Pusat A'
  },
  {
    id: 4,
    instansi: 'BPS',
    jenis: 'Kunjungan',
    tanggal: '2024-06-10',
    status: 'Selesai',
    unit: 'Pusat A'
  },
]

export default function NetworkingPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<NetworkingItem[]>([])

  const [formData, setFormData] = useState({
    instansi: "",
    jenis: "Kunjungan",
    tanggal: "",
    status: "Selesai",
  })

  const userUnit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") : null

  const jenisOptions = ["Kunjungan", "Kerjasama", "Koordinasi"]
  const statusOptions = ["Selesai", "MoU Ditandatangani", "Menunggu Tindak Lanjut"]

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("networkingData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  // Calculate statistics
  const totalKegiatan = data.length
  const selesai = data.filter(item => item.status === 'Selesai').length
  const mouDitandatangani = data.filter(item => item.status === 'MoU Ditandatangani').length
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
    {
      title: "Tindak Lanjut",
      value: menungguTindakLanjut,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+10%',
      description: 'Menunggu follow up'
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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
    localStorage.setItem("networkingData", JSON.stringify(updatedData))

    // Reset form and close modal
    setFormData({
      instansi: "",
      jenis: "Kunjungan",
      tanggal: "",
      status: "Selesai",
    })
    setShowModal(false)
    alert('Data berhasil disimpan!')
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
                  placeholder="Contoh: Kementerian PANRB"
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

              {/* Tanggal */}
              <div className="space-y-1">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                />
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
            Kegiatan per Jenis
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
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <Building className="w-3 h-3 mr-1 text-gray-400" />
                      {item.instansi}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {item.tanggal}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Kunjungan' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Kerjasama' ? 'bg-purple-100 text-purple-800' :
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
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'MoU Ditandatangani' ? <Award className="w-3 h-3 mr-1" /> :
                       <Clock className="w-3 h-3 mr-1" />}
                      {item.status}
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
          <Handshake className="w-6 h-6 mr-2 text-purple-500" />
          Kegiatan Networking Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Kunjungan ke BPS</h3>
              <p className="text-sm text-green-600">Kegiatan kunjungan telah selesai dilaksanakan</p>
              <p className="text-xs text-green-500 mt-1">10 Juni 2024 • 1 minggu yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <div className="bg-purple-500 rounded-full p-2">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">MoU dengan BPKP</h3>
              <p className="text-sm text-purple-600">Memorandum of Understanding telah ditandatangani</p>
              <p className="text-xs text-purple-500 mt-1">20 Mei 2024 • 3 minggu yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div className="bg-yellow-500 rounded-full p-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Koordinasi dengan Kemendagri</h3>
              <p className="text-sm text-yellow-600">Menunggu tindak lanjut hasil koordinasi</p>
              <p className="text-xs text-yellow-500 mt-1">1 Juni 2024 • 2 minggu yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}