import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing id parameter' });
  }
  const taskId = Number(id);
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid id format' });
  }

  if (req.method === 'GET') {
    // Get task by id with subtasks and users
    try {
      const task = await prisma.tasks.findUnique({
        where: { id: taskId },
        include: {
          subtasks: true,
          users: true,
        },
      });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error });
    }
  } else if (req.method === 'PUT') {
    // Update task by id
    try {
      const { title, owner, status, label, progress, pilar } = req.body;
      if (!title || !owner || !status) {
        return res.status(400).json({ error: 'title, owner, and status are required' });
      }
      const data: Record<string, unknown> = {
        title,
        owner: Number(owner),
        status,
      };
      if (typeof label !== 'undefined') data.label = label;
      if (typeof progress !== 'undefined') data.progress = progress;
      if (typeof pilar !== 'undefined') data.pilar = pilar;
      const updatedTask = await prisma.tasks.update({
        where: { id: taskId },
        data,
        include: {
          subtasks: true,
          users: true,
        },
      });
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task', details: error });
    }
  } else if (req.method === 'DELETE') {
    // Delete task by id
    try {
      await prisma.tasks.delete({
        where: { id: taskId },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
