import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_id } = req.query;

  if (!unit_id || isNaN(parseInt(unit_id as string))) {
    return res.status(400).json({ error: 'Invalid unit_id' });
  }

  const unitId = parseInt(unit_id as string);

  switch (req.method) {
    case 'GET':
      return handleGet(unitId, res);
    case 'POST':
      return handlePost(unitId, req, res);
    case 'PUT':
      return handlePut(unitId, req, res);
    case 'DELETE':
      return handleDelete(unitId, req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Ambil semua data rencana mingguan berdasarkan unit_id
async function handleGet(unit_id: number, res: NextApiResponse) {
  try {
    const data = await prisma.rencana_mingguan.findMany({
      where: { unit_id },
      orderBy: [
        { bulan: 'asc' },
        { minggu: 'asc' }
      ]
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching rencana mingguan:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}

// POST: Tambah data rencana mingguan baru
async function handlePost(unit_id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { bulan, minggu, kegiatan, jenis_belanja, anggaran_rencana, anggaran_cair, status } = req.body;

    // Validasi input
    if (!bulan || !minggu || !kegiatan || !jenis_belanja || !anggaran_rencana || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Logic untuk anggaran_cair berdasarkan status
    let finalAnggaranCair = anggaran_cair || anggaran_rencana;
    if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(status)) {
      finalAnggaranCair = 0;
    }

    const newData = await prisma.rencana_mingguan.create({
      data: {
        unit_id,
        bulan: parseInt(bulan),
        minggu: parseInt(minggu),
        kegiatan,
        jenis_belanja,
        anggaran_rencana: parseFloat(anggaran_rencana),
        anggaran_cair: parseFloat(finalAnggaranCair),
        status
      }
    });

    return res.status(201).json({ data: newData });
  } catch (error) {
    console.error('Error creating rencana mingguan:', error);
    return res.status(500).json({ error: 'Failed to create data' });
  }
}

// PUT: Update data rencana mingguan
async function handlePut(unit_id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, bulan, minggu, kegiatan, jenis_belanja, anggaran_rencana, anggaran_cair, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing id for update' });
    }

    // Check if this is a status-only update (drag and drop)
    const isStatusOnlyUpdate = status && !bulan && !minggu && !kegiatan && !jenis_belanja && !anggaran_rencana && anggaran_cair === undefined;
    
    if (isStatusOnlyUpdate) {
      // For status-only updates, fetch existing data first
      const existingData = await prisma.rencana_mingguan.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingData) {
        return res.status(404).json({ error: 'Data not found' });
      }

      // Logic untuk anggaran_cair berdasarkan status
      let finalAnggaranCair = existingData.anggaran_cair;
      if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(status)) {
        finalAnggaranCair = 0;
      }

      const updatedData = await prisma.rencana_mingguan.update({
        where: { id: parseInt(id) },
        data: {
          status,
          anggaran_cair: finalAnggaranCair
        }
      });

      return res.status(200).json({ data: updatedData });
    } else {
      // For complete updates (form submissions)
      // Logic untuk anggaran_cair berdasarkan status
      let finalAnggaranCair = anggaran_cair || anggaran_rencana;
      if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(status)) {
        finalAnggaranCair = 0;
      }

      const updatedData = await prisma.rencana_mingguan.update({
        where: { id: parseInt(id) },
        data: {
          bulan: parseInt(bulan),
          minggu: parseInt(minggu),
          kegiatan,
          jenis_belanja,
          anggaran_rencana: parseFloat(anggaran_rencana),
          anggaran_cair: parseFloat(finalAnggaranCair),
          status
        }
      });

      return res.status(200).json({ data: updatedData });
    }
  } catch (error) {
    console.error('Error updating rencana mingguan:', error);
    return res.status(500).json({ error: 'Failed to update data' });
  }
}

// DELETE: Hapus data rencana mingguan
async function handleDelete(unit_id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }

    await prisma.rencana_mingguan.delete({
      where: { id: parseInt(id as string) }
    });

    return res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting rencana mingguan:', error);
    return res.status(500).json({ error: 'Failed to delete data' });
  }
}
