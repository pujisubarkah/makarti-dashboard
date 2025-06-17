'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const dataPublikasi = [
  {
    id: 1,
    judul: 'Peluncuran Inovasi Pelayanan',
    tanggal: '2025-05-20',
    jenis: 'Media Online',
    unit: 'Unit A',
    link: '#',
  },
  {
    id: 2,
    judul: 'Live IG Sosialisasi Kebijakan',
    tanggal: '2025-05-18',
    jenis: 'Instagram',
    unit: 'Unit B',
    link: '#',
    likes: 300,
    views: 5000,
  },
  {
    id: 3,
    judul: 'Berita Peliputan oleh Metro TV',
    tanggal: '2025-05-15',
    jenis: 'Media Massa',
    unit: 'Unit C',
    link: '#',
  },
  {
    id: 4,
    judul: 'Artikel Website Resmi',
    tanggal: '2025-05-10',
    jenis: 'Website',
    unit: 'Unit A',
    link: '#',
  },
]

const COLORS = ['#60a5fa', '#f472b6', '#34d399', '#facc15']

export default function MediaPage() {
  const mediaCount = dataPublikasi.reduce((acc, item) => {
    acc[item.jenis] = (acc[item.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(mediaCount).map(([key, value]) => ({
    name: key,
    value,
  }))

  const summaryCards = [
    { label: 'Total Publikasi', value: dataPublikasi.length },
    { label: 'Instagram', value: mediaCount['Instagram'] || 0 },
    {
      label: 'Total Likes (Instagram)',
      value:
        dataPublikasi
          .filter(d => d.jenis === 'Instagram')
          .reduce((a, b) => a + (b.likes || 0), 0),
    },
    {
      label: 'Avg Engagement (Instagram)',
      value: (() => {
        const ig = dataPublikasi.filter(d => d.jenis === 'Instagram' && d.views && d.views > 0)
        if (ig.length === 0) return '-'
        const totalEngagement = ig.reduce(
          (sum, item) => sum + (item.likes! / item.views!) * 100,
          0
        )
        return `${(totalEngagement / ig.length).toFixed(1)}%`
      })(),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Publikasi & Media</h1>

      {/* Summary Cards */}
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

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Jenis Media</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-right">Likes</th>
              <th className="px-4 py-2 text-right">Views</th>
              <th className="px-4 py-2 text-right">Engagement</th>
              <th className="px-4 py-2 text-center">Link</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dataPublikasi.map((item, index) => {
              const isInstagram = item.jenis === 'Instagram'
              const engagement =
                isInstagram && item.views
                  ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                  : '-'

              return (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.judul}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">{item.jenis}</td>
                  <td className="px-4 py-2">{item.unit}</td>
                  <td className="px-4 py-2 text-right">{isInstagram ? item.likes : '-'}</td>
                  <td className="px-4 py-2 text-right">{isInstagram ? item.views : '-'}</td>
                  <td className="px-4 py-2 text-right">{engagement}</td>
                  <td className="px-4 py-2 text-center">
                    <a href={item.link} className="text-blue-600 underline">
                      Lihat
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Proporsi Jenis Media
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
    </div>
  )
}
