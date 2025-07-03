import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await prisma.status_inovasi.findMany({
        orderBy: {
          id: 'asc'
        }
      })
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error fetching status inovasi:', error)
      return res.status(500).json({ error: 'Gagal mengambil data status inovasi.' })
    }
  }

  res.setHeader('Allow', ['GET'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
