import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Tipe untuk request body
type CreateNetworkingBody = {
  instansi: string;
  jenis: string;
  status: 'In Progress' | 'Selesai' | 'MoU Ditandatangani' | 'Menunggu Tindak Lanjut' | 'Direncanakan';
  catatan?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id } = req.query;
  const unitKerjaId = parseInt(unit_kerja_id as string);

  // Validasi unit_kerja_id
  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ error: 'Invalid unit_kerja_id' });
  }

  if (req.method === 'GET') {
    try {
      const networkings = await prisma.networking.findMany({
        where: {
          unit_kerja_id: unitKerjaId,
        },
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
        orderBy: {
          id: 'desc', // Urutkan berdasarkan ID terbaru
        },
      });

      const simplified = networkings.map((item) => ({
        id: item.id,
        instansi: item.instansi,
        jenis: item.jenis,
        status: item.status,
        catatan: item.catatan || '',
        unit_kerja: item.users?.unit_kerja || '',
      }));

      return res.status(200).json(simplified);
    } catch (error) {
      console.error('Error fetching networking data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const body: CreateNetworkingBody = req.body;

    // Validasi fields yang wajib
    if (!body.instansi || !body.jenis || !body.status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['instansi', 'jenis', 'status']
      });
    }

    // Validasi status enum
    const validStatus = ['In Progress', 'Selesai', 'MoU Ditandatangani', 'Menunggu Tindak Lanjut', 'Direncanakan'];
    if (!validStatus.includes(body.status)) {
      return res.status(400).json({ 
        error: 'Invalid status value',
        validValues: validStatus
      });
    }

    // Validasi jenis kegiatan
    const validJenis = ['Joint Seminar', 'Kunjungan', 'Kerjasama', 'Koordinasi', 'Workshop', 'Pelatihan'];
    if (!validJenis.includes(body.jenis)) {
      return res.status(400).json({ 
        error: 'Invalid jenis value',
        validValues: validJenis
      });
    }

    try {
      // Cek apakah unit_kerja_id exists di tabel users
      const userExists = await prisma.users.findUnique({
        where: { id: unitKerjaId },
      });

      if (!userExists) {
        return res.status(404).json({ error: 'Unit kerja not found' });
      }

      // Cek duplikasi data berdasarkan instansi, jenis, dan unit_kerja_id
      const existingNetworking = await prisma.networking.findFirst({
        where: {
          instansi: body.instansi.trim(),
          jenis: body.jenis,
          unit_kerja_id: unitKerjaId,
        },
      });

      if (existingNetworking) {
        return res.status(409).json({ 
          error: 'Duplicate entry detected',
          message: `Data networking dengan instansi "${body.instansi}" dan jenis "${body.jenis}" sudah ada`,
          existingData: {
            id: existingNetworking.id,
            instansi: existingNetworking.instansi,
            jenis: existingNetworking.jenis,
            status: existingNetworking.status,
          }
        });
      }

      const newNetworking = await prisma.networking.create({
        data: {
          instansi: body.instansi.trim(),
          jenis: body.jenis,
          status: body.status,
          catatan: body.catatan?.trim() || '',
          unit_kerja_id: unitKerjaId,
        },
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      });

      // Response format yang sama dengan GET
      const simplified = {
        id: newNetworking.id,
        instansi: newNetworking.instansi,
        jenis: newNetworking.jenis,
        status: newNetworking.status,
        catatan: newNetworking.catatan || '',
        unit_kerja: newNetworking.users?.unit_kerja || '',
      };

      return res.status(201).json({
        message: 'Data networking berhasil disimpan',
        data: simplified
      });
    } catch (error) {
      console.error('Error creating networking data:', error);
      
      // Handle database errors
      // Import Prisma error type at the top: import { Prisma } from '@prisma/client';
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        return res.status(409).json({ 
          error: 'Duplicate entry detected',
          message: 'Data networking dengan informasi serupa sudah ada'
        });
      }

      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Gagal menyimpan data networking'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}