import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  try {
    switch (req.method) {
      // 🔹 GET detail IDP by ID
      case 'GET': {
        const idp = await prisma.idp.findUnique({
          where: { id: Number(id) },
          include: {
            users: {
              select: { unit_kerja: true },
            },
          },
        })
        if (!idp) return res.status(404).json({ error: 'IDP tidak ditemukan' })
        return res.status(200).json(idp)
      }

      // 🔹 PUT update IDP
      case 'PUT': {
        const data = req.body
        const updated = await prisma.idp.update({
          where: { id: Number(id) },
          data: {
            ...data,
            updated_at: new Date(),
          },
        })
        return res.status(200).json(updated)
      }

      // 🔹 DELETE IDP
      case 'DELETE': {
        await prisma.idp.delete({
          where: { id: Number(id) },
        })
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error in /api/idp/[id]:', error)
    return res.status(500).json({ error: 'Gagal memproses data IDP.' })
  }
}
