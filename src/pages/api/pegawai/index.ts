// pages/api/pegawai/index.ts

import { prisma } from '@/lib/prisma';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Ambil semua data pegawai
    try {
      const pegawai = await prisma.pegawai.findMany();
      res.status(200).json(pegawai);
    } catch (error) {
      console.error('Error fetching pegawai data:', error);
      res.status(500).json({ error: 'Gagal mengambil data pegawai' });
    }
  } else if (req.method === 'POST') {
    // Tambah data pegawai
    try {
      const { nip, nama, unit_kerja_id, jabatan, golongan } = req.body;
      const newPegawai = await prisma.pegawai.create({
        data: {
          nip,
          nama,
          unit_kerja_id,
          jabatan,
          golongan,
        },
      });
      res.status(201).json(newPegawai);
    } catch (error) {
      console.error('Error creating pegawai:', error);
      res.status(500).json({ error: 'Gagal menambahkan pegawai' });
    }
  } else {
    // Method tidak didukung
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metode ${req.method} tidak diizinkan`);
  }
}
