'use client'

const heatmapData = [
  { unit: 'Unit TI', skills: [85, 92, 78, 88, 76, 90] },
  { unit: 'Unit SDM', skills: [78, 85, 95, 82, 88, 92] },
  { unit: 'Unit Keuangan', skills: [88, 76, 82, 94, 90, 85] },
  { unit: 'Unit Perencanaan', skills: [92, 88, 88, 86, 92, 78] },
  { unit: 'Unit Operasional', skills: [76, 82, 76, 78, 85, 88] },
]

const skillNames = ['IT', 'Manajemen', 'Komunikasi', 'Analisis', 'Problem Solving', 'Kerjasama']

const getColor = (value: number) => {
  if (value >= 90) return 'bg-green-500'
  if (value >= 80) return 'bg-blue-500'
  if (value >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function HeatmapChart() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          <div className="text-xs font-medium text-gray-600"></div>
          {skillNames.map((skill, idx) => (
            <div key={idx} className="text-xs font-medium text-gray-600 text-center">
              {skill}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        {heatmapData.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7 gap-2 mb-2">
            <div className="text-xs font-medium text-gray-700 flex items-center">
              {row.unit}
            </div>
            {row.skills.map((value, colIdx) => (
              <div
                key={colIdx}
                className={`${getColor(value)} rounded p-2 text-white text-center text-xs font-semibold flex items-center justify-center h-12`}
                title={`${value}`}
              >
                {value}
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="text-gray-600 font-medium">Skala:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">&lt;70</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">70-79</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">80-89</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">≥90</span>
          </div>
        </div>
      </div>
    </div>
  )
}
