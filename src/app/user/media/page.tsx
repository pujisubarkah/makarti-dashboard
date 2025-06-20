// app/publikasi/page.tsx
"use client"

import React, { useState } from "react"
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
  FileText, 
  Instagram, 
  Globe, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
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

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#8b5cf6']

export default function PublikasiPage() {
  // Dummy initial data with more variety
  const initialData: PublikasiItem[] = [
    {
      id: 1,
      judul: 'Peluncuran Inovasi Pelayanan Digital',
      tanggal: '2025-05-20',
      jenis: 'Media Online',
      unit: 'Unit A',
      link: '#',
    },
    {
      id: 2,
      judul: 'Live IG Sosialisasi Kebijakan Baru',
      tanggal: '2025-05-18',
      jenis: 'Instagram',
      unit: 'Unit B',
      link: '#',
      likes: 300,
      views: 5000,
    },
    {
      id: 3,
      judul: 'Workshop Transformasi Digital',
      tanggal: '2025-05-15',
      jenis: 'Website',
      unit: 'Unit A',
      link: '#',
    },
    {
      id: 4,
      judul: 'Kampanye ASN BerAKHLAK',
      tanggal: '2025-05-12',
      jenis: 'Instagram',
      unit: 'Unit C',
      link: '#',
      likes: 450,
      views: 7200,
    },
    {
      id: 5,
      judul: 'Artikel Inovasi Pelayanan',
      tanggal: '2025-05-10',
      jenis: 'Media Massa',
      unit: 'Unit B',
      link: '#',
    },
  ]

  // State for publikasi data
  const [data, setData] = useState<PublikasiItem[]>(initialData)
  const [showModal, setShowModal] = useState(false)

  // Ambil data publikasi dari localStorage jika tersedia (client-side only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("publikasiData")
      if (saved) {
        setData(JSON.parse(saved))
      }
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    jenis: "Media Online",
    link: "",
    likes: 0,
    views: 0,
  })
  const [userUnit, setUserUnit] = useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserUnit(localStorage.getItem("userUnit"))
    }
  }, [])

  const jenisMediaOptions = ["Media Online", "Instagram", "Media Massa", "Website"]

  // Calculate statistics
  const totalPublikasi = data.length
  const instagramPosts = data.filter(item => item.jenis === 'Instagram')
  const totalLikes = instagramPosts.reduce((sum, item) => sum + (item.likes || 0), 0)
  const totalViews = instagramPosts.reduce((sum, item) => sum + (item.views || 0), 0)
  const avgEngagement = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : '0'
  
  // Data for charts
  const jenisCount = data.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(jenisCount).map(([key, value]) => ({
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
    publikasi: count,
  }))

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
      description: 'Total konten yang dipublikasi'
    },
    {
      title: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: <Heart className="w-6 h-6" />,
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-100',
      textColor: 'text-pink-600',
      textDark: 'text-pink-800',
      borderColor: 'border-pink-500',
      change: '+25%',
      description: 'Dari konten Instagram'
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
      description: 'Jangkauan total konten'
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
      description: 'Rata-rata engagement'
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "likes" || name === "views" ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userUnit) {
      alert("Tidak dapat menentukan unit kerja")
      return
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      unit: userUnit,
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("publikasiData", JSON.stringify(updatedData))

    setFormData({
      judul: "",
      tanggal: "",
      jenis: "Media Online",
      link: "",
      likes: 0,
      views: 0,
    })
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Publikasi & Media</h1>
          <p className="text-blue-600">Kelola dan monitor konten publikasi di berbagai platform</p>
        </div>
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Jenis Media */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-600">Jenis Media</label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="https://example.com" 
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Conditional Instagram Fields */}
              {formData.jenis === "Instagram" && (
                <>
                  {/* Likes */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-blue-600">Likes</label>
                    <input
                      type="number"
                      name="likes"
                      value={formData.likes}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Views */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-blue-600">Views</label>
                    <input
                      type="number"
                      name="views"
                      value={formData.views}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Tombol Simpan & Batal */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-blue-500" />
            Distribusi Jenis Media
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
            Tren Publikasi Bulanan
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
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Publikasi & Media</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap konten yang telah dipublikasi</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                const isInstagram = item.jenis === 'Instagram'
                const engagement =
                  isInstagram && item.views
                    ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                    : '-'

                return (
                  <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">{item.judul}</TableCell>
                    <TableCell className="text-gray-600">{item.tanggal}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                        item.jenis === 'Media Online' ? 'bg-blue-100 text-blue-800' :
                        item.jenis === 'Website' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.jenis === 'Instagram' ? <Instagram className="w-3 h-3 mr-1" /> :
                         item.jenis === 'Website' ? <Globe className="w-3 h-3 mr-1" /> :
                         <FileText className="w-3 h-3 mr-1" />}
                        {item.jenis}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isInstagram ? (
                        <span className="inline-flex items-center text-pink-600">
                          <Heart className="w-3 h-3 mr-1" />
                          {item.likes?.toLocaleString()}
                        </span>
                      ) : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {isInstagram ? (
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
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Share className="w-3 h-3 mr-1" />
                        Lihat
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}