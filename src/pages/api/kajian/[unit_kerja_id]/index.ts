import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// Handler untuk GET /api/kajian/[unit_kerja_id]
async function getKajianByUnitKerja(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || isNaN(Number(unit_kerja_id))) {
    return res.status(400).json({ error: 'Invalid or missing unit_kerja_id' });
  }

  try {
    const kajians = await prisma.kajian.findMany({
      where: {
        unit_kerja_id: Number(unit_kerja_id),
      },
    });

    return res.status(200).json({ data: kajians });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handler untuk POST /api/kajian/[unit_kerja_id]
async function createKajianForUnitKerja(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;
  const { judul, jenis, status } = req.body;

  if (!unit_kerja_id || isNaN(Number(unit_kerja_id))) {
    return res.status(400).json({ error: 'Invalid or missing unit_kerja_id' });
  }
  if (!judul || !jenis) {
    return res.status(400).json({ error: 'Missing required fields: judul, jenis' });
  }

  try {
    const newKajian = await prisma.kajian.create({      data: {
        judul,
        jenis,
        status: status || null,
        unit_kerja_id: Number(unit_kerja_id),
      },
    });

    return res.status(201).json({ data: newKajian });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Main handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getKajianByUnitKerja(req, res);
  } else if (req.method === 'POST') {
    return createKajianForUnitKerja(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}