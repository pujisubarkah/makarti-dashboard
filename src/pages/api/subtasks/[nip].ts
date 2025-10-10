import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { nip } = req.query;

  if (!nip || Array.isArray(nip)) {
    return res.status(400).json({ error: 'Invalid NIP parameter' });
  }

  const nipString = nip.toString();

  try {
    if (req.method === 'GET') {
      // Get all subtasks assigned to employee by NIP
      const { 
        include_reviews = 'false',
        include_submissions = 'false',
        is_done,
        task_id
      } = req.query;

      // First, find the employee by NIP
      const employee = await prisma.pegawai.findFirst({
        where: { nip: nipString },
        select: {
          id: true,
          nama: true,
          nip: true,
          jabatan: true,
          golongan: true,
          eselon: true
        }
      });

      if (!employee) {
        return res.status(404).json({ error: `Employee with NIP ${nipString} not found` });
      }

      // Build where clause for subtasks
      const whereClause: any = { assigned_to: employee.id };

      if (is_done && !Array.isArray(is_done)) {
        whereClause.is_done = is_done === 'true';
      }

      if (task_id && !Array.isArray(task_id)) {
        const tId = parseInt(task_id, 10);
        if (!isNaN(tId)) {
          whereClause.task_id = tId;
        }
      }

      // Build include clause
      const includeClause: any = {
        pegawai: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
            golongan: true,
            eselon: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            owner: true,
            status: true,
            pilar: true,
            progress: true,
            created_at: true
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
        }
      });

      // Group subtasks by task
      const taskGroups: Record<number, any> = {};
      const taskStats: Record<number, { total: number; completed: number; pending: number; completion_rate: string }> = {};

      subtasks.forEach(subtask => {
        const taskId = subtask.task_id;
        
        if (!taskGroups[taskId]) {
          taskGroups[taskId] = {
            task: subtask.tasks,
            subtasks: []
          };
          taskStats[taskId] = { total: 0, completed: 0, pending: 0, completion_rate: '0%' };
        }
        
        taskGroups[taskId].subtasks.push(subtask);
        taskStats[taskId].total++;
        
        if (subtask.is_done) {
          taskStats[taskId].completed++;
        } else {
          taskStats[taskId].pending++;
        }
        
        taskStats[taskId].completion_rate = 
          ((taskStats[taskId].completed / taskStats[taskId].total) * 100).toFixed(2) + '%';
      });

      // Calculate overall statistics
      const totalSubtasks = subtasks.length;
      const completedSubtasks = subtasks.filter(st => st.is_done).length;
      const pendingSubtasks = totalSubtasks - completedSubtasks;
      const overallCompletionRate = totalSubtasks > 0 ? ((completedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%';

      // Get tasks with submissions and reviews
      const submittedSubtasks = subtasks.filter(st => st.subtask_submissions).length;
      const reviewedSubtasks = subtasks.filter(st => st.subtask_reviews).length;

      // Calculate average rating if reviews exist
      let averageRating = 0;
      const reviewedTasks = subtasks.filter((st: any) => st.subtask_reviews);
      if (reviewedTasks.length > 0) {
        const totalRating = reviewedTasks.reduce((sum: number, st: any) => sum + (st.subtask_reviews?.rating || 0), 0);
        averageRating = totalRating / reviewedTasks.length;
      }

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSubtasks = subtasks.filter(st => 
        new Date(st.created_at!) > thirtyDaysAgo
      );

      const recentCompletions = subtasks.filter((st: any) => 
        st.is_done && st.subtask_submissions && 
        new Date(st.subtask_submissions.submitted_at!) > thirtyDaysAgo
      );

      return res.status(200).json({
        employee: employee,
        subtasks: subtasks,
        grouped_by_task: Object.values(taskGroups),
        task_statistics: taskStats,
        overall_statistics: {
          total: totalSubtasks,
          completed: completedSubtasks,
          pending: pendingSubtasks,
          submitted: submittedSubtasks,
          reviewed: reviewedSubtasks,
          completion_rate: overallCompletionRate,
          submission_rate: totalSubtasks > 0 ? ((submittedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%',
          review_rate: totalSubtasks > 0 ? ((reviewedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%',
          average_rating: averageRating > 0 ? averageRating.toFixed(2) : null
        },
        recent_activity: {
          new_subtasks_30_days: recentSubtasks.length,
          completed_30_days: recentCompletions.length,
          tasks_involved: [...new Set(subtasks.map(st => st.task_id))].length
        }
      });

    } else if (req.method === 'POST') {
      // Create new subtask assigned to employee by NIP
      const { task_id, title, is_done = false } = req.body;

      if (!task_id || !title) {
        return res.status(400).json({ error: 'task_id and title are required' });
      }

      if (typeof task_id !== 'number' || typeof title !== 'string') {
        return res.status(400).json({ error: 'Invalid data types for task_id or title' });
      }

      // Find employee by NIP
      const employee = await prisma.pegawai.findFirst({
        where: { nip: nipString },
        select: { id: true, nama: true, nip: true }
      });

      if (!employee) {
        return res.status(404).json({ error: `Employee with NIP ${nipString} not found` });
      }

      // Validate task exists
      const task = await prisma.tasks.findUnique({
        where: { id: task_id }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const newSubtask = await prisma.subtasks.create({
        data: {
          task_id: task_id,
          title: title,
          assigned_to: employee.id,
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
              golongan: true,
              eselon: true
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
    console.error('Error in NIP subtasks API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}