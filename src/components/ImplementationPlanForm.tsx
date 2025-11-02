'use client'
import { useState } from 'react'

interface Plan {
  hasil: string;
  penerapan: string;
  dampak: string;
}


interface ImplementationPlanFormProps {
  data?: Plan[];
  onDataChange?: (plans: Plan[]) => void;
}

export default function ImplementationPlanForm({ data, onDataChange }: ImplementationPlanFormProps) {
  const [plans, setPlans] = useState<Plan[]>(data || [
    { hasil: '', penerapan: '', dampak: '' }
  ])

  const updatePlan = (i: number, field: keyof Plan, value: string) => {
    const updated = [...plans]
    updated[i][field] = value
    setPlans(updated)
    if (onDataChange) onDataChange(updated)
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Rencana Implementasi & Dampak</h2>
      <div className="grid grid-cols-1 gap-4">
        {plans.map((p: Plan, i: number) => (
          <div key={i} className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm space-y-3">
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Hasil / Kompetensi yang Dicapai</label>
              <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Hasil / Kompetensi yang Dicapai" value={p.hasil} onChange={(e) => updatePlan(i, 'hasil', e.target.value)} />
            </div>
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Penerapan dalam Pekerjaan</label>
              <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Penerapan dalam Pekerjaan" value={p.penerapan} onChange={(e) => updatePlan(i, 'penerapan', e.target.value)} />
            </div>
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Dampak bagi Unit / Instansi</label>
              <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Dampak bagi Unit / Instansi" value={p.dampak} onChange={(e) => updatePlan(i, 'dampak', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
