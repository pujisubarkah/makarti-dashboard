import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Total seluruh publikasi
    const total = await prisma.publikasi.count()

    // Group by unit_kerja_id & hitung jumlah publikasi
    const summary = await prisma.publikasi.groupBy({
      by: ['unit_kerja_id'],
      _count: {
        unit_kerja_id: true,
      },
    })

    // Ambil nama unit kerja dari users
    const unitKerjaMap: Record<number, string> = {}

    const unitKerjaIds = summary.map(s => s.unit_kerja_id)
    const users = await prisma.users.findMany({
      where: {
        id: { in: unitKerjaIds },
      },
      select: {
        id: true,
        unit_kerja: true,
      },
    })

    users.forEach(user => {
      unitKerjaMap[user.id] = user.unit_kerja ?? 'Tidak diketahui'
    })

    // Gabungkan summary dengan nama unit kerja
    const summaryWithUnitKerja = summary.map(s => ({
      unit_kerja_id: s.unit_kerja_id,
      unit_kerja: unitKerjaMap[s.unit_kerja_id] || 'Tidak diketahui',
      jumlah_publikasi: s._count.unit_kerja_id,
    }))

    // Ambil Top 3 unit kerja berdasarkan jumlah publikasi
    const topUnitKerja = summaryWithUnitKerja
      .sort((a, b) => b.jumlah_publikasi - a.jumlah_publikasi)
      .slice(0, 3)

    return res.status(200).json({
      total_publikasi: total,
      summary: {
        top_unit_kerja: topUnitKerja,
      },
    })
  } catch (error) {
    console.error('❌ Error fetching publikasi:', error)
    return res.status(500).json({ error: 'Gagal mengambil data publikasi' })
  }
}
