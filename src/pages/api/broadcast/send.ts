// pages/api/broadcast/send.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { message, type = 'info', adminId } = req.body

  // Validasi: hanya admin yang bisa kirim broadcast
  if (!message || !adminId) {
    return res.status(400).json({ error: 'Message and adminId are required' })
  }

  try {
    // Opsional: cek apakah pengirim benar-benar admin
    const admin = await prisma.users.findFirst({
      where: {
        id: Number(adminId),
        role_id: 1, // tanpa tanda kutip, karena role_id bertipe integer
      },
    })

    if (!admin) {
      return res.status(403).json({ error: 'Forbidden: Admin privileges required' })
    }

    // Simpan broadcast message
    const broadcast = await prisma.broadcastmessage.create({
      data: {
        message,
        type,
        sender_id: Number(adminId),
      },
    })

    return res.status(201).json({
      success: true,
      data: broadcast,
    })
  } catch (error) {
    console.error('Error sending broadcast:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}