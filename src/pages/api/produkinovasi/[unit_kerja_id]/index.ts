import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: 'unit_kerja_id tidak valid' })
  }

  const uid = parseInt(unit_kerja_id as string)

  if (req.method === 'GET') {
    try {
      const data = await prisma.produkInovasi.findMany({
        where: { unit_kerja_id: uid },
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
      console.error('Error fetching produk inovasi:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk inovasi unit kerja.' })
    }
  }

  if (req.method === 'POST') {
    const { nama, jenis, status_id, tanggalRilis, keterangan } = req.body
    if (!nama || !jenis || !status_id || !tanggalRilis) {
      return res.status(400).json({ error: 'Data produk inovasi tidak lengkap.' })
    }
    try {
      const newProduk = await prisma.produkInovasi.create({
        data: {
          nama,
          jenis,
          status_id,
          tanggalRilis: new Date(tanggalRilis),
          keterangan,
          unit_kerja_id: uid,
        },
      })
      return res.status(201).json(newProduk)
    } catch (error) {
      console.error('Error creating produk inovasi:', error);
      return res.status(500).json({ error: 'Gagal menambah produk inovasi.' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
