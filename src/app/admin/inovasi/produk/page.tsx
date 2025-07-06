'use client'

import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { AlertTriangle, X, Award, Rocket } from 'lucide-react'

interface ProdukInovasiData {
  id: number
  nama: string
  jenis: string
  status_id: number
  tanggalRilis: string
  keterangan: string
  unit_kerja_id: number
  status_inovasi: {
    id: number
    created_at: string
    status: string
  }
  users: {
    unit_kerja: string
  }
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6']

export default function ProdukInovasiPage() {
  const [dataProduk, setDataProduk] = useState<ProdukInovasiData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInnovationModal, setShowInnovationModal] = useState(false)

  useEffect(() => {
    const fetchProdukData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/produkinovasi')
        if (!response.ok) {
          throw new Error('Failed to fetch product innovation data')
        }
        const data = await response.json()
        setDataProduk(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProdukData()
  }, [])

  // Function to identify outstanding innovation products
  const getOutstandingProducts = () => {
    return dataProduk.filter(item => 
      item.status_inovasi.status === 'Selesai' && (
        item.jenis.includes('Digital') || 
        item.jenis === 'Dashboard' || 
        item.jenis === 'Aplikasi' ||
        item.nama.toLowerCase().includes('smart') ||
        item.nama.toLowerCase().includes('digital') ||
        item.nama.toLowerCase().includes('otomasi') ||
        item.keterangan.toLowerCase().includes('efisien') ||
        item.keterangan.toLowerCase().includes('monitoring') ||
        item.keterangan.toLowerCase().includes('inovasi')
      )
    )
  }

  // Group outstanding products by unit with 4D analysis
  const getOutstandingByUnit = () => {
    const outstanding = getOutstandingProducts()
    const grouped = outstanding.reduce((acc, item) => {
      const unitName = item.users.unit_kerja
      if (!acc[unitName]) {
        acc[unitName] = []
      }
      acc[unitName].push(item)
      return acc
    }, {} as Record<string, ProdukInovasiData[]>)
    
    return Object.entries(grouped)
      .map(([unit, products]) => ({
        unit,
        products,
        count: products.length,
        completionRate: (products.filter(p => p.status_inovasi.status === 'Selesai').length / products.length) * 100,
        digitalRate: (products.filter(p => p.jenis.includes('Digital') || p.jenis === 'Dashboard' || p.jenis === 'Aplikasi').length / products.length) * 100,
        // 4D Framework Analysis
        drumUp: products.length >= 2 ? 'Champion' : products.length === 1 ? 'Starter' : 'Potential',
        diagnose: products.some(p => p.keterangan.toLowerCase().includes('monitoring') || p.keterangan.toLowerCase().includes('analisis')) ? 'Advanced' : 'Basic',
        design: products.filter(p => p.jenis.includes('Digital') || p.jenis === 'Dashboard').length > 0 ? 'Digital-Ready' : 'Traditional',
        delivered: products.filter(p => p.status_inovasi.status === 'Selesai').length
      }))
      .sort((a, b) => b.count - a.count)
  }

  // Auto-show innovation modal when data is loaded
  useEffect(() => {
    if (dataProduk.length > 0 && !loading && !error) {
      const outstandingProducts = dataProduk.filter(item => 
        item.status_inovasi.status === 'Selesai' && (
          item.jenis.includes('Digital') || 
          item.jenis === 'Dashboard' || 
          item.jenis === 'Aplikasi' ||
          item.nama.toLowerCase().includes('smart') ||
          item.nama.toLowerCase().includes('digital') ||
          item.nama.toLowerCase().includes('otomasi') ||
          item.keterangan.toLowerCase().includes('efisien') ||
          item.keterangan.toLowerCase().includes('monitoring') ||
          item.keterangan.toLowerCase().includes('inovasi')
        )
      )
      
      if (outstandingProducts.length > 0) {
        // Show popup with a slight delay for better UX
        const timer = setTimeout(() => {
          setShowInnovationModal(true)
        }, 2000) // 2 second delay

        return () => clearTimeout(timer)
      }
    }
  }, [dataProduk, loading, error])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product innovation data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Error loading product innovation data</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dataProduk || dataProduk.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Produk Inovasi</h1>
          <p className="text-blue-600">Pantau dan kelola produk inovasi di seluruh unit kerja</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-gray-600 mb-2">Belum ada data produk inovasi</p>
            <p className="text-gray-500 text-sm">Data produk inovasi akan ditampilkan setelah ada input data</p>
          </div>
        </div>
      </div>
    )
  }

  const summaryCards = [
    { 
      label: 'Total Produk Inovasi', 
      value: dataProduk.length,
      icon: '🚀',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    { 
      label: 'Produk Selesai', 
      value: dataProduk.filter(d => d.status_inovasi.status === 'Selesai').length,
      icon: '✅',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    { 
      label: 'Jenis Digital', 
      value: dataProduk.filter(d => d.jenis.includes('Digital') || d.jenis === 'Dashboard' || d.jenis === 'Aplikasi').length,
      icon: '💻',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    { 
      label: 'Kolaborasi Unit', 
      value: new Set(dataProduk.map(d => d.users.unit_kerja)).size,
      icon: '🤝',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ]

  const pieData = Object.entries(
    dataProduk.reduce((acc, curr) => {
      acc[curr.jenis] = (acc[curr.jenis] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({ name: key, value }))

  const barData = Object.entries(
    dataProduk.reduce((acc, curr) => {
      acc[curr.users.unit_kerja] = (acc[curr.users.unit_kerja] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([unit, jumlah]) => ({ unit, jumlah }))
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Produk Inovasi</h1>
        <p className="text-blue-600">Pantau dan kelola produk inovasi di seluruh unit kerja</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{card.icon}</span>
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
                  <span>Progress</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {card.value > 0 ? '✓ Aktif' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Statistik Produk Inovasi
          </h2>
          <button
            onClick={() => setShowInnovationModal(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <Rocket className="w-4 h-4 mr-2" />
            4D Innovation Hub
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {getOutstandingProducts().length}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-indigo-600">
              {((dataProduk.filter(d => d.status_inovasi.status === 'Selesai').length / dataProduk.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-indigo-800">Tingkat Penyelesaian</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-emerald-600">
              {dataProduk.filter(d => d.jenis.includes('Digital') || d.jenis === 'Dashboard' || d.jenis === 'Aplikasi').length}
            </div>
            <div className="text-sm text-emerald-800">Solusi Digital</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-amber-600">
              {new Date().getFullYear() - Math.min(...dataProduk.map(d => new Date(d.tanggalRilis).getFullYear()))}
            </div>
            <div className="text-sm text-amber-800">Tahun Inovasi</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Produk Inovasi</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap produk inovasi per unit kerja</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Nama Produk</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-left font-medium">Jenis</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal Rilis</th>
                <th className="px-6 py-3 text-left font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataProduk.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.users.unit_kerja}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis.includes('Digital') || item.jenis === 'Dashboard' || item.jenis === 'Aplikasi' ? 'bg-purple-100 text-purple-800' :
                      item.jenis === 'Modul Pelatihan' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.jenis.includes('Digital') || item.jenis === 'Dashboard' || item.jenis === 'Aplikasi' ? '💻' :
                       item.jenis === 'Modul Pelatihan' ? '📚' : '📋'} {item.jenis}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.status_inovasi.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      item.status_inovasi.status === 'Proses' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status_inovasi.status === 'Selesai' ? '✅' :
                       item.status_inovasi.status === 'Proses' ? '�' : '📦'} {item.status_inovasi.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(item.tanggalRilis).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Jenis Produk
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
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

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Produk per Unit Kerja
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="jumlah" 
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

      {/* 4D Innovation Hub Modal - Ultra Enhanced */}
      {showInnovationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-700 scale-100 animate-in slide-in-from-bottom-8 zoom-in-95 border-2 border-purple-200">
            {/* Modal Header - Ultra Enhanced */}
            <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 text-white p-10 relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-transparent animate-pulse"></div>
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/20 rounded-full animate-ping"></div>
              <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-white/15 rounded-full animate-pulse delay-500"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-start space-x-6">
                  <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-sm shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <Rocket className="w-12 h-12 text-white drop-shadow-lg animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold mb-3 drop-shadow-md bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                      🚀 4D Innovation Framework
                    </h2>
                    <p className="text-purple-100 text-xl font-medium drop-shadow-sm mb-4">
                      ✨ Drum Up • Diagnose • Design • Delivered ✨
                    </p>
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          🎯 <span className="ml-2 text-xl">{getOutstandingProducts().length}</span> <span className="ml-1">Produk Unggulan</span>
                        </span>
                      </div>
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          🏆 <span className="ml-2 text-xl">{getOutstandingByUnit().length}</span> <span className="ml-1">Unit Inovatif</span>
                        </span>
                      </div>
                      <div className="bg-white/25 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-base flex items-center">
                          ⚡ <span className="ml-2 text-xl">{((getOutstandingProducts().filter(p => p.status_inovasi.status === 'Selesai').length / getOutstandingProducts().length) * 100).toFixed(0)}%</span> <span className="ml-1">Delivery Rate</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInnovationModal(false)}
                  className="text-white hover:bg-white/25 rounded-2xl p-4 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm shadow-lg"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              
              {/* 4D Framework Icons */}
              <div className="absolute bottom-4 right-4 flex space-x-3 animate-bounce">
                <span className="text-3xl" title="Drum Up">🥁</span>
                <span className="text-3xl" title="Diagnose">🔍</span>
                <span className="text-3xl" title="Design">🎨</span>
                <span className="text-3xl" title="Delivered">🚀</span>
              </div>
            </div>

            {/* Modal Content - 4D Framework Enhanced */}
            <div className="p-10 overflow-y-auto max-h-[calc(95vh-320px)] bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
              {/* Custom CSS Animations */}
              <style jsx>{`
                @keyframes cardFloat {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
                
                @keyframes pulse4D {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.8; transform: scale(1.05); }
                }
                
                .animate-shimmer {
                  animation: shimmer 2s ease-in-out infinite;
                }
                
                .animate-pulse4D {
                  animation: pulse4D 2s ease-in-out infinite;
                }
              `}</style>

              {getOutstandingByUnit().length > 0 ? (
                <div className="space-y-12">
                  {getOutstandingByUnit().map((unitData, index) => (
                    <div 
                      key={unitData.unit} 
                      className="bg-white rounded-3xl p-10 relative shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.02] border-2 border-gradient-to-r from-purple-200 to-blue-200 group"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #a855f7 70%, #7c3aed 100%)' :
                                   index === 1 ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 30%, #6366f1 70%, #4f46e5 100%)' :
                                   index === 2 ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 30%, #ef4444 70%, #dc2626 100%)' :
                                   'linear-gradient(135deg, #ecfdf5 0%, #bbf7d0 30%, #10b981 70%, #059669 100%)',
                        animation: `cardFloat ${3 + index * 0.5}s ease-in-out infinite alternate`
                      }}
                    >
                      {/* Enhanced Ranking Badge */}
                      <div className="absolute -top-6 -left-6 z-30">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 animate-pulse' : 
                          index === 1 ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700' : 
                          index === 2 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' : 'bg-gradient-to-br from-green-500 via-green-600 to-green-700'
                        }`}>
                          <span className="drop-shadow-lg">#{index + 1}</span>
                        </div>
                        {/* 4D Badge */}
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 text-2xl animate-spin">🎯</div>
                        )}
                      </div>

                      {/* Enhanced Crown for #1 */}
                      {index === 0 && (
                        <div className="absolute -top-4 -right-4 z-20">
                          <div className="text-5xl animate-bounce transform hover:scale-125 transition-transform duration-300">👑</div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-purple-600 font-bold text-xs bg-white px-2 py-1 rounded-full shadow-lg">
                            4D MASTER
                          </div>
                        </div>
                      )}

                      {/* Unit Header - 4D Enhanced */}
                      <div className="mb-8 relative">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-3xl font-bold text-gray-800 flex items-center group">
                            <div className="bg-white/40 p-3 rounded-2xl mr-4 backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                              <Award className="w-8 h-8 text-purple-600 animate-pulse" />
                            </div>
                            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              {unitData.unit}
                            </span>
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                              <span className="text-gray-800 font-bold text-lg flex items-center">
                                🚀 <span className="ml-2 text-2xl text-purple-600">{unitData.count}</span> <span className="ml-1">Produk</span>
                              </span>
                            </div>
                            <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                              <span className="text-gray-800 font-bold text-lg flex items-center">
                                ✅ <span className="ml-2 text-2xl text-green-600">{unitData.completionRate.toFixed(0)}%</span> <span className="ml-1">Selesai</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 4D Framework Analysis */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-2xl text-center shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl mb-2">🥁</div>
                            <div className="font-bold text-red-700 text-sm">DRUM UP</div>
                            <div className="text-red-600 font-medium">{unitData.drumUp}</div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl text-center shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl mb-2">🔍</div>
                            <div className="font-bold text-blue-700 text-sm">DIAGNOSE</div>
                            <div className="text-blue-600 font-medium">{unitData.diagnose}</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl text-center shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl mb-2">🎨</div>
                            <div className="font-bold text-purple-700 text-sm">DESIGN</div>
                            <div className="text-purple-600 font-medium">{unitData.design}</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl text-center shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl mb-2">🚀</div>
                            <div className="font-bold text-green-700 text-sm">DELIVERED</div>
                            <div className="text-green-600 font-medium">{unitData.delivered} Produk</div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar with 4D Visualization */}
                        <div className="relative mb-4">
                          <div className="w-full bg-white/50 rounded-2xl h-8 shadow-inner backdrop-blur-sm border border-white/30">
                            <div 
                              className="bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 h-8 rounded-2xl transition-all duration-2000 ease-out shadow-lg relative overflow-hidden flex items-center justify-center"
                              style={{ width: `${Math.min(unitData.completionRate, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                              <span className="text-white font-bold text-sm z-10">4D Success</span>
                            </div>
                          </div>
                          <div className="absolute right-0 -top-12">
                            <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/40">
                              <span className="text-sm font-bold text-gray-700 flex items-center">
                                🎯 {unitData.completionRate.toFixed(1)}% Completion Rate
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 4D Achievement Badges */}
                        <div className="flex items-center space-x-2 mb-4">
                          {unitData.completionRate >= 80 && (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                              🚀 4D Champion
                            </div>
                          )}
                          {unitData.digitalRate >= 50 && (
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                              💻 Digital Leader
                            </div>
                          )}
                          {unitData.count >= 3 && (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                              🏆 Innovation Hub
                            </div>
                          )}
                          {index === 0 && (
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                              👑 4D Master Unit
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Products Grid - 4D Enhanced */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {unitData.products.map((product, idx) => (
                          <div 
                            key={product.id} 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-purple-400 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden group cursor-pointer"
                            style={{
                              background: product.status_inovasi.status === 'Selesai' ? 
                                'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))' :
                                'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(124, 58, 237, 0.1))',
                            }}
                          >
                            {/* 4D Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/0 via-purple-200/30 to-purple-200/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            
                            {/* Product Status Indicator */}
                            <div className="absolute top-4 right-4">
                              <div className={`w-4 h-4 rounded-full animate-pulse ${
                                product.status_inovasi.status === 'Selesai' ? 'bg-green-500' :
                                product.status_inovasi.status === 'Proses' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {idx + 1}
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-base leading-tight flex-1">
                                    {product.nama}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg transition-transform duration-300 hover:scale-105 ${
                                  product.jenis.includes('Digital') || product.jenis === 'Dashboard' || product.jenis === 'Aplikasi' ? 'bg-purple-500 text-white' :
                                  product.jenis === 'Modul Pelatihan' ? 'bg-green-500 text-white' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  <span className="mr-2">
                                    {product.jenis.includes('Digital') || product.jenis === 'Dashboard' || product.jenis === 'Aplikasi' ? '💻' :
                                     product.jenis === 'Modul Pelatihan' ? '📚' : '📋'}
                                  </span>
                                  {product.jenis}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-white/50 p-3 rounded-xl">
                                {product.keterangan}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-gray-500 text-xs font-medium flex items-center bg-gray-100 px-3 py-2 rounded-xl">
                                  📅 {new Date(product.tanggalRilis).toLocaleDateString('id-ID')}
                                </p>
                                <div className="flex space-x-2">
                                  {product.status_inovasi.status === 'Selesai' && (
                                    <span className="text-2xl animate-bounce" title="4D Delivered">🎯</span>
                                  )}
                                  {product.jenis.includes('Digital') && (
                                    <span className="text-2xl animate-pulse" title="4D Design">🎨</span>
                                  )}
                                  {product.keterangan.toLowerCase().includes('monitoring') && (
                                    <span className="text-2xl animate-bounce delay-200" title="4D Diagnose">🔍</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="bg-gradient-to-br from-gray-100 via-purple-100 to-blue-100 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                    <Rocket className="w-20 h-20 text-gray-400 animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-600 mb-6 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    🔍 Belum Ada Produk Unggulan Terdeteksi
                  </h3>
                  <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                    Sistem sedang mencari produk inovasi yang sudah selesai atau memiliki karakteristik unggulan untuk analisis 4D Framework
                  </p>
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
                    <span className="font-bold">🚀 Kembangkan produk inovasi untuk muncul di 4D Hub!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - 4D Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 via-purple-50 to-blue-50 px-10 py-8 flex justify-between items-center border-t-2 border-purple-300">
              <div className="flex items-center space-x-6">
                <div className="text-xl text-gray-700 flex items-center">
                  <span className="font-bold text-purple-600 text-2xl">{getOutstandingProducts().length}</span>
                  <span className="mx-2">dari</span>
                  <span className="font-bold text-blue-600 text-2xl">{dataProduk.length}</span>
                  <span className="ml-2">produk tergolong unggulan</span>
                </div>
                <div className="bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-xl hover:scale-105 transition-transform duration-300">
                  🎯 4D Success Rate: {((getOutstandingProducts().length / dataProduk.length) * 100).toFixed(1)}%
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-xl animate-pulse">
                  ⚡ {getOutstandingProducts().filter(p => p.status_inovasi.status === 'Selesai').length} Delivered
                </div>
              </div>
              <button
                onClick={() => setShowInnovationModal(false)}
                className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                ✨ Tutup 4D Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
