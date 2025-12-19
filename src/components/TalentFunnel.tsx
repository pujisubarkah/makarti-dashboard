'use client'

const funnelData = [
  { level: 'Talent Pool', count: 250, percentage: 100, color: 'bg-blue-500' },
  { level: 'High Potential', count: 125, percentage: 50, color: 'bg-blue-600' },
  { level: 'Emerging Leaders', count: 75, percentage: 30, color: 'bg-blue-700' },
  { level: 'Future Leaders', count: 35, percentage: 14, color: 'bg-blue-800' },
  { level: 'Key Positions', count: 15, percentage: 6, color: 'bg-blue-900' },
]

export default function TalentFunnel() {
  return (
    <div className="w-full py-4">
      {funnelData.map((item, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.level}</span>
            <span className="text-sm text-gray-600">{item.count} orang ({item.percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden">
            <div
              className={`${item.color} h-10 rounded-full flex items-center justify-center text-white font-medium transition-all duration-500`}
              style={{ width: `${item.percentage}%` }}
            >
              {item.percentage >= 15 && `${item.count}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
