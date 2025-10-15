
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';


export default function HSDPDashboard() {
  const [activeTab, setActiveTab] = useState('kompetensi');

  // Data
  const kompetensiData = [
    { name: 'Digital Skill', value: 24 },
    { name: 'Leadership', value: 15 },
    { name: 'Communication', value: 12 },
    { name: 'Data Analysis', value: 10 },
    { name: 'Innovation', value: 8 },
  ];

  const gapData = [
    { aspect: 'Teknis', current: 60, target: 90 },
    { aspect: 'Manajerial', current: 70, target: 85 },
    { aspect: 'Sosial-Kultural', current: 65, target: 80 },
    { aspect: 'Digitalisasi', current: 50, target: 90 },
    { aspect: 'Inovasi', current: 55, target: 85 },
  ];

  const kegiatanData = [
    { name: 'Pelatihan', value: 40 },
    { name: 'Coaching', value: 25 },
    { name: 'E-Learning', value: 20 },
    { name: 'Magang', value: 15 },
  ];

  const progressData = [
    { name: 'Belum Dimulai', value: 10 },
    { name: 'Sedang Berjalan', value: 25 },
    { name: 'Selesai', value: 8 },
  ];

  const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];

  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Dashboard Visualisasi IDP Unit
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'kompetensi' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('kompetensi')}
          >
            Kompetensi
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'gap' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('gap')}
          >
            Gap Kompetensi
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'kegiatan' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('kegiatan')}
          >
            Jenis Kegiatan
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === 'progress' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress IDP
          </button>
        </div>

        {/* Distribusi Kompetensi */}
        {activeTab === 'kompetensi' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kompetensiData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gap Kompetensi */}
        {activeTab === 'gap' && (
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="90%" height="100%">
              <RadarChart data={gapData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="aspect" />
                <PolarRadiusAxis />
                <Radar name="Current" dataKey="current" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#F87171" fill="#F87171" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Jenis Kegiatan */}
        {activeTab === 'kegiatan' && (
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="80%" height="100%">
              <PieChart>
                <Pie
                  data={kegiatanData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {kegiatanData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Progress IDP */}
        {activeTab === 'progress' && (
          <div className="h-80 flex justify-center">
            <ResponsiveContainer width="80%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {progressData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      {/* Watermark Centered */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none select-none">
        <span className="text-3xl md:text-4xl font-extrabold text-blue-900 opacity-15 text-center" style={{textShadow:'0 2px 12px #fff'}}>
          Tahap Pengembangan<br />Mohon Doanya Untuk Makarti 5.0 Lebih Baik
        </span>
      </div>
    </Card>
  );
}
