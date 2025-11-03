import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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
      const whereClause: Record<string, unknown> = { assigned_to: employee.id };

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
      type IncludeClauseType = {
        pegawai: {
          select: {
            id: boolean;
            nama: boolean;
            nip: boolean;
            jabatan: boolean;
            golongan: boolean;
            eselon: boolean;
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
            created_at: boolean;
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
      };

      const includeClause: IncludeClauseType = {
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
      type TaskType = {
        id: number;
        title: string;
        owner: number;
        status: string;
        pilar: string | null;
        progress: number | null;
        created_at: Date | null;
      };
      const taskGroups: Record<number, { task: TaskType; subtasks: unknown[] }> = {};
      const taskStats: Record<number, { total: number; completed: number; pending: number; completion_rate: string }> = {};

      interface SubtaskType {
        task_id: number;
        is_done: boolean | null;
        created_at?: Date | string | null;
        tasks: TaskType;
        [key: string]: unknown;
      }

      subtasks.forEach((subtask: SubtaskType) => {
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
        
        if (subtask.is_done === true) {
          taskStats[taskId].completed++;
        } else {
          taskStats[taskId].pending++;
        }
        
        taskStats[taskId].completion_rate = 
          ((taskStats[taskId].completed / taskStats[taskId].total) * 100).toFixed(2) + '%';
      });

      // Calculate overall statistics
      const totalSubtasks = subtasks.length;
      const completedSubtasks = subtasks.filter((st: SubtaskType) => st.is_done).length;
      const pendingSubtasks = totalSubtasks - completedSubtasks;
      const overallCompletionRate = totalSubtasks > 0 ? ((completedSubtasks / totalSubtasks) * 100).toFixed(2) + '%' : '0%';

      // Get tasks with submissions and reviews
      const submittedSubtasks = subtasks.filter((st: { subtask_submissions?: unknown }) => st.subtask_submissions).length;
      const reviewedSubtasks = subtasks.filter((st: { subtask_reviews?: unknown }) => st.subtask_reviews).length;

      // Calculate average rating if reviews exist
      let averageRating = 0;
      interface SubtaskWithOptionalReviews {
        subtask_reviews?: { rating?: number } | null;
        [key: string]: unknown;
      }
      const reviewedTasks = subtasks.filter((st: SubtaskWithOptionalReviews) => st.subtask_reviews);
      if (reviewedTasks.length > 0) {
        const totalRating = reviewedTasks.reduce(
          (sum: number, st: SubtaskWithOptionalReviews) => sum + (st.subtask_reviews?.rating || 0),
          0
        );
        averageRating = totalRating / reviewedTasks.length;
      }

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSubtasks = subtasks.filter((st: SubtaskType) => 
        st.created_at && (typeof st.created_at === 'string' || st.created_at instanceof Date) && new Date(st.created_at) > thirtyDaysAgo
      );

      interface SubtaskWithSubmission {
        is_done: boolean | null;
        subtask_submissions?: { submitted_at?: Date | string | null } | null;
      }
      const recentCompletions = subtasks.filter((st: SubtaskWithSubmission) => 
        st.is_done === true && st.subtask_submissions && 
        st.subtask_submissions.submitted_at &&
        new Date(st.subtask_submissions.submitted_at) > thirtyDaysAgo
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
          tasks_involved: [...new Set(subtasks.map((st: SubtaskType) => st.task_id))].length
        }
      });

      await prisma.$disconnect();

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
        await prisma.$disconnect();
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

      await prisma.$disconnect();

    } else if (req.method === 'DELETE') {
      // Delete a subtask by id (from query param)
      const { id } = req.query;
      const subtaskId = typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : undefined;
      if (!subtaskId || isNaN(subtaskId)) {
        return res.status(400).json({ error: 'Invalid or missing subtask id' });
      }
      // Optionally, check if subtask belongs to this NIP
      const employee = await prisma.pegawai.findFirst({ where: { nip: nipString }, select: { id: true } });
      if (!employee) {
        return res.status(404).json({ error: `Employee with NIP ${nipString} not found` });
      }
      const subtask = await prisma.subtasks.findUnique({ where: { id: subtaskId } });
      if (!subtask) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Subtask not found' });
      }
      if (subtask.assigned_to !== employee.id) {
        await prisma.$disconnect();
        return res.status(403).json({ error: 'Subtask does not belong to this employee' });
      }
      await prisma.subtasks.delete({ where: { id: subtaskId } });
      await prisma.$disconnect();
      return res.status(200).json({ success: true, message: 'Subtask deleted' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in NIP subtasks API:', error);
    await prisma.$disconnect();
    return res.status(500).json({ error: 'Internal server error' });
  }
}