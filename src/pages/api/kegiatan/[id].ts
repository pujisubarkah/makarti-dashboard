import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EventData {
  title: string;
  date: string;
  location?: string;
  time?: string;
  type?: string;
  priority?: string;
  attendees?: number;
  description?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const unitKerjaId = parseInt(id as string)

  console.log('API /kegiatan/[id] called');
  console.log('Method:', req.method);
  console.log('Unit Kerja ID:', unitKerjaId);

  if (isNaN(unitKerjaId)) {
    console.log('Invalid unit kerja ID:', id);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid unit kerja ID' 
    })
  }

  if (req.method === 'POST') {
    try {
      const eventData: EventData = req.body

      // Validasi data yang diperlukan
      if (!eventData.title || !eventData.date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title and date are required' 
        })
      }

      // Validasi format tanggal
      const eventDate = new Date(eventData.date)
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid date format' 
        })
      }

      // Cek apakah unit_kerja_id valid
      const unitKerja = await prisma.users.findUnique({
        where: { id: unitKerjaId }
      })

      if (!unitKerja) {
        return res.status(404).json({ 
          success: false, 
          message: 'Unit kerja not found' 
        })
      }

      // Buat event baru
      const newEvent = await prisma.event_schedule.create({
        data: {
          unit_kerja_id: unitKerjaId,
          title: eventData.title.trim(),
          date: eventDate,
          location: eventData.location?.trim() || null,
          time: eventData.time?.trim() || null,
          type: eventData.type?.trim() || null,
          priority: eventData.priority?.trim() || null,
          attendees: eventData.attendees || 0,
          description: eventData.description?.trim() || null,
          created_at: new Date()
        }
      })

      res.status(201).json({ 
        success: true, 
        message: 'Event created successfully',
        data: newEvent
      })

    } catch (error) {
      console.error('Error creating event:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create event' 
      })
    }
  } 
  
  else if (req.method === 'GET') {
    try {
      console.log('GET request - fetching events for unit_kerja_id:', unitKerjaId);
      
      // Ambil semua event untuk unit kerja ini
      const events = await prisma.event_schedule.findMany({
        where: {
          unit_kerja_id: unitKerjaId
        },
        include: {
          users: {
            select: {
              id: true,
              unit_kerja: true,
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      console.log('Events found:', events.length);
      console.log('Events data:', events);

      res.status(200).json({ 
        success: true, 
        message: 'Events fetched successfully',
        data: events,
        count: events.length
      })

    } catch (error) {
      console.error('Error fetching events:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch events' 
      })
    }
  }
  
  else if (req.method === 'PUT') {
    try {
      const { eventId, ...updateData }: { eventId: number } & Partial<EventData> = req.body

      if (!eventId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event ID is required for update' 
        })
      }

      // Cek apakah event exists dan milik unit kerja ini
      const existingEvent = await prisma.event_schedule.findFirst({
        where: {
          id: eventId,
          unit_kerja_id: unitKerjaId
        }
      })

      if (!existingEvent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found or access denied' 
        })
      }

      // Prepare update data
      const updateEventData: any = {}
      
      if (updateData.title) updateEventData.title = updateData.title.trim()
      if (updateData.date) {
        const eventDate = new Date(updateData.date)
        if (!isNaN(eventDate.getTime())) {
          updateEventData.date = eventDate
        }
      }
      if (updateData.location !== undefined) updateEventData.location = updateData.location?.trim() || null
      if (updateData.time !== undefined) updateEventData.time = updateData.time?.trim() || null
      if (updateData.type !== undefined) updateEventData.type = updateData.type?.trim() || null
      if (updateData.priority !== undefined) updateEventData.priority = updateData.priority?.trim() || null
      if (updateData.attendees !== undefined) updateEventData.attendees = updateData.attendees
      if (updateData.description !== undefined) updateEventData.description = updateData.description?.trim() || null

      // Update event
      const updatedEvent = await prisma.event_schedule.update({
        where: { id: eventId },
        data: updateEventData
      })

      res.status(200).json({ 
        success: true, 
        message: 'Event updated successfully',
        data: updatedEvent
      })

    } catch (error) {
      console.error('Error updating event:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update event' 
      })
    }
  }
  
  else if (req.method === 'DELETE') {
    try {
      const { eventId } = req.body

      if (!eventId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event ID is required for deletion' 
        })
      }

      // Cek apakah event exists dan milik unit kerja ini
      const existingEvent = await prisma.event_schedule.findFirst({
        where: {
          id: eventId,
          unit_kerja_id: unitKerjaId
        }
      })

      if (!existingEvent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found or access denied' 
        })
      }

      // Delete event
      await prisma.event_schedule.delete({
        where: { id: eventId }
      })

      res.status(200).json({ 
        success: true, 
        message: 'Event deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting event:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete event' 
      })
    }
  }
  
  else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }
}
