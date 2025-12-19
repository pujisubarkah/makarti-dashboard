import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface NotificationWithUser {
  id: number;
  sender_id: number | null;
  receiver_id: number | null;
  receiver_role: string | null;
  message: string;
  type: string;
  created_at: Date;
  is_read: boolean;
  users: {
    id: number;
    role: string | null;
  } | null;
}

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
    let user;
    try {
      user = await prisma.users.findUnique({
        where: { id: parseInt(userId as string) }
      });
    } catch (userError) {
      console.error('Error fetching user for notifications:', userError);
      // Return empty notifications if user fetch fails
      return res.status(200).json({ 
        success: true, 
        notifications: [],
        unreadCount: 0
      });
    }

    if (!user) {
      return res.status(200).json({ 
        success: true, 
        notifications: [],
        unreadCount: 0
      });
    }

    // Fetch notifications for this user
    let notifications: NotificationWithUser[] = [];
    try {
      notifications = await prisma.notification.findMany({
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
      });
    } catch (notificationError) {
      console.error('Error fetching notifications:', notificationError);
      // Return empty array if notification fetch fails - don't crash the app
      return res.status(200).json({ 
        success: true, 
        notifications: [],
        unreadCount: 0
      });
    }

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
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    })
  }
}
