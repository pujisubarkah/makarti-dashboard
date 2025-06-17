'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Ide = {
  id: number
  judul: string
  pengusul: string
  status: 'Baru' | 'Diproses' | 'Diimplementasi'
  tanggal: string
  progress: number
}

const dummyData: Ide[] = [
  {
    id: 1,
    judul: 'Integrasi Dashboard',
    pengusul: 'Direktorat A',
    status: 'Baru',
    tanggal: '2025-06-16',
    progress: 10,
  },
  {
    id: 2,
    judul: 'Otomatisasi Laporan',
    pengusul: 'Pusat Data',
    status: 'Diproses',
    tanggal: '2025-06-15',
    progress: 45,
  },
  {
    id: 3,
    judul: 'Sistem Notifikasi Internal',
    pengusul: 'Direktorat C',
    status: 'Diimplementasi',
    tanggal: '2025-06-10',
    progress: 100,
  },
]

export default function ProgresInovasiPage() {
  const [filter, setFilter] = useState<string>('Semua')

  const filteredData =
    filter === 'Semua' ? dummyData : dummyData.filter((item) => item.status === filter)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-700">📊 Progres Inovasi</h2>
        <Select onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua</SelectItem>
            <SelectItem value="Baru">Baru</SelectItem>
            <SelectItem value="Diproses">Diproses</SelectItem>
            <SelectItem value="Diimplementasi">Diimplementasi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white shadow p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{item.judul}</h3>
                <p className="text-sm text-gray-500">{item.pengusul}</p>
              </div>
              <Badge
                variant={
                  item.status === 'Baru'
                    ? 'default'
                    : item.status === 'Diproses'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {item.status}
              </Badge>
            </div>
            <Progress value={item.progress} />
            <div className="text-sm text-right text-gray-600">
              {item.progress}% selesai ({item.tanggal})
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Tidak ada data inovasi pada status ini.</p>
        )}
      </div>
    </div>
  )
}
