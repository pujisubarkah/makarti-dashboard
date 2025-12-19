'use client'

interface GaugeChartProps {
  value: number
  max?: number
}

export default function GaugeChart({ value, max = 100 }: GaugeChartProps) {
  const percentage = (value / max) * 100
  const rotation = (percentage / 100) * 180 - 90

  const getColor = (val: number) => {
    if (val >= 90) return '#10b981' // green
    if (val >= 75) return '#3b82f6' // blue
    if (val >= 60) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  const color = getColor(value)

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-24">
        {/* Semi-circle background */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251} 251`}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="20"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
          />
          {/* Center circle */}
          <circle cx="100" cy="80" r="8" fill="#374151" />
        </svg>
      </div>

      {/* Value display */}
      <div className="text-center mt-2">
        <div className="text-3xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">Skor Integritas</div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-48 mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}
