// pages/api/login/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi!' });
  }

  const user = await prisma.users.findFirst({
    where: { username },
  });

  if (!user || !user.password) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan atau belum memiliki password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Password salah!' });
  }

  return res.status(200).json({
    message: 'Login berhasil!',
    user: {
      id: user.id,
      username: user.username,
      unit_kerja: user.unit_kerja,
      role_id: user.role_id,
    },
  });
}
