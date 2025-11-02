
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';

// Types untuk data IDP
interface Goal {
  kompetensi: string;
  alasan: string;
  target: string;
  indikator: string;
}

interface Plan {
  id: number;
  title: string;
  description?: string;
}

interface AiSuggestion {
  goals?: Goal[];
  activities?: Activity[];
}

interface Activity {
  jenis: string;
  judul: string;
  penyelenggara: string;
}

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  unit_kerja_id: number;
  jabatan: string;
  golongan: string;
  eselon: string;
}

interface User {
  id: number;
  username: string;
  alias: string;
  pegawai_pegawai_nipTousers: Pegawai;
}

interface IdpData {
  id: number;
  user_id: number;
  tahun: number;
  strength: string;
  weakness: string;
  opportunities: string;
  threats: string;
  goals: Goal[];
  activities: Activity[];
  plans: Plan[];
  ai_result: string | null;
  ai_suggestions: AiSuggestion;
  status: string;
  created_at: string;
  updated_at: string;
  users: User;
}

interface ApiResponse {
  unit_kerja_id: number;
  tahun: number | null;
  total: number;
  data: IdpData[];
}


export default function HCDPDashboard() {
  const [activeTab, setActiveTab] = useState('kompetensi');
  const [idpData, setIdpData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchIdpData = async () => {
      try {
        setLoading(true);
        
        // Ambil unit_kerja_id dari localStorage
        const unitKerjaId = localStorage.getItem('id');
        
        if (!unitKerjaId) {
          throw new Error('Unit kerja ID tidak ditemukan di localStorage');
        }

        console.log('Fetching IDP data for unit_kerja_id:', unitKerjaId);

        // Fetch data IDP berdasarkan unit_kerja_id dari localStorage
        const response = await fetch(`/api/idp/unit/${unitKerjaId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setIdpData(data);
      } catch (err) {
        console.error('Error fetching IDP data:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchIdpData();
  }, []);

  // Process data untuk charts
  const processedData = idpData ? {
    // Goals vs AI Suggestions comparison
    goalsVsAiData: (() => {
      const currentGoals: Record<string, number> = {};
      const aiSuggestions: Record<string, number> = {};
      
      idpData.data.forEach(idp => {
        // Current goals
        idp.goals?.forEach(goal => {
          const kompetesi = goal.kompetensi || 'Unknown';
          currentGoals[kompetesi] = (currentGoals[kompetesi] || 0) + 1;
        });
        
        // AI suggested goals
        if (idp.ai_suggestions?.goals) {
          idp.ai_suggestions.goals.forEach((goal: Goal) => {
            const kompetesi = goal.kompetensi || 'Unknown';
            aiSuggestions[kompetesi] = (aiSuggestions[kompetesi] || 0) + 1;
          });
        }
      });
      
      // Combine both datasets
      const allKompetensi = new Set([...Object.keys(currentGoals), ...Object.keys(aiSuggestions)]);
      return Array.from(allKompetensi).map(kompetensi => ({
        kompetensi: kompetensi.length > 20 ? kompetensi.substring(0, 20) + '...' : kompetensi,
        current: currentGoals[kompetensi] || 0,
        aiSuggested: aiSuggestions[kompetensi] || 0
      }));
    })(),

    // SWOT Distribution
    swotData: (() => {
      const swotCategories = ['strength', 'weakness', 'opportunities', 'threats'];
      return swotCategories.map(category => ({
        category: category === 'strength' ? 'Kekuatan' : 
                 category === 'weakness' ? 'Kelemahan' :
                 category === 'opportunities' ? 'Peluang' : 'Ancaman',
        count: idpData.data.filter(idp => idp[category as keyof IdpData] && 
               (idp[category as keyof IdpData] as string).length > 0).length
      }));
    })(),

    // Activities comparison (Current vs AI Suggested)
    activitiesComparisonData: (() => {
      const currentActivities: Record<string, number> = {};
      const aiActivities: Record<string, number> = {};
      
      idpData.data.forEach(idp => {
        // Current activities
        idp.activities?.forEach(activity => {
          const jenis = activity.jenis || 'Unknown';
          currentActivities[jenis] = (currentActivities[jenis] || 0) + 1;
        });
        
        // AI suggested activities
        if (idp.ai_suggestions?.activities) {
          idp.ai_suggestions.activities.forEach((activity: Activity) => {
            const jenis = activity.jenis || 'Unknown';
            aiActivities[jenis] = (aiActivities[jenis] || 0) + 1;
          });
        }
      });
      
      const allJenis = new Set([...Object.keys(currentActivities), ...Object.keys(aiActivities)]);
      return Array.from(allJenis).map(jenis => ({
        jenis: jenis.length > 15 ? jenis.substring(0, 15) + '...' : jenis,
        current: currentActivities[jenis] || 0,
        aiSuggested: aiActivities[jenis] || 0
      }));
    })(),

    // Kompetensi trends by year
    kompetensiTrendsData: (() => {
      const trends: Record<string, Record<number, number>> = {};
      
      idpData.data.forEach(idp => {
        idp.goals?.forEach(goal => {
          const kompetesi = goal.kompetensi || 'Unknown';
          const tahun = idp.tahun || new Date().getFullYear();
          
          if (!trends[kompetesi]) trends[kompetesi] = {};
          trends[kompetesi][tahun] = (trends[kompetesi][tahun] || 0) + 1;
        });
      });
      
      // Get all years
      const allYears = [...new Set(idpData.data.map(idp => idp.tahun))].sort();
      
      return Object.entries(trends).map(([kompetensi, yearData]) => ({
        kompetensi: kompetensi.length > 15 ? kompetensi.substring(0, 15) + '...' : kompetensi,
        ...Object.fromEntries(allYears.map(year => [year.toString(), yearData[year] || 0]))
      }));
    })(),

    // Progress overview
    progressOverviewData: (() => {
      const statusCount: Record<string, number> = {};
      const yearCount: Record<number, number> = {};
      
      idpData.data.forEach(idp => {
        const status = idp.status || 'Unknown';
        statusCount[status] = (statusCount[status] || 0) + 1;
        
        const tahun = idp.tahun || new Date().getFullYear();
        yearCount[tahun] = (yearCount[tahun] || 0) + 1;
      });
      
      return {
        statusData: Object.entries(statusCount).map(([name, value]) => ({ 
          name: name === 'draft' ? 'Draft' : name === 'submitted' ? 'Submitted' : 'Completed', 
          value 
        })),
        yearData: Object.entries(yearCount).map(([year, count]) => ({
          year: parseInt(year),
          count
        })).sort((a, b) => a.year - b.year)
      };
    })()
  } : {
    goalsVsAiData: [],
    swotData: [],
    activitiesComparisonData: [],
    kompetensiTrendsData: [],
    progressOverviewData: { statusData: [], yearData: [] }
  };

  const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#8B5CF6', '#F59E0B'];

  if (loading) {
    return (
      <Card className="w-full shadow-lg rounded-2xl">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data IDP...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg rounded-2xl">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Dashboard HCDP
        </CardTitle>
        <div className="text-sm text-gray-600">
          Total IDP: {idpData?.total || 0} | Data terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{idpData?.data.length || 0}</div>
            <div className="text-sm opacity-90">Total IDP</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {idpData?.data.filter(idp => idp.status === 'submitted').length || 0}
            </div>
            <div className="text-sm opacity-90">Aktif</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {idpData?.data.filter(idp => idp.status === 'draft').length || 0}
            </div>
            <div className="text-sm opacity-90">Draft</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {processedData.goalsVsAiData.reduce((sum, item) => sum + item.current, 0)}
            </div>
            <div className="text-sm opacity-90">Total Goals</div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {processedData.goalsVsAiData.reduce((sum, item) => sum + item.aiSuggested, 0)}
            </div>
            <div className="text-sm opacity-90">AI Goal Suggestions</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {idpData?.data.reduce((sum, idp) => sum + (idp.ai_suggestions?.activities?.length || 0), 0)}
            </div>
            <div className="text-sm opacity-90">AI Activity Suggestions</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'goals-vs-ai' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('goals-vs-ai')}
          >
            Goals vs AI Suggestions
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'swot-analysis' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('swot-analysis')}
          >
            SWOT Analysis
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'activities-comparison' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('activities-comparison')}
          >
            Activities Analysis
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'kompetensi-trends' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('kompetensi-trends')}
          >
            Kompetensi Trends
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'progress-overview' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('progress-overview')}
          >
            Progress Overview
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'goals-vs-ai' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Goals vs AI Suggestions</span>
                    <Badge variant="outline">Perbandingan</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Perbandingan antara goals yang ditetapkan pegawai dengan saran AI untuk pengembangan kompetensi
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4 text-center">Goals Pegawai</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={processedData.goalsVsAiData.filter(item => item.current > 0).map(item => ({
                              name: item.kompetensi,
                              value: item.current
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={80}
                            paddingAngle={2}
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            fill="#3b82f6"
                            dataKey="value"
                          >
                            {processedData.goalsVsAiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${Math.floor(0x3b82f6 + index * 0x111111).toString(16).slice(-6)}`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4 text-center">Saran AI</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={processedData.goalsVsAiData.filter(item => item.aiSuggested > 0).map(item => ({
                              name: item.kompetensi,
                              value: item.aiSuggested
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={80}
                            paddingAngle={2}
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            fill="#22c55e"
                            dataKey="value"
                          >
                            {processedData.goalsVsAiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${Math.floor(0x22c55e + index * 0x111111).toString(16).slice(-6)}`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Goals Pegawai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {processedData.goalsVsAiData.reduce((sum, item) => sum + item.current, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Saran AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {processedData.goalsVsAiData.reduce((sum, item) => sum + item.aiSuggested, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alignment Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {processedData.goalsVsAiData.length > 0 ? 
                        Math.round((processedData.goalsVsAiData.filter(item => item.current > 0 && item.aiSuggested > 0).length / processedData.goalsVsAiData.length) * 100) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'swot-analysis' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>SWOT Analysis Distribution</span>
                    <Badge variant="outline">Analisis</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Distribusi analisis SWOT dari semua IDP yang telah dibuat
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4 text-center">Radar SWOT Analysis</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={processedData.swotData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" />
                          <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                          <Radar 
                            name="Jumlah" 
                            dataKey="count" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.6} 
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4 text-center">Distribusi SWOT</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={processedData.swotData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {processedData.swotData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, `${processedData.swotData.find(item => item.count === value)?.category}`]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'activities-comparison' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Activities Analysis</span>
                    <Badge variant="outline">Kegiatan</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Analisis mendalam jenis kegiatan pengembangan yang dipilih pegawai dan rekomendasi AI
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Top Activities Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <h4 className="font-medium mb-4">Perbandingan Kegiatan: Pegawai vs AI</h4>
                        <ResponsiveContainer width="100%" height={350}>
                          <RadarChart data={processedData.activitiesComparisonData.slice(0, 6)}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="jenis" />
                            <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                            <Radar 
                              name="Pilihan Pegawai" 
                              dataKey="current" 
                              stroke="#ff7300" 
                              fill="#ff7300" 
                              fillOpacity={0.4}
                              strokeWidth={2}
                            />
                            <Radar 
                              name="Rekomendasi AI" 
                              dataKey="aiSuggested" 
                              stroke="#00c49f" 
                              fill="#00c49f" 
                              fillOpacity={0.4}
                              strokeWidth={2}
                            />
                            <Legend />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Top Activities</h4>
                        {processedData.activitiesComparisonData
                          .sort((a, b) => (b.current + b.aiSuggested) - (a.current + a.aiSuggested))
                          .slice(0, 5)
                          .map((activity, index) => (
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border-l-4 border-blue-500">
                              <div className="font-medium text-sm text-gray-800">{activity.jenis}</div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">Pegawai: {activity.current}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">AI: {activity.aiSuggested}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Activity Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-4 text-center">Distribusi Kegiatan Pegawai</h4>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={processedData.activitiesComparisonData.filter(item => item.current > 0).map(item => ({
                                name: item.jenis,
                                value: item.current
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {processedData.activitiesComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} kegiatan`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-4 text-center">Rekomendasi AI</h4>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={processedData.activitiesComparisonData.filter(item => item.aiSuggested > 0).map(item => ({
                                name: item.jenis,
                                value: item.aiSuggested
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {processedData.activitiesComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} saran`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Activity Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                          {processedData.activitiesComparisonData.reduce((sum, item) => sum + item.current, 0)}
                        </div>
                        <div className="text-sm text-orange-700 font-medium">Total Kegiatan Pegawai</div>
                        <div className="text-xs text-orange-600 mt-1">
                          Dari {processedData.activitiesComparisonData.filter(item => item.current > 0).length} jenis kegiatan
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {processedData.activitiesComparisonData.reduce((sum, item) => sum + item.aiSuggested, 0)}
                        </div>
                        <div className="text-sm text-green-700 font-medium">Total Rekomendasi AI</div>
                        <div className="text-xs text-green-600 mt-1">
                          Dari {processedData.activitiesComparisonData.filter(item => item.aiSuggested > 0).length} jenis kegiatan
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((processedData.activitiesComparisonData.filter(item => item.current > 0 && item.aiSuggested > 0).length / Math.max(processedData.activitiesComparisonData.length, 1)) * 100)}%
                        </div>
                        <div className="text-sm text-blue-700 font-medium">Alignment Score</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Kesamaan pilihan pegawai dengan AI
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'kompetensi-trends' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Kompetensi Trends</span>
                    <Badge variant="outline">Tren</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tren perkembangan fokus kompetensi dari tahun ke tahun
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="font-medium mb-4">Tren Kompetensi Radar Chart</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={processedData.kompetensiTrendsData.slice(0, 8)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="kompetensi" />
                          <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                          {idpData && [...new Set(idpData.data.map(idp => idp.tahun))].sort().map((year, index) => (
                            <Radar 
                              key={year}
                              name={`Tahun ${year}`}
                              dataKey={year.toString()} 
                              stroke={COLORS[index % COLORS.length]} 
                              fill={COLORS[index % COLORS.length]} 
                              fillOpacity={0.3}
                            />
                          ))}
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Top Kompetensi Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {processedData.kompetensiTrendsData.slice(0, 4).map((item, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                          <div className="text-sm font-medium text-gray-700 mb-2">{item.kompetensi}</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Object.values(item).filter((val, idx) => idx > 0 && typeof val === 'number').reduce((sum: number, val) => sum + (val as number), 0)}
                          </div>
                          <div className="text-xs text-gray-500">Total Goals</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'progress-overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status IDP</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Distribusi status IDP di unit kerja
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={processedData.progressOverviewData.statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {processedData.progressOverviewData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>IDP per Tahun</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Jumlah IDP yang dibuat per tahun
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {processedData.progressOverviewData.yearData.length > 1 ? (
                        <BarChart data={processedData.progressOverviewData.yearData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {processedData.progressOverviewData.yearData[0]?.count || 0}
                            </div>
                            <div className="text-lg text-gray-600">
                              IDP Tahun {processedData.progressOverviewData.yearData[0]?.year || new Date().getFullYear()}
                            </div>
                          </div>
                        </div>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total IDP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {idpData?.data.length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">IDP Aktif</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {idpData?.data.filter(idp => idp.status === 'submitted').length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {idpData?.data.filter(idp => idp.status === 'draft').length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {idpData?.data.filter(idp => idp.status === 'completed').length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Detail IDP Section */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Detail IDP Pegawai</h3>
          {idpData && idpData.data.length > 0 ? (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {idpData.data.map((idp) => (
                <div key={idp.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-blue-700">
                        {idp.users.pegawai_pegawai_nipTousers.nama}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {idp.users.pegawai_pegawai_nipTousers.jabatan} | {idp.users.pegawai_pegawai_nipTousers.golongan}
                      </p>
                      <p className="text-sm text-gray-500">NIP: {idp.users.pegawai_pegawai_nipTousers.nip}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        idp.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        idp.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {idp.status.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Tahun: {idp.tahun}</p>
                    </div>
                  </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Kekuatan:</h5>
                        <p className="text-sm text-gray-700">{idp.strength}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Kelemahan:</h5>
                        <p className="text-sm text-gray-700">{idp.weakness}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Peluang:</h5>
                        <p className="text-sm text-gray-700">{idp.opportunities}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-700 mb-2">Ancaman:</h5>
                        <p className="text-sm text-gray-700">{idp.threats}</p>
                      </div>
                    </div>

                    {idp.goals && idp.goals.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-purple-700 mb-2">Goals ({idp.goals.length}):</h5>
                        <div className="grid gap-2">
                          {idp.goals.map((goal, goalIndex) => (
                            <div key={goalIndex} className="bg-purple-50 p-3 rounded">
                              <p className="font-medium text-sm">{goal.kompetensi}</p>
                              <p className="text-xs text-gray-600 mt-1">{goal.target}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {idp.activities && idp.activities.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-indigo-700 mb-2">Activities ({idp.activities.length}):</h5>
                        <div className="grid gap-2">
                          {idp.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="bg-indigo-50 p-3 rounded">
                              <p className="font-medium text-sm">{activity.judul}</p>
                              <p className="text-xs text-gray-600">{activity.jenis} | {activity.penyelenggara}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions Section */}
                    {idp.ai_suggestions && (
                      <div className="mb-4">
                        <h5 className="font-medium text-emerald-700 mb-3 flex items-center gap-2">
                          <span>AI Suggestions</span>
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        </h5>
                        
                        {/* AI Suggested Goals */}
                        {idp.ai_suggestions.goals && idp.ai_suggestions.goals.length > 0 && (
                          <div className="mb-4">
                            <h6 className="font-medium text-sm text-emerald-600 mb-2">Suggested Goals ({idp.ai_suggestions.goals.length}):</h6>
                            <div className="grid gap-3">
                              {idp.ai_suggestions.goals.map((aiGoal: Goal, goalIndex: number) => (
                                <div key={goalIndex} className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="font-semibold text-sm text-emerald-800">{aiGoal.kompetensi}</div>
                                    <Badge variant="secondary" className="text-xs">AI Goal</Badge>
                                  </div>
                                  <p className="text-xs text-gray-700 mb-2"><strong>Target:</strong> {aiGoal.target}</p>
                                  <p className="text-xs text-gray-700 mb-2"><strong>Indikator:</strong> {aiGoal.indikator}</p>
                                  <p className="text-xs text-gray-600"><strong>Alasan:</strong> {aiGoal.alasan}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Suggested Activities */}
                        {idp.ai_suggestions.activities && idp.ai_suggestions.activities.length > 0 && (
                          <div className="mb-4">
                            <h6 className="font-medium text-sm text-emerald-600 mb-2">Suggested Activities ({idp.ai_suggestions.activities.length}):</h6>
                            <div className="grid gap-3">
                              {idp.ai_suggestions.activities.map((aiActivity: Activity, actIndex: number) => (
                                <div key={actIndex} className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="font-semibold text-sm text-teal-800">{aiActivity.judul}</div>
                                    <Badge variant="secondary" className="text-xs">AI Activity</Badge>
                                  </div>
                                  <p className="text-xs text-gray-700 mb-1"><strong>Jenis:</strong> {aiActivity.jenis}</p>
                                  <p className="text-xs text-gray-600"><strong>Penyelenggara:</strong> {aiActivity.penyelenggara}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 border-t pt-2">
                      Dibuat: {new Date(idp.created_at).toLocaleDateString('id-ID')} | 
                      Diperbarui: {new Date(idp.updated_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <p>Tidak ada data IDP yang tersedia</p>
              </div>
            )}
          </div>

      </CardContent>
    </Card>
  );
}
