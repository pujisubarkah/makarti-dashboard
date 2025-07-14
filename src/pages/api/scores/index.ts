import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await prisma.rekap_skor_unit_kerja.aggregate({
      _avg: {
        branding_score: true,
        networking_score: true,
        inovasi_score: true,
        total_learning_score: true,
      },
    })

    const branding = Number(result._avg.branding_score?.toFixed(2) ?? 0)
    const networking = Number(result._avg.networking_score?.toFixed(2) ?? 0)
    const inovasi = Number(result._avg.inovasi_score?.toFixed(2) ?? 0)
    const learning = Number(result._avg.total_learning_score?.toFixed(2) ?? 0)

    const smarter = Number(((inovasi + learning) / 2).toFixed(2))
    const bigger = Number(((branding + networking) / 2).toFixed(2))
    const better = Number(((branding + networking + inovasi + learning) / 4).toFixed(2))

    return res.status(200).json({
      average_components: {
        branding_score: branding,
        networking_score: networking,
        inovasi_score: inovasi,
        learning_score: learning,
      },
      calculated_summary: {
        smarter_score: smarter,
        bigger_score: bigger,
        better_score: better,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
