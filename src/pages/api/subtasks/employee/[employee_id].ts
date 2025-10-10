import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employee_id } = req.query;

  if (!employee_id || Array.isArray(employee_id)) {
    return res.status(400).json({ error: 'Invalid employee_id parameter' });
  }

  const employeeId = parseInt(employee_id, 10);
  if (isNaN(employeeId)) {
    return res.status(400).json({ error: 'employee_id must be a valid number' });
  }

  try {
    if (req.method === 'GET') {
      // Get all subtasks assigned to a specific employee
      const { 
        include_reviews = 'false',
        include_submissions = 'false',
        is_done,
        task_id
      } = req.query;

      // Check if employee exists
      const employee = await prisma.pegawai.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          nama: true,
          nip: true,
          jabatan: true,
          golongan: true
        }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Build where clause
      const whereClause: any = { assigned_to: employeeId };

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

      // Get tasks with submissions
      const submittedSubtasks = subtasks.filter(st => st.subtask_submissions).length;
      const reviewedSubtasks = subtasks.filter(st => st.subtask_reviews).length;

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
          review_rate: totalSubtasks > 0 ? ((reviewedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%'
        }
      });

    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in employee subtasks API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}