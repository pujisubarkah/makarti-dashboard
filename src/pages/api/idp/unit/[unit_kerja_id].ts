import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query

  try {
    switch (req.method) {
      // 🔹 GET all IDP by unit_kerja_id
      case 'GET': {
        const { tahun } = req.query
        
        const whereClause: { tahun?: number } = {}
        if (tahun) whereClause.tahun = Number(tahun)

        // Find IDPs where the user's pegawai has the specified unit_kerja_id
        const idpList = await prisma.idp.findMany({
          where: {
            ...whereClause,
            users: {
              pegawai_pegawai_nipTousers: {
                unit_kerja_id: Number(unit_kerja_id)
              }
            }
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                alias: true,
                pegawai_pegawai_nipTousers: {
                  select: {
                    id: true,
                    nip: true,
                    nama: true,
                    unit_kerja_id: true,
                    jabatan: true,
                    golongan: true,
                    eselon: true,
                  }
                }
              }
            },
          },
          orderBy: { created_at: 'desc' },
        })

        return res.status(200).json({
          unit_kerja_id: Number(unit_kerja_id),
          tahun: tahun ? Number(tahun) : null,
          total: idpList.length,
          data: idpList
        })
      }

      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error in /api/idp/unit/[unit_kerja_id]:', error)
    return res.status(500).json({ error: 'Gagal memproses data IDP berdasarkan unit kerja.' })
  }
}