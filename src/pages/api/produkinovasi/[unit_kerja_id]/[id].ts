import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query

  if (
    !unit_kerja_id ||
    !id ||
    Array.isArray(unit_kerja_id) ||
    Array.isArray(id)
  ) {
    return res.status(400).json({ error: 'Parameter tidak valid' })
  }

  const uid = parseInt(unit_kerja_id)
  const produkId = parseInt(id)

  if (req.method === 'GET') {
    try {
      const data = await prisma.produkInovasi.findFirst({
        where: {
          id: produkId,
          unit_kerja_id: uid,
        },
        include: {
          status_inovasi: true,
          users: true,
        },
      })

      if (!data) return res.status(404).json({ error: 'Data tidak ditemukan' })
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error fetching produk inovasi:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk inovasi.' })
    }
  }

  if (req.method === 'PUT') {
    const { nama, jenis, status_id, tanggalRilis, keterangan } = req.body
    try {
      const updated = await prisma.produkInovasi.updateMany({
        where: {
          id: produkId,
          unit_kerja_id: uid,
        },
        data: {
          nama,
          jenis,
          status_id,
          tanggalRilis: new Date(tanggalRilis),
          keterangan,
        },
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error('Error updating produk inovasi:', error);
      return res.status(500).json({ error: 'Gagal mengubah data produk inovasi.' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.produkInovasi.deleteMany({
        where: {
          id: produkId,
          unit_kerja_id: uid,
        },
      })
      return res.status(204).end()
    } catch (error) {
      console.error('Error deleting produk inovasi:', error);
      return res.status(500).json({ error: 'Gagal menghapus data produk inovasi.' })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
