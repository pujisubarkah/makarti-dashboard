import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { sender_id, receiver_id, receiver_role, message, type = 'info' } = req.body

    if (!sender_id || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID and message are required' 
      })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        sender_id: parseInt(sender_id),
        receiver_id: receiver_id ? parseInt(receiver_id) : null,
        receiver_role: receiver_role || null,
        message: message.trim(),
        type: type,
        is_read: false,
        created_at: new Date()
      }
    })

    res.status(200).json({ 
      success: true, 
      message: 'Notification sent successfully',
      notification 
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification' 
    })
  }
}

