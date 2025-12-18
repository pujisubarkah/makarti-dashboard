// pages/api/broadcast/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma' // sesuaikan path ke Prisma kamu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const userId = Number(req.query.userId)

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const broadcasts = await prisma.broadcastmessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        broadcastread: {
          where: {
            user_id: userId,
          },
          select: { id: true },
        },
      },
    })

    const result = broadcasts.map((msg) => ({
      id: msg.id,
      message: msg.message,
      type: msg.type,
      createdAt: msg.createdAt,
      isRead: msg.broadcastread.length > 0,
    }))

    res.status(200).json(result)
  } catch (error) {
    console.error('Error fetching broadcast messages:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

