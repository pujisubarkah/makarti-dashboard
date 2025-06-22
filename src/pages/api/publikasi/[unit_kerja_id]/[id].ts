import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const unitKerjaId = parseInt(req.query.unit_kerja_id as string)
  const publikasiId = parseInt(req.query.id as string)

  if (isNaN(unitKerjaId) || isNaN(publikasiId)) {
    return res.status(400).json({ message: "Invalid unit_kerja_id or id" })
  }

  try {
    switch (req.method) {
      case 'GET':
        const publikasi = await prisma.publikasi.findFirst({
          where: {
            id: publikasiId,
            unit_kerja_id: unitKerjaId,
          },
        })
        if (!publikasi) {
          return res.status(404).json({ message: 'Publikasi not found' })
        }
        return res.status(200).json(publikasi)

      case 'PUT':
        const { judul, tanggal, jenis, link, likes, views } = req.body

        const updated = await prisma.publikasi.update({
          where: { id: publikasiId },
          data: {
            judul,
            tanggal: tanggal ? new Date(tanggal) : undefined,
            jenis,
            link,
            likes,
            views,
          },
        })
        return res.status(200).json(updated)

      case 'DELETE':
        await prisma.publikasi.delete({
          where: { id: publikasiId },
        })
        return res.status(200).json({ message: 'Publikasi deleted successfully' })

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('❌ Error in publikasi API:', error)
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    })
  } finally {
    await prisma.$disconnect()
  }
}
