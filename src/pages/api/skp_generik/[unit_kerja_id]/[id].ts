import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const unit_kerja_id = Number(req.query.unit_kerja_id);
	const id = Number(req.query.id);
	if (!unit_kerja_id || !id) return res.status(400).json({ error: 'unit_kerja_id and id are required' });

	if (req.method === 'GET') {
		// Get SKP Generik by id and unit_kerja_id
		try {
			const data = await prisma.skp_generik.findFirst({
				where: { id, unit_kerja_id },
			});
			if (!data) return res.status(404).json({ error: 'Data not found' });
			return res.status(200).json(data);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch data' });
		}
	}

	if (req.method === 'PUT') {
		// Update SKP Generik by id and unit_kerja_id
		try {
			const body = req.body;
			const updated = await prisma.skp_generik.update({
				where: { id },
				data: {
					unit_kerja_id,
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
			return res.status(200).json(updated);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to update data' });
		}
	}

	if (req.method === 'DELETE') {
		// Delete SKP Generik by id and unit_kerja_id
		try {
			await prisma.skp_generik.delete({
				where: { id },
			});
			return res.status(200).json({ message: 'Deleted successfully' });
		} catch (error) {
			return res.status(500).json({ error: 'Failed to delete data' });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}
