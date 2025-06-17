'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const dataPelatihanPeserta = [
  {
    id: 1,
    nama: 'Webinar Transformasi Digital',
    tanggal: '2025-05-10',
    jenis: 'Webinar',
    jumlahPeserta: 120,
    penyelenggara: 'Pusdiklat',
  },
  {
    id: 2,
    nama: 'Workshop Kepemimpinan',
    tanggal: '2025-05-12',
    jenis: 'Seminar',
    jumlahPeserta: 45,
    penyelenggara: 'LAN Pusat',
  },
  {
    id: 3,
    nama: 'Pelatihan Menulis Policy Brief',
    tanggal: '2025-05-15',
    jenis: 'Zoom',
    jumlahPeserta: 80,
    penyelenggara: 'Biro Humas',
  },
  {
    id: 4,
    nama: 'Sosialisasi Reformasi Birokrasi',
    tanggal: '2025-05-18',
    jenis: 'Sosialisasi',
    jumlahPeserta: 65,
    penyelenggara: 'LAN Pusat',
  },
]

const totalPeserta = dataPelatihanPeserta.reduce((acc, item) => acc + item.jumlahPeserta, 0)

const summaryCards = [
  { label: 'Total Kegiatan', value: dataPelatihanPeserta.length },
  { label: 'Total Peserta', value: totalPeserta },
  {
    label: 'Jenis Terbanyak',
    value:
      Object.entries(
        dataPelatihanPeserta.reduce((acc, curr) => {
          acc[curr.jenis] = (acc[curr.jenis] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
  },
]

const barData = dataPelatihanPeserta
  .sort((a, b) => b.jumlahPeserta - a.jumlahPeserta)
  .map((item) => ({
    name: item.nama,
    peserta: item.jumlahPeserta,
  }))

export default function PesertaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Jumlah Peserta Pelatihan</h1>

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

      {/* Tabel */}
      <div className="overflow-x-auto mb-8">
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
            {dataPelatihanPeserta.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">{item.penyelenggara}</td>
                <td className="px-4 py-2 text-right">{item.jumlahPeserta}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
