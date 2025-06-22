import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const unitKerjaId = parseInt(req.query.unit_kerja_id as string)

  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ message: "Invalid unit_kerja_id" })
  }

  try {
    if (req.method === 'GET') {
      const publikasi = await prisma.publikasi.findMany({
        where: { unit_kerja_id: unitKerjaId },
        orderBy: { tanggal: 'desc' },
      })
      return res.status(200).json(publikasi)
    }

    if (req.method === 'POST') {
      const { judul, tanggal, jenis, link, likes, views } = req.body

      // Validasi required fields
      if (!judul || !tanggal || !jenis) {
        return res.status(400).json({ 
          message: "Missing required fields: judul, tanggal, jenis" 
        })
      }

      const newPublikasi = await prisma.publikasi.create({
        data: {
          judul,
          tanggal: new Date(tanggal),
          jenis,
          link: link || null,
          likes: likes || null,
          views: views || null,
          unit_kerja_id: unitKerjaId,
        },
      })
      return res.status(201).json(newPublikasi)
    }

    return res.status(405).json({ message: "Method not allowed" })
    
  } catch (error) {
    console.error('Error in publikasi API:', error)
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
}