'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

const dataPelatihan = [
  { id: 1, nama: 'Aulia Rahman', unit: 'Humas', judul: 'Pelatihan Komunikasi Publik', jam: 6, tanggal: '2025-05-10' },
  { id: 2, nama: 'Intan Sari', unit: 'Kepegawaian', judul: 'Manajemen SDM', jam: 8, tanggal: '2025-05-12' },
  { id: 3, nama: 'Rizky Ananda', unit: 'Kepegawaian', judul: 'Evaluasi Kinerja ASN', jam: 7, tanggal: '2025-05-18' },
  { id: 4, nama: 'Dian Setiawan', unit: 'Humas', judul: 'Teknik Desain Grafis', jam: 5, tanggal: '2025-05-20' },
  { id: 5, nama: 'Nina Putri', unit: 'IT', judul: 'Pelatihan Keamanan Siber', jam: 10, tanggal: '2025-06-02' },
  { id: 6, nama: 'Reza Maulana', unit: 'IT', judul: 'Pengembangan Aplikasi Internal', jam: 12, tanggal: '2025-06-05' },
]

// Ringkasan
const totalJam = dataPelatihan.reduce((sum, item) => sum + item.jam, 0)
const totalPegawai = new Set(dataPelatihan.map(d => d.nama)).size
const totalUnit = new Set(dataPelatihan.map(d => d.unit)).size

const summaryCards = [
  { label: 'Total Pelatihan', value: dataPelatihan.length },
  { label: 'Total Peserta', value: totalPegawai },
  { label: 'Rata-rata Jam per Pegawai', value: (totalJam / totalPegawai).toFixed(1) },
  { label: 'Unit Terlibat', value: totalUnit },
]

// Data rata-rata jam per unit untuk grafik
const unitGroups: Record<string, number[]> = {}
dataPelatihan.forEach(item => {
  if (!unitGroups[item.unit]) unitGroups[item.unit] = []
  unitGroups[item.unit].push(item.jam)
})
const barData = Object.entries(unitGroups).map(([unit, jams]) => ({
  unit,
  rataJam: (jams.reduce((a, b) => a + b, 0) / jams.length).toFixed(1),
}))

export default function PelatihanPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Pelatihan & Learning</h1>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Tabel Pelatihan */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Nama Pegawai</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Judul Pelatihan</th>
              <th className="px-4 py-2 text-left">Jam</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataPelatihan.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2">{item.judul}</td>
                <td className="px-4 py-2">{item.jam}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grafik Rata-rata Jam per Unit */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Rata-rata Jam Pelatihan per Unit Kerja
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="unit" />
              <YAxis label={{ value: 'Jam', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rataJam" fill="#60a5fa" name="Rata-rata Jam" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
