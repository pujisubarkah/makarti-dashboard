import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ message: 'unit_kerja_id tidak valid' })
  }

  try {
    const data = await prisma.rekap_skor_unit_kerja.findFirst({
      where: {
        unit_kerja_id: parseInt(unit_kerja_id),
      },
    })

    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan' })
    }

    const smarter = {
      smarter_score: data.smarter_score,
      learning_score: data.total_learning_score,
      learning_pelatihan_score: data.learning_pelatihan_score,
      learning_penyelenggaraan_score: data.learning_penyelenggaraan_score,
      inovasi_score: data.inovasi_score,
      inovasi_kinerja_score: data.inovasi_kinerja_score,
      inovasi_kajian_score: data.inovasi_kajian_score,
    }

    const bigger = {
      bigger_score: data.bigger_score,
      branding_score: data.branding_score,
      branding_engagement_score: data.branding_engagement_score,
      branding_publikasi_score: data.branding_publikasi_score,
      networking_score: data.networking_score,
      networking_kerjasama_score: data.networking_kerjasama_score,
      networking_koordinasi_score: data.networking_koordinasi_score,
    }

    const better = {
      better_score: data.better_score,
      learning_score: data.total_learning_score,
      inovasi_score: data.inovasi_score,
      branding_score: data.branding_score,
      networking_score: data.networking_score,
    }

    return res.status(200).json({
      unit_kerja_id: data.unit_kerja_id,
      smarter,
      bigger,
      better,
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
