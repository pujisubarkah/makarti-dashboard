// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        role_id: true,
        unit_kerja: true,
      },
    })

    await prisma.$disconnect();
    return res.status(200).json({ users })
  } catch (error) {
    console.error('Error mengambil data users:', error)
    await prisma.$disconnect();
    return res.status(500).json({ message: 'Internal server error' })
  }
}
