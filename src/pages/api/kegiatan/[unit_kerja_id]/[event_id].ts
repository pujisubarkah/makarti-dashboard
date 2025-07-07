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
  const { unit_kerja_id, event_id } = req.query
  const unitKerjaId = parseInt(unit_kerja_id as string)
  const eventId = parseInt(event_id as string)

  console.log('API /kegiatan/[unit_kerja_id]/[event_id] called');
  console.log('Method:', req.method);
  console.log('Unit Kerja ID:', unitKerjaId);
  console.log('Event ID:', eventId);

  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid unit kerja ID' 
    })
  }

  if (isNaN(eventId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid event ID' 
    })
  }

  if (req.method === 'PUT') {
    try {
      const updateData: EventData = req.body

      console.log('Update data received:', updateData);

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

      console.log('Final update data:', updateEventData);

      // Update event
      const updatedEvent = await prisma.event_schedule.update({
        where: { id: eventId },
        data: updateEventData
      })

      console.log('Event updated successfully:', updatedEvent);

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

      console.log('Deleting event:', existingEvent);

      // Delete event
      await prisma.event_schedule.delete({
        where: { id: eventId }
      })

      console.log('Event deleted successfully');

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
  
  else if (req.method === 'GET') {
    try {
      // Get specific event
      const event = await prisma.event_schedule.findFirst({
        where: {
          id: eventId,
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
        }
      })

      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        })
      }

      res.status(200).json({ 
        success: true, 
        message: 'Event fetched successfully',
        data: event
      })

    } catch (error) {
      console.error('Error fetching event:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch event' 
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
