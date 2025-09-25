import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Ambil semua tasks beserta subtasks dan users
    try {
      const tasks = await prisma.tasks.findMany({
        include: {
          subtasks: true,
          users: true,
        },
      });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error });
    }
  } else if (req.method === 'POST') {
    // Tambah task baru (beserta subtasks jika ada)
    try {
      const { title, owner, status, label, progress, pilar, subtasks } = req.body;
      if (!title || !owner || !status) {
        return res.status(400).json({ error: 'title, owner, and status are required' });
      }
      const data = {
        title,
        owner: Number(owner),
        status,
        ...(typeof label !== 'undefined' && { label }),
        ...(typeof progress !== 'undefined' && { progress }),
        ...(typeof pilar !== 'undefined' && { pilar }),
      };
      if (typeof label !== 'undefined') data.label = label;
      if (typeof progress !== 'undefined') data.progress = progress;
      if (typeof pilar !== 'undefined') data.pilar = pilar;
      const subtasksData = (subtasks && Array.isArray(subtasks)) ? {
        subtasks: {
          create: subtasks.map((sub: {
            title: string;
            is_done?: boolean;
            assigned_to?: string;
            created_at?: string;
          }) => ({
            title: sub.title,
            is_done: sub.is_done || false,
            assigned_to: sub.assigned_to,
            created_at: sub.created_at ? new Date(sub.created_at) : undefined,
          })),
        }
      } : {};
      const finalData = { ...data, ...subtasksData };
      const newTask = await prisma.tasks.create({
        data: finalData,
        include: {
          subtasks: true,
          users: true,
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}