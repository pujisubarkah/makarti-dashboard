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
          <h2 className="text-xl font-bold mb-4 text-gray-800">Highlight: Pilar MAKARTI → Bigger Smarter Better</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="bg-blue-500 rounded-full p-2">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">BIGGER: Melalui Inovasi & Networking</h3>
                <p className="text-sm text-blue-600">15 inovasi dan 8 kunjungan instansi menghasilkan jangkauan 45 unit dengan 12,500 penerima manfaat</p>
                <p className="text-xs text-blue-500 mt-1">Kontribusi: Inovasi 70% • Networking 65%</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <div className="bg-purple-500 rounded-full p-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-purple-800">SMARTER: Melalui Inovasi & Komunikasi</h3>
                <p className="text-sm text-purple-600">Inovasi teknologi dan 42 komunikasi mencapai digitalisasi 78% dan literasi digital 68%</p>
                <p className="text-xs text-purple-500 mt-1">Kontribusi: Inovasi 85% • Komunikasi 60%</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="bg-green-500 rounded-full p-2">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">BETTER: Melalui Learning & Inovasi</h3>
                <p className="text-sm text-green-600">10 kegiatan pembelajaran dan inovasi menghasilkan kepuasan layanan 92% dan efisiensi 85%</p>
                <p className="text-xs text-green-500 mt-1">Kontribusi: Learning 80% • Inovasi 75%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
