'use client'

import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface DetailPerBulan {
  id: number
  bulan: string
  pagu_anggaran: number
  realisasi_pengeluaran: number
  capaian_realisasi: number
  capaian_realisasi_kumulatif: number
}

interface SerapanData {
  unit_kerja: string
  unit_kerja_id: number
  pagu_anggaran: number
  total_realisasi: number
  sisa_anggaran: number
  capaian_realisasi: number
  detail_per_bulan: DetailPerBulan[]
}

function getStatusColor(persen: number) {
  if (persen >= 80) return 'bg-green-500'
  if (persen >= 60) return 'bg-yellow-400'
  return 'bg-red-500'
}

function formatUnitName(unitKerja: string) {
  return unitKerja.replace(/_/g, ' ')
}

const COLORS = ['#4ade80', '#e2e8f0'] // hijau & abu-abu

export default function SerapanTablePage() {
  const [dataSerapan, setDataSerapan] = useState<SerapanData[]>([])
  const [selectedUnit, setSelectedUnit] = useState<null | SerapanData>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLowestUnitAlert, setShowLowestUnitAlert] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SerapanData | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [departments, setDepartments] = useState<{ name: string; unitIds: number[] }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/serapan')
        if (!response.ok) {
          throw new Error('Gagal mengambil data serapan')
        }
        const data: SerapanData[] = await response.json()
        setDataSerapan(data)
        
        // Show alert for lowest absorption unit after data loads
        if (data.length > 0) {
          setTimeout(() => setShowLowestUnitAlert(true), 1000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch departments from /api/scores/rekap
  useEffect(() => {
    fetch('/api/scores/rekap')
      .then(res => res.json())
      .then(rekap => {
        if (rekap.level_3 && Array.isArray(rekap.level_3)) {
          // Map department name to unit_kerja_id
          const deptMap: { [name: string]: number[] } = {};
          interface RekapUnit {
            unit_kerja_id: number;
            department?: { name?: string };
          }
          rekap.level_3.forEach((unit: RekapUnit) => {
            const deptName = unit.department?.name || '-';
            if (!deptMap[deptName]) deptMap[deptName] = [];
            deptMap[deptName].push(unit.unit_kerja_id);
          });
          setDepartments(Object.entries(deptMap).map(([name, unitIds]) => ({ name, unitIds })));
        }
      });
  }, []);

  const handleRowClick = (unit: SerapanData) => {
    setSelectedUnit(unit)
  }

  // Filter dan sort data
  const filteredAndSortedData = dataSerapan
    .filter(item => {
      // Filter by department if selected
      if (selectedDepartment) {
        const dept = departments.find(d => d.name === selectedDepartment);
        if (!dept || !dept.unitIds.includes(item.unit_kerja_id)) return false;
      }
      return formatUnitName(item.unit_kerja).toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0
      
      let aValue: string | number
      let bValue: string | number
      
      const key = sortConfig.key
      if (key === 'detail_per_bulan') {
        // Skip sorting for detail_per_bulan as it's an array
        return 0
      }
      
      aValue = a[key] as string | number
      bValue = b[key] as string | number
      
      // Untuk unit_kerja, gunakan nama yang sudah diformat
      if (sortConfig.key === 'unit_kerja') {
        aValue = formatUnitName(aValue as string).toLowerCase()
        bValue = formatUnitName(bValue as string).toLowerCase()
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

  const handleSort = (key: keyof SerapanData) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey: keyof SerapanData) => {
    if (sortConfig.key !== columnKey) {
      return '⇅'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data serapan anggaran...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    )
  }
  // Hitung summary data berdasarkan data yang sudah difilter
  const totalAnggaran = filteredAndSortedData.reduce((sum, item) => sum + item.pagu_anggaran, 0)
  const totalRealisasi = filteredAndSortedData.reduce((sum, item) => sum + item.total_realisasi, 0)
  const totalSisaAnggaran = filteredAndSortedData.reduce((sum, item) => sum + item.sisa_anggaran, 0)
  const rataRataSerapan = filteredAndSortedData.length > 0 ? 
    Math.round(filteredAndSortedData.reduce((sum, item) => sum + item.capaian_realisasi, 0) / filteredAndSortedData.length) : 0
  
  // Find unit with lowest absorption rate
  const unitTerendah = dataSerapan.length > 0 ? 
    dataSerapan.reduce((lowest, current) => 
      current.capaian_realisasi < lowest.capaian_realisasi ? current : lowest
    ) : null
    // Hitung unit berdasarkan status dari data yang sudah difilter
  const unitBaik = filteredAndSortedData.filter(item => item.capaian_realisasi >= 80).length
  const unitCukup = filteredAndSortedData.filter(item => {
    const persen = item.capaian_realisasi
    return persen >= 60 && persen < 80
  }).length
  const unitKurang = filteredAndSortedData.filter(item => item.capaian_realisasi < 60).length

  const pieData =
    selectedUnit && [
      {
        name: 'Realisasi',
        value: selectedUnit.total_realisasi,
      },
      {
        name: 'Sisa Anggaran',
        value: selectedUnit.sisa_anggaran,
      },
    ]

  return (
    <div className="p-6">
      {/* Alert Modal for Lowest Unit */}
      {showLowestUnitAlert && unitTerendah && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Perhatian: Unit dengan Serapan Terendah
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  {formatUnitName(unitTerendah.unit_kerja)}
                </h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>
                    <span className="font-medium">Persentase Serapan:</span> 
                    <span className="font-bold text-red-800 ml-1">
                      {Math.round(unitTerendah.capaian_realisasi)}%
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Anggaran:</span> 
                    <span className="ml-1">Rp {unitTerendah.pagu_anggaran.toLocaleString('id-ID')}</span>
                  </p>
                  <p>
                    <span className="font-medium">Realisasi:</span> 
                    <span className="ml-1">Rp {unitTerendah.total_realisasi.toLocaleString('id-ID')}</span>
                  </p>
                  <p>
                    <span className="font-medium">Sisa:</span> 
                    <span className="ml-1">Rp {unitTerendah.sisa_anggaran.toLocaleString('id-ID')}</span>
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Unit ini memerlukan perhatian khusus untuk meningkatkan serapan anggaran.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedUnit(unitTerendah)
                    setShowLowestUnitAlert(false)
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={() => setShowLowestUnitAlert(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Dashboard Serapan Anggaran</h1>
        
        {/* Alert Button for Lowest Unit */}
        {unitTerendah && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLowestUnitAlert(true)}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 border border-red-200"
            >
              <span>⚠️</span>
              <span className="text-sm font-medium">
                Unit Terendah: {Math.round(unitTerendah.capaian_realisasi)}%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Anggaran */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Total Anggaran</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {(totalAnggaran / 1_000_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            Rp {totalAnggaran.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Total Realisasi */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Total Realisasi</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {(totalRealisasi / 1_000_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">💸</span>
            </div>
          </div>
          <p className="text-green-600 text-xs mt-2">
            Rp {totalRealisasi.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-800 text-sm font-medium">Sisa Anggaran</p>
              <p className="text-2xl font-bold text-orange-600">
                Rp {(totalSisaAnggaran / 1_000_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-orange-600 text-xs mt-2">
            Rp {totalSisaAnggaran.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Rata-rata Serapan */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Rata-rata Serapan</p>
              <p className="text-2xl font-bold text-purple-600">{rataRataSerapan}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>          <p className="text-purple-600 text-xs mt-2">
            Dari {filteredAndSortedData.length} unit kerja
            {searchTerm && ` (filtered dari ${dataSerapan.length} total)`}
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Status Unit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">{unitBaik}</div>
            <div className="text-green-800 font-medium">Unit Baik</div>
            <div className="text-sm text-green-600">≥ 80% serapan</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{unitCukup}</div>
            <div className="text-yellow-800 font-medium">Unit Cukup</div>
            <div className="text-sm text-yellow-600">60-79% serapan</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-1">{unitKurang}</div>
            <div className="text-red-800 font-medium">Perlu Perhatian</div>
            <div className="text-sm text-red-600">&lt; 60% serapan</div>
          </div>
        </div>
      </div>      {/* Tabel Serapan */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-blue-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-blue-800">Detail Serapan per Unit</h2>
              <p className="text-sm text-blue-600">Klik pada baris untuk melihat detail grafik</p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Department Dropdown */}
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                style={{ minWidth: 180 }}
              >
                <option value="">Semua Kompartemen</option>
                {departments.map(dept => (
                  <option key={dept.name} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari unit kerja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Clear Sort Button */}
              {sortConfig.key && (
                <button
                  onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Sort
                </button>
              )}
            </div>
          </div>
          
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-3 text-sm text-blue-600">
              Menampilkan {filteredAndSortedData.length} dari {dataSerapan.length} unit kerja
              {filteredAndSortedData.length === 0 && (
                <span className="text-red-600 ml-2">- Tidak ada unit yang cocok dengan pencarian</span>
              )}
            </div>
          )}
        </div>
          <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('unit_kerja')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Unit Kerja
                    <span className="text-xs">{getSortIcon('unit_kerja')}</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort('pagu_anggaran')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors ml-auto"
                  >
                    Total Anggaran
                    <span className="text-xs">{getSortIcon('pagu_anggaran')}</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort('total_realisasi')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors ml-auto"
                  >
                    Realisasi
                    <span className="text-xs">{getSortIcon('total_realisasi')}</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort('capaian_realisasi')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors ml-auto"
                  >
                    Persentase
                    <span className="text-xs">{getSortIcon('capaian_realisasi')}</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada unit kerja yang cocok dengan pencarian' : 'Tidak ada data'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((item, index) => {
                  const persen = Math.round(item.capaian_realisasi)
                  const badgeColor = getStatusColor(persen)
                  const isSelected = selectedUnit?.unit_kerja === item.unit_kerja
                  
                  return (
                    <tr
                      key={index}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                        isSelected ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{formatUnitName(item.unit_kerja)}</td>
                      <td className="px-6 py-4 text-right">
                        Rp {item.pagu_anggaran.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        Rp {item.total_realisasi.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{persen}%</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            persen >= 80
                              ? 'bg-green-100 text-green-800'
                              : persen >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-1 ${badgeColor}`}></span>
                          {persen >= 80 ? 'Baik' : persen >= 60 ? 'Cukup' : 'Kurang'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie Chart */}
      {selectedUnit && (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Detail Serapan - {formatUnitName(selectedUnit.unit_kerja)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData ?? []}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(pieData ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Informasi Detail</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Anggaran:</span>
                    <span className="font-medium">Rp {selectedUnit.pagu_anggaran.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Realisasi:</span>
                    <span className="font-medium text-green-600">Rp {selectedUnit.total_realisasi.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sisa:</span>
                    <span className="font-medium text-orange-600">
                      Rp {selectedUnit.sisa_anggaran.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Persentase Serapan:</span>
                    <span className="font-bold text-blue-600">
                      {Math.round(selectedUnit.capaian_realisasi)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Monthly Breakdown */}
          {selectedUnit.detail_per_bulan && selectedUnit.detail_per_bulan.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Breakdown Per Bulan</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Chart */}
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <BarChart data={selectedUnit.detail_per_bulan}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Realisasi']}
                      />
                      <Bar dataKey="realisasi_pengeluaran" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Monthly Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Bulan</th>
                        <th className="px-3 py-2 text-right">Realisasi</th>
                        <th className="px-3 py-2 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedUnit.detail_per_bulan.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{detail.bulan}</td>
                          <td className="px-3 py-2 text-right">
                            Rp {detail.realisasi_pengeluaran.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2 text-right font-bold">
                            {detail.capaian_realisasi.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
