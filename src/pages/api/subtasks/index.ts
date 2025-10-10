import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface WhereClause {
  task_id?: number;
  assigned_to?: number;
  is_done?: boolean;
  title?: {
    contains: string;
    mode: 'insensitive';
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all subtasks with optional filters
      const { 
        task_id,
        assigned_to,
        is_done,
        search,
        limit = '50', 
        offset = '0',
        include_reviews = 'false',
        include_submissions = 'false'
      } = req.query;

      const whereClause: WhereClause = {};

      // Filter by task_id
      if (task_id && !Array.isArray(task_id)) {
        const taskId = parseInt(task_id, 10);
        if (!isNaN(taskId)) {
          whereClause.task_id = taskId;
        }
      }

      // Filter by assigned_to (employee)
      if (assigned_to && !Array.isArray(assigned_to)) {
        const empId = parseInt(assigned_to, 10);
        if (!isNaN(empId)) {
          whereClause.assigned_to = empId;
        }
      }

      // Filter by completion status
      if (is_done && !Array.isArray(is_done)) {
        whereClause.is_done = is_done === 'true';
      }

      // Search in title
      if (search && !Array.isArray(search)) {
        whereClause.title = {
          contains: search,
          mode: 'insensitive'
        };
      }

      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      // Build include clause based on query parameters
      const includeClause: {
        pegawai: {
          select: {
            id: boolean;
            nama: boolean;
            nip: boolean;
            jabatan: boolean;
            golongan: boolean;
          };
        };
        tasks: {
          select: {
            id: boolean;
            title: boolean;
            owner: boolean;
            status: boolean;
            pilar: boolean;
            progress: boolean;
          };
        };
        subtask_reviews?: {
          select: {
            id: boolean;
            rating: boolean;
            reviewed_by: boolean;
            reviewed_at: boolean;
          };
        };
        subtask_submissions?: {
          select: {
            id: boolean;
            file_upload: boolean;
            komentar: boolean;
            submitted_at: boolean;
            is_revised: boolean;
          };
        };
      } = {
        pegawai: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
            golongan: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            owner: true,
            status: true,
            pilar: true,
            progress: true
          }
        }
      };

      if (include_reviews === 'true') {
        includeClause.subtask_reviews = {
          select: {
            id: true,
            rating: true,
            reviewed_by: true,
            reviewed_at: true
          }
        };
      }

      if (include_submissions === 'true') {
        includeClause.subtask_submissions = {
          select: {
            id: true,
            file_upload: true,
            komentar: true,
            submitted_at: true,
            is_revised: true
          }
        };
      }

      const subtasks = await prisma.subtasks.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: {
          created_at: 'desc'
        },
        take: limitNum > 0 && limitNum <= 100 ? limitNum : 50,
        skip: offsetNum >= 0 ? offsetNum : 0
      });

      // Get total count for pagination
      const totalCount = await prisma.subtasks.count({
        where: whereClause
      });

      // Calculate statistics
      const stats = await prisma.subtasks.aggregate({
        where: whereClause,
        _count: {
          id: true
        }
      });

      const completedCount = await prisma.subtasks.count({
        where: {
          ...whereClause,
          is_done: true
        }
      });

      return res.status(200).json({
        subtasks,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          has_more: totalCount > offsetNum + limitNum
        },
        statistics: {
          total: stats._count.id,
          completed: completedCount,
          pending: stats._count.id - completedCount,
          completion_rate: stats._count.id > 0 ? ((completedCount / stats._count.id) * 100).toFixed(2) + '%' : '0%'
        }
      });

    } else if (req.method === 'POST') {
      // Create new subtask
      const { task_id, title, assigned_to, is_done = false } = req.body;

      if (!task_id || !title) {
        return res.status(400).json({ error: 'task_id and title are required' });
      }

      if (typeof task_id !== 'number' || typeof title !== 'string') {
        return res.status(400).json({ error: 'Invalid data types for task_id or title' });
      }

      // Validate task exists
      const task = await prisma.tasks.findUnique({
        where: { id: task_id }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Validate employee exists if assigned_to is provided
      if (assigned_to) {
        if (typeof assigned_to !== 'number') {
          return res.status(400).json({ error: 'assigned_to must be a number' });
        }

        const employee = await prisma.pegawai.findUnique({
          where: { id: assigned_to }
        });

        if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
        }
      }

      const newSubtask = await prisma.subtasks.create({
        data: {
          task_id: task_id,
          title: title,
          assigned_to: assigned_to || null,
          is_done: Boolean(is_done),
          created_at: new Date()
        },
        include: {
          pegawai: {
            select: {
              id: true,
              nama: true,
              nip: true,
              jabatan: true,
              golongan: true
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              owner: true,
              status: true,
              pilar: true,
              progress: true
            }
          }
        }
      });

      return res.status(201).json(newSubtask);

    } else if (req.method === 'PUT') {
      // Bulk update subtasks
      const { subtasks } = req.body;

      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        return res.status(400).json({ error: 'subtasks array is required' });
      }

      // Validate each subtask update
      for (const subtask of subtasks) {
        if (!subtask.id || typeof subtask.id !== 'number') {
          return res.status(400).json({ error: 'Each subtask must have a valid id' });
        }
      }

      // Update subtasks in transaction
      const updatedSubtasks = await prisma.$transaction(
        subtasks.map((subtask: { id: number; title?: string; assigned_to?: number; is_done?: boolean }) =>
          prisma.subtasks.update({
            where: { id: subtask.id },
            data: {
              ...(subtask.title && { title: subtask.title }),
              ...(subtask.assigned_to !== undefined && { assigned_to: subtask.assigned_to }),
              ...(subtask.is_done !== undefined && { is_done: subtask.is_done })
            }
          })
        )
      );

      return res.status(200).json({
        updated_count: updatedSubtasks.length,
        subtasks: updatedSubtasks
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in subtasks API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}