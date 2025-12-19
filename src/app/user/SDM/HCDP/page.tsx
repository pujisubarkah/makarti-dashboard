'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Award, Target, Shield, Lightbulb, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import RadarChart from '@/components/RadarChart'
import HeatmapChart from '@/components/HeatmapChart'
import StackedBarChart from '@/components/StackedBarChart'
import TalentFunnel from '@/components/TalentFunnel'
import GaugeChart from '@/components/GaugeChart'
import TrendChart from '@/components/TrendChart'

export default function HCDPPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Human Capital Development Plan (HCDP)
        </h1>
        <p className="text-gray-600 mt-2">
          Dashboard analitik pengembangan kompetensi dan talent SDM
        </p>
      </div>

      {/* 4 Index Cards in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-4 h-4" />
              Overall Index
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-900">85.2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">Index keseluruhan kompetensi</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-purple-700">
              <Award className="w-4 h-4" />
              Teknis
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-900">82.7</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">Kompetensi teknis</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-green-700">
              <Target className="w-4 h-4" />
              Manajerial
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-900">88.5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">Kompetensi manajerial</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2 text-orange-700">
              <Shield className="w-4 h-4" />
              Integritas
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-orange-900">91.3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">Index integritas</p>
          </CardContent>
        </Card>
      </div>

      {/* Hard Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Radar Chart Kompetensi</CardTitle>
            <CardDescription>Distribusi kompetensi hard skill berdasarkan area</CardDescription>
          </CardHeader>
          <CardContent>
            <RadarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heatmap Unit vs Skill</CardTitle>
            <CardDescription>Pemetaan kompetensi per unit organisasi</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart />
          </CardContent>
        </Card>
      </div>

      {/* Manajerial Competencies Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stacked Bar Leadership</CardTitle>
            <CardDescription>Distribusi kompetensi kepemimpinan</CardDescription>
          </CardHeader>
          <CardContent>
            <StackedBarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talent Funnel</CardTitle>
            <CardDescription>Pipeline pengembangan talent</CardDescription>
          </CardHeader>
          <CardContent>
            <TalentFunnel />
          </CardContent>
        </Card>
      </div>

      {/* Soft Skills - Integritas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gauge Integritas</CardTitle>
            <CardDescription>Skor integritas organisasi</CardDescription>
          </CardHeader>
          <CardContent>
            <GaugeChart value={91.3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Budaya</CardTitle>
            <CardDescription>Perkembangan budaya organisasi</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan Singkat</CardTitle>
            <CardDescription>Highlights & insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-medium text-blue-900">Peningkatan Signifikan</p>
                <p className="text-xs text-blue-700 mt-1">Kompetensi kepemimpinan meningkat 12% dari kuartal sebelumnya</p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm font-medium text-green-900">Target Tercapai</p>
                <p className="text-xs text-green-700 mt-1">85% pegawai telah menyelesaikan program pengembangan</p>
              </div>
              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                <p className="text-sm font-medium text-amber-900">Area Perhatian</p>
                <p className="text-xs text-amber-700 mt-1">Kompetensi digital perlu ditingkatkan di Unit TI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">Insights Kunci</CardTitle>
          </div>
          <CardDescription>Analisis mendalam dari data kompetensi SDM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Tren Positif Kompetensi</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Kompetensi manajerial menunjukkan peningkatan <span className="font-semibold text-blue-600">12%</span> dalam 6 bulan terakhir, 
                    terutama pada aspek kepemimpinan strategis dan pengambilan keputusan.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-blue-600">88.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Integritas Tinggi</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Skor integritas organisasi mencapai <span className="font-semibold text-orange-600">91.3%</span>, 
                    melampaui target nasional sebesar 90%. Budaya organisasi yang kuat mendukung peningkatan ini.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-orange-600">91.3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Gap Kompetensi Teknis</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Unit TI menunjukkan gap kompetensi digital dengan skor <span className="font-semibold text-red-600">76%</span>. 
                    Diperlukan program pelatihan intensif untuk meningkatkan kemampuan teknologi terkini.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                    <span className="text-xs font-medium text-red-600">76%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Talent Pipeline Kuat</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-green-600">125 high potential</span> pegawai telah diidentifikasi untuk 
                    pengembangan kepemimpinan, dengan <span className="font-semibold text-green-600">15 kandidat</span> siap untuk posisi kunci.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-green-100 rounded text-green-700 font-medium">50% High Potential</span>
                    <span className="px-2 py-1 bg-blue-100 rounded text-blue-700 font-medium">6% Ready Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-900">Rekomendasi Aksi</CardTitle>
          </div>
          <CardDescription>Langkah strategis untuk pengembangan SDM berkelanjutan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* High Priority Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  PRIORITAS TINGGI
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Program Transformasi Digital Unit TI</h5>
                    <p className="text-sm text-gray-600">
                      Luncurkan bootcamp intensif untuk meningkatkan kompetensi cloud computing, cybersecurity, 
                      dan AI/ML di Unit TI. Target peningkatan skor dari 76% ke 85% dalam 6 bulan.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: 6 bulan</span>
                      <span>•</span>
                      <span>Budget: Tinggi</span>
                      <span>•</span>
                      <span>Impact: Sangat Tinggi</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Succession Planning untuk Key Positions</h5>
                    <p className="text-sm text-gray-600">
                      Percepat program mentoring dan job rotation untuk 15 kandidat yang telah siap mengisi posisi kunci. 
                      Implementasi Individual Development Plan (IDP) yang terstruktur.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: 3 bulan</span>
                      <span>•</span>
                      <span>Budget: Sedang</span>
                      <span>•</span>
                      <span>Impact: Tinggi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Priority Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  PRIORITAS MENENGAH
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Leadership Development Program Lanjutan</h5>
                    <p className="text-sm text-gray-600">
                      Pertahankan momentum peningkatan kompetensi kepemimpinan dengan program advanced leadership 
                      untuk 125 high potential pegawai. Focus pada strategic thinking dan change management.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: 12 bulan</span>
                      <span>•</span>
                      <span>Budget: Tinggi</span>
                      <span>•</span>
                      <span>Impact: Tinggi</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Cross-Functional Skills Enhancement</h5>
                    <p className="text-sm text-gray-600">
                      Tingkatkan kolaborasi antar unit dengan program job shadowing dan cross-training. 
                      Fokus pada area komunikasi dan teamwork yang sudah menunjukkan skor tinggi (90%+).
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: 9 bulan</span>
                      <span>•</span>
                      <span>Budget: Rendah</span>
                      <span>•</span>
                      <span>Impact: Sedang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  QUICK WINS
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Reward & Recognition Program</h5>
                    <p className="text-sm text-gray-600">
                      Implementasi program penghargaan untuk mempertahankan skor integritas tinggi (91.3%). 
                      Publikasikan best practices dan role models di seluruh organisasi.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: 1 bulan</span>
                      <span>•</span>
                      <span>Budget: Rendah</span>
                      <span>•</span>
                      <span>Impact: Sedang</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
                  <ArrowRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">Monthly Knowledge Sharing Sessions</h5>
                    <p className="text-sm text-gray-600">
                      Adakan sesi berbagi pengetahuan bulanan antar unit untuk transfer kompetensi best-in-class. 
                      Dorong peer-to-peer learning dan communities of practice.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Timeline: Ongoing</span>
                      <span>•</span>
                      <span>Budget: Sangat Rendah</span>
                      <span>•</span>
                      <span>Impact: Sedang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
