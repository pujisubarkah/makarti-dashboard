import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Notification ID is required' 
      })
    }

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: { id: parseInt(id as string) },
      data: { is_read: true }
    })

    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read' 
    })
  }
}
