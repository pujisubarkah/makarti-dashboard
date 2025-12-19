'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const leadershipData = [
  {
    level: 'Level 1',
    strategic: 45,
    operational: 65,
    tactical: 78,
  },
  {
    level: 'Level 2',
    strategic: 62,
    operational: 72,
    tactical: 85,
  },
  {
    level: 'Level 3',
    strategic: 78,
    operational: 85,
    tactical: 92,
  },
  {
    level: 'Level 4',
    strategic: 88,
    operational: 90,
    tactical: 95,
  },
]

export default function StackedBarChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={leadershipData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="level" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="strategic" stackId="a" fill="#3b82f6" name="Strategic" />
        <Bar dataKey="operational" stackId="a" fill="#10b981" name="Operational" />
        <Bar dataKey="tactical" stackId="a" fill="#f59e0b" name="Tactical" />
      </BarChart>
    </ResponsiveContainer>
  )
}
