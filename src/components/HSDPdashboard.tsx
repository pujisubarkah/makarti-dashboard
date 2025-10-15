
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Tabs, { TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="kompetensi">Kompetensi</TabsTrigger>
            <TabsTrigger value="gap">Gap Kompetensi</TabsTrigger>
            <TabsTrigger value="kegiatan">Jenis Kegiatan</TabsTrigger>
            <TabsTrigger value="progress">Progress IDP</TabsTrigger>
          </TabsList>

          {/* Distribusi Kompetensi */}
          <TabsContent value="kompetensi">
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
          </TabsContent>

          {/* Gap Kompetensi */}
          <TabsContent value="gap">
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
          </TabsContent>

          {/* Jenis Kegiatan */}
          <TabsContent value="kegiatan">
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
          </TabsContent>

          {/* Progress IDP */}
          <TabsContent value="progress">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
