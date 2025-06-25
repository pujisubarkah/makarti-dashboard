import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await prisma.sosialisasi.findMany({
        include: {
          users: true, // jika ingin menyertakan data user
        },
      })
      return res.status(200).json(data)
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching data', error })
    }
  }

  if (req.method === 'POST') {
    const { nama, tanggal, jenis, platform, unit_kerja_id, peserta } = req.body

    if (!nama || !tanggal || !jenis || !platform || !unit_kerja_id || peserta === undefined) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const newSosialisasi = await prisma.sosialisasi.create({
        data: {
          nama,
          tanggal: new Date(tanggal),
          jenis,
          platform,
          unit_kerja_id,
          peserta,
        },
      })

      return res.status(201).json(newSosialisasi)
    } catch (error) {
      return res.status(500).json({ message: 'Error creating data', error })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
