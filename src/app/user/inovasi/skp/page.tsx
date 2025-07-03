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
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  Settings,
  Edit,
  Trash2
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts'

interface SkpTransformasionalItem {
  id: number
  pegawai: string
  inovasi: string
  target: string
  status: string
  dampak: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

const initialData: SkpTransformasionalItem[] = [
  {
    id: 1,
    pegawai: 'Budi Santosa',
    inovasi: 'Dashboard SKP Inovatif',
    target: 'Transparansi Kinerja Pegawai',
    status: 'On Progress',
    dampak: 'Visibilitas meningkat 80%'
  },
  {
    id: 2,
    pegawai: 'Ani Wijaya',
    inovasi: 'Sistem Monitoring Real-time',
    target: 'Efisiensi pelaporan',
    status: 'Dalam Rencana',
    dampak: 'Waktu pelaporan berkurang 50%'
  },
  {
    id: 3,
    pegawai: 'Sari Dewi',
    inovasi: 'Aplikasi Mobile SKP',
    target: 'Kemudahan akses pegawai',
    status: 'Sudah Implementasi',
    dampak: 'Kepuasan pegawai naik 90%'
  },
  {
    id: 4,
    pegawai: 'Ahmad Rahman',
    inovasi: 'Chatbot Konsultasi SKP',
    target: 'Pelayanan 24/7',
    status: 'On Progress',
    dampak: 'Response time 5 menit'
  },
  {
    id: 5,
    pegawai: 'Rina Kartika',
    inovasi: 'Sistem Notifikasi Otomatis',
    target: 'Pengingat deadline SKP',
    status: 'Masih Ide',
    dampak: 'Konsep awal telah dibuat'
  },
]

export default function SkpTransformasionalPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<SkpTransformasionalItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("skpTransformasionalData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  const [formData, setFormData] = useState({
    pegawai: '',
    inovasi: '',
    target: '',
    status: 'Masih Ide',
    dampak: '',
  })

  const statusOptions = ["Masih Ide", "Dalam Rencana", "On Progress", "Sudah Implementasi"]

  // Calculate statistics
  const totalSKP = data.length
  const sudahImplementasi = data.filter(item => item.status === 'Sudah Implementasi').length
  const onProgress = data.filter(item => item.status === 'On Progress').length
  const dalamRencana = data.filter(item => item.status === 'Dalam Rencana').length
  const masihIde = data.filter(item => item.status === 'Masih Ide').length

  // Data for charts
  const statusCount = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(statusCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const summaryCards = [
    {
      title: "Total SKP",
      value: totalSKP,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+12%',
      description: 'SKP Transformasional'
    },
    {
      title: "Implementasi",
      value: sudahImplementasi,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+25%',
      description: 'Sudah berhasil'
    },
    {
      title: "On Progress",
      value: onProgress,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+18%',
      description: 'Sedang berjalan'
    },
    {
      title: "Ide & Rencana",
      value: dalamRencana + masihIde,
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+8%',
      description: 'Tahap awal'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = (item: SkpTransformasionalItem) => {
    setFormData({
      pegawai: item.pegawai,
      inovasi: item.inovasi,
      target: item.target,
      status: item.status,
      dampak: item.dampak,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const updatedData = data.filter(item => item.id !== id)
      setData(updatedData)
      localStorage.setItem("skpTransformasionalData", JSON.stringify(updatedData))
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
      localStorage.setItem("skpTransformasionalData", JSON.stringify(updatedData))

      // Reset form and close modal
      setFormData({
        pegawai: '',
        inovasi: '',
        target: '',
        status: 'Masih Ide',
        dampak: '',
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard SKP Transformasional</h1>
          <p className="text-blue-600">Kelola dan monitor SKP transformasional pegawai</p>
        </div>
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              pegawai: '',
              inovasi: '',
              target: '',
              status: 'Masih Ide',
              dampak: '',
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Award className="w-4 h-4 mr-2" />
              Tambah SKP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">
                {editingId ? 'Edit SKP Transformasional' : 'Form SKP Transformasional'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Pegawai */}
              <div className="space-y-1">
                <Label htmlFor="pegawai">Nama Pegawai</Label>
                <Input
                  id="pegawai"
                  name="pegawai"
                  value={formData.pegawai}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Budi Santosa"
                />
              </div>

              {/* Judul Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="inovasi">Judul Inovasi</Label>
                <Input
                  id="inovasi"
                  name="inovasi"
                  value={formData.inovasi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Dashboard SKP Inovatif"
                />
              </div>

              {/* Target Transformasi */}
              <div className="space-y-1">
                <Label htmlFor="target">Target Transformasi</Label>
                <Input
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Transparansi Kinerja Pegawai"
                />
              </div>

              {/* Status Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status inovasi" />
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

              {/* Dampak Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="dampak">Dampak Inovasi</Label>
                <Input
                  id="dampak"
                  name="dampak"
                  value={formData.dampak}
                  onChange={handleChange}
                  placeholder="Contoh: Visibilitas meningkat 80%"
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
            Distribusi Status SKP
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

        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Progress Implementasi
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Sudah Implementasi</span>
              <span className="text-sm font-bold text-green-600">{sudahImplementasi}/{totalSKP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalSKP > 0 ? (sudahImplementasi / totalSKP) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-gray-700">On Progress</span>
              <span className="text-sm font-bold text-yellow-600">{onProgress}/{totalSKP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalSKP > 0 ? (onProgress / totalSKP) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-gray-700">Dalam Rencana</span>
              <span className="text-sm font-bold text-blue-600">{dalamRencana}/{totalSKP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalSKP > 0 ? (dalamRencana / totalSKP) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium text-gray-700">Masih Ide</span>
              <span className="text-sm font-bold text-purple-600">{masihIde}/{totalSKP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalSKP > 0 ? (masihIde / totalSKP) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data SKP Transformasional</h2>
          <p className="text-blue-100 text-sm">Monitoring inovasi dalam SKP pegawai</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Pegawai</TableHead>
                <TableHead className="font-medium">Judul Inovasi</TableHead>
                <TableHead className="font-medium">Target Transformasi</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Dampak Inovasi</TableHead>
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <Users className="w-3 h-3 mr-1 text-gray-400" />
                      {item.pegawai}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1 text-gray-400" />
                      {item.inovasi}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.target}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Sudah Implementasi' ? 'bg-green-100 text-green-800' :
                      item.status === 'On Progress' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'Dalam Rencana' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.status === 'Sudah Implementasi' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'On Progress' ? <Clock className="w-3 h-3 mr-1" /> :
                       item.status === 'Dalam Rencana' ? <Settings className="w-3 h-3 mr-1" /> :
                       <Lightbulb className="w-3 h-3 mr-1" />}
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.dampak}</TableCell>
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
          <Award className="w-6 h-6 mr-2 text-purple-500" />
          Progress SKP Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Aplikasi Mobile SKP</h3>
              <p className="text-sm text-green-600">Sari Dewi berhasil implementasi dengan kepuasan 90%</p>
              <p className="text-xs text-green-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div className="bg-yellow-500 rounded-full p-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Dashboard SKP Inovatif</h3>
              <p className="text-sm text-yellow-600">Budi Santosa dalam progress implementasi</p>
              <p className="text-xs text-yellow-500 mt-1">1 minggu yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <div className="bg-purple-500 rounded-full p-2">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">Sistem Notifikasi Otomatis</h3>
              <p className="text-sm text-purple-600">Rina Kartika sedang mengembangkan ide konsep</p>
              <p className="text-xs text-purple-500 mt-1">5 hari yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}