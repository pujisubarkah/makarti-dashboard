import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { adminId } = req.query

    if (!adminId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin ID is required' 
      })
    }

    // Get messages sent by this admin with manual join
    const messages = await prisma.notification.findMany({
      where: {
        sender_id: parseInt(adminId as string)
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Get receiver details separately to avoid relation issues
    const messagesWithReceiver = await Promise.all(
      messages.map(async (msg) => {
        let receiverName = 'Broadcast Message'
        
        if (msg.receiver_id) {
          const receiver = await prisma.users.findUnique({
            where: { id: msg.receiver_id },
            select: { username: true, alias: true }
          })
          receiverName = receiver?.alias || receiver?.username || 'Unknown User'
        }

        return {
          id: msg.id,
          receiver_name: receiverName,
          message: msg.message,
          type: msg.type,
          created_at: msg.created_at,
          is_read: msg.is_read
        }
      })
    )

    res.status(200).json({ 
      success: true, 
      messages: messagesWithReceiver
    })

  } catch (error) {
    console.error('Error fetching sent messages:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sent messages' 
    })
  }
}
