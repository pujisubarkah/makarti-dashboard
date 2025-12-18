import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      })
    }

    // Get user role to determine which notifications to fetch
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId as string) }
    })

    if (!user) {
      await prisma.$disconnect();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Fetch notifications for this user
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { receiver_id: parseInt(userId as string) },
          { receiver_role: user.role_id !== null ? String(user.role_id) : undefined }
        ]
      },
      include: {
        users: {
          select: {
            id: true,
            role: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      sender_id: notif.sender_id,
      sender_role: notif.users?.role === '1' ? 'admin' : 'user',
      message: notif.message,
      type: notif.type,
      created_at: notif.created_at,
      is_read: notif.is_read
    }))

    // Count unread notifications
    const unreadCount = notifications.filter(notif => !notif.is_read).length

    res.status(200).json({ 
      success: true, 
      notifications: formattedNotifications,
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    await prisma.$disconnect();
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    })
  }
}
