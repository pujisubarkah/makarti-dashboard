import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, ensureConnection } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure database connection
  await ensureConnection()

  try {
    switch (req.method) {
      // 🔹 GET semua IDP
      case 'GET': {
        const { user_id, tahun } = req.query
        
        const whereClause: { user_id?: number; tahun?: number } = {}
        if (user_id) whereClause.user_id = Number(user_id)
        if (tahun) whereClause.tahun = Number(tahun)

        const idpList = await prisma.idp.findMany({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          include: {
            users: {
              select: {
                pegawai_pegawai_nipTousers: {
                  select: {
                    unit_kerja_id: true,
                  }
                }
              }
            },
          },
          orderBy: { created_at: 'desc' },
        })
        await prisma.$disconnect()
        return res.status(200).json(idpList)
      }

      // 🔹 POST buat data IDP baru
      case 'POST': {
        const {
          user_id,
          tahun,
          strength,
          weakness,
          opportunities,
          threats,
          goals,
          activities,
          plans,
          ai_result,
          ai_suggestions,
          status,
        } = req.body

        // Basic validation
        if (!user_id || !tahun) {
          return res.status(400).json({ error: 'user_id and tahun are required' })
        }

        // Check user exists
        const user = await prisma.users.findUnique({ where: { id: Number(user_id) } })
        if (!user) {
          await prisma.$disconnect()
          return res.status(404).json({ error: 'User not found' })
        }

        // Prevent duplicate IDP for same user & year
        const existing = await prisma.idp.findFirst({
          where: { user_id: Number(user_id), tahun: Number(tahun) },
        })
        if (existing) {
          await prisma.$disconnect()
          return res.status(409).json({ error: 'IDP already exists for this user and year' })
        }

        const created = await prisma.idp.create({
          data: {
            user_id: Number(user_id),
            tahun: Number(tahun),
            strength: strength ?? null,
            weakness: weakness ?? null,
            opportunities: opportunities ?? null,
            threats: threats ?? null,
            goals: goals ?? null,
            activities: activities ?? null,
            plans: plans ?? null,
            ai_result: ai_result ?? null,
            ai_suggestions: ai_suggestions ?? null,
            status: status ?? 'draft',
          },
          include: {
            users: {
              select: {
                pegawai_pegawai_nipTousers: {
                  select: {
                    unit_kerja_id: true,
                  }
                }
              }
            },
          },
        })

        await prisma.$disconnect()
        return res.status(201).json({ message: 'IDP created', data: created })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error in /api/idp:', error)
    await prisma.$disconnect()
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' })
  }
}
