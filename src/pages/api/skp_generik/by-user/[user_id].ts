import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { user_id } = req.query;

	if (!user_id || Array.isArray(user_id)) {
		return res.status(400).json({ error: 'user_id is required' });
	}

	const userIdNum = Number(user_id);

	if (req.method === 'GET') {
		try {
			console.log('SKP API (by-user): Fetching data for user_id:', userIdNum);
			
			// Try to find user first
			const user = await prisma.users.findUnique({
				where: { id: userIdNum },
				select: { id: true, unit_kerja: true, username: true }
			});
			
			if (!user) {
				console.log('SKP API (by-user): User not found');
				return res.status(404).json({ error: 'User not found' });
			}
			
			console.log('SKP API (by-user): User found:', user);
			
			// Try to find pegawai for this user
			const pegawai = await prisma.pegawai.findFirst({
				where: { 
					OR: [
						{ nip: user.username },
						{ unit_kerja_id: userIdNum }
					]
				},
				select: { id: true, nama: true, unit_kerja_id: true, nip: true }
			});
			
			console.log('SKP API (by-user): Pegawai found:', pegawai);
			
			let unit_kerja_id = userIdNum;
			
			// If pegawai exists and has a different unit_kerja_id, use that
			if (pegawai && pegawai.unit_kerja_id && pegawai.unit_kerja_id !== userIdNum) {
				unit_kerja_id = pegawai.unit_kerja_id;
				console.log('SKP API (by-user): Using pegawai unit_kerja_id:', unit_kerja_id);
			}
			
			// Fetch SKP data for the unit kerja
			const data = await prisma.skp_generik.findMany({
				where: { unit_kerja_id },
				orderBy: { tanggal: 'desc' },
			});
			
			console.log('SKP API (by-user): Found', data.length, 'SKP records for unit_kerja_id:', unit_kerja_id);
			console.log('SKP API (by-user): Sample data:', data[0] || 'No data found');
			
			return res.status(200).json({
				data,
				user_info: {
					user_id: userIdNum,
					unit_kerja_id,
					pegawai: pegawai,
					user: user
				}
			});
			
		} catch (error) {
			console.error('SKP API (by-user): Error fetching data:', error);
			return res.status(500).json({ error: 'Failed to fetch data' });
		}
	}

	return res.status(405).json({ error: 'Method not allowed' });
}