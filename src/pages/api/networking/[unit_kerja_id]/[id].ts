import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Tipe untuk request body
type UpdateNetworkingBody = {
  instansi?: string;
  jenis?: string;
  status?: 'In Progress' | 'Selesai' | 'MoU Ditandatangani' | 'Menunggu Tindak Lanjut' | 'Direncanakan';
  catatan?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id, id } = req.query;
  const unitKerjaId = parseInt(unit_kerja_id as string);
  const networkingId = parseInt(id as string);

  // Validasi parameters
  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ error: 'Invalid unit_kerja_id' });
  }

  if (isNaN(networkingId)) {
    return res.status(400).json({ error: 'Invalid networking id' });
  }

  // GET - Ambil data networking berdasarkan ID
  if (req.method === 'GET') {
    try {
      const networking = await prisma.networking.findFirst({
        where: {
          id: networkingId,
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

      if (!networking) {
        return res.status(404).json({ error: 'Networking data not found' });
      }

      const response = {
        id: networking.id,
        instansi: networking.instansi,
        jenis: networking.jenis,
        status: networking.status,
        catatan: networking.catatan || '',
        unit_kerja: networking.users?.unit_kerja || '',
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching networking data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT - Update data networking
  if (req.method === 'PUT') {
    const body: UpdateNetworkingBody = req.body;

    // Validasi minimal ada satu field yang diupdate
    if (!body.instansi && !body.jenis && !body.status && body.catatan === undefined) {
      return res.status(400).json({ 
        error: 'At least one field must be provided for update',
        allowedFields: ['instansi', 'jenis', 'status', 'catatan']
      });
    }

    // Validasi status jika disediakan
    if (body.status) {
      const validStatus = ['In Progress', 'Selesai', 'MoU Ditandatangani', 'Menunggu Tindak Lanjut', 'Direncanakan'];
      if (!validStatus.includes(body.status)) {
        return res.status(400).json({ 
          error: 'Invalid status value',
          validValues: validStatus
        });
      }
    }

    // Validasi jenis jika disediakan
    if (body.jenis) {
      const validJenis = ['Joint Seminar', 'Kunjungan', 'Kerjasama', 'Koordinasi', 'Workshop', 'Pelatihan'];
      if (!validJenis.includes(body.jenis)) {
        return res.status(400).json({ 
          error: 'Invalid jenis value',
          validValues: validJenis
        });
      }
    }

    try {
      // Cek apakah networking data exists dan milik unit kerja yang benar
      const existingNetworking = await prisma.networking.findFirst({
        where: {
          id: networkingId,
          unit_kerja_id: unitKerjaId,
        },
      });

      if (!existingNetworking) {
        return res.status(404).json({ 
          error: 'Networking data not found or access denied' 
        });
      }

      // Prepare data untuk update
      const updateData: Partial<UpdateNetworkingBody> = {};
      if (body.instansi) updateData.instansi = body.instansi.trim();
      if (body.jenis) updateData.jenis = body.jenis;
      if (body.status) updateData.status = body.status;
      if (body.catatan !== undefined) updateData.catatan = body.catatan.trim();

      const updatedNetworking = await prisma.networking.update({
        where: { id: networkingId },
        data: updateData,
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      });

      const response = {
        id: updatedNetworking.id,
        instansi: updatedNetworking.instansi,
        jenis: updatedNetworking.jenis,
        status: updatedNetworking.status,
        catatan: updatedNetworking.catatan || '',
        unit_kerja: updatedNetworking.users?.unit_kerja || '',
      };

      return res.status(200).json({
        message: 'Networking data updated successfully',
        data: response
      });
    } catch (error) {
      console.error('Error updating networking data:', error);
      
      // Handle unique constraint errors
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
        message: 'Gagal mengupdate data networking'
      });
    }
  }

  // DELETE - Hapus data networking
  if (req.method === 'DELETE') {
    try {
      // Cek apakah networking data exists dan milik unit kerja yang benar
      const existingNetworking = await prisma.networking.findFirst({
        where: {
          id: networkingId,
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

      if (!existingNetworking) {
        return res.status(404).json({ 
          error: 'Networking data not found or access denied' 
        });
      }

      // Hapus data networking
      await prisma.networking.delete({
        where: { id: networkingId },
      });

      return res.status(200).json({
        message: 'Networking data deleted successfully',
        deletedData: {
          id: existingNetworking.id,
          instansi: existingNetworking.instansi,
          jenis: existingNetworking.jenis,
          status: existingNetworking.status,
          unit_kerja: existingNetworking.users?.unit_kerja || '',
        }
      });

    } catch (error) {
      console.error('Error deleting networking data:', error);
      
      // Handle foreign key constraint errors
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2003'
      ) {
        return res.status(409).json({ 
          error: 'Cannot delete data',
          message: 'Data networking masih memiliki relasi dengan data lain'
        });
      }

      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Gagal menghapus data networking'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}