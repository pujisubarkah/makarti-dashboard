// GET semua inovasi
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const inovasi = await prisma.inovasi.findMany({
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      })

      return res.status(200).json(inovasi)
    } catch (error) {
      console.error('Error fetching inovasi:', error);
      return res.status(500).json({ error: 'Gagal mengambil data inovasi.' })
    }
  }

  res.setHeader('Allow', ['GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}

