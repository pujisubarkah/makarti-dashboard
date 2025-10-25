'use client'
import { useState } from 'react'

interface Activity {
  jenis: string;
  judul: string;
  penyelenggara: string;
}

interface DevelopmentActivitiesFormProps {
  data?: Activity[];
  onChange?: (activities: Activity[]) => void;
}

export default function DevelopmentActivitiesForm({ data, onChange }: DevelopmentActivitiesFormProps) {
  const [activities, setActivities] = useState<Activity[]>(data || [
    { jenis: '', judul: '', penyelenggara: '' }
  ])

  const updateActivity = (i: number, field: keyof Activity, value: string) => {
    const updated = [...activities];
    updated[i] = { ...updated[i], [field]: value };
    setActivities(updated);
    if (onChange) onChange(updated);
  };

  const addActivity = () => {
    const updated = [...activities, { jenis: '', judul: '', penyelenggara: '' }];
    setActivities(updated);
    if (onChange) onChange(updated);
  };

  const removeActivity = (i: number) => {
    if (activities.length === 1) {
      const updated = [{ jenis: '', judul: '', penyelenggara: '' }];
      setActivities(updated);
      if (onChange) onChange(updated);
      return;
    }
    const updated = activities.filter((_, idx) => idx !== i);
    setActivities(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Rencana Kegiatan Pengembangan</h2>
      <div className="grid grid-cols-1 gap-4">
        {activities.map((a: Activity, i: number) => (
          <div key={i} className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <label className="block font-semibold text-blue-800 mb-1">Jenis Kegiatan</label>
                <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Jenis Kegiatan" value={a.jenis} onChange={(e) => updateActivity(i, 'jenis', e.target.value)} />
              </div>
              <div className="ml-4 mt-1">
                <button type="button" onClick={() => removeActivity(i)} className="text-sm text-red-600 hover:underline">Hapus</button>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Judul / Nama Kegiatan</label>
              <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Judul / Nama Kegiatan" value={a.judul} onChange={(e) => updateActivity(i, 'judul', e.target.value)} />
            </div>
            <div>
              <label className="block font-semibold text-blue-800 mb-1">Penyelenggara</label>
              <input className="w-full border border-blue-200 rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="Penyelenggara" value={a.penyelenggara} onChange={(e) => updateActivity(i, 'penyelenggara', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 flex items-center justify-center">
        <button type="button" onClick={addActivity} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition">Tambah Kegiatan</button>
      </div>
    </div>
  );
}
