import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;
	if (!id) {
		return res.status(400).json({ error: 'ID pegawai diperlukan' });
	}

	if (req.method === 'GET') {
		// Ambil data pegawai berdasarkan id
		try {
					const pegawai = await prisma.pegawai.findUnique({
						where: { id: Number(id) },
						include: {
							users: {
								select: { unit_kerja: true }
							},
							pegawai_detail: true
						}
					});
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
		// Update data pegawai berdasarkan id
		try {
			const { nip, nama, unit_kerja_id, jabatan, golongan } = req.body;
			const updatedPegawai = await prisma.pegawai.update({
				where: { id: Number(id) },
				data: {
					nip,
					nama,
					unit_kerja_id,
					jabatan,
					golongan,
				},
			});
			return res.status(200).json(updatedPegawai);
		} catch (error) {
			console.error('Error updating pegawai:', error);
			return res.status(500).json({ error: 'Gagal mengupdate pegawai' });
		}
	} else if (req.method === 'DELETE') {
		// Hapus data pegawai berdasarkan id
		try {
			await prisma.pegawai.delete({
				where: { id: Number(id) },
			});
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
