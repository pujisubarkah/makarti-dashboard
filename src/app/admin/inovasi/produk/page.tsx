'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const dataProduk = [
  {
    id: 1,
    nama: 'Sistem e-Integritas',
    unit: 'Pusat A',
    jenis: 'Aplikasi Digital',
    status: 'Aktif Digunakan',
    tanggalRilis: '2024-10-01',
    keterangan: 'Sistem pelaporan benturan kepentingan',
  },
  {
    id: 2,
    nama: 'Dashboard Evaluasi Kinerja',
    unit: 'Pusat B',
    jenis: 'Dashboard',
    status: 'Uji Coba',
    tanggalRilis: '2025-02-15',
    keterangan: 'Dashboard pemantauan real-time capaian SKP',
  },
  {
    id: 3,
    nama: 'Modul Transformasi Digital ASN',
    unit: 'Pusat A',
    jenis: 'Modul Pelatihan',
    status: 'Aktif Digunakan',
    tanggalRilis: '2025-03-10',
    keterangan: 'Modul pelatihan digitalisasi layanan publik',
  },
  {
    id: 4,
    nama: 'Template SOP Pelayanan Prima',
    unit: 'Pusat C',
    jenis: 'SOP',
    status: 'Arsip',
    tanggalRilis: '2023-12-20',
    keterangan: 'Template standar pelayanan untuk unit teknis',
  },
]

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f472b6']

const summaryCards = [
  { 
    label: 'Total Produk Inovasi', 
    value: dataProduk.length,
    icon: '🚀',
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500'
  },
  { 
    label: 'Produk Aktif', 
    value: dataProduk.filter(d => d.status === 'Aktif Digunakan').length,
    icon: '✅',
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500'
  },
  { 
    label: 'Jenis Digital', 
    value: dataProduk.filter(d => d.jenis.includes('Digital') || d.jenis === 'Dashboard').length,
    icon: '💻',
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500'
  },
  { 
    label: 'Kolaborasi Unit', 
    value: new Set(dataProduk.map(d => d.unit)).size,
    icon: '🤝',
    color: 'orange',
    bgGradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    textDark: 'text-orange-800',
    borderColor: 'border-orange-500'
  },
]

const pieData = Object.entries(
  dataProduk.reduce((acc, curr) => {
    acc[curr.jenis] = (acc[curr.jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([key, value]) => ({ name: key, value }))

const barData = Object.entries(
  dataProduk.reduce((acc, curr) => {
    acc[curr.unit] = (acc[curr.unit] || 0) + 1
    return acc
  }, {} as Record<string, number>)
).map(([unit, jumlah]) => ({ unit, jumlah }))

export default function ProdukInovasiPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Produk Inovasi</h1>
        <p className="text-blue-600">Pantau dan kelola produk inovasi di seluruh unit kerja</p>
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

      {/* Additional Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Produk Inovasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-indigo-600">
              {((dataProduk.filter(d => d.status === 'Aktif Digunakan').length / dataProduk.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-indigo-800">Tingkat Adopsi</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-emerald-600">
              {dataProduk.filter(d => d.jenis.includes('Digital') || d.jenis === 'Dashboard' || d.jenis === 'Aplikasi Digital').length}
            </div>
            <div className="text-sm text-emerald-800">Solusi Digital</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-amber-600">
              {new Date().getFullYear() - Math.min(...dataProduk.map(d => new Date(d.tanggalRilis).getFullYear()))}
            </div>
            <div className="text-sm text-amber-800">Tahun Inovasi</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Detail Produk Inovasi</h2>
          <p className="text-blue-100 text-sm">Daftar lengkap produk inovasi per unit kerja</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th className="px-6 py-3 text-left font-medium">Nama Produk</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-left font-medium">Jenis</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Tanggal Rilis</th>
                <th className="px-6 py-3 text-left font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {dataProduk.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.jenis.includes('Digital') || item.jenis === 'Dashboard' ? 'bg-purple-100 text-purple-800' :
                      item.jenis === 'Modul Pelatihan' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.jenis.includes('Digital') || item.jenis === 'Dashboard' ? '💻' :
                       item.jenis === 'Modul Pelatihan' ? '📚' : '📋'} {item.jenis}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Aktif Digunakan' ? 'bg-green-100 text-green-800' :
                      item.status === 'Uji Coba' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'Aktif Digunakan' ? '✅' :
                       item.status === 'Uji Coba' ? '🔬' : '📦'} {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.tanggalRilis}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">🥧</span>
            Distribusi Jenis Produk
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
            Produk per Unit Kerja
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="jumlah" 
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
