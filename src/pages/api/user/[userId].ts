import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  // Validasi ID
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ 
      error: 'User ID harus berupa string yang valid' 
    });
  }

  try {
    switch (method) {
      case 'GET':
        // Ambil data pegawai berdasarkan user ID
        const user = await prisma.users.findUnique({
          where: {
            id: parseInt(userId)
          },
          include: {
            pegawai_pegawai_nipTousers: {
              select: {
                id: true,
                nip: true,
                nama: true,
                unit_kerja_id: true,
                jabatan: true,
                golongan: true,
                eselon: true
              }
            }
          }
        });

        if (!user) {
          return res.status(404).json({ 
            error: 'User tidak ditemukan' 
          });
        }

        if (!user.pegawai_pegawai_nipTousers) {
          return res.status(404).json({ 
            error: 'Data pegawai tidak ditemukan untuk user ini' 
          });
        }

        // Return data pegawai
        return res.status(200).json({
          user_id: user.id,
          username: user.username,
          ...user.pegawai_pegawai_nipTousers
        });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ 
          error: `Method ${method} tidak didukung` 
        });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan internal server',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}