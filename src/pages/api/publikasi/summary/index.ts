import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Ambil semua alias dari users (role_id 2 atau 3) yang tidak null
    const allUsersRaw = await prisma.users.findMany({
      where: {
        role_id: {
          in: [2, 3],
        },
        alias: {
          not: null,
        },
      },
      select: {
        alias: true,
      },
      distinct: ['alias'],
    })

    const allAlias = allUsersRaw
      .map((u) => u.alias!)
      .filter((v, i, self) => self.indexOf(v) === i)

    // 2. Ambil alias yang sudah mengisi publikasi
    const sudahIsiRaw = await prisma.publikasi.findMany({
      where: {
        users: {
          role_id: {
            in: [2, 3],
          },
          alias: {
            not: null,
          },
        },
      },
      select: {
        users: {
          select: {
            alias: true,
          },
        },
      },
    })

    const aliasSudahIsi = Array.from(new Set(
      sudahIsiRaw
        .map((p) => p.users?.alias)
        .filter((a): a is string => !!a)
    ))

    // 3. Alias yang belum mengisi publikasi
    const aliasBelumIsi = allAlias.filter(
      (alias) => !aliasSudahIsi.includes(alias)
    )

    return res.status(200).json({
      unit_kerja_sudah_isi: aliasSudahIsi,
      unit_kerja_belum_isi: aliasBelumIsi,
      summary: {
        total_sudah_isi: aliasSudahIsi.length,
        total_belum_isi: aliasBelumIsi.length,
        total_unit_kerja: aliasSudahIsi.length + aliasBelumIsi.length
      }
    })
  } catch (error) {
    console.error('❌ Error fetching alias summary:', error)
    return res.status(500).json({ error: 'Gagal mengambil data alias unit kerja' })
  }
}
