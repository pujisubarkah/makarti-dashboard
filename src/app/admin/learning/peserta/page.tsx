'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6', '#8b5cf6', '#06b6d4']

type Penyelenggaraan = {
  id: number
  namaKegiatan: string
  tanggal: string
  jumlahPeserta: number
  jenis_bangkom_non_pelatihan: {
    jenis_bangkom: string
  }
  users: {
    unit_kerja: string
  }
}

export default function PesertaPage() {
  const [data, setData] = useState<Penyelenggaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPenyelenggara, setSelectedPenyelenggara] = useState<string>('Semua')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/penyelenggaraan')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Gagal fetch data penyelenggaraan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedPenyelenggara])

  // Dapatkan daftar penyelenggara unik
  const penyelenggaraList = Array.from(
    new Set(data.map((item) => item.users?.unit_kerja || 'Lainnya'))
  )

  // Filter berdasarkan penyelenggara
  const filteredData =
    selectedPenyelenggara === 'Semua'
      ? data
      : data.filter((item) => item.users?.unit_kerja === selectedPenyelenggara)

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const totalPeserta = filteredData.reduce((acc, item) => acc + item.jumlahPeserta, 0)
  const totalKegiatan = filteredData.length

  // Hitung rata-rata peserta per kegiatan
  const rataRataPeserta = totalKegiatan > 0 ? (totalPeserta / totalKegiatan).toFixed(1) : '0'

  // Hitung jenis terbanyak
  const jenisCount = filteredData.reduce((acc, curr) => {
    const jenis = curr.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
    acc[jenis] = (acc[jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jenisTerbanyak = Object.entries(jenisCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  // Hitung top performing units berdasarkan total peserta
  const unitStats = Object.entries(
    filteredData.reduce((acc, item) => {
      const unit = item.users?.unit_kerja || 'Lainnya'
      if (!acc[unit]) {
        acc[unit] = { totalPeserta: 0, totalKegiatan: 0 }
      }
      acc[unit].totalPeserta += item.jumlahPeserta
      acc[unit].totalKegiatan += 1
      return acc
    }, {} as Record<string, { totalPeserta: number; totalKegiatan: number }>)
  )
    .map(([unit, stats]) => ({
      unit,
      totalPeserta: stats.totalPeserta,
      totalKegiatan: stats.totalKegiatan,
      rataRataPeserta: stats.totalPeserta / stats.totalKegiatan,
    }))
    .sort((a, b) => b.totalPeserta - a.totalPeserta)
    .slice(0, 3)

  const summaryCards = [
    {
      label: 'Total Kegiatan',
      value: totalKegiatan,
      icon: '📚',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
    },
    {
      label: 'Total Peserta',
      value: totalPeserta,
      icon: '👥',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
    },
    {
      label: 'Rata-rata Peserta',
      value: rataRataPeserta,
      icon: '📊',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
    },
    {
      label: 'Jenis Terbanyak',
      value: jenisTerbanyak,
      icon: '🏆',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
    },
  ]

  const barData = filteredData
    .sort((a, b) => b.jumlahPeserta - a.jumlahPeserta)
    .slice(0, 10)
    .map((item) => ({
      name: item.namaKegiatan.length > 30 ? item.namaKegiatan.substring(0, 30) + '...' : item.namaKegiatan,
      peserta: item.jumlahPeserta,
    }))

  // Data untuk pie chart jenis kegiatan
  const pieData = Object.entries(jenisCount).map(([jenis, count]) => ({
    name: jenis,
    value: count,
  }))

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Peserta Pelatihan</h1>
        <p className="text-blue-600">Pantau dan kelola peserta pelatihan di seluruh unit kerja</p>
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
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>{card.label}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
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
                      width: `${Math.min(
                        (parseFloat(card.value.toString()) / Math.max(...summaryCards.map((c) => parseFloat(c.value.toString()) || 0))) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {parseFloat(card.value.toString()) > 0 ? '📈 Aktif' : '⏳ Monitoring'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Units */}
      {unitStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Unit Terbaik (Total Peserta Terbanyak)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {unitStats.map((unit, index) => {
              const colors = [
                {
                  bg: 'from-yellow-400 to-yellow-500',
                  light: 'bg-yellow-100',
                  text: 'text-yellow-600',
                  dark: 'text-yellow-800',
                  border: 'border-yellow-500',
                  icon: '🥇',
                },
                {
                  bg: 'from-gray-400 to-gray-500',
                  light: 'bg-gray-100',
                  text: 'text-gray-600',
                  dark: 'text-gray-800',
                  border: 'border-gray-500',
                  icon: '🥈',
                },
                {
                  bg: 'from-orange-400 to-orange-500',
                  light: 'bg-orange-100',
                  text: 'text-orange-600',
                  dark: 'text-orange-800',
                  border: 'border-orange-500',
                  icon: '🥉',
                },
              ][index]

              const percentage = ((unit.totalPeserta / totalPeserta) * 100).toFixed(1)

              return (
                <div
                  key={unit.unit}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${colors.dark} mb-1`}>{unit.unit}</p>
                        <p className={`text-3xl font-bold ${colors.text}`}>{unit.totalPeserta}</p>
                        <p className="text-xs text-gray-600">peserta</p>
                      </div>
                      <div className={`${colors.light} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                        <span className="text-2xl">{colors.icon}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-500`}
                          style={{
                            width: `${(unit.totalPeserta / Math.max(...unitStats.map((u) => u.totalPeserta))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{unit.totalKegiatan} kegiatan</span>
                        <span className={`font-medium ${colors.text}`}>{percentage}% total peserta</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Learning Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Pembelajaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold text-blue-600">
              {unitStats.length > 0 ? Math.max(...unitStats.map((u) => u.totalPeserta)) : 0}
            </div>
            <div className="text-sm text-blue-800">Peserta Tertinggi</div>
            <div className="text-xs text-blue-600 mt-1">Best Performance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {unitStats.length > 0 ? Math.max(...unitStats.map((u) => u.rataRataPeserta)).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-green-800">Rata-rata Tertinggi</div>
            <div className="text-xs text-green-600 mt-1">Per Kegiatan</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(jenisCount).length}</div>
            <div className="text-sm text-purple-800">Jenis Kegiatan</div>
            <div className="text-xs text-purple-600 mt-1">Variety</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🌟</div>
            <div className="text-2xl font-bold text-orange-600">
              {unitStats.filter((u) => u.totalPeserta >= 100).length}
            </div>
            <div className="text-sm text-orange-800">Unit Aktif</div>
            <div className="text-xs text-orange-600 mt-1">100+ peserta</div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Filter Data Peserta
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Unit Kerja:</label>
          <select
            value={selectedPenyelenggara}
            onChange={(e) => setSelectedPenyelenggara(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="Semua">Semua Unit</option>
            {penyelenggaraList.map((nama, i) => (
              <option key={i} value={nama}>
                {nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Table with Pagination */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Peserta Pelatihan</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap kegiatan pelatihan dan jumlah peserta</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
              </div>
              <div className="text-xs text-blue-200">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                Memuat data...
              </div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-sm text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">No</th>
                  <th className="px-6 py-3 text-left font-medium">Nama Kegiatan</th>
                  <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-6 py-3 text-left font-medium">Jenis</th>
                  <th className="px-6 py-3 text-left font-medium">Penyelenggara</th>
                  <th className="px-6 py-3 text-right font-medium">Jumlah Peserta</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {paginatedData.map((item, index) => {
                  const unitRank = unitStats.findIndex((u) => u.unit === (item.users?.unit_kerja || 'Lainnya'))
                  const isTopUnit = unitRank !== -1
                  const globalIndex = startIndex + index

                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">{globalIndex + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.namaKegiatan}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📚 {item.jenis_bangkom_non_pelatihan?.jenis_bangkom || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isTopUnit
                              ? unitRank === 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : unitRank === 1
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} {item.users?.unit_kerja || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.jumlahPeserta >= 50
                              ? 'bg-green-100 text-green-800'
                              : item.jumlahPeserta >= 20
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          👥 {item.jumlahPeserta}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {paginatedData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> hingga{' '}
                <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari{' '}
                <span className="font-medium">{filteredData.length}</span> hasil
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  ← Sebelumnya
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageClick(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      )}
                    </>
                  )}
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageClick(totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Top Kegiatan Berdasarkan Jumlah Peserta
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 100, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="peserta" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Jenis Kegiatan
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
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
    </div>
  )
}
