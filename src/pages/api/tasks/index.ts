import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get user ID for filtering tasks
      const userId = getUserIdFromRequest(req);
      
      // Only return tasks if user is authenticated and has valid userId
      if (!userId) {
        return res.status(200).json([]);
      }
      
      // Filter tasks based on user's owner/unit kerja
      const whereClause = { owner: userId };
      
      const tasks = await prisma.tasks.findMany({
        where: whereClause,
        include: {
          subtasks: true,
          users: true,
        },
      });
      
      res.status(200).json(tasks);
    } catch {
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
    } catch {
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

      const updatedTask = await prisma.tasks.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          subtasks: true,
          users: true,
        },
      });

      res.status(200).json(updatedTask);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}