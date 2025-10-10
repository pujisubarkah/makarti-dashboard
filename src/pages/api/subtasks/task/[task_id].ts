import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { task_id } = req.query;

  if (!task_id || Array.isArray(task_id)) {
    return res.status(400).json({ error: 'Invalid task_id parameter' });
  }

  const taskId = parseInt(task_id, 10);
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'task_id must be a valid number' });
  }

  try {
    if (req.method === 'GET') {
      // Get all subtasks for a specific task
      const { 
        include_reviews = 'false',
        include_submissions = 'false',
        assigned_to,
        is_done
      } = req.query;

      // Check if task exists
      const task = await prisma.tasks.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          title: true,
          owner: true,
          status: true,
          pilar: true,
          progress: true
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Build where clause
      const whereClause: Record<string, unknown> = { task_id: taskId };

      if (assigned_to && !Array.isArray(assigned_to)) {
        const empId = parseInt(assigned_to, 10);
        if (!isNaN(empId)) {
          whereClause.assigned_to = empId;
        }
      }

      if (is_done && !Array.isArray(is_done)) {
        whereClause.is_done = is_done === 'true';
      }

      // Build include clause
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
          created_at: 'asc'
        }
      });

      // Calculate task completion statistics
      const totalSubtasks = subtasks.length;
      const completedSubtasks = subtasks.filter((st: { is_done: boolean | null }) => st.is_done === true).length;
      const pendingSubtasks = totalSubtasks - completedSubtasks;
      const completionRate = totalSubtasks > 0 ? ((completedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%';

      return res.status(200).json({
        task: task,
        subtasks: subtasks,
        statistics: {
          total: totalSubtasks,
          completed: completedSubtasks,
          pending: pendingSubtasks,
          completion_rate: completionRate
        }
      });

    } else if (req.method === 'POST') {
      // Create new subtask for specific task
      const { title, assigned_to, is_done = false } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }

      if (typeof title !== 'string') {
        return res.status(400).json({ error: 'title must be a string' });
      }

      // Validate task exists
      const task = await prisma.tasks.findUnique({
        where: { id: taskId }
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
          task_id: taskId,
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

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in task subtasks API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}