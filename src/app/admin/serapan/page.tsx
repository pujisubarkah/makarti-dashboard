'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const dataSerapan = [
  { unit: 'Unit A', anggaran: 500_000_000, realisasi: 450_000_000 },
  { unit: 'Unit B', anggaran: 500_000_000, realisasi: 320_000_000 },
  { unit: 'Unit C', anggaran: 500_000_000, realisasi: 220_000_000 },
  { unit: 'Unit D', anggaran: 300_000_000, realisasi: 250_000_000 },
]

function getPersentase(realisasi: number, anggaran: number) {
  return Math.round((realisasi / anggaran) * 100)
}

function getStatusColor(persen: number) {
  if (persen >= 80) return 'bg-green-500'
  if (persen >= 60) return 'bg-yellow-400'
  return 'bg-red-500'
}

const COLORS = ['#4ade80', '#e2e8f0'] // hijau & abu-abu

export default function SerapanTablePage() {
  const [selectedUnit, setSelectedUnit] = useState<null | typeof dataSerapan[0]>(null)

  const handleRowClick = (unit: typeof dataSerapan[0]) => {
    setSelectedUnit(unit)
  }

  // Hitung summary data
  const totalAnggaran = dataSerapan.reduce((sum, item) => sum + item.anggaran, 0)
  const totalRealisasi = dataSerapan.reduce((sum, item) => sum + item.realisasi, 0)
  const sisaAnggaran = totalAnggaran - totalRealisasi
  const rataRataSerapan = Math.round((totalRealisasi / totalAnggaran) * 100)
  
  // Hitung unit berdasarkan status
  const unitBaik = dataSerapan.filter(item => getPersentase(item.realisasi, item.anggaran) >= 80).length
  const unitCukup = dataSerapan.filter(item => {
    const persen = getPersentase(item.realisasi, item.anggaran)
    return persen >= 60 && persen < 80
  }).length
  const unitKurang = dataSerapan.filter(item => getPersentase(item.realisasi, item.anggaran) < 60).length

  const pieData =
    selectedUnit && [
      {
        name: 'Realisasi',
        value: selectedUnit.realisasi,
      },
      {
        name: 'Sisa Anggaran',
        value: selectedUnit.anggaran - selectedUnit.realisasi,
      },
    ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Dashboard Serapan Anggaran</h1>

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
            {rataRataSerapan}% dari total anggaran
          </p>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-800 text-sm font-medium">Sisa Anggaran</p>
              <p className="text-2xl font-bold text-orange-600">
                Rp {(sisaAnggaran / 1_000_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-orange-600 text-xs mt-2">
            {100 - rataRataSerapan}% belum terserap
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
          </div>
          <p className="text-purple-600 text-xs mt-2">
            Dari {dataSerapan.length} unit kerja
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
      </div>

      {/* Tabel Serapan */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-blue-50 border-b">
          <h2 className="text-xl font-bold text-blue-800">Detail Serapan per Unit</h2>
          <p className="text-sm text-blue-600">Klik pada baris untuk melihat detail grafik</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">Unit Kerja</th>
                <th className="px-6 py-3 text-right">Total Anggaran</th>
                <th className="px-6 py-3 text-right">Realisasi</th>
                <th className="px-6 py-3 text-right">Persentase</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataSerapan.map((item, index) => {
                const persen = getPersentase(item.realisasi, item.anggaran)
                const badgeColor = getStatusColor(persen)
                const isSelected = selectedUnit?.unit === item.unit
                
                return (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      isSelected ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      Rp {item.anggaran.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      Rp {item.realisasi.toLocaleString('id-ID')}
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie Chart */}
      {selectedUnit && (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Detail Serapan - {selectedUnit.unit}
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
                    <span className="font-medium">Rp {selectedUnit.anggaran.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Realisasi:</span>
                    <span className="font-medium text-green-600">Rp {selectedUnit.realisasi.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sisa:</span>
                    <span className="font-medium text-orange-600">
                      Rp {(selectedUnit.anggaran - selectedUnit.realisasi).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Persentase Serapan:</span>
                    <span className="font-bold text-blue-600">
                      {getPersentase(selectedUnit.realisasi, selectedUnit.anggaran)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
