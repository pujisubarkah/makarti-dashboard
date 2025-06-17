'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataInovasi = [
  {
    id: 1,
    judul: 'Digitalisasi Formulir Pelayanan',
    pengusul: 'Unit A',
    tahap: 'Implementasi',
    tanggal: '2025-04-01',
    indikator: 'Waktu proses berkurang 40%',
  },
  {
    id: 2,
    judul: 'Aplikasi Penilaian Mandiri ASN',
    pengusul: 'Unit B',
    tahap: 'Uji Coba',
    tanggal: '2025-03-12',
    indikator: 'Uji coba pada 3 unit kerja',
  },
  {
    id: 3,
    judul: 'Bot Konsultasi Kebijakan',
    pengusul: 'Unit C',
    tahap: 'Ide',
    tanggal: '2025-05-05',
    indikator: 'Belum direncanakan lebih lanjut',
  },
  {
    id: 4,
    judul: 'Sistem Pelacakan Surat Masuk',
    pengusul: 'Unit A',
    tahap: 'Perencanaan',
    tanggal: '2025-04-20',
    indikator: 'Target uji coba Juni 2025',
  },
  {
    id: 5,
    judul: 'Dashboard Kinerja Pegawai',
    pengusul: 'Unit B',
    tahap: 'Implementasi',
    tanggal: '2025-03-28',
    indikator: 'Sudah diakses oleh 80% pegawai',
  },
]

const summaryCards = [
  { label: 'Total Inovasi', value: dataInovasi.length },
  {
    label: 'Tahap Ide',
    value: dataInovasi.filter(d => d.tahap === 'Ide').length,
  },
  {
    label: 'Tahap Uji Coba',
    value: dataInovasi.filter(d => d.tahap === 'Uji Coba').length,
  },
  {
    label: 'Sudah Implementasi',
    value: dataInovasi.filter(d => d.tahap === 'Implementasi').length,
  },
]

const tahapCount = dataInovasi.reduce((acc, curr) => {
  acc[curr.tahap] = (acc[curr.tahap] || 0) + 1
  return acc
}, {} as Record<string, number>)

const pieData = Object.entries(tahapCount).map(([key, value]) => ({
  name: key,
  value,
}))

const COLORS = ['#fbbf24', '#60a5fa', '#34d399', '#f472b6']

export default function InovasiPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Inovasi & Kinerja</h1>

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

      {/* Tabel */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Judul Inovasi</th>
              <th className="px-4 py-2 text-left">Pengusul</th>
              <th className="px-4 py-2 text-left">Tahap</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Indikator Kinerja</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataInovasi.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.judul}</td>
                <td className="px-4 py-2">{item.pengusul}</td>
                <td className="px-4 py-2">{item.tahap}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.indikator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Distribusi Tahapan Inovasi
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
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
  )
}
