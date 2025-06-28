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
  Lightbulb,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Rocket,
  Settings,
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

interface InovasiItem {
  id: number
  judul: string
  pengusul: string
  tahap: string
  tanggal: string
  indikator: string
  unit: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

// Dummy initial data
const initialData: InovasiItem[] = [
  {
    id: 1,
    judul: 'Digitalisasi Formulir Pelayanan',
    pengusul: 'Unit A',
    tahap: 'Implementasi',
    tanggal: '2025-05-15',
    indikator: 'Target selesai Juni 2025',
    unit: 'Unit A'
  },
  {
    id: 2,
    judul: 'Sistem Monitoring Real-time',
    pengusul: 'Unit B',
    tahap: 'Uji Coba',
    tanggal: '2025-05-10',
    indikator: 'Uji coba 3 bulan',
    unit: 'Unit B'
  },
  {
    id: 3,
    judul: 'Chatbot Pelayanan Publik',
    pengusul: 'Unit A',
    tahap: 'Perencanaan',
    tanggal: '2025-05-20',
    indikator: 'Development dimulai Juli 2025',
    unit: 'Unit A'
  },
  {
    id: 4,
    judul: 'Dashboard Analytics',
    pengusul: 'Unit C',
    tahap: 'Ide',
    tanggal: '2025-05-18',
    indikator: 'Proposal draft selesai',
    unit: 'Unit C'
  },
]

export default function InovasiPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<InovasiItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("inovasiData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  const [formData, setFormData] = useState({
    judul: '',
    pengusul: 'Unit A',
    tahap: 'Ide',
    tanggal: '',
    indikator: '',
  })

  const tahapOptions = ["Ide", "Perencanaan", "Uji Coba", "Implementasi"]
  const unitOptions = ["Unit A", "Unit B", "Unit C", "Unit D"]

  // Calculate statistics
  const totalInovasi = data.length
  const implementasi = data.filter(item => item.tahap === 'Implementasi').length
  const ujiCoba = data.filter(item => item.tahap === 'Uji Coba').length
  const perencanaan = data.filter(item => item.tahap === 'Perencanaan').length
  const ide = data.filter(item => item.tahap === 'Ide').length

  // Data for charts
  const tahapCount = data.reduce((acc, item) => {
    acc[item.tahap] = (acc[item.tahap] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(tahapCount).map(([key, value]) => ({
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
    inovasi: count,
  }))

  const summaryCards = [
    {
      title: "Total Inovasi",
      value: totalInovasi,
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+15%',
      description: 'Inovasi keseluruhan'
    },
    {
      title: "Implementasi",
      value: implementasi,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+20%',
      description: 'Sudah diimplementasi'
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
      change: '+30%',
      description: 'Dalam tahap uji coba'
    },
    {
      title: "Perencanaan",
      value: perencanaan + ide,
      icon: <Target className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+10%',
      description: 'Ide & perencanaan'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = (item: InovasiItem) => {
    setFormData({
      judul: item.judul,
      pengusul: item.pengusul,
      tahap: item.tahap,
      tanggal: item.tanggal,
      indikator: item.indikator,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const updatedData = data.filter(item => item.id !== id)
      setData(updatedData)
      localStorage.setItem("inovasiData", JSON.stringify(updatedData))
      alert('Data berhasil dihapus!')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let updatedData
      
      if (editingId) {
        // Update existing item
        updatedData = data.map(item => 
          item.id === editingId 
            ? { ...item, ...formData, unit: formData.pengusul }
            : item
        )
      } else {
        // Add new item
        const newItem = {
          id: Date.now(),
          ...formData,
          unit: formData.pengusul
        }
        updatedData = [...data, newItem]
      }

      setData(updatedData)
      localStorage.setItem("inovasiData", JSON.stringify(updatedData))

      // Reset form and close modal
      setFormData({
        judul: '',
        pengusul: 'Unit A',
        tahap: 'Ide',
        tanggal: '',
        indikator: '',
      })
      setEditingId(null)
      setShowModal(false)
      alert(editingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!')
    } catch {
      alert('Terjadi kesalahan saat menyimpan data.')
    }
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Inovasi</h1>
          <p className="text-blue-600">Kelola dan monitor perkembangan inovasi pelayanan</p>
        </div>
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              judul: '',
              pengusul: 'Unit A',
              tahap: 'Ide',
              tanggal: '',
              indikator: '',
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Lightbulb className="w-4 h-4 mr-2" />
              Tambah Inovasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">
                {editingId ? 'Edit Inovasi' : 'Form Pengisian Inovasi'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="judul">Judul Inovasi</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Digitalisasi Formulir Pelayanan"
                />
              </div>

              {/* Pengusul */}
              <div className="space-y-1">
                <Label htmlFor="pengusul">Pengusul</Label>
                <Select
                  name="pengusul"
                  value={formData.pengusul}
                  onValueChange={(value) => handleSelectChange("pengusul", value)}
                >
                  <SelectTrigger id="pengusul">
                    <SelectValue placeholder="Pilih unit pengusul" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tahap Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="tahap">Tahap</Label>
                <Select
                  name="tahap"
                  value={formData.tahap}
                  onValueChange={(value) => handleSelectChange("tahap", value)}
                >
                  <SelectTrigger id="tahap">
                    <SelectValue placeholder="Pilih tahap inovasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahapOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Inovasi */}
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

              {/* Indikator Kinerja */}
              <div className="space-y-1">
                <Label htmlFor="indikator">Indikator Kinerja</Label>
                <Input
                  id="indikator"
                  name="indikator"
                  value={formData.indikator}
                  onChange={handleChange}
                  required
                  placeholder="Misal: Target uji coba Juni 2025"
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
            Distribusi Tahap Inovasi
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
            Tren Inovasi Bulanan
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
                  dataKey="inovasi" 
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
          <h2 className="text-xl font-bold">Data Inovasi Pelayanan</h2>
          <p className="text-blue-100 text-sm">Monitoring perkembangan inovasi di unit kerja</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Judul Inovasi</TableHead>
                <TableHead className="font-medium">Tahap</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Indikator Kinerja</TableHead>
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.judul}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.tahap === 'Implementasi' ? 'bg-green-100 text-green-800' :
                      item.tahap === 'Uji Coba' ? 'bg-yellow-100 text-yellow-800' :
                      item.tahap === 'Perencanaan' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.tahap === 'Implementasi' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.tahap === 'Uji Coba' ? <Settings className="w-3 h-3 mr-1" /> :
                       item.tahap === 'Perencanaan' ? <Target className="w-3 h-3 mr-1" /> :
                       <Lightbulb className="w-3 h-3 mr-1" />}
                      {item.tahap}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <span className="inline-flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      {item.tanggal}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.indikator}</TableCell>
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
          <Rocket className="w-6 h-6 mr-2 text-purple-500" />
          Progress Inovasi Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Digitalisasi Formulir Pelayanan</h3>
              <p className="text-sm text-green-600">Tahap implementasi berjalan sesuai target</p>
              <p className="text-xs text-green-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div className="bg-yellow-500 rounded-full p-2">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Sistem Monitoring Real-time</h3>
              <p className="text-sm text-yellow-600">Uji coba berlangsung 3 bulan ke depan</p>
              <p className="text-xs text-yellow-500 mt-1">1 minggu yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="bg-blue-500 rounded-full p-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Chatbot Pelayanan Publik</h3>
              <p className="text-sm text-blue-600">Tahap perencanaan development telah dimulai</p>
              <p className="text-xs text-blue-500 mt-1">3 hari yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}