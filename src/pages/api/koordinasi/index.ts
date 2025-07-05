import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const data = await prisma.koordinasi.findMany({
        orderBy: { tanggal: 'desc' },
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      })

      return res.status(200).json(data)
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('❌ Error on Koordinasi API:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    })
  } finally {
    await prisma.$disconnect()
  }
}
