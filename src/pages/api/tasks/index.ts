import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get user ID for filtering tasks
      const userId = getUserIdFromRequest(req);
      
      console.log('API GET /tasks - User ID from request:', userId);
      
      // Only return tasks if user is authenticated and has valid userId
      if (!userId) {
        console.log('API GET /tasks - No user ID found, returning empty array');
        return res.status(200).json([]);
      }
      
      // Filter tasks based on user's owner/unit kerja
      const whereClause = { owner: userId };
      
      console.log('API GET /tasks - Where clause:', whereClause);
      console.log('API GET /tasks - Filtering tasks for user ID:', userId);
      
      const tasks = await prisma.tasks.findMany({
        where: whereClause,
        include: {
          subtasks: true,
          users: true,
        },
      });
      
      console.log('API GET /tasks - Found tasks:', tasks.length);
      console.log('API GET /tasks - Tasks with rencana status:', tasks.filter(task => task.status === 'rencana').length);
      
      res.status(200).json(tasks);
    } catch (error) {
      console.error('API GET /tasks - Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, label, pilar, tags, pj_kegiatan, owner } = req.body;

      // Get owner from request, fallback to getUserIdFromRequest helper
      let taskOwner = owner;
      if (!taskOwner) {
        taskOwner = getUserIdFromRequest(req);
        if (!taskOwner) {
          return res.status(400).json({ 
            error: 'Owner tidak dapat ditentukan. Pastikan Anda sudah login dan mengirim owner di request body atau header x-user-id.' 
          });
        }
      }

      const task = await prisma.tasks.create({
        data: {
          title,
          label,
          tags,
          pilar,
          pj_kegiatan,
          owner: taskOwner,
          status: 'rencana',
          progress: 0,
        },
        include: {
          subtasks: true,
          users: true,
        },
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status, title, label, pilar, tags, pj_kegiatan } = req.body;

      console.log('API PUT /tasks - Request body:', req.body);
      console.log('API PUT /tasks - Extracted fields:', { id, status, title, label, pilar, tags, pj_kegiatan });

      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Build update data object
      const updateData: Partial<{
        status: string;
        progress: number;
        title: string;
        label: string;
        pilar: string;
        tags: string;
        pj_kegiatan: string;
      }> = {};
      
      // Handle status update
      if (status !== undefined) {
        updateData.status = status;
        // Auto-set progress based on status
        if (status === 'selesai') {
          updateData.progress = 100;
        }
      }
      
      // Handle other field updates
      if (title !== undefined) updateData.title = title;
      if (label !== undefined) updateData.label = label;
      if (pilar !== undefined) updateData.pilar = pilar;
      if (tags !== undefined) updateData.tags = tags;
      if (pj_kegiatan !== undefined) updateData.pj_kegiatan = pj_kegiatan;

      console.log('API PUT /tasks - Update data object:', updateData);

      const updatedTask = await prisma.tasks.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          subtasks: true,
          users: true,
        },
      });

      console.log('API PUT /tasks - Updated task:', updatedTask);
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}