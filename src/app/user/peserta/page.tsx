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
  Users,
  Calendar,
  TrendingUp,
  GraduationCap,
  Monitor,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  Clock,
  Plus
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

interface PenyelenggaraanItem {
  id: number
  namaKegiatan: string
  tanggal: string
  jumlahPeserta: number
  jenis_bangkom_non_pelatihan?: {  // Make optional
    jenis_bangkom: string
  }
  users?: {  // Make optional
    unit_kerja: string
  }
}

interface JenisBangkomOption {
  id: number
  jenis_bangkom: string
  created_at: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function PenyelenggaraanBangkomPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<PenyelenggaraanItem[]>([])
  const [options, setOptions] = useState<JenisBangkomOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    namaKegiatan: '',
    tanggal: '',
    jenis_bangkom_id: '',
    jumlahPeserta: ''
  })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Ambil unit_kerja_id dari localStorage
        const unitKerjaId = localStorage.getItem("id")
        
        if (!unitKerjaId) {
          throw new Error("Unit kerja ID tidak ditemukan di localStorage. Silakan login ulang.")
        }

        // Fetch data penyelenggaraan dan jenis bangkom secara parallel
        const [penyelenggaraanResponse, jenisBangkomResponse] = await Promise.all([
          fetch(`/api/penyelenggaraan/${unitKerjaId}`),
          fetch('/api/jenis_bangkom')
        ])

        if (!penyelenggaraanResponse.ok) {
          if (penyelenggaraanResponse.status === 404) {
            throw new Error("Data penyelenggaraan tidak ditemukan untuk unit kerja ini.")
          } else {
            throw new Error(`HTTP error! status: ${penyelenggaraanResponse.status}`)
          }
        }

        if (!jenisBangkomResponse.ok) {
          throw new Error(`HTTP error! status: ${jenisBangkomResponse.status}`)
        }

        const penyelenggaraanData = await penyelenggaraanResponse.json()
        const jenisBangkomData = await jenisBangkomResponse.json()

        setData(penyelenggaraanData)
        setOptions(jenisBangkomData)
        setError(null)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data')
        
        // Set empty data on error
        setData([])
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    // Cek apakah kode berjalan di browser
    if (typeof window !== 'undefined') {
      fetchData()
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data penyelenggaraan...</p>
            <p className="text-sm text-gray-500 mt-2">Mengambil informasi dari database...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="text-red-600 mr-3 text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium text-lg">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => {
                window.location.reload()
                toast.info("Memuat ulang halaman...")
              }} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

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
    const jenis = item.jenis_bangkom_non_pelatihan?.jenis_bangkom
    if (jenis) {
      acc[jenis] = (acc[jenis] || 0) + 1
    }
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
      description: 'Kegiatan bangkom total'
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
    setFormData(prev => ({ ...prev, jenis_bangkom_id: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Show loading toast
    const loadingPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const unitKerjaId = localStorage.getItem("id")
          if (!unitKerjaId) {
            throw new Error("Unit kerja ID tidak ditemukan")
          }

          const response = await fetch(`/api/penyelenggaraan/${unitKerjaId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              namaKegiatan: formData.namaKegiatan,
              tanggal: formData.tanggal,
              jenis_bangkom_id: parseInt(formData.jenis_bangkom_id),
              jumlahPeserta: parseInt(formData.jumlahPeserta),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
          }

          const newItem = await response.json()
          
          // Pastikan data lengkap sebelum menambahkan ke state
          if (newItem && newItem.jenis_bangkom_non_pelatihan) {
            setData(prev => [newItem, ...prev])
          } else {
            // Jika data tidak lengkap, refresh seluruh data
            const refreshResponse = await fetch(`/api/penyelenggaraan/${unitKerjaId}`)
            if (refreshResponse.ok) {
              const refreshedData = await refreshResponse.json()
              setData(refreshedData)
            }
          }

          // Reset form
          setFormData({
            namaKegiatan: '',
            tanggal: '',
            jenis_bangkom_id: '',
            jumlahPeserta: ''
          })
          setShowModal(false)

          resolve(newItem)
        } catch (err) {
          console.error('Error saving data:', err)
          reject(err)
        } finally {
          setIsSubmitting(false)
        }
      }, 500) // Reduced delay
    })

    // Use Sonner's promise toast
    toast.promise(loadingPromise, {
      loading: 'Menyimpan data kegiatan...',
      success: 'Data berhasil ditambahkan!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`,
    })
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

      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Penyelenggaraan Bangkom</h1>
          <p>Kelola dan monitor penyelenggaraan kegiatan bangkom non-pelatihan:
  <br/>
  <span>(Seminar, Webinar, Bimtek, Talkshow, Penilaian Kompetensi,</span>
  <br/>
  <span>Lab inovasi, Sosialisasi, dan lainnya)</span>
</p>
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
              <DialogTitle className="text-blue-700">Form Penyelenggaraan Bangkom</DialogTitle>
            </DialogHeader>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                <Input
                  id="namaKegiatan"
                  name="namaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Lab. Inovasi Kab. Tanjung Jabung Timur"
                />
              </div>

              {/* Tanggal Kegiatan */}
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

              {/* Jenis Bangkom */}
              <div className="space-y-1">
                <Label htmlFor="jenis_bangkom">Jenis Bangkom</Label>
                <Select 
                  onValueChange={handleSelectChange} 
                  value={formData.jenis_bangkom_id}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="jenis_bangkom">
                    <SelectValue placeholder="Pilih jenis bangkom" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.jenis_bangkom}
                      </SelectItem>
                    ))}
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
                  disabled={isSubmitting}
                  placeholder="Contoh: 30"
                />
              </div>

              {/* Submit & Cancel Buttons */}
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
            Jenis Bangkom
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
          <p className="text-blue-100 text-sm">Monitoring kegiatan bangkom non-pelatihan dan peserta</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Nama Kegiatan</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis Bangkom</TableHead>
                <TableHead className="text-right font-medium">Jumlah Peserta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.namaKegiatan}</TableCell>
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
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      {item.jenis_bangkom_non_pelatihan?.jenis_bangkom ?? "Tidak diketahui"}
                    </span>
                  </TableCell>
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

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada data penyelenggaraan. Tambahkan kegiatan pertama Anda!
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
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">{item.namaKegiatan}</h3>
                <p className="text-sm text-blue-600">
                  {item.jumlahPeserta} peserta • {item.jenis_bangkom_non_pelatihan?.jenis_bangkom ?? "Tidak diketahui"}
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