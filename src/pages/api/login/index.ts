// pages/api/login/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      await prisma.$disconnect();
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      await prisma.$disconnect();
      return res.status(400).json({ error: 'Username dan password wajib diisi!' });
    }

    const user = await prisma.users.findFirst({
      where: { username },
    });

    if (!user || !user.password) {
      console.log(`Login gagal: Pengguna '${username}' tidak ditemukan atau belum memiliki password`);
      await prisma.$disconnect();
      return res.status(401).json({ error: 'Pengguna tidak ditemukan atau belum memiliki password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login gagal: Password salah untuk pengguna '${username}'`);
      await prisma.$disconnect();
      return res.status(401).json({ error: 'Password salah!' });
    }

    await prisma.$disconnect();
    return res.status(200).json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        unit_kerja: user.unit_kerja,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
}
