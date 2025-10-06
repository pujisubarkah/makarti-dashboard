import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List all SKP Generik
    try {
      const data = await prisma.skp_generik.findMany();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  if (req.method === 'POST') {
    // Create SKP Generik
    try {
      const body = req.body;
      const newSKP = await prisma.skp_generik.create({
        data: {
          unit_kerja_id: Number(body.unit_kerja_id),
          tanggal: new Date(body.tanggal),
          pilar: body.pilar,
          indikator: body.indikator,
          target_volume: Number(body.target_volume),
          target_satuan: body.target_satuan,
          update_volume: Number(body.update_volume),
          update_satuan: body.update_satuan,
          kendala: body.kendala || null,
        },
      });
      return res.status(201).json(newSKP);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create data' });
    }
  }


  return res.status(405).json({ error: 'Method not allowed' });
}
