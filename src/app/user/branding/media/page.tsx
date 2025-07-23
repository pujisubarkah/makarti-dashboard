// app/publikasi/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  FileText, 
  Instagram, 
  Globe, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share,
  BarChart3,
  PieChart as PieChartIcon,
  Music, // Icon untuk TikTok
  Play, // Icon untuk YouTube
  Loader2, // Loading spinner
  AlertCircle // Error icon
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
import useSWR from 'swr'
import { toast } from 'sonner'

interface PublikasiItem {
  id: number
  judul: string
  tanggal: string
  jenis: string
  unit: string
  link: string
  likes?: number
  views?: number
}

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6', '#ef4444', '#dc2626']

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export default function PublikasiPage() {
  // State management
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  
  // Motivational popup state
  const [showMotivationalPopup, setShowMotivationalPopup] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  
  // Edit form state
  const [editData, setEditData] = useState<PublikasiItem | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form State
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    jenis: "Media Online",
    link: "",
    likes: 0,
    views: 0,
  })
  
  // User data
  const [unitKerjaId, setUnitKerjaId] = useState<number | null>(null)
  const [userUnit, setUserUnit] = useState<string | null>(null)

  // Get unit kerja ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("id")
      const storedUnit = localStorage.getItem("userUnit")
      
      if (storedId) {
        setUnitKerjaId(parseInt(storedId))
      }
      if (storedUnit) {
        setUserUnit(storedUnit)
      }
    }
  }, [])

  // Auto-show motivational popup on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMotivationalPopup(true)
      
      // Start animation sequence
      setTimeout(() => setAnimationStep(1), 500)
      setTimeout(() => setAnimationStep(2), 1000)
      setTimeout(() => setShowParticles(true), 1500)
    }, 2000) // Show after 2 seconds

    return () => clearTimeout(timer)
  }, [])

  // SWR hook for data fetching
  const { 
    data: rawData, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    unitKerjaId ? `/api/publikasi/${unitKerjaId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh setiap 30 detik
      revalidateOnFocus: true, // Refresh ketika window focus
      revalidateOnReconnect: true, // Refresh ketika reconnect
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    }
  )

  // SWR hook for group summary data
  const { 
    data: groupData, 
    error: groupError,
    isLoading: groupLoading 
  } = useSWR('/api/publikasi/groupby', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // Transform data
  const data = React.useMemo(() => {
    if (!rawData) return []
    
    return rawData.map((item: PublikasiItem) => ({
      id: item.id,
      judul: item.judul,
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
      jenis: item.jenis,
      unit: userUnit || 'Unknown Unit',
      link: item.link || '#',
      likes: item.likes,
      views: item.views,
    }))
  }, [rawData, userUnit])

  // Get top 3 units data from groupby API
  interface UnitType {
    unit_kerja: string;
    jumlah_publikasi: number;
    unit_kerja_id: number;
  }
  const topUnits = React.useMemo(() => {
    if (!groupData || !Array.isArray(groupData.summary?.top_unit_kerja)) return [];
    return (groupData.summary.top_unit_kerja as UnitType[]).slice(0, 3);
  }, [groupData])

  // Function to handle unit click (simplified for user page)
  const handleUnitClick = (unitName: string) => {
    toast.info(`Unit Champion: ${unitName.replace(/_/g, ' ')}`, {
      description: 'Unit ini memiliki publikasi media terbanyak!',
      duration: 4000,
    })
  }

  // Submit new publikasi to API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!unitKerjaId) {
      toast.error("Tidak dapat menentukan unit kerja")
      return
    }

    try {
      setSubmitLoading(true)
      
      const payload = {
        judul: formData.judul,
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        link: formData.link || null,
        likes: hasEngagementMetrics(formData.jenis) ? formData.likes || null : null,
        views: hasEngagementMetrics(formData.jenis) ? formData.views || null : null,
      }

      const response = await fetch(`/api/publikasi/${unitKerjaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create publikasi')
      }

      const newPublikasi = await response.json()

      // Reset form and close modal
      setFormData({
        judul: "",
        tanggal: "",
        jenis: "Media Online",
        link: "",
        likes: 0,
        views: 0,
      })
      setShowModal(false)

      // Mutate SWR cache to trigger revalidation
      await mutate()
      
      // Show success toast
      toast.success("Publikasi berhasil ditambahkan!", {
        description: `"${newPublikasi.judul}" telah dipublikasikan di ${newPublikasi.jenis}.`,
        duration: 4000,
        action: {
          label: "Lihat",
          onClick: () => {
            // Scroll to table or do something
            document.querySelector('#publikasi-table')?.scrollIntoView({ behavior: 'smooth' })
          },
        },
      })
      
    } catch {
      toast.error("Gagal menambahkan publikasi", {
        description: 'Terjadi kesalahan saat menyimpan data.',
        duration: 5000,
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  // Media options
  const jenisMediaOptions = ["Media Online", "Instagram", "TikTok", "YouTube", "Media Massa", "Website"]

  // Helper function untuk menentukan apakah jenis media memiliki metrics
  const hasEngagementMetrics = (jenis: string) => {
    return jenis === 'Instagram' || jenis === 'TikTok' || jenis === 'YouTube'
  }

  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "likes" || name === "views" ? parseInt(value) || 0 : value,
    }))
  }

  // Edit publication
  const handleEdit = (item: PublikasiItem) => {
    setEditData({
      ...item,
      tanggal: new Date(item.tanggal).toISOString().split('T')[0]
    })
    setShowEditModal(true)
  }

  // Update publication
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!unitKerjaId || !editData) {
    toast.error("Data tidak lengkap");
    return;
  }

  try {
    setEditLoading(true);
    
    const payload = {
      id: editData.id,
      judul: editData.judul,
      tanggal: editData.tanggal,
      jenis: editData.jenis,
      link: editData.link || null,
      likes: hasEngagementMetrics(editData.jenis) ? editData.likes || null : null,
      views: hasEngagementMetrics(editData.jenis) ? editData.views || null : null,
    };

    // Perbaikan endpoint PUT di sini:
    if (!editData) {
      throw new Error("Data edit tidak ditemukan");
    }
    // Pastikan editData tidak null sebelum akses id
    const response = await fetch(`/api/publikasi/${unitKerjaId}/${editData?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update publikasi');
    }

    // Mutate SWR cache to trigger revalidation
    await mutate();
    
    // Show success toast
    toast.success("Publikasi berhasil diperbarui!", {
      description: `"${editData.judul}" telah diperbarui.`,
      duration: 4000,
    });
    
  } catch {
    toast.error("Gagal memperbarui publikasi", {
      description: 'Terjadi kesalahan saat memperbarui data.',
      duration: 5000,
    })
  } finally {
    setEditLoading(false);
  }
}

  // Delete publication
const handleDelete = async (id: number, judul: string) => {
  if (!unitKerjaId) {
    toast.error("Tidak dapat menentukan unit kerja");
    return;
  }

  // Confirm delete
  if (!window.confirm(`Apakah Anda yakin ingin menghapus publikasi "${judul}"?`)) {
    return;
  }

  try {
    setDeleteLoading(id);
    
    const response = await fetch(`/api/publikasi/${unitKerjaId}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // Tidak perlu body karena ID sudah di URL
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete publikasi');
    }

    // Mutate SWR cache to trigger revalidation
    await mutate();
    
    // Show success toast
    toast.success("Publikasi berhasil dihapus!", {
      description: `"${judul}" telah dihapus dari sistem.`,
      duration: 4000,
    });
    
  } catch (err) {
    console.error('Error deleting publikasi:', err);
    toast.error("Gagal menghapus publikasi", {
      description: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data.',
      duration: 5000,
    });
  } finally {
    setDeleteLoading(null);
  }
}

  // Edit form change handler
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [name]: name === "likes" || name === "views" ? parseInt(value) || 0 : value,
      }
    })
  }

  // Calculate statistics
  const totalPublikasi = data.length
  
  const socialMediaPosts = data.filter((item: PublikasiItem) => 
    item.jenis === 'Instagram' || item.jenis === 'TikTok' || item.jenis === 'YouTube'
  )
  const instagramPosts = data.filter((item: PublikasiItem) => item.jenis === 'Instagram')
  const tiktokPosts = data.filter((item: PublikasiItem) => item.jenis === 'TikTok')
  const youtubePosts = data.filter((item: PublikasiItem) => item.jenis === 'YouTube')
  
  const totalLikes = socialMediaPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.likes || 0), 0)
  const totalViews = socialMediaPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.views || 0), 0)
  const avgEngagement = totalViews > 0 && totalLikes > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : '0'
  
  const instagramLikes = instagramPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.likes || 0), 0)
  const instagramViews = instagramPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.views || 0), 0)
  const tiktokLikes = tiktokPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.likes || 0), 0)
  const tiktokViews = tiktokPosts.reduce((sum: number, item: PublikasiItem) => sum + (item.views || 0), 0)
  const youtubeLikes = youtubePosts.reduce((sum: number, item: PublikasiItem) => sum + (item.likes || 0), 0)
  const youtubeViews = youtubePosts.reduce((sum: number, item: PublikasiItem) => sum + (item.views || 0), 0)
  
  // Data for charts
  const jenisCount = data.reduce((acc: Record<string, number>, item: PublikasiItem) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(jenisCount).map(([key, value]) => ({
    name: key,
    value,
  }))
  const monthlyData = data.reduce((acc: Record<string, { count: number, monthNum: number }>, item: PublikasiItem) => {
    const date = new Date(item.tanggal)
    const month = date.toLocaleDateString('id-ID', { month: 'short' })
    const monthNum = date.getMonth() // 0-11 for sorting
    
    if (!acc[month]) {
      acc[month] = { count: 0, monthNum }
    }
    acc[month].count += 1
    return acc
  }, {} as Record<string, { count: number, monthNum: number }>)

  const barData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      publikasi: (data as { count: number, monthNum: number }).count,
      monthNum: (data as { count: number, monthNum: number }).monthNum,
    }))
    .sort((a, b) => a.monthNum - b.monthNum) // Sort by month number chronologically

  // Summary cards
  // Hitung IKU Publikasi
  // Rumus: 0.5 * (engagement/0.6) + 0.5 * (Jumlah Publikasi/5)
  const engagementValue = typeof avgEngagement === 'string' ? parseFloat(avgEngagement) : avgEngagement;
  const ikuPublikasi = 0.5 * (engagementValue / 0.6) + 0.5 * (totalPublikasi / 60);

  const summaryCards = [
    {
      title: "Total Publikasi",
      value: totalPublikasi,
      icon: <FileText className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+12%',
      description: 'Total konten semua platform'
    },
    {
      title: "Total Interaksi",
      value: totalLikes.toLocaleString(),
      icon: <Heart className="w-6 h-6" />,
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-100',
      textColor: 'text-pink-600',
      textDark: 'text-pink-800',
      borderColor: 'border-pink-500',
      change: '+25%',
      description: `IG: ${instagramLikes.toLocaleString()} | TikTok: ${tiktokLikes.toLocaleString()} | YT: ${youtubeLikes.toLocaleString()}`
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: <Eye className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+18%',
      description: `IG: ${instagramViews.toLocaleString()} | TikTok: ${tiktokViews.toLocaleString()} | YT: ${youtubeViews.toLocaleString()}`
    },
    {
      title: "Engagement Rate",
      value: `${avgEngagement}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+8%',
      description: 'Rata-rata IG, TikTok & YouTube'
    },
    {
      title: "IKU Publikasi",
      value: ikuPublikasi.toFixed(2) + '%',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      textDark: 'text-indigo-800',
      borderColor: 'border-indigo-500',
      change: '',
      description: 'IKU = 0.5*(Engagement/0.6) + 0.5*(Publikasi/60)'
    }
  ]

  // Pagination calculations
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5 if current is near start
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show pages near end
        pages.push('ellipsis')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show pages around current
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Manual refresh function
  const handleRefresh = () => {
    toast.promise(
      mutate(),
      {
        loading: 'Memperbarui data...',
        success: 'Data berhasil diperbarui!',
        error: 'Gagal memperbarui data',
      }
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data publikasi...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Publikasi & Media</h1>
          <p className="text-blue-600">Kelola dan monitor konten publikasi di berbagai platform</p>
          {userUnit && (
            <p className="text-sm text-gray-500 mt-1">Unit: {userUnit}</p>
          )}
        </div>
        <div className="flex gap-3">
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="px-4 py-2"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          {/* Add Publication Button */}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                <FileText className="w-4 h-4 mr-2" />
                Tambah Publikasi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-blue-700">Tambah Publikasi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Judul */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-600">Judul</label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    required
                    disabled={submitLoading}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Tanggal */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-600">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                    disabled={submitLoading}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Jenis Media */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-600">Jenis Media</label>
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleChange}
                    disabled={submitLoading}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {jenisMediaOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-600">Link</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    disabled={submitLoading}
                    placeholder={
                      formData.jenis === 'Instagram' ? 'https://instagram.com/p/...' :
                      formData.jenis === 'TikTok' ? 'https://tiktok.com/@username/video/...' :
                      formData.jenis === 'YouTube' ? 'https://youtube.com/watch?v=...' :
                      'https://example.com'
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Conditional Fields untuk platform dengan metrics */}
                {hasEngagementMetrics(formData.jenis) && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-blue-700 font-medium mb-2">
                        📊 Metrics untuk {formData.jenis}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formData.jenis === 'Instagram' 
                          ? 'Masukkan jumlah likes dan views dari post Instagram'
                          : formData.jenis === 'TikTok'
                          ? 'Masukkan jumlah likes dan views dari video TikTok'
                          : 'Masukkan jumlah likes dan views dari video YouTube'
                        }
                      </p>
                    </div>

                    {/* Likes */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-blue-600">
                        Likes {
                          formData.jenis === 'TikTok' ? '❤️' : 
                          formData.jenis === 'YouTube' ? '👍' :
                          '💕'
                        }
                      </label>
                      <input
                        type="number"
                        name="likes"
                        value={formData.likes}
                        onChange={handleChange}
                        min="0"
                        disabled={submitLoading}
                        placeholder={
                          formData.jenis === 'TikTok' ? 'e.g., 1500' : 
                          formData.jenis === 'YouTube' ? 'e.g., 680' :
                          'e.g., 300'
                        }
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    {/* Views */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-blue-600">
                        Views {
                          formData.jenis === 'TikTok' ? '👀' : 
                          formData.jenis === 'YouTube' ? '📺' :
                          '📊'
                        }
                      </label>
                      <input
                        type="number"
                        name="views"
                        value={formData.views}
                        onChange={handleChange}
                        min="0"
                        disabled={submitLoading}
                        placeholder={
                          formData.jenis === 'TikTok' ? 'e.g., 25000' : 
                          formData.jenis === 'YouTube' ? 'e.g., 18500' :
                          'e.g., 5000'
                        }
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </>
                )}

                {/* Submit buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    type="button"
                    disabled={submitLoading}
                    className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                      width: `${Math.min((typeof card.value === 'number' ? card.value : parseFloat(card.value)) / Math.max(...summaryCards.map(c => typeof c.value === 'number' ? c.value : parseFloat(c.value) || 0)) * 100, 100)}%` 
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

      {/* Champions Card Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">🏆</span>
              Top 3 Unit Kerja Terbaik
            </h2>
            <p className="text-gray-600 text-sm mt-1">Ranking unit kerja berdasarkan jumlah publikasi media</p>
          </div>
          {groupData && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Publikasi Seluruh Unit</p>
              <p className="text-2xl font-bold text-blue-600">{groupData.total_publikasi?.toLocaleString()}</p>
            </div>
          )}
        </div>

        {groupLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Memuat data ranking...</span>
          </div>
        ) : groupError ? (
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Gagal memuat data ranking</p>
          </div>
        ) : topUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topUnits.map((unit: UnitType, index: number) => {
              const medals = ['🥇', '🥈', '🥉']
              const colors = ['yellow', 'gray', 'orange']
              const bgGradients = [
                'from-yellow-50 to-yellow-100',
                'from-gray-50 to-gray-100', 
                'from-orange-50 to-orange-100'
              ]
              const borderColors = [
                'border-yellow-300',
                'border-gray-300',
                'border-orange-300'
              ]
              
              return (
                <div
                  key={unit.unit_kerja_id}
                  onClick={() => handleUnitClick(unit.unit_kerja)}
                  className={`bg-gradient-to-br ${bgGradients[index]} rounded-lg p-4 border-2 ${borderColors[index]} hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 group`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{medals[index]}</div>
                    <h3 className="font-bold text-gray-800 mb-1 text-lg">
                      Peringkat {index + 1}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-tight">
                      {unit.unit_kerja.replace(/_/g, ' ')}
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${colors[index]}-200 text-${colors[index]}-800 text-sm font-bold mb-3`}>
                      📊 {unit.jumlah_publikasi} publikasi
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`bg-${colors[index]}-500 h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${topUnits.length > 0 ? (unit.jumlah_publikasi / topUnits[0].jumlah_publikasi) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {topUnits.length > 0 ? ((unit.jumlah_publikasi / topUnits[0].jumlah_publikasi) * 100).toFixed(1) : 0}% dari terbaik
                    </p>
                    
                    {/* Click indicator */}
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        👆 Klik untuk info
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Belum ada data ranking unit kerja</p>
          </div>
        )}

        {/* Additional Stats */}
        {groupData && topUnits.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Unit Terbaik</p>
                <p className="font-bold text-yellow-600">{topUnits[0].unit_kerja.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Publikasi Terbaik</p>
                <p className="font-bold text-blue-600">{topUnits[0].jumlah_publikasi} publikasi</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dominasi</p>
                <p className="font-bold text-green-600">
                  {((topUnits[0].jumlah_publikasi / groupData.total_publikasi) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Jenis Media
          </h2>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Belum ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-green-500" />
            Tren Publikasi Bulanan
          </h2>
          <div className="h-[300px]">
            {barData.length > 0 ? (
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
                    dataKey="publikasi" 
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Belum ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table with Pagination */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" id="publikasi-table">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Publikasi & Media</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap konten yang telah dipublikasikan</p>
            </div>
            {data.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-100">
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, data.length)} dari {data.length} data
                </p>
                <p className="text-xs text-blue-200">
                  Halaman {currentPage} dari {totalPages}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Judul</TableHead>
                <TableHead className="font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Jenis Media</TableHead>
                <TableHead className="text-right font-medium">Likes</TableHead>
                <TableHead className="text-right font-medium">Views</TableHead>
                <TableHead className="text-right font-medium">Engagement</TableHead>
                <TableHead className="text-center font-medium">Link</TableHead>
                <TableHead className="text-center font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((item: PublikasiItem, index: number) => {
                  const hasMetrics = hasEngagementMetrics(item.jenis)
                  const engagement =
                    hasMetrics && item.views
                      ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                      : '-'

                  return (
                    <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                      <TableCell className="text-gray-600">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium text-gray-800">{item.judul}</TableCell>
                      <TableCell className="text-gray-600">{item.tanggal}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                          item.jenis === 'TikTok' ? 'bg-red-100 text-red-800' :
                          item.jenis === 'YouTube' ? 'bg-red-100 text-red-800' :
                          item.jenis === 'Media Online' ? 'bg-blue-100 text-blue-800' :
                          item.jenis === 'Website' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.jenis === 'Instagram' ? <Instagram className="w-3 h-3 mr-1" /> :
                           item.jenis === 'TikTok' ? <Music className="w-3 h-3 mr-1" /> :
                           item.jenis === 'YouTube' ? <Play className="w-3 h-3 mr-1" /> :
                           item.jenis === 'Website' ? <Globe className="w-3 h-3 mr-1" /> :
                           <FileText className="w-3 h-3 mr-1" />}
                          {item.jenis}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasMetrics ? (
                          <span className={`inline-flex items-center ${
                            item.jenis === 'TikTok' ? 'text-red-600' : 
                            item.jenis === 'YouTube' ? 'text-red-600' :
                            'text-pink-600'
                          }`}>
                            <Heart className="w-3 h-3 mr-1" />
                            {item.likes?.toLocaleString()}
                          </span>
                        ) : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {hasMetrics ? (
                          <span className="inline-flex items-center text-blue-600">
                            <Eye className="w-3 h-3 mr-1" />
                            {item.views?.toLocaleString()}
                          </span>
                        ) : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          parseFloat(engagement) > 5 ? 'text-green-600' :
                          parseFloat(engagement) > 2 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {engagement}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <a 
                          href={item.link} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Share className="w-3 h-3 mr-1" />
                          Lihat
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0 text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                            title="Edit publikasi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id, item.judul)}
                            disabled={deleteLoading === item.id}
                            className="h-8 w-8 p-0 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 disabled:opacity-50"
                            title="Hapus publikasi"
                          >
                            {deleteLoading === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                      <p>Tidak ada data publikasi</p>
                      <p className="text-sm">Tambahkan publikasi pertama Anda</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, data.length)}</span> dari <span className="font-medium">{data.length}</span> hasil
                </span>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={goToPrevPage}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => goToPage(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={goToNextPage}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            {totalPages > 10 && (
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">Lompat ke halaman:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Publication Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Edit Publikasi</DialogTitle>
          </DialogHeader>
          {editData && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Judul */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-600">Judul</label>
                <input
                  type="text"
                  name="judul"
                  value={editData.judul}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Tanggal */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-600">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  value={editData.tanggal}
                  onChange={handleEditChange}
                  required
                  disabled={editLoading}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Jenis Media */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-600">Jenis Media</label>
                <select
                  name="jenis"
                  value={editData.jenis}
                  onChange={handleEditChange}
                  disabled={editLoading}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {jenisMediaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-600">Link</label>
                <input
                  type="url"
                  name="link"
                  value={editData.link}
                  onChange={handleEditChange}
                  disabled={editLoading}
                  placeholder={
                    editData.jenis === 'Instagram' ? 'https://instagram.com/p/...' :
                    editData.jenis === 'TikTok' ? 'https://tiktok.com/@username/video/...' :
                    editData.jenis === 'YouTube' ? 'https://youtube.com/watch?v=...' :
                    'https://example.com'
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Conditional Fields untuk platform dengan metrics */}
              {hasEngagementMetrics(editData.jenis) && (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      📊 Metrics untuk {editData.jenis}
                    </p>
                    <p className="text-xs text-gray-600">
                      {editData.jenis === 'Instagram' 
                        ? 'Masukkan jumlah likes dan views dari post Instagram'
                        : editData.jenis === 'TikTok'
                        ? 'Masukkan jumlah likes dan views dari video TikTok'
                        : 'Masukkan jumlah likes dan views dari video YouTube'
                      }
                    </p>
                  </div>

                  {/* Likes */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-blue-600">
                      Likes {
                        editData.jenis === 'TikTok' ? '❤️' : 
                        editData.jenis === 'YouTube' ? '👍' :
                        '💕'
                      }
                    </label>
                    <input
                      type="number"
                      name="likes"
                      value={editData.likes || 0}
                      onChange={handleEditChange}
                      min="0"
                      disabled={editLoading}
                      placeholder={
                        editData.jenis === 'TikTok' ? 'e.g., 1500' : 
                        editData.jenis === 'YouTube' ? 'e.g., 680' :
                        'e.g., 300'
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Views */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-blue-600">
                      Views {
                        editData.jenis === 'TikTok' ? '👀' : 
                        editData.jenis === 'YouTube' ? '📺' :
                        '📊'
                      }
                    </label>
                    <input
                      type="number"
                      name="views"
                      value={editData.views || 0}
                      onChange={handleEditChange}
                      min="0"
                      disabled={editLoading}
                      placeholder={
                        editData.jenis === 'TikTok' ? 'e.g., 25000' : 
                        editData.jenis === 'YouTube' ? 'e.g., 18500' :
                        'e.g., 5000'
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}

              {/* Submit buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditData(null)
                  }}
                  type="button"
                  disabled={editLoading}
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    'Perbarui'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Motivational Popup - Media & Branding Excellence */}
      <Dialog open={showMotivationalPopup} onOpenChange={setShowMotivationalPopup}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-transparent">
          <DialogTitle className="sr-only">Media & Branding Excellence Motivation</DialogTitle>
          <div className="relative">
            {/* Animated Background with Media Theme */}
            <div className="relative bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 p-12 text-white overflow-hidden">
              {/* Particle Animation */}
              {showParticles && (
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Decorative Media Icons */}
              <div className="absolute top-6 left-6 opacity-10">
                <div className="text-6xl">📱</div>
              </div>
              <div className="absolute top-6 right-6 opacity-10">
                <div className="text-6xl">📺</div>
              </div>
              <div className="absolute bottom-6 left-12 opacity-10">
                <div className="text-6xl">📢</div>
              </div>
              <div className="absolute bottom-6 right-12 opacity-10">
                <div className="text-6xl">🎯</div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 text-center space-y-8">
                {/* Animated Title */}
                <div className={`transform transition-all duration-1000 ${
                  animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Media & Branding Excellence
                  </h2>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
                    <div className="text-2xl">🚀</div>
                    <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded"></div>
                  </div>
                </div>

                {/* Inspirational Quote */}
                <div className={`transform transition-all duration-1000 delay-500 ${
                  animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  <blockquote className="text-xl font-light leading-relaxed mb-6 px-4">
                    <div className="mb-4">
                      &ldquo;Konten bukan hanya tayang, tapi harus <span className="text-yellow-300 font-semibold">berdampak</span>.
                    </div>
                    <div className="mb-4">
                      Publikasi bukan hanya tampil, tapi harus <span className="text-pink-300 font-semibold">menyampaikan pesan</span>.
                    </div>
                    <div className="mb-4">
                      Karena... <span className="text-purple-200 font-medium">engagement</span> itu bukan sekadar partisipasi —
                    </div>
                    <div className="text-lg font-semibold">
                      tapi komitmen untuk membawa instansi menjadi
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      <span className="text-yellow-300">Bigger</span>, <span className="text-pink-300">Smarter</span>, dan <span className="text-purple-300">Better</span>!&rdquo;
                    </div>
                  </blockquote>
                  
                  <div className="flex justify-center items-center gap-8 mt-8">
                    {/* Bigger, Smarter, Better Stats */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-300">📈</div>
                      <div className="text-sm opacity-80 font-medium">Bigger</div>
                      <div className="text-xs opacity-60">Jangkauan Lebih Luas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-300">🧠</div>
                      <div className="text-sm opacity-80 font-medium">Smarter</div>
                      <div className="text-xs opacity-60">Strategi Cerdas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300">⭐</div>
                      <div className="text-sm opacity-80 font-medium">Better</div>
                      <div className="text-xs opacity-60">Kualitas Unggul</div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className={`transform transition-all duration-1000 delay-1000 ${
                  animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                    <p className="text-lg mb-4">
                      Mari wujudkan publikasi dan konten media yang 
                      <span className="text-yellow-300 font-semibold"> berdampak nyata</span> dan 
                      <span className="text-pink-300 font-semibold"> mengubah paradigma!</span>
                    </p>
                    <div className="flex justify-center gap-4 text-sm opacity-80">
                      <span>🎯 Konten Berdampak</span>
                      <span>•</span>
                      <span>💡 Pesan Bermakna</span>
                      <span>•</span>
                      <span>� Engagement Berkualitas</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-6">
                  <Button 
                    onClick={() => setShowMotivationalPopup(false)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Mari Berkarya! ✨
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}
