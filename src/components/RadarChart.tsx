'use client'

import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const radarData = [
  { skill: 'Teknis IT', value: 85, fullMark: 100 },
  { skill: 'Manajemen', value: 78, fullMark: 100 },
  { skill: 'Komunikasi', value: 92, fullMark: 100 },
  { skill: 'Analisis Data', value: 88, fullMark: 100 },
  { skill: 'Problem Solving', value: 82, fullMark: 100 },
  { skill: 'Kerjasama Tim', value: 90, fullMark: 100 },
]

export default function RadarChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsRadar data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar name="Kompetensi" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        <Tooltip />
        <Legend />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
