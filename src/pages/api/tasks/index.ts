import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get user ID for filtering tasks
      const userId = getUserIdFromRequest(req);
      
      console.log('API GET /tasks - User ID from request:', userId);
      
      // Temporary: Get all tasks first to debug
      const allTasks = await prisma.tasks.findMany({
        include: {
          subtasks: true,
          users: true,
        },
      });
      
      console.log('API GET /tasks - All tasks in DB:', allTasks.length);
      console.log('API GET /tasks - All tasks data:', allTasks.map(t => ({ id: t.id, title: t.title, status: t.status, owner: t.owner })));
      
      // TEMPORARY: Show all tasks for debugging
      // const whereClause = userId ? { owner: userId } : {};
      const whereClause = {}; // Show all tasks temporarily
      
      console.log('API GET /tasks - Where clause (showing all tasks for debug):', whereClause);
      
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
      
      if (status !== undefined) {
        updateData.status = status;
        updateData.progress = status === 'selesai' ? 100 : undefined;
      }
      
      if (title !== undefined) updateData.title = title;
      if (label !== undefined) updateData.label = label;
      if (pilar !== undefined) updateData.pilar = pilar;
      if (tags !== undefined) updateData.tags = tags;
      if (pj_kegiatan !== undefined) updateData.pj_kegiatan = pj_kegiatan;

      const updatedTask = await prisma.tasks.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          subtasks: true,
          users: true,
        },
      });

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
