import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const unit_kerja_id = Number(req.query.unit_kerja_id);
	if (!unit_kerja_id) return res.status(400).json({ error: 'unit_kerja_id is required' });

	if (req.method === 'GET') {
		// List SKP Generik by unit_kerja_id
		try {
			console.log('SKP API: Fetching data for unit_kerja_id:', unit_kerja_id);
			
			// First, let's check if this ID exists in users table
			const user = await prisma.users.findUnique({
				where: { id: unit_kerja_id },
				select: { id: true, unit_kerja: true, username: true }
			});
			console.log('SKP API: User found:', user);
			
			// Also check if there's a pegawai with this unit_kerja_id
			const pegawai = await prisma.pegawai.findMany({
				where: { unit_kerja_id },
				select: { id: true, nama: true, unit_kerja_id: true }
			});
			console.log('SKP API: Pegawai in this unit:', pegawai.length);
			
			const data = await prisma.skp_generik.findMany({
				where: { unit_kerja_id },
				orderBy: { tanggal: 'desc' },
			});
			console.log('SKP API: Found', data.length, 'SKP records');
			console.log('SKP API: Sample data:', data[0] || 'No data found');
			return res.status(200).json(data);
		} catch (error) {
			console.error('SKP API: Error fetching data:', error);
			return res.status(500).json({ error: 'Failed to fetch data' });
		}
	}

	if (req.method === 'POST') {
		// Create SKP Generik for unit_kerja_id
		try {
			const body = req.body;
			const newSKP = await prisma.skp_generik.create({
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
			return res.status(201).json(newSKP);
		} catch {
			return res.status(500).json({ error: 'Failed to create data' });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}
