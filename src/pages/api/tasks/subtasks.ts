import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  try {
    // Mulai dari users, lalu ke tasks, subtasks, pegawai, pegawai_detail
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            subtasks: {
              select: {
                id: true,
                title: true,
                is_done: true,
                pegawai: {
                  select: {
                    nama: true,
                    pegawai_detail: {
                      select: { photo_url: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
