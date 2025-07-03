"use client"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  TrendingUp, 
  Award,
  BarChart3,
  Cloud,
  Target,
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
} from 'recharts'

interface PelatihanItem {
  id: number
  pegawai_id: number
  unit_kerja_id: number
  judul: string
  jam: number
  tanggal: string
  pegawai: {
    id: number
    nama: string
  }
}

interface ProcessedData {
  id_pegawai: string
  id: number
  pegawai_id: number
  nama: string
  judul: string
  jam: number
  tanggal: string
}

interface Employee {
  id: number
  nama: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

// WordCloud Component
// Minimal WordCloudOptions type for type safety
interface WordCloudOptions {
  list: [string, number][];
  gridSize?: number;
  weightFactor?: (size: number) => number;
  fontFamily?: string;
  color?: () => string;
  rotateRatio?: number;
  backgroundColor?: string;
  minSize?: number;
  drawOutOfBound?: boolean;
  shrinkToFit?: boolean;
}

function TrainingWordCloud({ data }: { data: ProcessedData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let WordCloud: ((canvas: HTMLCanvasElement, options: WordCloudOptions) => void) | undefined;
    let isMounted = true;
    if (!canvasRef.current || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wordFreq: Record<string, number> = {};
    data.forEach(item => {
      const words = item.judul
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    const wordList: [string, number][] = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([word, freq]) => [word, freq * 10]);

    if (wordList.length === 0) return;

    // Dynamically import wordcloud only on client
    import('wordcloud').then((mod) => {
      if (!isMounted) return;
      WordCloud = mod.default || mod;
      if (WordCloud) {
        try {
          WordCloud(canvas, {
            list: wordList,
            gridSize: Math.round(16 * canvas.width / 1024),
            weightFactor: function (size: number) {
              return Math.pow(size, 2.3) * canvas.width / 1024;
            },
            fontFamily: 'Inter, sans-serif',
            color: function () {
              return COLORS[Math.floor(Math.random() * COLORS.length)];
            },
            rotateRatio: 0.3,
            backgroundColor: 'transparent',
            minSize: 12,
            drawOutOfBound: false,
            shrinkToFit: true
          });
        } catch (error) {
          console.error('WordCloud error:', error);
        }
      }
    });
    return () => { isMounted = false; };
  }, [data])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-full"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  )
}

export default function PelatihanPage() {
  const [showModal, setShowModal] = useState(false)  
  const [data, setData] = useState<ProcessedData[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    id_pegawai: null as string | null,
    judul: '',
    jam: 0,
    tanggal: ''
  })

  // Ensure component is mounted before rendering client-side features
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get unit_kerja_id from localStorage and fetch data
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const id = localStorage.getItem('id')
      if (id) {
        const parsedId = parseInt(id)
        fetchPelatihanData(parsedId)
        fetchEmployeesData(parsedId)
      } else {
        setError('Unit kerja ID tidak ditemukan')
        setLoading(false)
      }
    } else if (mounted) {
      setLoading(false)
    }
  }, [mounted])
  const fetchPelatihanData = async (id: number) => {    try {
      setLoading(true)
      const response = await fetch(`/api/pelatihan_pegawai/${id}`)
      if (!response.ok) throw new Error('Failed to fetch pelatihan data')
      const apiData: PelatihanItem[] = await response.json()
      
      const processedData: ProcessedData[] = apiData.map(item => ({
        id_pegawai: item.pegawai?.id?.toString() ?? '', 
        id: item.id,
        pegawai_id: item.pegawai_id,
        nama: item.pegawai?.nama || 'Unknown',
        judul: item.judul,
        jam: item.jam,
        tanggal: new Date(item.tanggal).toISOString().split('T')[0] // Format yyyy-mm-dd for input
      }))
      setData(processedData)
    } catch (err) {      console.error('Error fetching pelatihan data:', err)
      setError('Failed to load pelatihan data')
      toast.error('Gagal memuat data pelatihan')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeesData = async (id: number) => {
  try {
    const response = await fetch(`/api/employee/${id}`)
    if (!response.ok) throw new Error('Failed to fetch employees data')
    const employeeList: Employee[] = await response.json()

    setEmployees(employeeList)
  } catch (err) {
    console.error('Error fetching employees data:', err)
    toast.error('Gagal memuat data pegawai')
  }
}

  // Helper function to get employee name by ID
  const getEmployeeNameById = (id: number): string => {
    const employee = employees.find(emp => emp.id === id)
    return employee ? employee.nama : 'Unknown'
  }

  // Calculate statistics
  const totalPelatihan = data.length
  const totalPeserta = data.length
  const totalJam = data.reduce((sum, item) => sum + item.jam, 0)
  const rataRataJam = totalPelatihan > 0 ? Math.round(totalJam / totalPelatihan) : 0
  // Data for charts
  const monthlyData = data.reduce((acc, item) => {
    const date = new Date(item.tanggal) // tanggal sudah dalam format ISO yyyy-mm-dd
    const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    acc[monthYear] = (acc[monthYear] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(monthlyData)
    .sort(([a], [b]) => {
      const dateA = new Date(a.split(' ').reverse().join(' '))
      const dateB = new Date(b.split(' ').reverse().join(' '))
      return dateA.getTime() - dateB.getTime()
    })
    .map(([month, count]) => ({ month, pelatihan: count }))

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
  const handleEdit = (item: ProcessedData) => {
    setFormData({
      id_pegawai: item.pegawai_id.toString(),
      judul: item.judul,
      jam: item.jam,
      tanggal: item.tanggal
    })
    setEditingId(item.id)
    setShowModal(true)
  }
  const handleDelete = async (id: number) => {
    if (typeof window !== 'undefined' && confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const unitKerjaId = localStorage.getItem("id")
        setLoading(true)
        
        const response = await fetch(`/api/pelatihan_pegawai/${unitKerjaId}/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Gagal menghapus data dari server')

        // Refresh data from server
        if (unitKerjaId) {
          await fetchPelatihanData(parseInt(unitKerjaId))
        }
        
        toast.success('Data berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting data:', error)
        toast.error('Gagal menghapus data')
      } finally {
        setLoading(false)
      }
    }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  try {
    const unitKerjaId = localStorage.getItem("id")
    setLoading(true)

    let response
    if (editingId) {
      // Update data
      response = await fetch(`/api/pelatihan_pegawai/${unitKerjaId}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pegawai_id: Number(formData.id_pegawai), // langsung gunakan ID pegawai
          judul: formData.judul,
          jam: Number(formData.jam),
          tanggal: formData.tanggal
        })
      })
    } else {
      // Create new data
      response = await fetch(`/api/pelatihan_pegawai/${unitKerjaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pegawai_id: Number(formData.id_pegawai), // langsung gunakan ID pegawai
          judul: formData.judul,
          jam: Number(formData.jam),
          tanggal: formData.tanggal
        })
      })
    }

    if (!response.ok) throw new Error('Gagal menyimpan data ke server')

    const id = localStorage.getItem('id')
    if (id) {
      await fetchPelatihanData(parseInt(id))
    }

    setFormData({ id_pegawai: null, judul: '', jam: 0, tanggal: '' })
    setEditingId(null)
    setShowModal(false)
    toast.success(editingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!')
  } catch {
    toast.error('Terjadi kesalahan saat menyimpan data.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Prevent hydration mismatch by not rendering until mounted */}
      {!mounted ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat halaman...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data pelatihan...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload()
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Muat Ulang
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Pengembangan Kompetensi</h1>
              <p className="text-blue-600">Kelola dan monitor kegiatan pelatihan pegawai</p>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => {
              setShowModal(open)
              if (!open) {
                setEditingId(null)
                setFormData({ id_pegawai: null, judul: '', jam: 0, tanggal: '' })
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Tambah Pelatihan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">
                    {editingId ? 'Edit Pelatihan' : 'Form Pengisian Pelatihan'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama Pegawai */}
                    <div className="space-y-1">
                    <Label htmlFor="nama">Nama Pegawai</Label>                    <Select
                      value={formData.id_pegawai ?? undefined}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, id_pegawai: value }))}
                    >
                      <SelectTrigger>
                      <SelectValue placeholder="Pilih nama pegawai">
                        {formData.id_pegawai ? getEmployeeNameById(Number(formData.id_pegawai)) : "Pilih nama pegawai"}
                      </SelectValue>
                      </SelectTrigger><SelectContent className="max-h-[200px] overflow-y-auto">
                      {employees.length > 0 ? (
                        <>
                        <div className="px-2 py-1 text-xs text-gray-500 font-medium border-b border-gray-100">
                          {employees.length} pegawai tersedia
                        </div>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.nama}
                          </SelectItem>
                        ))}
                        </>
                      ) : (
                        <SelectItem value="" disabled>
                        Tidak ada data pegawai
                        </SelectItem>
                      )}
                      </SelectContent>
                    </Select>
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
                    <Button variant="outline" onClick={() => setShowModal(false)} type="button">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} group overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${card.textDark} mb-1`}>{card.title}</p>
                      <p className={`text-3xl font-bold ${card.textColor} mb-2`}>{card.value}</p>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">{card.change}</span>
                        <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                      </div>
                    </div>
                    <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                      <div className={card.textColor}>{card.icon}</div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.min(
                            (typeof card.value === 'string' ? parseInt(card.value) : card.value) /
                              Math.max(...summaryCards.map(c =>
                                typeof c.value === 'string' ? parseInt(c.value) : c.value
                              )) *
                              100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{card.description}</span>
                      <span className={`font-medium ${card.textColor}`}>📈 Aktif</span>
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
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value} pelatihan`, 'Jumlah Pelatihan']}
                      />
                      <Bar dataKey="pelatihan" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Word Cloud */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <Cloud className="w-6 h-6 mr-2 text-green-500" />
                Judul Pelatihan
              </h2>
              <div className="h-[300px] flex items-center justify-center">
                {data.length > 0 ? (
                  <TrainingWordCloud data={data} />
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">☁️</div>
                    <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
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
                    <TableHead>No</TableHead>
                    <TableHead>Nama Pegawai</TableHead>
                    <TableHead>Judul Pelatihan</TableHead>
                    <TableHead className="text-center">Jam</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-blue-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.judul}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" /> {item.jam} jam
                        </span>
                      </TableCell>
                      <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" /> Selesai
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
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
            </>
          )}
        </>
      )}
    </div>
  )
}

// Force dynamic rendering to prevent SSR issues with browser-only APIs
export const dynamic = "force-dynamic"