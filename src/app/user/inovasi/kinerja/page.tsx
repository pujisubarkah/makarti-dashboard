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
import { toast } from "sonner"

interface InovasiItem {
  id: number
  judul: string
  tahap: string
  tanggal: string
  indikator: string
  unit: string
  unit_kerja_id?: string | number
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

export default function InovasiPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<InovasiItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const id = typeof window !== 'undefined' ? localStorage.getItem('id') : null
      if (!id) throw new Error('ID unit kerja tidak ditemukan di localStorage')
      
      const res = await fetch(`/api/inovasi/${id}`)
      if (!res.ok) throw new Error('Gagal mengambil data inovasi dari server')
      
      const apiData: InovasiItem[] = await res.json()
      // Mapping ke struktur frontend
      setData(apiData.map((item) => ({
        id: item.id,
        judul: item.judul,
        tahap: item.tahap,
        tanggal: item.tanggal.split('T')[0],
        indikator: item.indikator,
        unit: item.unit_kerja_id ? `Unit ${item.unit_kerja_id}` : '-',
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data inovasi dari API saat komponen dimuat
  useEffect(() => {
    fetchData()
  }, [])

  const [formData, setFormData] = useState({
    judul: '',
    tahap: 'Ide',
    tanggal: '',
    indikator: '',
  })

  const tahapOptions = ["Ide", "Perencanaan", "Uji Coba", "Implementasi"]

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
      icon: <Rocket className="w-6 h-6" />,
      color: 'blue',
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
      tahap: item.tahap,
      tanggal: item.tanggal,
      indikator: item.indikator,
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
          onClick: async () => {
            try {
              // Mendapatkan unit_kerja_id dari localStorage
              const unitKerjaId = typeof window !== 'undefined' ? localStorage.getItem('id') : null
              if (!unitKerjaId) throw new Error('ID unit kerja tidak ditemukan')
              
              // Mengirim request DELETE ke API
              const res = await fetch(`/api/inovasi/${unitKerjaId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
              })
              
              if (!res.ok) throw new Error('Gagal menghapus data dari server')
                // Refresh data setelah berhasil menghapus dari API
              await fetchData()
              toast.success("Data berhasil dihapus!")
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Gagal menghapus data')
            }
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
      // Mendapatkan unit_kerja_id dari localStorage
      const unitKerjaId = typeof window !== 'undefined' ? localStorage.getItem('id') : null
      if (!unitKerjaId) throw new Error('ID unit kerja tidak ditemukan')

      // Menyiapkan data untuk dikirim ke API
      const payloadData = {
        ...formData,
        unit_kerja_id: unitKerjaId
      }
      
      let response
      let message
      
      if (editingId) {
        // Update existing item - PUT request
        response = await fetch(`/api/inovasi/${unitKerjaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            ...payloadData
          }),
        })
        message = 'Data berhasil diperbarui!'
      } else {
        // Add new item - POST request
        response = await fetch(`/api/inovasi/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadData),
        })
        message = 'Data berhasil disimpan!'
      }

      if (!response.ok) {
        throw new Error(`Gagal ${editingId ? 'memperbarui' : 'menyimpan'} data ke server`)
      }      // Refresh data dari server
      await fetchData()      // Reset form and close modal
      setFormData({
        judul: '',
        tahap: 'Ide',
        tanggal: '',
        indikator: '',
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
          <p className="text-gray-600">Memuat data inovasi...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Inovasi</h1>
          <p className="text-blue-600">&quot;Pantau dan kelola inovasi pelayanan yang lahir dari setiap unit kerja—menuju pelayanan publik yang makin gesit, responsif, dan solutif!&quot;</p>
        </div>
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              judul: '',
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
          {data.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
                item.tahap === 'Implementasi'
                  ? 'bg-green-50 border-green-500'
                  : item.tahap === 'Uji Coba'
                  ? 'bg-yellow-50 border-yellow-500'
                  : item.tahap === 'Perencanaan'
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className={
                item.tahap === 'Implementasi'
                  ? 'bg-green-500 rounded-full p-2'
                  : item.tahap === 'Uji Coba'
                  ? 'bg-yellow-500 rounded-full p-2'
                  : item.tahap === 'Perencanaan'
                  ? 'bg-blue-500 rounded-full p-2'
                  : 'bg-gray-400 rounded-full p-2'
              }>
                {item.tahap === 'Implementasi' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : item.tahap === 'Uji Coba' ? (
                  <Settings className="w-4 h-4 text-white" />
                ) : item.tahap === 'Perencanaan' ? (
                  <Target className="w-4 h-4 text-white" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  item.tahap === 'Implementasi'
                    ? 'text-green-800'
                    : item.tahap === 'Uji Coba'
                    ? 'text-yellow-800'
                    : item.tahap === 'Perencanaan'
                    ? 'text-blue-800'
                    : 'text-gray-800'
                }`}>{item.judul}</h3>
                <p className={`text-sm ${
                  item.tahap === 'Implementasi'
                    ? 'text-green-600'
                    : item.tahap === 'Uji Coba'
                    ? 'text-yellow-600'
                    : item.tahap === 'Perencanaan'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>{item.indikator}</p>
                <p className={`text-xs mt-1 ${
                  item.tahap === 'Implementasi'
                    ? 'text-green-500'
                    : item.tahap === 'Uji Coba'
                    ? 'text-yellow-500'
                    : item.tahap === 'Perencanaan'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}>{item.tanggal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}