// pages/api/broadcast/mark-read.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma' // Sesuaikan path jika berbeda

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { broadcastId, userId } = req.body

  // Validasi input
  if (!broadcastId || !userId) {
    return res.status(400).json({ error: 'broadcastId and userId are required' })
  }

  try {
    const broadcastIdNum = Number(broadcastId)
    const userIdNum = Number(userId)

    if (isNaN(broadcastIdNum) || isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid broadcastId or userId' })
    }

    // Cek apakah sudah ada record di broadcastread
    const existingRead = await prisma.broadcastread.findFirst({
      where: {
        message_id: broadcastIdNum,
        user_id: userIdNum,
      },
    })

    if (!existingRead) {
      // Jika belum pernah dibaca, buat record baru
      await prisma.broadcastread.create({
        data: {
          message_id: broadcastIdNum,
          user_id: userIdNum,
          readAt: new Date(),
        },
      })
    }

    // Kembalikan respons sukses
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error marking broadcast as read:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

