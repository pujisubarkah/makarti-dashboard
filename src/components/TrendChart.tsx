'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const trendData = [
  { month: 'Jan', integritas: 85, budaya: 82 },
  { month: 'Feb', integritas: 87, budaya: 84 },
  { month: 'Mar', integritas: 86, budaya: 86 },
  { month: 'Apr', integritas: 89, budaya: 87 },
  { month: 'Mei', integritas: 90, budaya: 89 },
  { month: 'Jun', integritas: 91, budaya: 91 },
]

export default function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[75, 100]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="integritas" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="Integritas"
          dot={{ fill: '#f59e0b', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="budaya" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Budaya Organisasi"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
