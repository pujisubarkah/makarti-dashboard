'use client'

import { useState, useEffect } from 'react'
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
import { 
  Lightbulb, 
  Megaphone, 
  Users, 
  BookOpenCheck, 
  TrendingUp, 
  Award, 
  Rocket, 
  Star, 
  Brain,
  Target
} from 'lucide-react'

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6']

interface Kegiatan {
  id: number
  title: string
  date: string
  location: string
  time: string
  type: string
  priority: string
  attendees: number
  description: string
  unit_kerja: string
}

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

// Data Bigger Smarter Better yang dicapai melalui 4 pilar MAKARTI
const biggerSmarterBetterAchievements = [
  {
    category: 'BIGGER',
    subtitle: 'Dampak & Jangkauan',
    description: 'Dicapai melalui Inovasi dan Networking',
    contributingPillars: [
      { pillar: 'Inovasi', contribution: 70, description: '15 inovasi aktif meningkatkan dampak layanan' },
      { pillar: 'Networking', contribution: 65, description: '8 kunjungan instansi memperluas jangkauan' }
    ],
    metrics: [
      { label: 'Penerima Manfaat', value: '12,500', unit: 'orang', progress: 85, source: 'Inovasi & Networking' },
      { label: 'Jangkauan Wilayah', value: '45', unit: 'unit', progress: 90, source: 'Networking' },
      { label: 'Kolaborasi Eksternal', value: '28', unit: 'instansi', progress: 80, source: 'Networking' },
      { label: 'Dampak Sistemik', value: '75', unit: '%', progress: 75, source: 'Inovasi' }
    ],
    overallScore: 82,
    icon: <Rocket className="w-6 h-6" />,
    color: 'blue',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500'
  },
  {
    category: 'SMARTER',
    subtitle: 'Teknologi & Inovasi',
    description: 'Dicapai melalui Inovasi dan Komunikasi & Branding',
    contributingPillars: [
      { pillar: 'Inovasi', contribution: 85, description: 'Inovasi teknologi mendorong transformasi digital' },
      { pillar: 'Komunikasi', contribution: 60, description: '42 postingan komunikasi meningkatkan literasi digital' }
    ],
    metrics: [
      { label: 'Digitalisasi', value: '78', unit: '%', progress: 78, source: 'Inovasi' },
      { label: 'Otomatisasi', value: '65', unit: '%', progress: 65, source: 'Inovasi' },
      { label: 'Data Analytics', value: '72', unit: '%', progress: 72, source: 'Inovasi' },
      { label: 'Literasi Digital', value: '68', unit: '%', progress: 68, source: 'Komunikasi & Branding' }
    ],
    overallScore: 71,
    icon: <Brain className="w-6 h-6" />,
    color: 'purple',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500'
  },
  {
    category: 'BETTER',
    subtitle: 'Kualitas & Efisiensi',
    description: 'Dicapai melalui Learning dan Inovasi',
    contributingPillars: [
      { pillar: 'Learning', contribution: 80, description: '10 kegiatan pembelajaran meningkatkan kualitas SDM' },
      { pillar: 'Inovasi', contribution: 75, description: 'Inovasi mengoptimalkan proses kerja' }
    ],
    metrics: [
      { label: 'Kepuasan Layanan', value: '92', unit: '%', progress: 92, source: 'Learning & Inovasi' },
      { label: 'Efisiensi Proses', value: '85', unit: '%', progress: 85, source: 'Inovasi' },
      { label: 'Kualitas Output', value: '88', unit: '%', progress: 88, source: 'Learning' },
      { label: 'Pengurangan Biaya', value: '35', unit: '%', progress: 70, source: 'Inovasi' }
    ],
    overallScore: 84,
    icon: <Star className="w-6 h-6" />,
    color: 'green',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-500'
  }
]

// Data kontribusi setiap pilar terhadap BSB
const pillarContributionData = [
  { 
    pillar: 'Inovasi', 
    bigger: 70, 
    smarter: 85, 
    better: 75,
    description: '15 inovasi aktif'
  },
  { 
    pillar: 'Komunikasi & Branding', 
    bigger: 45, 
    smarter: 60, 
    better: 50,
    description: '42 postingan komunikasi'
  },
  { 
    pillar: 'Networking', 
    bigger: 65, 
    smarter: 35, 
    better: 40,
    description: '8 kunjungan instansi'
  },
  { 
    pillar: 'Learning', 
    bigger: 55, 
    smarter: 45, 
    better: 80,
    description: '10 kegiatan pembelajaran'
  }
]

export default function RingkasanMakartiPage() {
  const [serapanData, setSerapanData] = useState([
    { name: 'Terserap', value: 375 },
    { name: 'Sisa', value: 125 },
  ])
  const [serapanSummary, setSerapanSummary] = useState({
    total_pagu: 500000000,
    total_realisasi: 375000000,
    total_sisa: 125000000,
    unit_kerja_penginput: []
  })
  const [kegiatanData, setKegiatanData] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [kegiatanLoading, setKegiatanLoading] = useState(true)

  useEffect(() => {
    const fetchSerapanData = async () => {
      try {
        const response = await fetch('/api/serapan/summary')
        const data = await response.json()
        
        setSerapanSummary(data)
        setSerapanData([
          { name: 'Terserap', value: Math.round(data.total_realisasi / 1000000) }, // Convert to millions
          { name: 'Sisa', value: Math.round(data.total_sisa / 1000000) },
        ])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching serapan data:', error)
        setLoading(false)
      }
    }

    const fetchKegiatanData = async () => {
      try {
        const response = await fetch('/api/kegiatan')
        const data = await response.json()
        
        // Filter for today's events
        const today = new Date().toISOString().split('T')[0]
        const todayEvents = data.filter((event: Kegiatan) => {
          const eventDate = new Date(event.date).toISOString().split('T')[0]
          return eventDate === today
        })
        
        setKegiatanData(todayEvents)
        setKegiatanLoading(false)
      } catch (error) {
        console.error('Error fetching kegiatan data:', error)
        setKegiatanLoading(false)
      }
    }

    fetchSerapanData()
    fetchKegiatanData()
  }, [])

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

      {/* Bigger Smarter Better Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bigger Smarter Better</h2>
            <p className="text-gray-600">Dicapai melalui 4 pilar MAKARTI: Inovasi, Komunikasi & Branding, Networking, dan Learning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {biggerSmarterBetterAchievements.map((achievement) => (
            <div key={achievement.category} className={`${achievement.bgLight} rounded-xl p-6 border-l-4 ${achievement.borderColor} hover:shadow-lg transition-all duration-300`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-2xl font-bold ${achievement.textColor}`}>
                    {achievement.category}
                  </h3>
                  <p className="text-sm text-gray-600">{achievement.subtitle}</p>
                </div>
                <div className={`bg-white p-3 rounded-full shadow-md`}>
                  <div className={achievement.textColor}>
                    {achievement.icon}
                  </div>
                </div>
              </div>

              {/* Contributing Pillars */}
              <div className="mb-4 p-3 bg-white rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">{achievement.description}</p>
                <div className="space-y-2">
                  {achievement.contributingPillars.map((pillar, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{pillar.pillar}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${achievement.textColor.replace('text-', 'bg-')}`}
                            style={{ width: `${pillar.contribution}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${achievement.textColor}`}>
                          {pillar.contribution}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className={`text-3xl font-bold ${achievement.textColor}`}>
                    {achievement.overallScore}%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      achievement.overallScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      achievement.overallScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${achievement.overallScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3">
                {achievement.metrics.map((metric, metricIdx) => (
                  <div key={metricIdx} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{metric.label}</span>
                      <span className={`text-sm font-bold ${achievement.textColor}`}>
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">via {metric.source}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-700 ${
                          metric.progress >= 80 ? 'bg-green-500' :
                          metric.progress >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${metric.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Badge */}
              <div className="mt-4 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  achievement.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                  achievement.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {achievement.overallScore >= 80 ? '🎯 Excellent' :
                   achievement.overallScore >= 60 ? '⚡ Good' :
                   '🔄 Needs Improvement'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">82%</div>
              <div className="text-sm opacity-90">BIGGER Score</div>
              <div className="text-xs opacity-75">via Inovasi & Networking</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">71%</div>
              <div className="text-sm opacity-90">SMARTER Score</div>
              <div className="text-xs opacity-75">via Inovasi & Komunikasi</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">84%</div>
              <div className="text-sm opacity-90">BETTER Score</div>
              <div className="text-xs opacity-75">via Learning & Inovasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontribusi Pilar terhadap BSB */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Award className="w-6 h-6 mr-2 text-orange-500" />
          Kontribusi Pilar MAKARTI terhadap Bigger Smarter Better
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pillarContributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="pillar" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [`${value}%`, typeof name === 'string' ? name.toUpperCase() : name]}
              />
              <Legend />
              <Bar dataKey="bigger" fill="#3b82f6" radius={[2, 2, 0, 0]} name="BIGGER" />
              <Bar dataKey="smarter" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="SMARTER" />
              <Bar dataKey="better" fill="#10b981" radius={[2, 2, 0, 0]} name="BETTER" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {pillarContributionData.map((pillar, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg text-center">
              <h4 className="font-medium text-gray-800 text-sm">{pillar.pillar}</h4>
              <p className="text-xs text-gray-600 mt-1">{pillar.description}</p>
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

      {/* Bottom Grid - Updated with Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart - Serapan */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Serapan Anggaran</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
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
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total Pagu: <span className="font-bold">Rp{(serapanSummary.total_pagu / 1000000).toLocaleString()} juta</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Realisasi: <span className="font-bold text-green-600">Rp{(serapanSummary.total_realisasi / 1000000).toLocaleString()} juta</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Persentase Serapan: <span className="font-bold text-green-600">
                      {((serapanSummary.total_realisasi / serapanSummary.total_pagu) * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
                
                {serapanSummary.unit_kerja_penginput.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Unit Kerja Penginput:</h4>
                    <div className="flex flex-wrap gap-2">
                      {serapanSummary.unit_kerja_penginput.map((unit, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Today's Schedule Preview */}
        <div className="bg-white rounded-xl shadow-lg lg:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Jadwal Hari Ini</h2>
            {kegiatanLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-gray-500">Loading jadwal...</div>
              </div>
            ) : kegiatanData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">📅</p>
                  <p>Tidak ada kegiatan hari ini</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {kegiatanData.map((kegiatan: Kegiatan) => (
                  <div key={kegiatan.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{kegiatan.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        kegiatan.priority === 'high' ? 'bg-red-100 text-red-800' :
                        kegiatan.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {kegiatan.priority}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">🕐</span>
                        <span>{kegiatan.time}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">📍</span>
                        <span>{kegiatan.location}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">👥</span>
                        <span>{kegiatan.attendees} peserta</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">🏢</span>
                        <span className="font-medium text-blue-600">{kegiatan.unit_kerja}</span>
                      </div>
                    </div>
                    
                    {kegiatan.description && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700">
                        {kegiatan.description}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        kegiatan.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                        kegiatan.type === 'workshop' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {kegiatan.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BSB Highlights - Compact */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Highlight BSB</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-blue-800 text-sm">BIGGER</h3>
              </div>
              <p className="text-xs text-blue-600">Jangkauan 45 unit dengan 12,500 penerima manfaat</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">82%</div>
                <div className="w-12 bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-purple-800 text-sm">SMARTER</h3>
              </div>
              <p className="text-xs text-purple-600">Digitalisasi 78% dan otomatisasi 65%</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-600">71%</div>
                <div className="w-12 bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-green-600" />
                <h3 className="font-medium text-green-800 text-sm">BETTER</h3>
              </div>
              <p className="text-xs text-green-600">Kepuasan layanan 92% dan efisiensi 85%</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">84%</div>
                <div className="w-12 bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
