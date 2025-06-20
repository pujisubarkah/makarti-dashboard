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
} from 'recharts'

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

  // Dapatkan daftar penyelenggara unik
  const penyelenggaraList = Array.from(
    new Set(data.map((item) => item.users?.unit_kerja || 'Lainnya'))
  )

  // Filter berdasarkan penyelenggara
  const filteredData =
    selectedPenyelenggara === 'Semua'
      ? data
      : data.filter((item) => item.users?.unit_kerja === selectedPenyelenggara)

  const totalPeserta = filteredData.reduce((acc, item) => acc + item.jumlahPeserta, 0)

  const summaryCards = [
    { label: 'Total Kegiatan', value: filteredData.length },
    { label: 'Total Peserta', value: totalPeserta },
    {
      label: 'Jenis Terbanyak',
      value:
        Object.entries(
          filteredData.reduce((acc, curr) => {
            const jenis = curr.jenis_bangkom_non_pelatihan?.jenis_bangkom || 'Lainnya'
            acc[jenis] = (acc[jenis] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
    },
  ]

  const barData = filteredData
    .sort((a, b) => b.jumlahPeserta - a.jumlahPeserta)
    .map((item) => ({
      name: item.namaKegiatan,
      peserta: item.jumlahPeserta,
    }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Jumlah Peserta Pelatihan</h1>

      

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 text-center border border-gray-100"
          >
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-2xl font-semibold text-blue-600">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Penyelenggara */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Unit Kerja:</label>
        <select
          value={selectedPenyelenggara}
          onChange={(e) => setSelectedPenyelenggara(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="Semua">Semua</option>
          {penyelenggaraList.map((nama, i) => (
            <option key={i} value={nama}>
              {nama}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        {loading ? (
          <div className="text-center text-gray-500">Memuat data...</div>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
            <thead className="bg-blue-100 text-sm text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Nama Kegiatan</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Jenis</th>
                <th className="px-4 py-2 text-left">Penyelenggara</th>
                <th className="px-4 py-2 text-right">Jumlah Peserta</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.namaKegiatan}</td>
                  <td className="px-4 py-2">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    {item.jenis_bangkom_non_pelatihan?.jenis_bangkom || '-'}
                  </td>
                  <td className="px-4 py-2">{item.users?.unit_kerja || '-'}</td>
                  <td className="px-4 py-2 text-right">{item.jumlahPeserta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Top Kegiatan Berdasarkan Jumlah Peserta
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="peserta" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
