// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'ID tidak valid' })
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        username: true,
        role_id: true,
        unit_kerja: true,
      },
    })

    if (!user) {
      await prisma.$disconnect();
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    await prisma.$disconnect();
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Error mengambil user:', error)
    await prisma.$disconnect();
    return res.status(500).json({ message: 'Internal server error' })
  }
}
