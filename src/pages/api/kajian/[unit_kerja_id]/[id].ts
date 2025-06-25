import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// Handler untuk PUT /api/kajian/[unit_kerja_id]/[id]
async function updateKajian(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;
  const { judul, jenis, status } = req.body;

  if (!unit_kerja_id || isNaN(Number(unit_kerja_id)) || !id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  if (!judul || !jenis || !status) {
    return res.status(400).json({ error: 'Missing required fields: judul, jenis, status' });
  }

  try {
    const updatedKajian = await prisma.kajian.update({
      where: {
        id: Number(id),
      },
      data: {
        judul,
        jenis,
        status,
        unit_kerja_id: Number(unit_kerja_id), // tetap ikut update jika perlu
      },
    });

    return res.status(200).json({ data: updatedKajian });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handler untuk DELETE /api/kajian/[unit_kerja_id]/[id]
async function deleteKajian(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid or missing kajian ID' });
  }

  try {
    await prisma.kajian.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({ message: 'Kajian deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Main handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    return updateKajian(req, res);
  } else if (req.method === 'DELETE') {
    return deleteKajian(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}