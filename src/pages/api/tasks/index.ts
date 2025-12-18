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
  } else if (req.method === 'DELETE') {
    // Bulk or single delete: accept id (number or array) in query or body
    let ids: number[] = [];
    if (req.query.id) {
      if (Array.isArray(req.query.id)) {
        ids = req.query.id.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
      } else {
        const parsed = parseInt(req.query.id as string, 10);
        if (!isNaN(parsed)) ids = [parsed];
      }
    } else if (req.body && req.body.id) {
      if (Array.isArray(req.body.id)) {
  ids = req.body.id.map((v: string | number) => parseInt(v as string, 10)).filter((v: number) => !isNaN(v));
      } else {
        const parsed = parseInt(req.body.id, 10);
        if (!isNaN(parsed)) ids = [parsed];
      }
    }
    if (!ids.length) {
      return res.status(400).json({ error: 'No valid id(s) provided for deletion' });
    }
    try {
      const deleted = await prisma.tasks.deleteMany({ where: { id: { in: ids } } });
      
      return res.status(200).json({ deleted_count: deleted.count, ids });
    } catch (error) {
      
      return res.status(500).json({ error: 'Failed to delete task(s)', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

