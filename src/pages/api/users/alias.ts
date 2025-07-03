// src/pages/api/users/alias.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const data = await prisma.users.findMany({
      where: {
        alias: {
          not: null,
        },
      },
      select: {
        alias: true,
      },
      orderBy: {
        alias: 'asc',
      },
    })

    // Bersihkan alias null dan duplikat
    const aliasList = Array.from(new Set(data.map((item) => item.alias).filter(Boolean)))

    res.status(200).json(aliasList)
  } catch (error) {
    console.error('Error fetching alias:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
