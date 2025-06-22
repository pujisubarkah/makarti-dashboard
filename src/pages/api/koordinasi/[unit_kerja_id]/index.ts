import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const unitKerjaId = parseInt(req.query.unit_kerja_id as string)

  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ message: 'Invalid unit_kerja_id' })
  }

  try {
    if (req.method === 'GET') {
      const data = await prisma.koordinasi.findMany({
        where: { unit_kerja_id: unitKerjaId },
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

    if (req.method === 'POST') {
      const {
        tanggal,
        instansi,
        jenisInstansi,
        topik,
        catatan,
        Status,
      } = req.body

      // Validasi wajib
      if (!tanggal || !instansi || !jenisInstansi || !topik) {
        return res.status(400).json({
          message: 'Missing required fields: tanggal, instansi, jenisInstansi, topik',
        })
      }

      const newData = await prisma.koordinasi.create({
        data: {
          tanggal: new Date(tanggal),
          instansi,
          jenisInstansi,
          topik,
          catatan: catatan || null,
          Status: Status || null,
          unit_kerja_id: unitKerjaId,
        },
      })

      return res.status(201).json(newData)
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
