// app/user/koordinasi/tambah/page.tsx
"use client"

/*
 * 🔧 PERBAIKAN EDIT STATUS KOORDINASI - August 20, 2025
 * 
 * ✅ ROOT CAUSE YANG DIPERBAIKI:
 * - API mengharapkan field "Status" (uppercase S)
 * - Frontend form menggunakan "status" (lowercase s)  
 * - Mapping yang salah menyebabkan status tidak terupdate
 * 
 * ✅ SOLUSI: Explicit field mapping editFormData.status → requestData.Status
 */

import React, { useState, useEffect } from "react"
import { toast } from "sonner" // Hanya import toast yang digunakan
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
  Building, 
  TrendingUp, 
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Save,
  RefreshCw
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

// Update interface sesuai dengan struktur API response
interface KoordinasiItem {
  id: number
  tanggal: string // "2025-06-19T13:03:21.000Z"
  instansi: string
  jenisInstansi: string
  topik: string
  catatan: string
  unit_kerja_id: number
  createdAt: string
  Status: string // Note: Capital S dari API
  users: {
    unit_kerja: string
  }
}

// Interface untuk form data
interface FormData {
  tanggal: string
  instansi: string
  jenisInstansi: string
  topik: string
  status: string
  catatan: string
}

export default function TambahKoordinasiPage() {
  // STATES
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [unitKerjaId, setUnitKerjaId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<KoordinasiItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<KoordinasiItem[]>([])

  const [formData, setFormData] = useState<FormData>({
    tanggal: "",
    instansi: "",
    jenisInstansi: "Pusat",
    topik: "",
    status: "Progress",
    catatan: "",
  })

  const [editFormData, setEditFormData] = useState<FormData>({
    tanggal: "",
    instansi: "",
    jenisInstansi: "Pusat",
    topik: "",
    status: "Progress",
    catatan: "",
  })

  // Get unit_kerja_id from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUnitKerjaId = localStorage.getItem('id')
      
      if (storedUnitKerjaId) {
        setUnitKerjaId(storedUnitKerjaId)
        toast.success("Unit kerja berhasil dimuat", {
          description: `ID: ${storedUnitKerjaId}`,
          duration: 2000,
        })
      } else {
        setError('ID unit kerja tidak ditemukan di localStorage')
        setLoading(false)
        toast.error("ID unit kerja tidak ditemukan", {
          description: "Silakan login ulang",
          duration: 4000,
        })
      }
    }
  }, [])

  // Fetch data on mount and unitKerjaId change
  useEffect(() => {
    const fetchData = async () => {
      if (unitKerjaId) {
        await fetchKoordinasiData(unitKerjaId)
      }
    }

    fetchData()
  }, [unitKerjaId]) 

  // Debug logging
  useEffect(() => {
    console.log('=== COMPONENT DEBUG ===')
    console.log('Unit Kerja ID from localStorage:', unitKerjaId)
    console.log('Data length:', data.length)
  }, [unitKerjaId, data])

  // HELPER FUNCTIONS
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Fetch data from API with toast notifications
  const fetchKoordinasiData = async (unitId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Toast loading untuk initial load
      const loadingToast = toast.loading("Memuat data koordinasi...", {
        description: "Mohon tunggu sebentar"
      })
      
      const response = await fetch(`/api/koordinasi/${unitId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      const koordinasiData = Array.isArray(result) ? result : result.data || []
      
      console.log('=== FETCH DATA DEBUG ===')
      console.log('Raw koordinasi data:', koordinasiData)
      koordinasiData.forEach((item: KoordinasiItem, index: number) => {
        console.log(`Item ${index + 1} - ID: ${item.id}, Status: "${item.Status}"`)
      })
      
      setData(koordinasiData)
      
      // Dismiss loading toast dan show success
      toast.dismiss(loadingToast)
      toast.success("Data koordinasi berhasil dimuat", {
        description: `${koordinasiData.length} kegiatan koordinasi ditemukan`,
        duration: 3000,
      })
      
    } catch (err) {
      console.error('Error fetching koordinasi data:', err)
      setError(err instanceof Error ? err.message : 'Gagal memuat data koordinasi')
      setData([])
      
      toast.error("Gagal memuat data koordinasi", {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // STATISTICS CALCULATIONS
  const totalKoordinasi = data.length
  const selesai = data.filter(item => item.Status === 'Selesai').length
  const progress = data.filter(item => item.Status === 'Progress').length
  const tindakLanjut = data.filter(item => item.Status === 'Tindak Lanjut').length

  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenisInstansi] = (acc[item.jenisInstansi] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barDataJenis = Object.entries(jenisCount).map(([jenis, count]) => ({
    jenis,
    jumlah: count,
  }))

  const statusData = [
    { name: 'Progress', value: progress, color: '#fbbf24' },
    { name: 'Tindak Lanjut', value: tindakLanjut, color: '#60a5fa' },
    { name: 'Selesai', value: selesai, color: '#34d399' }
  ].filter(item => item.value > 0)

  const summaryCards = [
    {
      title: "Total Koordinasi",
      value: totalKoordinasi,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+18%',
      description: 'Kegiatan koordinasi total'
    },
    {
      title: "Progress",
      value: progress,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '+15%',
      description: 'Sedang berlangsung'
    },
    {
      title: "Tindak Lanjut",
      value: tindakLanjut,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+10%',
      description: 'Perlu ditindaklanjuti'
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
      description: 'Telah diselesaikan'
    },
  ]

  // EVENT HANDLERS
  const handleEdit = (item: KoordinasiItem) => {
    console.log('=== HANDLE EDIT DEBUG ===')
    console.log('Original item:', item)
    console.log('Original item.Status (from DB):', item.Status)
    
    setEditingItem(item)
    
    const newEditFormData = {
      tanggal: item.tanggal.split('T')[0],
      instansi: item.instansi,
      jenisInstansi: item.jenisInstansi,
      topik: item.topik,
      status: item.Status, // Map from item.Status (uppercase) to form status (lowercase)
      catatan: item.catatan,
    }
    
    console.log('New edit form data:', newEditFormData)
    console.log('Form status (lowercase):', newEditFormData.status)
    setEditFormData(newEditFormData)
    setShowEditModal(true)
    
    // Toast untuk edit mode
    toast.info("Mode edit diaktifkan", {
      description: `Edit koordinasi: ${item.instansi}`,
      duration: 2000,
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log('Edit form change:', name, value)
    
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditSelectChange = (name: keyof FormData, value: string) => {
    console.log('=== EDIT SELECT CHANGE ===')
    console.log(`Field "${name}" changed to:`, value)
    if (name === 'status') {
      console.log('Status changed:')
      console.log('- Previous status:', editFormData.status)
      console.log('- New status:', value)
    }
    
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // POST - Add new koordinasi with toast notifications
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!unitKerjaId) {
      toast.error("ID unit kerja tidak ditemukan", {
        description: "Silakan refresh halaman atau login ulang",
        duration: 4000,
      })
      return
    }
    
    setSubmitting(true)
    
    // Toast loading
    const loadingToast = toast.loading("Menambahkan koordinasi...", {
      description: `Instansi: ${formData.instansi}`,
    })
    
    try {
      const requestData = {
        tanggal: formData.tanggal,
        instansi: formData.instansi,
        jenisInstansi: formData.jenisInstansi,
        topik: formData.topik,
        Status: formData.status, // ✅ Map lowercase 'status' to uppercase 'Status' for API consistency
        catatan: formData.catatan,
        unit_kerja_id: parseInt(unitKerjaId),
      }
      
      console.log('=== POST SUBMIT DEBUG ===')
      console.log('Form status (lowercase):', formData.status)
      console.log('Mapped to API Status (uppercase):', requestData.Status)
      console.log('POST Request Data:', requestData)
      
      const response = await fetch(`/api/koordinasi/${unitKerjaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      console.log('POST Response Status:', response.status)
      const responseText = await response.text()
      console.log('POST Response Body:', responseText)
      
      if (!response.ok) {
        throw new Error(`Gagal menambah data: ${response.status} - ${responseText}`)
      }
      
      // Refresh data
      await mutateKoordinasi()
      
      setShowModal(false)
      setFormData({
        tanggal: "",
        instansi: "",
        jenisInstansi: "Pusat",
        topik: "",
        status: "Progress",
        catatan: "",
      })
      
      // Dismiss loading dan show success
      toast.dismiss(loadingToast)
      toast.success("Koordinasi berhasil ditambahkan!", {
        description: `${formData.instansi} - ${formData.topik}`,
        duration: 4000,
        action: {
          label: "Lihat",
          onClick: () => {
            // Scroll to table
            document.querySelector('[data-table="koordinasi"]')?.scrollIntoView({ 
              behavior: 'smooth' 
            })
          },
        },
      })
      
    } catch (err) {
      console.error('POST Error:', err)
      
      // Dismiss loading dan show error
      toast.dismiss(loadingToast)
      toast.error("Gagal menambahkan koordinasi", {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal',
        duration: 5000,
        action: {
          label: "Coba Lagi",
          onClick: () => {
            handleSubmit(e)
          },
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  // PUT - Edit koordinasi with toast notifications
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem || !unitKerjaId) {
      toast.error("Data tidak lengkap", {
        description: "Data edit atau ID unit kerja tidak tersedia",
        duration: 4000,
      })
      return
    }
    
    setSubmitting(true)
    
    // Toast loading
    const loadingToast = toast.loading("Memperbarui koordinasi...", {
      description: `${editFormData.instansi}`,
    })
    
    try {
      const requestData = {
        tanggal: editFormData.tanggal,
        instansi: editFormData.instansi,
        jenisInstansi: editFormData.jenisInstansi,
        topik: editFormData.topik,
        Status: editFormData.status, // ✅ IMPORTANT: Map lowercase 'status' to uppercase 'Status' for API
        catatan: editFormData.catatan,
        id: editingItem.id,
        koordinasiId: editingItem.id,
        unit_kerja_id: parseInt(unitKerjaId),
      }

      console.log('=== EDIT SUBMIT DEBUG ===')
      console.log('Edit form status (lowercase):', editFormData.status)
      console.log('Mapped to API Status (uppercase):', requestData.Status)
      console.log('Full request data:', requestData)
      console.log('API URL:', `/api/koordinasi/${unitKerjaId}/${editingItem.id}`)

      const response = await fetch(`/api/koordinasi/${unitKerjaId}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('PUT Response Status:', response.status)
      const responseText = await response.text()
      console.log('PUT Response Body:', responseText)
      
      // Try to parse as JSON for better error handling
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log('Parsed Response Data:', responseData)
      } catch {
        console.log('Response is not JSON, using as text')
        responseData = responseText
      }
      
      if (!response.ok) {
        throw new Error(`Gagal memperbarui data: ${response.status} - ${JSON.stringify(responseData)}`)
      }
      
      // Refresh data
      await mutateKoordinasi()
      
      // Validate that the status was actually updated
      setTimeout(() => {
        const updatedItem = data.find(item => item.id === editingItem.id)
        if (updatedItem) {
          console.log('=== VALIDATION AFTER UPDATE ===')
          console.log('Updated item Status:', updatedItem.Status)
          console.log('Expected Status:', editFormData.status)
          
          if (updatedItem.Status === editFormData.status) {
            console.log('✅ Status update SUCCESS - Status berubah dengan benar')
          } else {
            console.log('❌ Status update FAILED - Status tidak berubah')
          }
        }
      }, 1000) // Wait 1 second for data refresh
      
      setShowEditModal(false)
      setEditingItem(null)
      setEditFormData({
        tanggal: "",
        instansi: "",
        jenisInstansi: "Pusat",
        topik: "",
        status: "Progress",
        catatan: "",
      })
      
      // Dismiss loading dan show success
      toast.dismiss(loadingToast)
      toast.success("Koordinasi berhasil diperbarui!", {
        description: `${editFormData.instansi} - Status: ${editFormData.status}`,
        duration: 4000,
        action: {
          label: "Lihat",
          onClick: () => {
            document.querySelector('[data-table="koordinasi"]')?.scrollIntoView({ 
              behavior: 'smooth' 
            })
          },
        },
      })
      
    } catch (err) {
      console.error('PUT Error:', err)
      
      // Dismiss loading dan show error
      toast.dismiss(loadingToast)
      toast.error("Gagal memperbarui koordinasi", {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal',
        duration: 5000,
        action: {
          label: "Coba Lagi",
          onClick: () => {
            handleEditSubmit(e)
          },
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  // DELETE - Delete koordinasi with toast notifications
  const handleDeleteSimple = async (item: KoordinasiItem) => {
    if (!item.id || !unitKerjaId) {
      toast.error("Data tidak lengkap", {
        description: "ID koordinasi atau unit kerja tidak tersedia",
        duration: 4000,
      })
      return
    }

    // Toast konfirmasi dengan promise
    toast.promise(
      new Promise((resolve, reject) => {
        const confirmed = window.confirm(
          `Apakah Anda yakin ingin menghapus koordinasi dengan ${item.instansi}?\n\nTopik: ${item.topik}`
        )
        
        if (confirmed) {
          resolve(true)
        } else {
          reject(new Error('Penghapusan dibatalkan'))
        }
      }),
      {
        loading: 'Menunggu konfirmasi...',
        success: () => {
          // Proceed with actual deletion
          performDelete(item)
          return 'Konfirmasi diterima'
        },
        error: 'Penghapusan dibatalkan',
      }
    )
  }

  const performDelete = async (item: KoordinasiItem) => {
    setSubmitting(true)
    
    // Toast loading untuk delete
    const loadingToast = toast.loading("Menghapus koordinasi...", {
      description: `${item.instansi}`,
    })
    
    try {
      console.log('DELETE Item:', item)
      console.log('DELETE Unit ID:', unitKerjaId)
      console.log('DELETE URL:', `/api/koordinasi/${unitKerjaId}/${item.id}`)

      const response = await fetch(`/api/koordinasi/${unitKerjaId}/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          koordinasiId: item.id,
          unit_kerja_id: parseInt(unitKerjaId!)
        }),
      })

      console.log('DELETE Response Status:', response.status)
      const responseText = await response.text()
      console.log('DELETE Response Body:', responseText)
      
      if (!response.ok) {
        throw new Error(`Gagal menghapus data: ${response.status} - ${responseText}`)
      }
      
      // Refresh data
      await mutateKoordinasi()
      
      // Dismiss loading dan show success
      toast.dismiss(loadingToast)
      toast.success("Koordinasi berhasil dihapus!", {
        description: `${item.instansi} telah dihapus dari sistem`,
        duration: 4000,
        action: {
          label: "Undo", // Optional: implement undo functionality
          onClick: () => {
            toast.info("Fitur undo belum tersedia", {
              description: "Silakan tambahkan kembali koordinasi jika diperlukan",
            })
          },
        },
      })
      
    } catch (err) {
      console.error('DELETE Error:', err)
      
      // Dismiss loading dan show error
      toast.dismiss(loadingToast)
      toast.error("Gagal menghapus koordinasi", {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal',
        duration: 5000,
        action: {
          label: "Coba Lagi",
          onClick: () => {
            performDelete(item)
          },
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to refresh data after mutation
  const mutateKoordinasi = async () => {
    if (unitKerjaId) {
      await fetchKoordinasiData(unitKerjaId)
    }
  }

  // Manual refresh function with toast
  const handleRefresh = async () => {
    console.log('Manual refresh triggered')
    
    toast.promise(
      mutateKoordinasi(),
      {
        loading: 'Memperbarui data...',
        success: 'Data berhasil diperbarui!',
        error: 'Gagal memperbarui data',
      }
    )
  }

  // CONDITIONAL RETURNS
  if (loading && data.length === 0) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-blue-600 font-medium">Memuat data koordinasi...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
            <Button 
              onClick={() => unitKerjaId && fetchKoordinasiData(unitKerjaId)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!unitKerjaId) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <strong className="font-bold">Peringatan: </strong>
                <span className="block sm:inline">ID unit kerja tidak ditemukan di localStorage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MAIN RENDER
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Koordinasi Eksternal</h1>
            {/* Enhanced Status Indicator */}
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span className="text-xs">Updating...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs hover:bg-blue-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-blue-600">Catat, kelola, dan pantau seluruh kegiatan kunjungan dari instansi lain untuk memastikan koordinasi berjalan efektif dan terstruktur</p>
          {data.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Unit Kerja: {data[0].users.unit_kerja} • Data terbaru: {new Date().toLocaleTimeString('id-ID')}
            </p>
          )}
        </div>
        
        {/* Add Modal Button with enhanced icon */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Form Kegiatan Koordinasi
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Form fields remain the same but add some visual feedback */}
              <div className="space-y-1">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="instansi">Instansi / Pihak Terkait</Label>
                <Input
                  id="instansi"
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Kementerian PANRB"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label>Jenis Instansi</Label>
                <Select
                  value={formData.jenisInstansi}
                  onValueChange={(value) => handleSelectChange("jenisInstansi", value)}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih jenis instansi" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pusat", "Daerah", "Akademisi", "Swasta", "NGO"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="topik">Topik Koordinasi</Label>
                <Input
                  id="topik"
                  name="topik"
                  value={formData.topik}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Sinkronisasi indikator SPBE"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label>Status Koordinasi</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih status koordinasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Progress">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                        Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="Tindak Lanjut">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                        Tindak Lanjut
                      </div>
                    </SelectItem>
                    <SelectItem value="Selesai">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Selesai
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="catatan">Catatan</Label>
                <Input
                  id="catatan"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Disepakati timeline pelaporan"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    toast.info("Form ditutup", {
                      description: "Data yang belum disimpan akan hilang",
                      duration: 2000,
                    })
                  }}
                  type="button"
                  disabled={submitting}
                  className="rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal with enhanced toast notifications */}
        <Dialog open={showEditModal} onOpenChange={(open) => {
          if (!open) {
            setShowEditModal(false)
            setEditingItem(null)
            setEditFormData({
              tanggal: "",
              instansi: "",
              jenisInstansi: "Pusat",
              topik: "",
              status: "Progress",
              catatan: "",
            })
            toast.info("Mode edit ditutup", {
              description: "Perubahan yang belum disimpan akan hilang",
              duration: 2000,
            })
          }
        }}>
          <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Edit Kegiatan Koordinasi
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
              {/* Edit form fields - similar to add form but with edit data */}
              <div className="space-y-1">
                <Label htmlFor="edit-tanggal">Tanggal</Label>
                <Input
                  id="edit-tanggal"
                  type="date"
                  name="tanggal"
                  value={editFormData.tanggal}
                  onChange={handleEditChange}
                  required
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-instansi">Instansi / Pihak Terkait</Label>
                <Input
                  id="edit-instansi"
                  name="instansi"
                  value={editFormData.instansi}
                  onChange={handleEditChange}
                  required
                  placeholder="Contoh: Kementerian PANRB"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label>Jenis Instansi</Label>
                <Select
                  value={editFormData.jenisInstansi}
                  onValueChange={(value) => handleEditSelectChange("jenisInstansi", value)}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih jenis instansi" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pusat", "Daerah", "Akademisi", "Swasta", "NGO"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-topik">Topik Koordinasi</Label>
                <Input
                  id="edit-topik"
                  name="topik"
                  value={editFormData.topik}
                  onChange={handleEditChange}
                  required
                  placeholder="Contoh: Sinkronisasi indikator SPBE"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <Label>Status Koordinasi</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => handleEditSelectChange("status", value)}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih status koordinasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Progress">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                        Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="Tindak Lanjut">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                        Tindak Lanjut
                      </div>
                    </SelectItem>
                    <SelectItem value="Selesai">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Selesai
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-catatan">Catatan</Label>
                <Input
                  id="edit-catatan"
                  name="catatan"
                  value={editFormData.catatan}
                  onChange={handleEditChange}
                  placeholder="Contoh: Disepakati timeline pelaporan"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                    setEditFormData({
                      tanggal: "",
                      instansi: "",
                      jenisInstansi: "Pusat",
                      topik: "",
                      status: "Progress",
                      catatan: "",
                    })
                  }}
                  type="button"
                  disabled={submitting}
                  className="rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Perbarui
                    </>
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
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((card.value / Math.max(...summaryCards.map(c => c.value), 1)) * 100, 100)}%` 
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Status Koordinasi
          </h2>
          <div className="h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Belum ada data koordinasi
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Distribusi Jenis Instansi
          </h2>
          <div className="h-[300px]">
            {barDataJenis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barDataJenis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="jenis" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="jumlah" 
                    fill="url(#colorGradientJenis)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradientJenis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Belum ada data koordinasi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table with data attribute for scrolling */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" data-table="koordinasi">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Daftar Kegiatan Koordinasi</h2>
              <p className="text-blue-100 text-sm">Monitoring koordinasi lintas instansi</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Total: {data.length} koordinasi</p>
              <p className="text-xs text-blue-200">Last updated: {new Date().toLocaleTimeString('id-ID')}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Instansi</TableHead>
                <TableHead className="font-medium">Jenis</TableHead>
                <TableHead className="font-medium">Topik</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Catatan</TableHead>
                <TableHead className="font-medium text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
                      <p>Belum ada data koordinasi</p>
                      <p className="text-sm text-gray-400">Klik &ldquo;Tambah Kegiatan&rdquo; untuk menambah koordinasi baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(item.tanggal)}</TableCell>
                    <TableCell className="font-medium text-gray-800">{item.instansi}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenisInstansi === 'Pusat' ? 'bg-blue-100 text-blue-800' :
                        item.jenisInstansi === 'Daerah' ? 'bg-green-100 text-green-800' :
                        item.jenisInstansi === 'Akademisi' ? 'bg-purple-100 text-purple-800' :
                        item.jenisInstansi === 'Swasta' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.jenisInstansi === 'Pusat' ? <Building className="w-3 h-3 mr-1" /> :
                         item.jenisInstansi === 'Daerah' ? <Users className="w-3 h-3 mr-1" /> :
                         item.jenisInstansi === 'Akademisi' ? <BookOpen className="w-3 h-3 mr-1" /> :
                         item.jenisInstansi === 'Swasta' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                         <MessageSquare className="w-3 h-3 mr-1" />}
                        {item.jenisInstansi}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-800">
                      <div className="max-w-xs">
                        <div className="truncate" title={item.topik}>
                          {item.topik}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.Status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        item.Status === 'Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.Status === 'Selesai' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                         item.Status === 'Progress' ? <Clock className="w-3 h-3 mr-1" /> :
                         <TrendingUp className="w-3 h-3 mr-1" />}
                        {item.Status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div className="max-w-xs">
                        <div className="truncate" title={item.catatan}>
                          {item.catatan || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          disabled={submitting}
                          title={`Edit koordinasi ${item.instansi}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!item.id) {
                              toast.error("ID koordinasi tidak valid")
                              return
                            }
                            if (!unitKerjaId) {
                              toast.error("ID unit kerja tidak ditemukan")
                              return
                            }
                            handleDeleteSimple(item)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          disabled={submitting}
                          title={`Hapus koordinasi ${item.instansi}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-purple-500" />
          Aktivitas Koordinasi Terbaru
        </h2>
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>Belum ada aktivitas koordinasi</p>
            </div>
          ) : (
            data.slice(0, 3).map((item) => (
              <div key={item.id} className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                item.jenisInstansi === 'Pusat' ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' :
                item.jenisInstansi === 'Daerah' ? 'bg-green-50 border-green-500 hover:bg-green-100' :
                item.jenisInstansi === 'Akademisi' ? 'bg-purple-50 border-purple-500 hover:bg-purple-100' :
                item.jenisInstansi === 'Swasta' ? 'bg-orange-50 border-orange-500 hover:bg-orange-100' :
                'bg-red-50 border-red-500 hover:bg-red-100'
              }`}>
                <div className={`rounded-full p-2 ${
                  item.jenisInstansi === 'Pusat' ? 'bg-blue-500' :
                  item.jenisInstansi === 'Daerah' ? 'bg-green-500' :
                  item.jenisInstansi === 'Akademisi' ? 'bg-purple-500' :
                  item.jenisInstansi === 'Swasta' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}>
                  {item.jenisInstansi === 'Pusat' ? <Building className="w-4 h-4 text-white" /> :
                   item.jenisInstansi === 'Daerah' ? <Users className="w-4 h-4 text-white" /> :
                   item.jenisInstansi === 'Akademisi' ? <BookOpen className="w-4 h-4 text-white" /> :
                   item.jenisInstansi === 'Swasta' ? <TrendingUp className="w-4 h-4 text-white" /> :
                   <MessageSquare className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    item.jenisInstansi === 'Pusat' ? 'text-blue-800' :
                    item.jenisInstansi === 'Daerah' ? 'text-green-800' :
                    item.jenisInstansi === 'Akademisi' ? 'text-purple-800' :
                    item.jenisInstansi === 'Swasta' ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {item.topik.length > 80 ? `${item.topik.substring(0, 80)}...` : item.topik}
                  </h3>
                  <p className={`text-sm ${
                    item.jenisInstansi === 'Pusat' ? 'text-blue-600' :
                    item.jenisInstansi === 'Daerah' ? 'text-green-600' :
                    item.jenisInstansi === 'Akademisi' ? 'text-purple-600' :
                    item.jenisInstansi === 'Swasta' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {item.catatan && item.catatan.length > 100 ? 
                      `${item.catatan.substring(0, 100)}...` : 
                      item.catatan || 'Tidak ada catatan'
                    }
                  </p>
                  <p className={`text-xs mt-1 ${
                    item.jenisInstansi === 'Pusat' ? 'text-blue-500' :
                    item.jenisInstansi === 'Daerah' ? 'text-green-500' :
                    item.jenisInstansi === 'Akademisi' ? 'text-purple-500' :
                    item.jenisInstansi === 'Swasta' ? 'text-orange-500' :
                    'text-red-500'
                  }`}>
                    {item.instansi} • {formatDate(item.tanggal)} • Status: {item.Status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-b-xl px-6 py-3 border-t border-gray-100">
        <strong>Keterangan Status:</strong>
        <ul className="list-disc ml-5 mt-1 space-y-0.5">
          <li><span className="font-semibold text-yellow-700">Progress</span>: Kegiatan koordinasi sedang berlangsung atau dalam proses pelaksanaan.</li>
          <li><span className="font-semibold text-blue-700">Tindak Lanjut</span>: Kegiatan memerlukan aksi lanjutan atau follow-up dari pihak terkait.</li>
          <li><span className="font-semibold text-green-700">Selesai</span>: Kegiatan koordinasi telah selesai dan tidak ada tindak lanjut yang diperlukan.</li>
        </ul>
      </div>
    </div>
  )
}