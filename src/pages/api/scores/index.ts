import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure database connection
  try {
    const result = await prisma.rekap_skor_unit_kerja.aggregate({
      _avg: {
        branding_score: true,
        networking_score: true,
        inovasi_score: true,
        total_learning_score: true,
        // New score fields
        bigger_total_score: true,
        bigger_generik_score: true,
        bigger_score: true,
        smarter_total_score: true,
        smarter_generik_score: true,
        smarter_score: true,
        better_total_score: true,
        better_generik_score: true,
        better_score: true,
      },
    })

    const branding = Number(result._avg.branding_score?.toFixed(2) ?? 0)
    const networking = Number(result._avg.networking_score?.toFixed(2) ?? 0)
    const inovasi = Number(result._avg.inovasi_score?.toFixed(2) ?? 0)
    const learning = Number(result._avg.total_learning_score?.toFixed(2) ?? 0)

    // Calculate traditional scores (for backward compatibility)
    //const smarter_calc = Number(((inovasi + learning) / 2).toFixed(2))
    //const bigger_calc = Number(((branding + networking) / 2).toFixed(2))
    //const better_calc = Number(((branding + networking + inovasi + learning) / 4).toFixed(2))

    // Get the new score fields from database
    const bigger_total = Number(result._avg.bigger_total_score?.toFixed(2) ?? 0)
    const bigger_generik = Number(result._avg.bigger_generik_score?.toFixed(2) ?? 0)
    const bigger_transform = Number(result._avg.bigger_score?.toFixed(2) ?? 0)
    
    const smarter_total = Number(result._avg.smarter_total_score?.toFixed(2) ?? 0)
    const smarter_generik = Number(result._avg.smarter_generik_score?.toFixed(2) ?? 0)
    const smarter_transform = Number(result._avg.smarter_score?.toFixed(2) ?? 0)
    
    const better_total = Number(result._avg.better_total_score?.toFixed(2) ?? 0)
    const better_generik = Number(result._avg.better_generik_score?.toFixed(2) ?? 0)
    const better_transform = Number(result._avg.better_score?.toFixed(2) ?? 0)

    
    return res.status(200).json({
      average_components: {
        branding_score: branding,
        networking_score: networking,
        inovasi_score: inovasi,
        learning_score: learning,
      },
      calculated_summary: {
        // New three-tier scoring system
        bigger_total_score: bigger_total,
        bigger_generik_score: bigger_generik,
        bigger_score: bigger_transform,
        smarter_total_score: smarter_total,
        smarter_generik_score: smarter_generik,
        smarter_score: smarter_transform,
        better_total_score: better_total,
        better_generik_score: better_generik,
        better_score: better_transform,
      },
    })
  } catch (error) {
    console.error('Error in /api/scores/index:', error)
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}

