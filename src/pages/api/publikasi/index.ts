import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const offset = (page - 1) * limit

  try {
    // Ambil data publikasi + relasi user
    const publikasi = await prisma.publikasi.findMany({
      orderBy: {
        tanggal: 'desc',
      },
      skip: offset,
      take: limit,
      include: {
        users: {
          select: {
            id: true,
            unit_kerja: true,
          
          },
        },
      },
    })

    // Total seluruh publikasi
    const total = await prisma.publikasi.count()

    return res.status(200).json({
      data: publikasi,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('❌ Error fetching publikasi:', error)
    return res.status(500).json({ error: 'Gagal mengambil data publikasi' })
  }
}
