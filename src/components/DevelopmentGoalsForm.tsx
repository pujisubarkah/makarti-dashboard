'use client'
import { useState } from 'react'

type Goal = {
  kompetensi: string
  alasan: string
  target: string
  indikator: string
}

interface DevelopmentGoalsFormProps {
  data?: Goal[];
  onChange?: (goals: Goal[]) => void;
}

export default function DevelopmentGoalsForm({ data, onChange }: DevelopmentGoalsFormProps) {
  const [goals, setGoals] = useState<Goal[]>(data || [
    { kompetensi: '', alasan: '', target: '', indikator: '' }
  ])


  const updateGoal = (i: number, field: keyof Goal, value: string) => {
    const updated = [...goals];
    updated[i][field] = value;
    setGoals(updated);
    if (onChange) onChange(updated);
  };

  const addGoal = () => {
    const updated = [...goals, { kompetensi: '', alasan: '', target: '', indikator: '' }];
    setGoals(updated);
    if (onChange) onChange(updated);
  };

  const removeGoal = (i: number) => {
    if (goals.length === 1) {
      // keep one empty goal instead of removing all
      const updated = [{ kompetensi: '', alasan: '', target: '', indikator: '' }];
      setGoals(updated);
      if (onChange) onChange(updated);
      return;
    }
    const updated = goals.filter((_, idx) => idx !== i);
    setGoals(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Tujuan Pengembangan</h2>
      <div className="grid grid-cols-1 gap-4">
        {goals.map((g: Goal, i: number) => (
          <div key={i} className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <label className="block font-semibold text-blue-800 mb-1">Kompetensi yang akan dikembangkan</label>
                <input
                  className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="Kompetensi yang akan dikembangkan"
                  value={g.kompetensi}
                  onChange={(e) => updateGoal(i, 'kompetensi', e.target.value)}
                />
              </div>
              <div className="ml-4 mt-1">
                <button
                  type="button"
                  onClick={() => removeGoal(i)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Alasan / Kesenjangan Kompetensi</label>
              <input
                className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                placeholder="Alasan / Kesenjangan Kompetensi"
                value={g.alasan}
                onChange={(e) => updateGoal(i, 'alasan', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-blue-800 mb-1">Target Waktu</label>
                <input
                  className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="Target Waktu"
                  value={g.target}
                  onChange={(e) => updateGoal(i, 'target', e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold text-blue-800 mb-1">Indikator Keberhasilan</label>
                <input
                  className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="Indikator Keberhasilan"
                  value={g.indikator}
                  onChange={(e) => updateGoal(i, 'indikator', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 flex items-center justify-center">
        <button
          type="button"
          onClick={addGoal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition"
        >
          Tambah Tujuan
        </button>
      </div>
    </div>
  );
}
