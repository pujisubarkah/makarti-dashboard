import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subtasks_id } = req.query;

  if (!subtasks_id || Array.isArray(subtasks_id)) {
    return res.status(400).json({ error: 'Invalid subtasks_id parameter' });
  }

  const subtaskId = parseInt(subtasks_id, 10);
  if (isNaN(subtaskId)) {
    return res.status(400).json({ error: 'subtasks_id must be a valid number' });
  }

  try {
    if (req.method === 'GET') {
      // Get subtask submission by subtask_id
      const submission = await prisma.subtask_submissions.findUnique({
        where: { subtask_id: subtaskId },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              },
              tasks: {
                select: {
                  id: true,
                  title: true,
                  owner: true
                }
              }
            }
          }
        }
      });

      if (!submission) {
        return res.status(404).json({ error: 'Subtask submission not found' });
      }

      return res.status(200).json(submission);

    } else if (req.method === 'POST') {
      // Create new subtask submission
      const { file_upload, komentar } = req.body;

      if (!file_upload) {
        return res.status(400).json({ error: 'file_upload is required' });
      }

      // Check if subtask exists and get assigned_to info
      const subtask = await prisma.subtasks.findUnique({
        where: { id: subtaskId },
        include: {
          pegawai: {
            select: {
              id: true,
              nama: true,
              nip: true
            }
          }
        }
      });

      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      // Check if submission already exists
      const existingSubmission = await prisma.subtask_submissions.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (existingSubmission) {
        return res.status(409).json({ error: 'Submission already exists for this subtask' });
      }

      // Create new submission
      const newSubmission = await prisma.subtask_submissions.create({
        data: {
          subtask_id: subtaskId,
          file_upload: file_upload,
          komentar: komentar || null,
          submitted_at: new Date(),
          is_revised: false
        },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              }
            }
          }
        }
      });

      return res.status(201).json(newSubmission);

    } else if (req.method === 'PUT') {
      // Update existing subtask submission
      const { file_upload, komentar, is_revised } = req.body;

      // Check if submission exists
      const existingSubmission = await prisma.subtask_submissions.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (!existingSubmission) {
        return res.status(404).json({ error: 'Subtask submission not found' });
      }

      // Update submission
      const updatedSubmission = await prisma.subtask_submissions.update({
        where: { subtask_id: subtaskId },
        data: {
          ...(file_upload && { file_upload }),
          ...(komentar !== undefined && { komentar }),
          ...(is_revised !== undefined && { is_revised }),
          submitted_at: new Date() // Update timestamp when revised
        },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              }
            }
          }
        }
      });

      return res.status(200).json(updatedSubmission);

    } else if (req.method === 'DELETE') {
      // Delete subtask submission
      const existingSubmission = await prisma.subtask_submissions.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (!existingSubmission) {
        return res.status(404).json({ error: 'Subtask submission not found' });
      }

      await prisma.subtask_submissions.delete({
        where: { subtask_id: subtaskId }
      });

      return res.status(204).end();

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in subtasks_submission API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}