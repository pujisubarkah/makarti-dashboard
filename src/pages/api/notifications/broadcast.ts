import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface User {
  id: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { sender_id, message, type = 'info' } = req.body

    if (!sender_id || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID and message are required' 
      })
    }

    // Get all non-admin users (role_id != 1)
    const users = await prisma.users.findMany({
      where: {
        role_id: { not: 1 }
      },
      select: {
        id: true
      }
    })

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map((user: User) => 
        prisma.notification.create({
          data: {
            sender_id: parseInt(sender_id),
            receiver_id: user.id,
            message: message.trim(),
            type: type,
            is_read: false,
            created_at: new Date()
          }
        })
      )
    )

    res.status(200).json({ 
      success: true, 
      message: `Broadcast sent to ${users.length} users`,
      count: users.length,
      notifications
    })

  } catch (error) {
    console.error('Error sending broadcast:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send broadcast' 
    })
  }
}

