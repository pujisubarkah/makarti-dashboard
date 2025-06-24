import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Tipe untuk request body
type CreateNetworkingBody = {
  instansi: string;
  jenis: string;
  status: 'Inisiasi' | 'OnProgress' | 'MoU'; // Sesuaikan dengan enum kamu
  catatan?: string;
  unit_kerja_id: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const networkings = await prisma.networking.findMany({
      include: {
        users: true,
      },
    });

    const simplified = networkings.map((item) => ({
      id: item.id,
      instansi: item.instansi,
      jenis: item.jenis,
      catatan: item.catatan || null,
      status: item.status,
      unit_kerja: item.users?.unit_kerja || null,
    }));

    return res.status(200).json(simplified);
  }

  if (req.method === 'POST') {
    const body: CreateNetworkingBody = req.body;

    // Validasi sederhana
    if (
      !body.instansi ||
      !body.jenis ||
      !body.status ||
      !body.unit_kerja_id
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validasi status enum
    const validStatus = ['Inisiasi', 'OnProgress', 'MoU'];
    if (!validStatus.includes(body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
      const newNetworking = await prisma.networking.create({
        data: {
          instansi: body.instansi,
          jenis: body.jenis,
          status: body.status,
          catatan: body.catatan || '',
          unit_kerja_id: body.unit_kerja_id,
        },
        include: {
          users: true, // untuk langsung dapatkan data user/unit kerja
        },
      });

      // Sederhanakan response seperti GET
      const simplified = {
        id: newNetworking.id,
        instansi: newNetworking.instansi,
        jenis: newNetworking.jenis,
        catatan: newNetworking.catatan || null,
        status: newNetworking.status,
        unit_kerja: newNetworking.users?.unit_kerja || null,
      };

      return res.status(201).json(simplified);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}