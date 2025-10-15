'use client'
import { useState } from 'react'


interface SwotForm {
  strength: string;
  weakness: string;
  opportunities: string;
  threats: string;
}

interface SwotAnalysisFormProps {
  data?: SwotForm;
  onChange?: (form: SwotForm) => void;
}

export default function SwotAnalysisForm({ data, onChange }: SwotAnalysisFormProps) {
  const [form, setForm] = useState<SwotForm>(data || {
    strength: '',
    weakness: '',
    opportunities: '',
    threats: ''
  })

  const handleChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    onChange?.(updated)
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Analisis Diri (SWOT)</h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { key: 'strength', label: 'Kekuatan (Strength)' },
          { key: 'weakness', label: 'Kelemahan (Weakness)' },
          { key: 'opportunities', label: 'Peluang (Opportunities)' },
          { key: 'threats', label: 'Ancaman (Threats)' },
        ].map(({ key, label }) => (
          <div key={key} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <label className="block font-semibold text-blue-800 mb-1">{label}</label>
            <textarea
              className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition min-h-[60px]"
              rows={3}
              value={form[key as keyof SwotForm]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Tuliskan ${label.toLowerCase()} Anda...`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
