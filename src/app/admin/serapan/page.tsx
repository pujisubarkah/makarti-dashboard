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
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Tabel Serapan Anggaran</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Unit Kerja</th>
              <th className="px-4 py-2 text-right">Total Anggaran</th>
              <th className="px-4 py-2 text-right">Realisasi</th>
              <th className="px-4 py-2 text-right">Persentase</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataSerapan.map((item, index) => {
              const persen = getPersentase(item.realisasi, item.anggaran)
              const badgeColor = getStatusColor(persen)
              return (
                <tr
                  key={index}
                  className="border-t cursor-pointer hover:bg-blue-50"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.unit}</td>
                  <td className="px-4 py-2 text-right">
                    Rp {item.anggaran.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    Rp {item.realisasi.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-right">{persen}%</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}
                      title={
                        persen >= 80
                          ? 'Baik'
                          : persen >= 60
                          ? 'Cukup'
                          : 'Perlu Perhatian'
                      }
                    ></span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      {selectedUnit && (
        <div className="mt-8 bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Grafik Serapan - {selectedUnit.unit}
          </h2>
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
        </div>
      )}
    </div>
  )
}
