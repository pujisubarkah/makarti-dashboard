import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Helper function to calculate and update task progress based on subtasks
async function updateTaskProgress(taskId: number) {
  try {
    // Get all subtasks for this task
    const subtasks = await prisma.subtasks.findMany({
      where: { task_id: taskId },
      select: { is_done: true }
    });

    // Calculate progress percentage
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(subtask => subtask.is_done).length;
    const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // Update task progress
    await prisma.tasks.update({
      where: { id: taskId },
      data: { progress: progressPercentage }
    });

    console.log(`Updated task ${taskId} progress: ${progressPercentage}% (${completedSubtasks}/${totalSubtasks} subtasks completed)`);
    
    return progressPercentage;
  } catch (error) {
    console.error('Error updating task progress:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { task_id } = req.query;
      
      if (!task_id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const subtasks = await prisma.subtasks.findMany({
        where: {
          task_id: parseInt(task_id as string)
        },
        include: {
          pegawai: {
            select: {
              id: true,
              nama: true,
              jabatan: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('API GET /subtasks - Found subtasks:', subtasks.length);
      res.status(200).json(subtasks);
    } catch (error) {
      console.error('API GET /subtasks - Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { task_id, title, assigned_to } = req.body;

      if (!task_id || !title) {
        return res.status(400).json({ error: 'Task ID and title are required' });
      }

      console.log('API POST /subtasks - Creating subtask:', { task_id, title, assigned_to });

      const subtask = await prisma.subtasks.create({
        data: {
          task_id: parseInt(task_id),
          title,
          assigned_to: assigned_to ? parseInt(assigned_to) : null,
          is_done: false
        },
        include: {
          pegawai: {
            select: {
              id: true,
              nama: true,
              jabatan: true
            }
          }
        }
      });

      // Update task progress after creating subtask
      await updateTaskProgress(parseInt(task_id));

      console.log('API POST /subtasks - Created subtask:', subtask);
      res.status(201).json(subtask);
    } catch (error) {
      console.error('API POST /subtasks - Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, is_done, title, assigned_to } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Subtask ID is required' });
      }

      console.log('API PUT /subtasks - Updating subtask:', { id, is_done, title, assigned_to });

      // Build update data object
      const updateData: Partial<import('@prisma/client').subtasks> = {};
      
      if (is_done !== undefined) updateData.is_done = is_done;
      if (title !== undefined) updateData.title = title;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to ? parseInt(assigned_to) : null;

      const updatedSubtask = await prisma.subtasks.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          pegawai: {
            select: {
              id: true,
              nama: true,
              jabatan: true
            }
          }
        }
      });

      // Update task progress after updating subtask (especially when is_done changes)
      if (is_done !== undefined) {
        await updateTaskProgress(updatedSubtask.task_id);
      }

      console.log('API PUT /subtasks - Updated subtask:', updatedSubtask);
      res.status(200).json(updatedSubtask);
    } catch (error) {
      console.error('API PUT /subtasks - Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Subtask ID is required' });
      }

      console.log('API DELETE /subtasks - Deleting subtask:', id);

      // Get the subtask before deleting to know which task to update
      const subtaskToDelete = await prisma.subtasks.findUnique({
        where: { id: parseInt(id as string) },
        select: { task_id: true }
      });

      if (!subtaskToDelete) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      await prisma.subtasks.delete({
        where: { id: parseInt(id as string) }
      });

      // Update task progress after deleting subtask
      await updateTaskProgress(subtaskToDelete.task_id);

      console.log('API DELETE /subtasks - Subtask deleted successfully');
      res.status(200).json({ message: 'Subtask deleted successfully' });
    } catch (error) {
      console.error('API DELETE /subtasks - Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
