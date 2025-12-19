// pages/api/login/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure database connection
  try {
    if (req.method !== 'POST') {
      
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      
      return res.status(400).json({ error: 'Username dan password wajib diisi!' });
    }

    const user = await prisma.users.findFirst({
      where: { username },
      include: {
        pegawai_pegawai_nipTousers: {
          select: {
            unit_kerja_id: true,
            nama: true,
            jabatan: true,
          }
        }
      }
    });

    if (!user || !user.password) {
      console.log(`Login gagal: Pengguna '${username}' tidak ditemukan atau belum memiliki password`);
      
      return res.status(401).json({ error: 'Pengguna tidak ditemukan atau belum memiliki password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login gagal: Password salah untuk pengguna '${username}'`);
      
      return res.status(401).json({ error: 'Password salah!' });
    }

    
    return res.status(200).json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        unit_kerja: user.unit_kerja,
        unit_kerja_id: user.pegawai_pegawai_nipTousers?.unit_kerja_id || null,
        nama: user.pegawai_pegawai_nipTousers?.nama || user.username,
        jabatan: user.pegawai_pegawai_nipTousers?.jabatan || null,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error(error);
    
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
}

