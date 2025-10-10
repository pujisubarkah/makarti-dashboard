import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;
	if (!id) {
		return res.status(400).json({ error: 'ID pegawai diperlukan' });
	}

	if (req.method === 'GET') {
		// Ambil data pegawai berdasarkan id atau nip
		try {
			let pegawai;
			
			// Check if id is a valid integer ID (small number) or NIP (long string)
			// Assume ID is small integer (< 1000000), NIP is long string
			const numericId = Number(id);
			if (!isNaN(numericId) && numericId > 0 && numericId < 1000000 && Number.isInteger(numericId)) {
				// Search by ID (small integer)
				pegawai = await prisma.pegawai.findUnique({
					where: { id: numericId },
					include: {
						users_pegawai_unit_kerja_idTousers: {
							select: { unit_kerja: true }
						},
						pegawai_detail: true
					}
				});
			} else {
				// Search by NIP (string, including long numbers)
				pegawai = await prisma.pegawai.findFirst({
					where: { nip: String(id) },
					include: {
						users_pegawai_unit_kerja_idTousers: {
							select: { unit_kerja: true }
						},
						pegawai_detail: true
					}
				});
			}
					if (!pegawai) {
						return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
					}
					// Tambahkan foto_url
					const foto_url = pegawai.nip
						? `https://dtjrketxxozstcwvotzh.supabase.co/storage/v1/object/public/foto_pegawai/${pegawai.nip}.jpg`
						: null;
					return res.status(200).json({ ...pegawai, foto_url });
		} catch (error) {
			console.error('Error fetching pegawai by id:', error);
			return res.status(500).json({ error: 'Gagal mengambil data pegawai' });
		}
	} else if (req.method === 'PUT') {
		// Update data pegawai berdasarkan id atau nip
		try {
			const { nip, nama, unit_kerja_id, jabatan, golongan } = req.body;
			let updatedPegawai;
			
			const numericId = Number(id);
			if (!isNaN(numericId) && numericId > 0 && numericId < 1000000 && Number.isInteger(numericId)) {
				// Update by ID
				updatedPegawai = await prisma.pegawai.update({
					where: { id: numericId },
					data: {
						nip,
						nama,
						unit_kerja_id,
						jabatan,
						golongan,
					},
				});
			} else {
				// Update by NIP - find first then update by ID
				const existingPegawai = await prisma.pegawai.findFirst({
					where: { nip: String(id) }
				});
				
				if (!existingPegawai) {
					return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
				}
				
				updatedPegawai = await prisma.pegawai.update({
					where: { id: existingPegawai.id },
					data: {
						nip,
						nama,
						unit_kerja_id,
						jabatan,
						golongan,
					},
				});
			}
			
			return res.status(200).json(updatedPegawai);
		} catch (error) {
			console.error('Error updating pegawai:', error);
			return res.status(500).json({ error: 'Gagal mengupdate pegawai' });
		}
	} else if (req.method === 'DELETE') {
		// Hapus data pegawai berdasarkan id atau nip
		try {
			const numericId = Number(id);
			if (!isNaN(numericId) && numericId > 0 && numericId < 1000000 && Number.isInteger(numericId)) {
				// Delete by ID
				await prisma.pegawai.delete({
					where: { id: numericId },
				});
			} else {
				// Delete by NIP - find first then delete by ID
				const existingPegawai = await prisma.pegawai.findFirst({
					where: { nip: String(id) }
				});
				
				if (!existingPegawai) {
					return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
				}
				
				await prisma.pegawai.delete({
					where: { id: existingPegawai.id },
				});
			}
			return res.status(204).end();
		} catch (error) {
			console.error('Error deleting pegawai:', error);
			return res.status(500).json({ error: 'Gagal menghapus pegawai' });
		}
	} else {
		res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
		res.status(405).end(`Metode ${req.method} tidak diizinkan`);
	}
}
