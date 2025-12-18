import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await prisma.produkInovasi.findMany({
        include: {
          status_inovasi: true,
          users: {
            select: {
              unit_kerja: true,
            },
          }
        },
      })
      return res.status(200).json(data)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ error: 'Gagal mengambil data produk inovasi.' })
    }
  }

  res.setHeader('Allow', ['GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}

