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
  BookOpen,
  FileSearch,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  FileText
} from "lucide-react"

interface KajianItem {
  id: number
  judulKajian: string
  jenisProduk: string
  statusPenyelesaian: string
  tanggalMulai: string
  targetSelesai: string
  penanggungJawab: string
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

const initialData: KajianItem[] = [
  {
    id: 1,
    judulKajian: 'Analisis Efektivitas Pelayanan Digital',
    jenisProduk: 'Analisis Kebijakan',
    statusPenyelesaian: 'Selesai',
    tanggalMulai: '2024-01-15',
    targetSelesai: '2024-03-15',
    penanggungJawab: 'Tim A'
  },
  {
    id: 2,
    judulKajian: 'Survei Kepuasan Masyarakat Layanan Digital',
    jenisProduk: 'Survei',
    statusPenyelesaian: 'Berlangsung',
    tanggalMulai: '2024-02-01',
    targetSelesai: '2024-05-01',
    penanggungJawab: 'Tim B'
  },
  {
    id: 3,
    judulKajian: 'Policy Brief Transformasi Digital Pemerintahan',
    jenisProduk: 'Policy Brief',
    statusPenyelesaian: 'Berlangsung',
    tanggalMulai: '2024-03-10',
    targetSelesai: '2024-06-10',
    penanggungJawab: 'Tim C'
  },
  {
    id: 4,
    judulKajian: 'Telaah Kebijakan Pengembangan Smart City',
    jenisProduk: 'Telaah Kebijakan',
    statusPenyelesaian: 'Tertunda',
    tanggalMulai: '2024-01-20',
    targetSelesai: '2024-04-20',
    penanggungJawab: 'Tim A'
  },
  {
    id: 5,
    judulKajian: 'Kajian Implementasi AI dalam Pelayanan Publik',
    jenisProduk: 'Analisis Kebijakan',
    statusPenyelesaian: 'Perencanaan',
    tanggalMulai: '2024-05-01',
    targetSelesai: '2024-08-01',
    penanggungJawab: 'Tim D'
  },
  {
    id: 6,
    judulKajian: 'Policy Brief Dampak Digitalisasi Pelayanan',
    jenisProduk: 'Policy Brief',
    statusPenyelesaian: 'Selesai',
    tanggalMulai: '2023-11-01',
    targetSelesai: '2024-01-01',
    penanggungJawab: 'Tim B'
  },
  {
    id: 7,
    judulKajian: 'Survei Kebutuhan Fitur Digital Masyarakat',
    jenisProduk: 'Survei',
    statusPenyelesaian: 'Berlangsung',
    tanggalMulai: '2024-04-01',
    targetSelesai: '2024-07-01',
    penanggungJawab: 'Tim C'
  },
  {
    id: 8,
    judulKajian: 'Telaah Kebijakan Keamanan Data Pemerintah',
    jenisProduk: 'Telaah Kebijakan',
    statusPenyelesaian: 'Perencanaan',
    tanggalMulai: '2024-06-01',
    targetSelesai: '2024-09-01',
    penanggungJawab: 'Tim A'
  }
]

export default function KajianPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<KajianItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("kajianData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  const [formData, setFormData] = useState({
    judulKajian: '',
    jenisProduk: 'Analisis Kebijakan',
    statusPenyelesaian: 'Perencanaan',
    tanggalMulai: '',
    targetSelesai: '',
    penanggungJawab: 'Tim A',
  })

  const jenisProdukOptions = ["Analisis Kebijakan", "Telaah Kebijakan", "Survei", "Policy Brief"]
  const statusOptions = ["Perencanaan", "Berlangsung", "Selesai", "Tertunda"]
  const timOptions = ["Tim A", "Tim B", "Tim C", "Tim D"]

  // Calculate statistics
  const totalKajian = data.length
  const selesai = data.filter(item => item.statusPenyelesaian === 'Selesai').length
  const berlangsung = data.filter(item => item.statusPenyelesaian === 'Berlangsung').length
  const tertunda = data.filter(item => item.statusPenyelesaian === 'Tertunda').length

  // Data for charts
  const statusCount = data.reduce((acc, item) => {
    acc[item.statusPenyelesaian] = (acc[item.statusPenyelesaian] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(statusCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenisProduk] = (acc[item.jenisProduk] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(jenisCount).map(([jenis, count]) => ({
    jenis,
    kajian: count,
  }))

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const summaryCards = [
    {
      title: "Total Produk",
      value: totalKajian,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+12%',
      description: 'Total produk kajian'
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
      change: '+25%',
      description: 'Produk telah selesai'
    },
    {
      title: "Berlangsung",
      value: berlangsung,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+18%',
      description: 'Sedang dikerjakan'
    },
    {
      title: "Tertunda",
      value: tertunda,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-100',
      textColor: 'text-red-600',
      textDark: 'text-red-800',
      borderColor: 'border-red-500',
      change: '-5%',
      description: 'Perlu perhatian khusus'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = (item: KajianItem) => {
    setFormData({
      judulKajian: item.judulKajian,
      jenisProduk: item.jenisProduk,
      statusPenyelesaian: item.statusPenyelesaian,
      tanggalMulai: item.tanggalMulai,
      targetSelesai: item.targetSelesai,
      penanggungJawab: item.penanggungJawab,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const updatedData = data.filter(item => item.id !== id)
      setData(updatedData)
      localStorage.setItem("kajianData", JSON.stringify(updatedData))
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil(updatedData.length / itemsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
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
      localStorage.setItem("kajianData", JSON.stringify(updatedData))

      // Reset form and close modal
      setFormData({
        judulKajian: '',
        jenisProduk: 'Analisis Kebijakan',
        statusPenyelesaian: 'Perencanaan',
        tanggalMulai: '',
        targetSelesai: '',
        penanggungJawab: 'Tim A',
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Kajian & Analisis Kebijakan</h1>
          <p className="text-blue-600">Kelola dan monitor Produk Kajian/Analisis Kebijakan/Telaah Kebijakan</p>
        </div>
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              judulKajian: '',
              jenisProduk: 'Analisis Kebijakan',
              statusPenyelesaian: 'Perencanaan',
              tanggalMulai: '',
              targetSelesai: '',
              penanggungJawab: 'Tim A',
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <BookOpen className="w-4 h-4 mr-2" />
              Tambah Produk Kajian
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">
                {editingId ? 'Edit Produk Kajian' : 'Form Produk Kajian Baru'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul Kajian */}
              <div className="space-y-1">
                <Label htmlFor="judulKajian">Judul Kajian</Label>
                <Input
                  id="judulKajian"
                  name="judulKajian"
                  value={formData.judulKajian}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Analisis Efektivitas Pelayanan Digital"
                />
              </div>

              {/* Jenis Produk */}
              <div className="space-y-1">
                <Label htmlFor="jenisProduk">Jenis Produk</Label>
                <Select
                  name="jenisProduk"
                  value={formData.jenisProduk}
                  onValueChange={(value) => handleSelectChange("jenisProduk", value)}
                >
                  <SelectTrigger id="jenisProduk">
                    <SelectValue placeholder="Pilih jenis produk kajian" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisProdukOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Penyelesaian */}
              <div className="space-y-1">
                <Label htmlFor="statusPenyelesaian">Status Penyelesaian</Label>
                <Select
                  name="statusPenyelesaian"
                  value={formData.statusPenyelesaian}
                  onValueChange={(value) => handleSelectChange("statusPenyelesaian", value)}
                >
                  <SelectTrigger id="statusPenyelesaian">
                    <SelectValue placeholder="Pilih status penyelesaian" />
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

              {/* Tanggal Mulai */}
              <div className="space-y-1">
                <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  name="tanggalMulai"
                  value={formData.tanggalMulai}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Target Selesai */}
              <div className="space-y-1">
                <Label htmlFor="targetSelesai">Target Selesai</Label>
                <Input
                  id="targetSelesai"
                  type="date"
                  name="targetSelesai"
                  value={formData.targetSelesai}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Penanggung Jawab */}
              <div className="space-y-1">
                <Label htmlFor="penanggungJawab">Penanggung Jawab</Label>
                <Select
                  name="penanggungJawab"
                  value={formData.penanggungJawab}
                  onValueChange={(value) => handleSelectChange("penanggungJawab", value)}
                >
                  <SelectTrigger id="penanggungJawab">
                    <SelectValue placeholder="Pilih tim penanggung jawab" />
                  </SelectTrigger>
                  <SelectContent>
                    {timOptions.map((option) => (
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
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">dari bulan lalu</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Status Produk
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full">
              {pieData.map((item, index) => (
                <div key={item.name} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Type Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Produk per Jenis
          </h2>
          <div className="h-[300px] flex items-end justify-around gap-2">
            {barData.map((item, index) => (
              <div key={item.jenis} className="flex flex-col items-center">
                <div 
                  className="w-12 rounded-t"
                  style={{ 
                    height: `${(item.kajian / Math.max(...barData.map(d => d.kajian))) * 200}px`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                ></div>
                <p className="text-xs text-center mt-2 font-medium">{item.jenis}</p>
                <p className="text-sm font-bold">{item.kajian}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Table with Pagination */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Produk Kajian & Analisis Kebijakan</h2>
          <p className="text-blue-100 text-sm">Monitoring perkembangan produk kajian dan analisis kebijakan</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Judul Kajian</TableHead>
                <TableHead className="font-medium">Jenis Produk</TableHead>
                <TableHead className="font-medium">Status Penyelesaian</TableHead>
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="text-gray-600">{indexOfFirstItem + index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800">
                    <span className="inline-flex items-center">
                      <FileSearch className="w-3 h-3 mr-1 text-gray-400" />
                      {item.judulKajian}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenisProduk === 'Analisis Kebijakan' ? 'bg-blue-100 text-blue-800' :
                      item.jenisProduk === 'Telaah Kebijakan' ? 'bg-green-100 text-green-800' :
                      item.jenisProduk === 'Survei' ? 'bg-purple-100 text-purple-800' :
                      item.jenisProduk === 'Policy Brief' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <FileText className="w-3 h-3 mr-1" />
                      {item.jenisProduk}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.statusPenyelesaian === 'Selesai' ? 'bg-green-100 text-green-800' :
                      item.statusPenyelesaian === 'Berlangsung' ? 'bg-yellow-100 text-yellow-800' :
                      item.statusPenyelesaian === 'Tertunda' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.statusPenyelesaian === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.statusPenyelesaian === 'Berlangsung' ? <Clock className="w-3 h-3 mr-1" /> :
                       item.statusPenyelesaian === 'Tertunda' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                       <FileText className="w-3 h-3 mr-1" />}
                      {item.statusPenyelesaian}
                    </span>
                  </TableCell>
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, data.length)} dari {data.length} data
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}