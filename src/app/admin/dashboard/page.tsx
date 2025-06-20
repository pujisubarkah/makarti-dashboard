'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { Lightbulb, Megaphone, Users, BookOpenCheck, TrendingUp, Award } from 'lucide-react'

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

const summaryData = [
  { 
    title: 'Jumlah Inovasi Aktif', 
    value: 15, 
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-100',
    textColor: 'text-blue-600',
    textDark: 'text-blue-800',
    borderColor: 'border-blue-500',
    change: '+12%',
    changeType: 'increase'
  },
  { 
    title: 'Postingan Komunikasi', 
    value: 42, 
    icon: <Megaphone className="w-6 h-6" />,
    color: 'green',
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-100',
    textColor: 'text-green-600',
    textDark: 'text-green-800',
    borderColor: 'border-green-500',
    change: '+8%',
    changeType: 'increase'
  },
  { 
    title: 'Kunjungan Instansi', 
    value: 8, 
    icon: <Users className="w-6 h-6" />,
    color: 'yellow',
    bgGradient: 'from-yellow-500 to-yellow-600',
    bgLight: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    textDark: 'text-yellow-800',
    borderColor: 'border-yellow-500',
    change: '+25%',
    changeType: 'increase'
  },
  { 
    title: 'Kegiatan Pembelajaran', 
    value: 10, 
    icon: <BookOpenCheck className="w-6 h-6" />,
    color: 'purple',
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-100',
    textColor: 'text-purple-600',
    textDark: 'text-purple-800',
    borderColor: 'border-purple-500',
    change: '+5%',
    changeType: 'increase'
  },
]

const makartiChart = [
  { name: 'Inovasi', Januari: 2, Februari: 4, Maret: 5 },
  { name: 'Komunikasi', Januari: 3, Februari: 6, Maret: 8 },
  { name: 'Networking', Januari: 1, Februari: 2, Maret: 4 },
  { name: 'Learning', Januari: 4, Februari: 6, Maret: 5 },
]

const trendData = [
  { bulan: 'Jan', total: 10 },
  { bulan: 'Feb', total: 18 },
  { bulan: 'Mar', total: 22 },
  { bulan: 'Apr', total: 28 },
  { bulan: 'Mei', total: 35 },
  { bulan: 'Jun', total: 42 },
]

const serapanData = [
  { name: 'Terserap', value: 375 },
  { name: 'Sisa', value: 125 },
]

const targetAchievements = [
  {
    category: 'Inovasi',
    target: 20,
    achieved: 15,
    percentage: 75,
    color: 'blue'
  },
  {
    category: 'Komunikasi',
    target: 50,
    achieved: 42,
    percentage: 84,
    color: 'green'
  },
  {
    category: 'Networking',
    target: 10,
    achieved: 8,
    percentage: 80,
    color: 'yellow'
  },
  {
    category: 'Learning',
    target: 12,
    achieved: 10,
    percentage: 83,
    color: 'purple'
  },
]

export default function RingkasanMakartiPage() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard MAKARTI</h1>
        <p className="text-blue-600">Monitoring, Analisis, Kolaborasi, Adaptasi, Riset, Transformasi, dan Inovasi</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${item.borderColor} hover:scale-105 group overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.textDark} mb-1`}>
                    {item.title}
                  </p>
                  <p className={`text-3xl font-bold ${item.textColor} mb-2`}>
                    {item.value}
                  </p>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">
                      {item.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
                  </div>
                </div>
                <div className={`${item.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  <div className={item.textColor}>
                    {item.icon}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${item.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((item.value / Math.max(...summaryData.map(c => c.value))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Performance</span>
                  <span className={`font-medium ${item.textColor}`}>
                    📈 Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Achievements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="w-6 h-6 mr-2 text-yellow-500" />
          Pencapaian Target MAKARTI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {targetAchievements.map((achievement, index) => (
            <div key={achievement.category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">{achievement.category}</h3>
                <span className={`text-sm font-bold ${
                  achievement.percentage >= 80 ? 'text-green-600' :
                  achievement.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {achievement.percentage}%
                </span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      achievement.percentage >= 80 ? 'bg-green-500' :
                      achievement.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${achievement.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {achievement.achieved} dari {achievement.target} target
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-blue-500" />
            Tren Kinerja Tiap Pilar (Jan–Mar)
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={makartiChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Januari" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Februari" fill="#34d399" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Maret" fill="#fbbf24" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Trend */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
            Tren Pertumbuhan Total Kegiatan
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Serapan */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Serapan Anggaran</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serapanData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {serapanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`Rp${value} juta`, 'Jumlah']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Anggaran: <span className="font-bold">Rp500 juta</span></p>
            <p className="text-sm text-gray-600">Persentase Serapan: <span className="font-bold text-green-600">75%</span></p>
          </div>
        </div>

        {/* Monthly Highlights */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Highlight Bulan Ini</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-500 rounded-full p-2">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Inovasi Digital Terbaru</h3>
                <p className="text-sm text-blue-600">Implementasi 3 sistem baru untuk meningkatkan efisiensi pelayanan</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-500 rounded-full p-2">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Kampanye Komunikasi</h3>
                <p className="text-sm text-green-600">Engagement rate meningkat 25% dari publikasi konten edukasi</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-500 rounded-full p-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Kolaborasi Strategis</h3>
                <p className="text-sm text-yellow-600">MoU dengan 2 instansi baru untuk pengembangan kapasitas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-500 rounded-full p-2">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-purple-800">Program Pembelajaran</h3>
                <p className="text-sm text-purple-600">5 workshop dengan tingkat kepuasan peserta 95%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
