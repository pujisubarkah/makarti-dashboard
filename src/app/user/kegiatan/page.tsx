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
import { Calendar, DollarSign, CheckCircle, BarChart3, PieChart as PieChartIcon, Edit, Trash2, Plus, TrendingUp, Search, Filter, Clock, ChevronDown, ChevronUp, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RencanaMingguan {
  id: number
  minggu: number
  kegiatan: string
  unit_id: number
  jenis_belanja: string
  anggaran_rencana: number
  anggaran_cair: number
  created_at: string
  bulan: number
  status: string
  assigned_to?: string // Tambahkan properti assigned_to dengan tipe opsional
}

interface SerapanData {
  total_realisasi: number
  detail_per_bulan: Array<{
    bulan: number
    pagu_anggaran: number
    realisasi: number
  }>
}

const bulanOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
]

const mingguOptions = [
  { value: 1, label: 'Minggu ke-1' },
  { value: 2, label: 'Minggu ke-2' },
  { value: 3, label: 'Minggu ke-3' },
  { value: 4, label: 'Minggu ke-4' },
  { value: 5, label: 'Minggu ke-5' },
  { value: 6, label: 'Minggu ke-6' }
]

const statusOptions = ["Direncanakan", "Dilaksanakan", "Dibatalkan", "Reschedule"]

const jenisBelanjaOptions = [
  { value: '51', label: '51 - Belanja Pegawai' },
  { value: '52', label: '52 - Belanja Barang Jasa' },
  { value: '53', label: '53 - Belanja Modal' }
]

export default function RencanaKegiatanPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<RencanaMingguan[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [serapanData, setSerapanData] = useState<SerapanData | null>(null)

  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<RencanaMingguan | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Search, Filter, and Sort states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterBulan, setFilterBulan] = useState("all")
  const [filterJenisBelanja, setFilterJenisBelanja] = useState("all")
  const [sortField, setSortField] = useState<keyof RencanaMingguan | "">("bulan")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Collapsible weeks state
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set())
  const [showOnlyRecentWeeks, setShowOnlyRecentWeeks] = useState(true)
  
  // Pagination state for older weeks
  const [currentOlderWeekPage, setCurrentOlderWeekPage] = useState(1)
  const olderWeeksPerPage = 10

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    bulan: '',
    minggu: '',
    kegiatan: '',
    jenis_belanja: '',
    anggaran_rencana: '',
    anggaran_cair: '',
    status: 'Direncanakan',
  })

  // Effect untuk mengubah anggaran_cair ketika status berubah
  useEffect(() => {
    if (['Dibatalkan', 'Reschedule'].includes(formData.status)) {
      setFormData(prev => ({ ...prev, anggaran_cair: '0' }))
    }
  }, [formData.status])

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitKerjaId = localStorage.getItem('id');
        if (!unitKerjaId) throw new Error('Unit kerja ID tidak ditemukan. Silakan login ulang.');
        // Fetch kegiatan data
        const kegiatanResponse = await fetch(`/api/rencana-mingguan/${unitKerjaId}`);
        if (kegiatanResponse.ok) {
          const kegiatanResult = await kegiatanResponse.json();
          setData(kegiatanResult.data || []);
        }
        // Fetch serapan anggaran data
        const serapanResponse = await fetch(`/api/serapan/${unitKerjaId}`);
        if (serapanResponse.ok) {
          const serapanResult = await serapanResponse.json();
          setSerapanData(serapanResult);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal memuat data rencana kegiatan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate statistics
  const totalKegiatan = data.length
  const direncanakan = data.filter(item => item.status === 'Direncanakan').length
  const dilaksanakan = data.filter(item => item.status === 'Dilaksanakan').length
  const dibatalkan = data.filter(item => item.status === 'Dibatalkan').length
  const reschedule = data.filter(item => item.status === 'Reschedule' || item.status === 'Ditunda').length

  // Get latest Pagu Anggaran and total realisasi from serapan data
  const getPaguAnggaranTerbaru = () => {
    if (!serapanData || !serapanData.detail_per_bulan || serapanData.detail_per_bulan.length === 0) {
      return 0
    }
    // Get the latest month's pagu anggaran
    const latestData = serapanData.detail_per_bulan[serapanData.detail_per_bulan.length - 1]
    return latestData.pagu_anggaran || 0
  }

  const getTotalRealisasiSerapan = () => {
    return serapanData?.total_realisasi || 0
  }

  // Data for charts
  const statusChartData = [
    { name: 'Direncanakan', value: direncanakan, color: '#60a5fa' },
    { name: 'Dilaksanakan', value: dilaksanakan, color: '#34d399' },
    { name: 'Dibatalkan', value: dibatalkan, color: '#ef4444' },
    { name: 'Reschedule', value: reschedule, color: '#f472b6' }
  ].filter(item => item.value > 0)

  const anggaranPerBulan = bulanOptions.map(bulan => {
    const kegiatanBulan = data.filter(item => item.bulan === bulan.value)
    return {
      bulan: bulan.label,
      rencana: kegiatanBulan.reduce((sum, item) => sum + item.anggaran_rencana, 0),
      realisasi: kegiatanBulan.reduce((sum, item) => sum + item.anggaran_cair, 0)
    }
  }).filter(item => item.rencana > 0 || item.realisasi > 0)

  // Filter and search data
  const filteredData = data.filter(item => {
    const matchesSearch = item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jenis_belanja.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "" || filterStatus === "all" || item.status === filterStatus
    const matchesBulan = filterBulan === "" || filterBulan === "all" || item.bulan.toString() === filterBulan
    const matchesJenisBelanja = filterJenisBelanja === "" || filterJenisBelanja === "all" || item.jenis_belanja === filterJenisBelanja
    
    return matchesSearch && matchesStatus && matchesBulan && matchesJenisBelanja
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    // Default sorting: bulan desc, then minggu desc
    if (!sortField || sortField === "bulan") {
      // Primary sort by month (descending)
      const monthDiff = b.bulan - a.bulan
      if (monthDiff !== 0) return monthDiff
      
      // Secondary sort by week (descending) if months are equal
      return b.minggu - a.minggu
    }
    
    // For other fields, use the standard sorting logic
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      // Provide default values if undefined
      const aComp = aValue ?? '';
      const bComp = bValue ?? '';
      return aComp < bComp ? -1 : aComp > bComp ? 1 : 0;
    } else {
      const aComp = aValue ?? '';
      const bComp = bValue ?? '';
      return aComp > bComp ? -1 : aComp < bComp ? 1 : 0;
    }
  })



  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterBulan("all")
    setFilterJenisBelanja("all")
    setSortField("bulan")
    setSortDirection("desc")
  }

  const summaryCards = [
    {
      title: "Total Kegiatan",
      value: totalKegiatan,
      icon: <Calendar className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      description: 'Total rencana kegiatan'
    },
    {
      title: "Pagu Anggaran",
      value: `Rp ${getPaguAnggaranTerbaru().toLocaleString('id-ID')}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      description: 'Pagu anggaran bulan terakhir'
    },
    {
      title: "Realisasi Anggaran",
      value: `Rp ${getTotalRealisasiSerapan().toLocaleString('id-ID')}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      description: 'Total realisasi kumulatif'
    },
    {
      title: "Direncanakan",
      value: direncanakan,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'cyan',
      bgGradient: 'from-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      textDark: 'text-cyan-800',
      borderColor: 'border-cyan-500',
      description: 'Kegiatan direncanakan'
    }
  ]

  const resetForm = () => {
    setFormData({
      bulan: '',
      minggu: '',
      kegiatan: '',
      jenis_belanja: '',
      anggaran_rencana: '',
      anggaran_cair: '',
      status: 'Direncanakan',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const unitKerjaId = localStorage.getItem('id')
      
      if (!unitKerjaId) {
        throw new Error('Unit kerja ID tidak ditemukan. Silakan login ulang.')
      }

      if (editingId) {
        // Update existing item
        const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update rencana kegiatan')
        }

        const result = await response.json()
        setData(prev => prev.map(item => 
          item.id === editingId ? result.data : item
        ))
        alert('Data berhasil diperbarui!')
      } else {
        // Create new item
        const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create rencana kegiatan')
        }

        const result = await response.json()
        setData(prev => [...prev, result.data])
        alert('Data berhasil disimpan!')
      }

      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving data:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (item: RencanaMingguan) => {
    setFormData({
      bulan: item.bulan.toString(),
      minggu: item.minggu.toString(),
      kegiatan: item.kegiatan,
      jenis_belanja: item.jenis_belanja,
      anggaran_rencana: item.anggaran_rencana.toString(),
      anggaran_cair: item.anggaran_cair.toString(),
      status: item.status,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return

    try {
      const unitKerjaId = localStorage.getItem('id')
      const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete data')
      }

      setData(prev => prev.filter(item => item.id !== id))
      alert('Data berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('Gagal menghapus data')
    }
  }

  // Update kegiatan status
  const updateKegiatanStatus = async (kegiatanId: number, newStatus: string) => {
    try {
      const unitKerjaId = localStorage.getItem('id')
      const response = await fetch(`/api/rencana-mingguan/${unitKerjaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: kegiatanId,
          status: newStatus
        }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setData(prev => prev.map(item => 
          item.id === kegiatanId ? updatedItem.data : item
        ))
      } else {
        const errorData = await response.json()
        console.error('Failed to update kegiatan status:', errorData)
        alert(`Gagal mengupdate status kegiatan: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating kegiatan status:', error)
      alert('Gagal mengupdate status kegiatan')
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: RencanaMingguan) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    e.dataTransfer.setData('text/plain', String(item.id))
    
    // Add drag image styling
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(2deg)'
    dragImage.style.opacity = '0.8'
    document.body.appendChild(dragImage)
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove highlight if we're leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedItem) return;
    
    if (draggedItem.status !== columnStatus) {
      updateKegiatanStatus(draggedItem.id, columnStatus)
      
      // Visual feedback for successful drop
      const statusText: Record<string, string> = {
        'Direncanakan': 'Direncanakan',
        'Dilaksanakan': 'Dilaksanakan', 
        'Dibatalkan': 'Dibatalkan',
        'Reschedule': 'Reschedule'
      }
      
      console.log(`Kegiatan "${draggedItem.kegiatan}" dipindahkan ke ${statusText[columnStatus]}`)
    }
    setDraggedItem(null)
  }

  // Group kegiatan by week for organized display
  const getKegiatanGroupedByWeek = (status: string) => {
    const kegiatanByStatus = sortedData.filter(item => {
      // Handle legacy "Ditunda" status as "Reschedule"
      if (status === 'Reschedule') {
        return item.status === 'Reschedule' || item.status === 'Ditunda'
      }
      return item.status === status
    })

    // Group by week (bulan + minggu combination)
    const groupedByWeek = kegiatanByStatus.reduce((acc, item) => {
      const weekKey = `${item.bulan}-${item.minggu}`
      if (!acc[weekKey]) {
        acc[weekKey] = {
          weekInfo: { bulan: item.bulan, minggu: item.minggu },
          items: []
        }
      }
      acc[weekKey].items.push(item)
      return acc
    }, {} as Record<string, { weekInfo: { bulan: number, minggu: number }, items: RencanaMingguan[] }>)

    // Convert to array and sort by bulan desc, then minggu desc
    const sortedWeeks = Object.entries(groupedByWeek)
      .map(([weekKey, data]) => ({ weekKey, ...data }))
      .sort((a, b) => {
        // Primary sort by month (descending)
        const monthDiff = b.weekInfo.bulan - a.weekInfo.bulan
        if (monthDiff !== 0) return monthDiff
        
        // Secondary sort by week (descending) if months are equal
        return b.weekInfo.minggu - a.weekInfo.minggu
      })

    return sortedWeeks
  }

  // Get recent weeks (latest 3) and older weeks with pagination
  const getWeeksToDisplay = (status: string) => {
    const allWeeks = getKegiatanGroupedByWeek(status)
    
    if (showOnlyRecentWeeks) {
      const recentWeeks = allWeeks.slice(0, 3)
      const olderWeeks = allWeeks.slice(3)
      return { recentWeeks, olderWeeks, totalOlderWeeks: olderWeeks.length }
    }
    
    return { recentWeeks: allWeeks, olderWeeks: [], totalOlderWeeks: 0 }
  }

  // Get paginated older weeks for display
  const getPaginatedOlderWeeks = () => {
    // Collect all older weeks from all statuses
    const allOlderWeeksMap = new Map<string, { bulan: number, minggu: number }>()
    
    ;['Direncanakan', 'Dilaksanakan', 'Reschedule', 'Dibatalkan'].forEach(status => {
      const { olderWeeks } = getWeeksToDisplay(status)
      olderWeeks.forEach(week => {
        allOlderWeeksMap.set(week.weekKey, week.weekInfo)
      })
    })

    // Sort all older weeks
    const sortedOlderWeeks = Array.from(allOlderWeeksMap.entries())
      .map(([weekKey, weekInfo]) => ({ weekKey, weekInfo }))
      .sort((a, b) => {
        const monthDiff = b.weekInfo.bulan - a.weekInfo.bulan
        if (monthDiff !== 0) return monthDiff
        return b.weekInfo.minggu - a.weekInfo.minggu
      })

    // Apply pagination
    const startIndex = (currentOlderWeekPage - 1) * olderWeeksPerPage
    const endIndex = startIndex + olderWeeksPerPage
    const paginatedWeeks = sortedOlderWeeks.slice(startIndex, endIndex)
    
    return {
      weeks: paginatedWeeks,
      totalWeeks: sortedOlderWeeks.length,
      totalPages: Math.ceil(sortedOlderWeeks.length / olderWeeksPerPage),
      hasMore: sortedOlderWeeks.length > olderWeeksPerPage
    }
  }

  // Toggle collapsed state for week
  const toggleWeekCollapse = (weekKey: string) => {
    const newCollapsed = new Set(collapsedWeeks)
    if (newCollapsed.has(weekKey)) {
      newCollapsed.delete(weekKey)
    } else {
      newCollapsed.add(weekKey)
    }
    setCollapsedWeeks(newCollapsed)
  }

  // Get kegiatan by status
  const getKegiatanByStatus = (status: string) => {
    return sortedData.filter(item => {
      // Handle legacy "Ditunda" status as "Reschedule"
      if (status === 'Reschedule') {
        return item.status === 'Reschedule' || item.status === 'Ditunda'
      }
      return item.status === status
    })
  }

  const getBulanLabel = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan)
    return bulanObj ? bulanObj.label : `Bulan ${bulan}`
  }

  const getJenisBelanjaLabel = (jenisKode: string) => {
    const jenisObj = jenisBelanjaOptions.find(j => j.value === jenisKode)
    return jenisObj ? jenisObj.label : jenisKode
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render charts until component is mounted on client
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Rencana Kegiatan Mingguan
          </h1>
          <p className="text-gray-600">
            Kelola dan pantau rencana kegiatan mingguan beserta anggarannya
          </p>
        </div>
        
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rencana
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Rencana Kegiatan' : 'Tambah Rencana Kegiatan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulan" className="text-sm font-medium text-gray-700">
                    Bulan
                  </Label>
                  <Select value={formData.bulan} onValueChange={(value) => setFormData({...formData, bulan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {bulanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minggu" className="text-sm font-medium text-gray-700">
                    Minggu
                  </Label>
                  <Select value={formData.minggu} onValueChange={(value) => setFormData({...formData, minggu: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih minggu" />
                    </SelectTrigger>
                    <SelectContent>
                      {mingguOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="kegiatan" className="text-sm font-medium text-gray-700">
                  Kegiatan
                </Label>
                <Input
                  id="kegiatan"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
                  placeholder="Masukkan nama kegiatan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="jenis_belanja" className="text-sm font-medium text-gray-700">
                  Jenis Belanja
                </Label>
                <Select value={formData.jenis_belanja} onValueChange={(value) => setFormData({...formData, jenis_belanja: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis belanja" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisBelanjaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="anggaran_rencana" className="text-sm font-medium text-gray-700">
                  Anggaran Rencana
                </Label>
                <Input
                  id="anggaran_rencana"
                  type="number"
                  value={formData.anggaran_rencana}
                  onChange={(e) => setFormData({...formData, anggaran_rencana: e.target.value})}
                  placeholder="Masukkan anggaran rencana"
                  required
                />
              </div>

              <div>
                <Label htmlFor="anggaran_cair" className="text-sm font-medium text-gray-700">
                  Anggaran Realisasi (Cair)
                </Label>
                <Input
                  id="anggaran_cair"
                  type="number"
                  value={formData.anggaran_cair}
                  onChange={(e) => setFormData({...formData, anggaran_cair: e.target.value})}
                  placeholder="Masukkan anggaran realisasi"
                  disabled={['Dibatalkan', 'Reschedule'].includes(formData.status)}
                />
                {['Dibatalkan', 'Reschedule'].includes(formData.status) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Anggaran realisasi otomatis 0 untuk status ini
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
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

              <div className="flex justify-end gap-3 pt-4">
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

      {/* Summary Cards */}
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
                  <p className={`text-2xl font-bold ${card.textColor} mb-2`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <PieChartIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Distribusi Status Kegiatan</h3>
          </div>
          {statusChartData.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>

        {/* Budget Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Anggaran per Bulan</h3>
          </div>
          {anggaranPerBulan.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anggaranPerBulan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number, name: number) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name.toString()]} />
                  <Legend />
                  <Bar dataKey="rencana" fill="#60a5fa" name="Anggaran Rencana" />
                  <Bar dataKey="realisasi" fill="#34d399" name="Anggaran Realisasi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Data Rencana Kegiatan</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari kegiatan atau jenis belanja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filter Status */}
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Bulan */}
              <Select value={filterBulan} onValueChange={(value) => setFilterBulan(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanOptions.map((bulan) => (
                    <SelectItem key={bulan.value} value={bulan.value.toString()}>
                      {bulan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Jenis Belanja */}
              <Select value={filterJenisBelanja} onValueChange={(value) => setFilterJenisBelanja(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Jenis Belanja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {jenisBelanjaOptions.map((jenis) => (
                    <SelectItem key={jenis.value} value={jenis.value}>
                      {jenis.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="px-3"
                title="Bersihkan filter"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan {sortedData.length} dari {data.length} data
            {(searchTerm || (filterStatus !== "all") || (filterBulan !== "all") || (filterJenisBelanja !== "all")) && (
              <span className="ml-2 text-blue-600">(dengan filter)</span>
            )}
          </div>
        </div>
        {/* Board/Column View */}
        <div className="space-y-6">
          {/* Get all unique weeks from all statuses */}
          {(() => {
            // Collect all weeks from all statuses
            const allWeeksMap = new Map<string, { bulan: number, minggu: number }>()
            
            ;['Direncanakan', 'Dilaksanakan', 'Reschedule', 'Dibatalkan'].forEach(status => {
              const weeks = getKegiatanGroupedByWeek(status)
              weeks.forEach(week => {
                allWeeksMap.set(week.weekKey, week.weekInfo)
              })
            })

            // Sort all weeks by bulan desc, then minggu desc
            const sortedAllWeeks = Array.from(allWeeksMap.entries())
              .map(([weekKey, weekInfo]) => ({ weekKey, weekInfo }))
              .sort((a, b) => {
                const monthDiff = b.weekInfo.bulan - a.weekInfo.bulan
                if (monthDiff !== 0) return monthDiff
                return b.weekInfo.minggu - a.weekInfo.minggu
              })

            const recentAllWeeks = showOnlyRecentWeeks ? sortedAllWeeks.slice(0, 3) : sortedAllWeeks
            const { weeks: paginatedOlderWeeks, totalWeeks: totalOlderWeeks, totalPages: totalOlderPages, hasMore: hasMoreOlderWeeks } = showOnlyRecentWeeks ? getPaginatedOlderWeeks() : { weeks: [], totalWeeks: 0, totalPages: 0, hasMore: false }

            return (
              <>
                {/* Column Headers */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4">
                  {[
                    { status: 'Direncanakan', title: 'Direncanakan', icon: Calendar, color: 'blue' },
                    { status: 'Dilaksanakan', title: 'Dilaksanakan', icon: CheckCircle, color: 'green' },
                    { status: 'Reschedule', title: 'Reschedule', icon: Clock, color: 'yellow' },
                    { status: 'Dibatalkan', title: 'Dibatalkan', icon: Trash2, color: 'red' }
                  ].map(column => {
                    const { recentWeeks, olderWeeks } = getWeeksToDisplay(column.status)
                    const totalItems = recentWeeks.reduce((sum, week) => sum + week.items.length, 0) + 
                                     olderWeeks.reduce((sum, week) => sum + week.items.length, 0)
                    const IconComponent = column.icon

                    return (
                      <div key={column.status} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <IconComponent className={`h-5 w-5 mr-2 ${
                              column.color === 'blue' ? 'text-blue-600' :
                              column.color === 'green' ? 'text-green-600' :
                              column.color === 'yellow' ? 'text-yellow-600' :
                              column.color === 'red' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              column.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              column.color === 'green' ? 'bg-green-100 text-green-600' :
                              column.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                              column.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {totalItems}
                            </span>
                            {column.status === 'Direncanakan' && hasMoreOlderWeeks && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowOnlyRecentWeeks(!showOnlyRecentWeeks)}
                                className="h-6 w-6 p-0"
                                title={showOnlyRecentWeeks ? 'Tampilkan semua minggu' : 'Tampilkan 3 minggu terakhir'}
                              >
                                {showOnlyRecentWeeks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Recent Weeks Content */}
                <div className="space-y-6">
                  {recentAllWeeks.map((weekData, weekIndex) => (
                    <div key={weekData.weekKey}>
                      {/* Week Separator Line */}
                      {weekIndex > 0 && (
                        <div className="border-t-2 border-gray-300 mb-6 relative">
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-50 px-3">
                            <div className="text-xs text-gray-500 font-medium">━━━</div>
                          </div>
                        </div>
                      )}

                      {/* Week Header */}
                      <div className="text-center mb-4">
                        <span className="inline-block text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                          {getBulanLabel(weekData.weekInfo.bulan)} - Minggu {weekData.weekInfo.minggu}
                        </span>
                      </div>

                      {/* Week Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {[
                          { status: 'Direncanakan', color: 'blue' },
                          { status: 'Dilaksanakan', color: 'green' },
                          { status: 'Reschedule', color: 'yellow' },
                          { status: 'Dibatalkan', color: 'red' }
                        ].map(column => {
                          const weekItems = getKegiatanGroupedByWeek(column.status)
                            .find(week => week.weekKey === weekData.weekKey)?.items || []
                          const isDragOver = dragOverColumn === column.status

                          return (
                            <div
                              key={column.status}
                              className={`bg-gray-50 rounded-lg p-4 min-h-[200px] transition-all duration-200 ${
                                isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed scale-[1.02]' : ''
                              }`}
                              onDragOver={handleDragOver}
                              onDragEnter={(e) => handleDragEnter(e, column.status)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, column.status)}
                            >
                              <div className="space-y-3">
                                {weekItems.map(item => {
                                  const isBeingDragged = draggedItem?.id === item.id
                                  
                                  return (
                                    <div
                                      key={item.id}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, item)}
                                      onDragEnd={handleDragEnd}
                                      className={`bg-white rounded-lg shadow-md border border-gray-200 p-3 cursor-move hover:shadow-lg transition-all duration-200 group ${
                                        isBeingDragged ? 'opacity-50 rotate-2' : 'hover:scale-[1.02]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                          ID: {item.id}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleEdit(item)
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-blue-50"
                                          >
                                            <Edit className="w-3 h-3 text-blue-600" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDelete(item.id)
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-600" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 break-words">
                                        {item.kegiatan}
                                      </h4>
                                      
                                      <div className="text-xs text-gray-500 mb-2">
                                        {getJenisBelanjaLabel(item.jenis_belanja)}
                                      </div>
                                      
                                      <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Rencana:</span>
                                          <span className="font-medium text-blue-600">
                                            Rp {(item.anggaran_rencana / 1000000).toFixed(1)}M
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600">Realisasi:</span>
                                          <span className="font-medium text-green-600">
                                            Rp {(item.anggaran_cair / 1000000).toFixed(1)}M
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Progress bar */}
                                      {item.anggaran_rencana > 0 && (
                                        <div className="mt-2">
                                          <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div 
                                              className="bg-green-500 h-1 rounded-full transition-all duration-300" 
                                              style={{ 
                                                width: `${Math.min((item.anggaran_cair / item.anggaran_rencana) * 100, 100)}%` 
                                              }}
                                            ></div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1 text-right">
                                            {Math.round((item.anggaran_cair / item.anggaran_rencana) * 100)}%
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                                
                                {weekItems.length === 0 && (
                                  <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                    <div className="text-xs">Tidak ada kegiatan</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Older Weeks (Collapsible with Pagination) */}
                {!showOnlyRecentWeeks && hasMoreOlderWeeks && (
                  <div className="border-t-2 border-gray-400 pt-6 mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <span className="inline-block text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                        Minggu Sebelumnya ({totalOlderWeeks})
                      </span>
                      
                      {/* Pagination Controls */}
                      {totalOlderPages > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Halaman {currentOlderWeekPage} dari {totalOlderPages}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentOlderWeekPage(Math.max(1, currentOlderWeekPage - 1))}
                              disabled={currentOlderWeekPage === 1}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentOlderWeekPage(Math.min(totalOlderPages, currentOlderWeekPage + 1))}
                              disabled={currentOlderWeekPage === totalOlderPages}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      {paginatedOlderWeeks.map((weekData, weekIndex) => {
                        const isCollapsed = collapsedWeeks.has(weekData.weekKey)
                        
                        return (
                          <div key={weekData.weekKey}>
                            {/* Week Separator Line for older weeks */}
                            {weekIndex > 0 && (
                              <div className="border-t border-gray-200 mb-4 relative">
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-gray-50 px-2">
                                  <div className="text-xs text-gray-400">···</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Collapsible Week Header */}
                            <button
                              onClick={() => toggleWeekCollapse(weekData.weekKey)}
                              className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-4"
                            >
                              <span className="text-sm font-medium text-gray-700 mr-3">
                                {getBulanLabel(weekData.weekInfo.bulan)} - Minggu {weekData.weekInfo.minggu}
                              </span>
                              <div className="flex items-center gap-2">
                                {isCollapsed ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronUp className="w-4 h-4" />
                                }
                              </div>
                            </button>

                            {/* Collapsible Week Content */}
                            {!isCollapsed && (
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {[
                                  { status: 'Direncanakan', color: 'blue' },
                                  { status: 'Dilaksanakan', color: 'green' },
                                  { status: 'Reschedule', color: 'yellow' },
                                  { status: 'Dibatalkan', color: 'red' }
                                ].map(column => {
                                  const weekItems = getKegiatanGroupedByWeek(column.status)
                                    .find(week => week.weekKey === weekData.weekKey)?.items || []
                                  const isDragOver = dragOverColumn === column.status

                                  return (
                                    <div
                                      key={column.status}
                                      className={`bg-gray-50 rounded-lg p-3 min-h-[150px] transition-all duration-200 ${
                                        isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed scale-[1.02]' : ''
                                      }`}
                                      onDragOver={handleDragOver}
                                      onDragEnter={(e) => handleDragEnter(e, column.status)}
                                      onDragLeave={handleDragLeave}
                                      onDrop={(e) => handleDrop(e, column.status)}
                                    >
                                      <div className="space-y-2">
                                        {weekItems.map(item => {
                                          const isBeingDragged = draggedItem?.id === item.id
                                          
                                          return (
                                            <div
                                              key={item.id}
                                              draggable
                                              onDragStart={(e) => handleDragStart(e, item)}
                                              onDragEnd={handleDragEnd}
                                              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 cursor-move hover:shadow-md transition-all duration-200 group ${
                                                isBeingDragged ? 'opacity-50 rotate-2' : 'hover:scale-[1.01]'
                                              }`}
                                            >
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                  ID: {item.id}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleEdit(item)
                                                    }}
                                                    className="h-5 w-5 p-0 hover:bg-blue-50"
                                                  >
                                                    <Edit className="w-2 h-2 text-blue-600" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleDelete(item.id)
                                                    }}
                                                    className="h-5 w-5 p-0 hover:bg-red-50"
                                                  >
                                                    <Trash2 className="w-2 h-2 text-red-600" />
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              <h4 className="font-medium text-xs text-gray-800 mb-1 line-clamp-1 break-words">
                                                {item.kegiatan}
                                              </h4>
                                              
                                              <div className="text-xs text-gray-500 mb-1">
                                                {getJenisBelanjaLabel(item.jenis_belanja)}
                                              </div>
                                              
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-blue-600 font-medium">
                                                  Rp {(item.anggaran_rencana / 1000000).toFixed(1)}M
                                                </span>
                                                <span className="text-green-600 font-medium">
                                                  {Math.round((item.anggaran_cair / Math.max(item.anggaran_rencana, 1)) * 100)}%
                                                </span>
                                              </div>
                                            </div>
                                          )
                                        })}
                                        
                                        {weekItems.length === 0 && (
                                          <div className="text-center py-4 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                                            Tidak ada kegiatan
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Bottom Pagination (if more than 5 pages) */}
                    {totalOlderPages > 5 && (
                      <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentOlderWeekPage(1)}
                            disabled={currentOlderWeekPage === 1}
                            className="h-7 px-2 text-xs"
                          >
                            First
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentOlderWeekPage(Math.max(1, currentOlderWeekPage - 1))}
                            disabled={currentOlderWeekPage === 1}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {/* Show page numbers around current page */}
                            {Array.from({ length: Math.min(5, totalOlderPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(
                                totalOlderPages - 4,
                                currentOlderWeekPage - 2
                              )) + i
                              
                              if (pageNum <= totalOlderPages) {
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={pageNum === currentOlderWeekPage ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentOlderWeekPage(pageNum)}
                                    className="h-7 w-7 p-0 text-xs"
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              }
                              return null
                            })}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentOlderWeekPage(Math.min(totalOlderPages, currentOlderWeekPage + 1))}
                            disabled={currentOlderWeekPage === totalOlderPages}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentOlderWeekPage(totalOlderPages)}
                            disabled={currentOlderWeekPage === totalOlderPages}
                            className="h-7 px-2 text-xs"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {recentAllWeeks.length === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {[
                      { status: 'Direncanakan', title: 'Direncanakan', icon: Calendar },
                      { status: 'Dilaksanakan', title: 'Dilaksanakan', icon: CheckCircle },
                      { status: 'Reschedule', title: 'Reschedule', icon: Clock },
                      { status: 'Dibatalkan', title: 'Dibatalkan', icon: Trash2 }
                    ].map(column => {
                      const IconComponent = column.icon
                      return (
                        <div key={column.status} className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
                          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                            <IconComponent className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            Belum ada kegiatan {column.title.toLowerCase()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )
          })()}
        </div>


      </div>
    </div>
  )
}
