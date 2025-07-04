import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const page = parseInt(req.query.page as string) || 1
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined // No default limit
  const offset = limit ? (page - 1) * limit : 0

  try {
    // Ambil data publikasi + relasi user
    const publikasi = await prisma.publikasi.findMany({
      orderBy: {
        tanggal: 'desc',
      },
      ...(limit && { skip: offset, take: limit }), // Only apply pagination if limit is provided
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
        limit: limit || total, // If no limit, show total as limit
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1, // If no limit, only 1 page
      },
    })
  } catch (error) {
    console.error('❌ Error fetching publikasi:', error)
    return res.status(500).json({ error: 'Gagal mengambil data publikasi' })
  }
}
