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
  created_at: string
  judul: string
  jenis: string
  status: string | null
  unit_kerja_id: number
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

export default function KajianPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<KajianItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get unit_kerja_id from localStorage (assuming it's stored there)
        const unitKerjaId = localStorage.getItem('id')
        
        const response = await fetch(`/api/kajian/${unitKerjaId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const result = await response.json()
        setData(result.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Gagal memuat data kajian')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const [formData, setFormData] = useState({
    judul: '',
    jenis: 'Laporan',
    status: '',
  })

  const jenisOptions = ["Laporan", "Buku", "Policy brief", "Analisis Kebijakan", "Telaah Kebijakan", "Survei","Produk Hukum"]
  const statusOptions = ["Draft", "Review", "Selesai", "Revisi", "Ditunda"]

  // Calculate statistics - updated for new data structure
  const totalKajian = data.length
  const withStatus = data.filter(item => item.status && item.status.trim() !== '').length
  const withoutStatus = data.filter(item => !item.status || item.status.trim() === '').length
  const laporan = data.filter(item => item.jenis === 'Laporan').length
  // Data for charts - updated for new structure
  const statusCount = data.reduce((acc, item) => {
    const status = item.status && item.status.trim() !== '' ? item.status : 'Belum Ada Status'
    acc[status] = (acc[status] || 0) + 1
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
      title: "Ada Status",
      value: withStatus,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+25%',
      description: 'Produk dengan status'
    },
    {
      title: "Belum Ada Status",
      value: withoutStatus,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+18%',
      description: 'Belum ada status'
    },
    {
      title: "Laporan",
      value: laporan,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-100',
      textColor: 'text-red-600',
      textDark: 'text-red-800',
      borderColor: 'border-red-500',
      change: '-5%',
      description: 'Jenis laporan'
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
      judul: item.judul,
      jenis: item.jenis,
      status: item.status || '',
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const unitKerjaId = localStorage.getItem('unit_kerja_id') || '19'
        
        const response = await fetch(`/api/kajian/${unitKerjaId}/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete kajian')
        }

        // Remove from local state
        const updatedData = data.filter(item => item.id !== id)
        setData(updatedData)
        
        // Reset to first page if current page becomes empty
        const newTotalPages = Math.ceil(updatedData.length / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
        
        alert('Data berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting data:', error)
        alert('Terjadi kesalahan saat menghapus data.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const unitKerjaId = localStorage.getItem('unit_kerja_id') || '19'
      
      if (editingId) {
        // Update existing item - PUT to API
        const response = await fetch(`/api/kajian/${unitKerjaId}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            judul: formData.judul,
            jenis: formData.jenis,
            status: formData.status,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update kajian')
        }

        const result = await response.json()
        // Update local state with the updated item
        setData(prev => prev.map(item => 
          item.id === editingId ? result.data : item
        ))
        alert('Data berhasil diperbarui!')
      } else {
        // Create new item - POST to API
        const response = await fetch(`/api/kajian/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            judul: formData.judul,
            jenis: formData.jenis,
            status: formData.status,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create kajian')
        }

        const result = await response.json()
        setData(prev => [...prev, result.data])
        alert('Data berhasil disimpan!')
      }

      // Reset form and close modal
      setFormData({
        judul: '',
        jenis: 'Laporan',
        status: '',
      })
      setEditingId(null)
      setShowModal(false)
    } catch (error) {
      console.error('Error submitting data:', error)
      alert('Terjadi kesalahan saat menyimpan data.')
    }
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data kajian...</p>
          </div>
        </div>
      ) : (
        <>
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
              judul: '',
              jenis: 'Laporan',
              status: '',
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
                <Label htmlFor="judul">Judul Kajian</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Analisis Efektivitas Pelayanan Digital"
                />
              </div>

              {/* Jenis Produk */}
              <div className="space-y-1">
                <Label htmlFor="jenis">Jenis Produk</Label>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onValueChange={(value) => handleSelectChange("jenis", value)}
                >
                  <SelectTrigger id="jenis">
                    <SelectValue placeholder="Pilih jenis produk kajian" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Status Produk
          </h2>
          <div className="h-[400px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <div className="flex items-center justify-center w-full">
                {/* Pie Chart Circle */}
                <div className="relative">
                  <svg width="280" height="280" viewBox="0 0 280 280">
                    {(() => {
                      let cumulativeAngle = 0;
                      const centerX = 140;
                      const centerY = 140;
                      const radius = 100;
                      
                      return pieData.map((item, index) => {
                        const percentage = (item.value / data.length) * 100;
                        const angle = (percentage / 100) * 360;
                        
                        // Calculate start and end points
                        const startAngle = cumulativeAngle;
                        const endAngle = cumulativeAngle + angle;
                        
                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = (endAngle * Math.PI) / 180;
                        
                        const startX = centerX + radius * Math.cos(startAngleRad);
                        const startY = centerY + radius * Math.sin(startAngleRad);
                        const endX = centerX + radius * Math.cos(endAngleRad);
                        const endY = centerY + radius * Math.sin(endAngleRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${startX} ${startY}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                          'Z'
                        ].join(' ');
                        
                        cumulativeAngle += angle;
                        
                        return (
                          <path
                            key={item.name}
                            d={pathData}
                            fill={COLORS[index % COLORS.length]}
                            stroke="white"
                            strokeWidth="2"
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{data.length}</div>
                      <div className="text-sm text-gray-600">Total Produk</div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="ml-8 space-y-3">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.value} produk ({((item.value / data.length) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <PieChartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Belum ada data untuk ditampilkan</p>
                <p className="text-sm">Tambahkan produk kajian untuk melihat distribusi status</p>
              </div>
            )}
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
                <TableHead className="font-medium">Status</TableHead>
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
                      {item.judul}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis === 'Analisis Kebijakan' ? 'bg-blue-100 text-blue-800' :
                      item.jenis === 'Telaah Kebijakan' ? 'bg-green-100 text-green-800' :
                      item.jenis === 'Survei' ? 'bg-purple-100 text-purple-800' :
                      item.jenis === 'Policy brief' ? 'bg-orange-100 text-orange-800' :
                      item.jenis === 'Laporan' ? 'bg-cyan-100 text-cyan-800' :
                      item.jenis === 'Buku' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <FileText className="w-3 h-3 mr-1" />
                      {item.jenis}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      item.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'Draft' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'Revisi' ? 'bg-orange-100 text-orange-800' :
                      item.status === 'Ditunda' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'Review' ? <Clock className="w-3 h-3 mr-1" /> :
                       item.status === 'Draft' ? <FileText className="w-3 h-3 mr-1" /> :
                       item.status === 'Revisi' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                       item.status === 'Ditunda' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                       <FileText className="w-3 h-3 mr-1" />}
                      {item.status || 'Belum ada status'}
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
        </>
      )}
    </div>
  )
}