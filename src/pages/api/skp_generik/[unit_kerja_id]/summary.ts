import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const unit_kerja_id = Number(req.query.unit_kerja_id);
	if (!unit_kerja_id) return res.status(400).json({ error: 'unit_kerja_id is required' });

	if (req.method === 'GET') {
		// Summary SKP Generik by pilar for unit_kerja_id
		try {
			const data = await prisma.skp_generik.findMany({
				where: { unit_kerja_id },
			});
			// Agregasi per pilar
			const summary: Record<string, { target_volume: number; update_volume: number }> = {};
			for (const item of data) {
				const pilar = item.pilar.toUpperCase();
				if (!summary[pilar]) {
					summary[pilar] = { target_volume: 0, update_volume: 0 };
				}
				summary[pilar].target_volume += item.target_volume;
				summary[pilar].update_volume += item.update_volume;
			}
			return res.status(200).json(summary);
		} catch (error) {
			return res.status(500).json({ error: 'Failed to fetch summary' });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}
