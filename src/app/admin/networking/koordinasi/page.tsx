'use client'

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"

const COLORS = ['#60a5fa', '#34d399', '#facc15']

const rawData = [
  {
    id: 1,
    tanggal: '2025-01-10',
    unit: 'Unit A',
    instansi: 'Kementerian Keuangan',
    jenisInstansi: 'Pusat',
    topik: 'Koordinasi anggaran',
    catatan: 'Sinkronisasi data belanja',
  },
  {
    id: 2,
    tanggal: '2025-02-15',
    unit: 'Unit B',
    instansi: 'Kementerian PANRB',
    jenisInstansi: 'Pusat',
    topik: 'Digitalisasi layanan',
    catatan: 'MoU ditandatangani',
  },
  {
    id: 3,
    tanggal: '2025-03-20',
    unit: 'Unit C',
    instansi: 'Pemprov Jabar',
    jenisInstansi: 'Daerah',
    topik: 'Reformasi birokrasi',
    catatan: 'Menunggu tindak lanjut',
  },
  {
    id: 4,
    tanggal: '2025-03-25',
    unit: 'Unit A',
    instansi: 'Universitas Indonesia',
    jenisInstansi: 'Akademisi',
    topik: 'Riset tata kelola',
    catatan: 'Diskusi lanjutan',
  },
  {
    id: 5,
    tanggal: '2025-04-15',
    unit: 'Unit A',
    instansi: 'Pemprov Bali',
    jenisInstansi: 'Daerah',
    topik: 'Kolaborasi smart city',
    catatan: 'Kunjungan awal',
  },
]

const allUnits = [...new Set(rawData.map((d) => d.unit))]
const allJenisInstansi = [...new Set(rawData.map((d) => d.jenisInstansi))]
const allMonths = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
]

export default function KoordinasiDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedJenis, setSelectedJenis] = useState('all')

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const monthMatch =
        selectedMonth === 'all' || item.tanggal.slice(5, 7) === selectedMonth
      const unitMatch = selectedUnit === 'all' || item.unit === selectedUnit
      const jenisMatch = selectedJenis === 'all' || item.jenisInstansi === selectedJenis
      return monthMatch && unitMatch && jenisMatch
    })
  }, [selectedMonth, selectedUnit, selectedJenis])

  const pieData = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      count[d.jenisInstansi] = (count[d.jenisInstansi] || 0) + 1
    })
    return Object.entries(count).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const barData = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      const month = d.tanggal.slice(0, 7) // '2025-03'
      count[month] = (count[month] || 0) + 1
    })
    return Object.entries(count)
      .sort()
      .map(([name, value]) => ({ name, value }))
  }, [filteredData])

  // Hitung unit terpopuler
  const unitCount = useMemo(() => {
    const count: Record<string, number> = {}
    filteredData.forEach((d) => {
      count[d.unit] = (count[d.unit] || 0) + 1
    })
    return Object.entries(count).sort(([, a], [, b]) => b - a).slice(0, 3)
  }, [filteredData])

  // Summary cards data
  const summaryCards = [
    {
      label: 'Total Koordinasi',
      value: filteredData.length,
      icon: '🤝',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Instansi Pusat',
      value: filteredData.filter(d => d.jenisInstansi === 'Pusat').length,
      icon: '🏛️',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    {
      label: 'Instansi Daerah',
      value: filteredData.filter(d => d.jenisInstansi === 'Daerah').length,
      icon: '🏢',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Akademisi',
      value: filteredData.filter(d => d.jenisInstansi === 'Akademisi').length,
      icon: '🎓',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Koordinasi & Networking</h1>
        <p className="text-blue-600">Pantau dan kelola kegiatan koordinasi antar instansi</p>
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

      {/* Top Performing Units */}
      {unitCount.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Unit Paling Aktif dalam Koordinasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {unitCount.map(([unit, count], index) => {
              const colors = [
                { 
                  bg: 'from-yellow-400 to-yellow-500', 
                  light: 'bg-yellow-100', 
                  text: 'text-yellow-600', 
                  dark: 'text-yellow-800',
                  border: 'border-yellow-500',
                  icon: '🥇' 
                },
                { 
                  bg: 'from-gray-400 to-gray-500', 
                  light: 'bg-gray-100', 
                  text: 'text-gray-600', 
                  dark: 'text-gray-800',
                  border: 'border-gray-500',
                  icon: '🥈' 
                },
                { 
                  bg: 'from-orange-400 to-orange-500', 
                  light: 'bg-orange-100', 
                  text: 'text-orange-600', 
                  dark: 'text-orange-800',
                  border: 'border-orange-500',
                  icon: '🥉' 
                }
              ][index]

              const percentage = ((count / filteredData.length) * 100).toFixed(1)

              return (
                <div
                  key={unit}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${colors.dark} mb-1`}>
                          {unit}
                        </p>
                        <p className={`text-3xl font-bold ${colors.text}`}>
                          {count}
                        </p>
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
                            width: `${(count / Math.max(...unitCount.map(([, c]) => c))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{percentage}% total koordinasi</span>
                        <span className={`font-medium ${colors.text}`}>
                          Rank #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Filter Data Koordinasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <Select onValueChange={setSelectedMonth} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {allMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Kerja</label>
            <Select onValueChange={setSelectedUnit} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Unit Kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Unit</SelectItem>
                {allUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Instansi</label>
            <Select onValueChange={setSelectedJenis} defaultValue="all">
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Pilih Jenis Instansi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {allJenisInstansi.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {jenis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Kegiatan Koordinasi</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap kegiatan koordinasi antar instansi</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium">Unit Kerja</th>
                <th className="px-6 py-3 text-left font-medium">Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Jenis Instansi</th>
                <th className="px-6 py-3 text-left font-medium">Topik</th>
                <th className="px-6 py-3 text-left font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {filteredData.map((item, idx) => {
                const unitRank = unitCount.findIndex(([unit]) => unit === item.unit)
                const isTopUnit = unitRank !== -1 && unitRank < 3

                return (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{idx + 1}</td>
                    <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isTopUnit 
                          ? unitRank === 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : unitRank === 1 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.instansi.includes('Kementerian') && <span className="mr-1">🏛️</span>}
                      {item.instansi.includes('Universitas') && <span className="mr-1">🎓</span>}
                      {item.instansi.includes('Pemprov') && <span className="mr-1">🏢</span>}
                      {item.instansi}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenisInstansi === 'Pusat' ? 'bg-green-100 text-green-800' :
                        item.jenisInstansi === 'Daerah' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.jenisInstansi === 'Pusat' ? '🏛️' :
                         item.jenisInstansi === 'Daerah' ? '🏢' : '🎓'} {item.jenisInstansi}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.topik}</td>
                    <td className="px-6 py-4 text-gray-600">{item.catatan}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Proporsi Jenis Instansi
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
            Tren Kegiatan per Bulan
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="value" 
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
    </div>
  )
}
