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
        // Ambil data pegawai berdasarkan id
        try {
            const pegawai = await prisma.pegawai.findUnique({
                where: { id: Number(id) },
                include: {
                    users_pegawai_unit_kerja_idTousers: {
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

            // Hitung usia pensiun
            let usia_pensiun = 58;
            const eselon = pegawai.eselon?.toUpperCase() || "";
            const jabatan = pegawai.jabatan?.toUpperCase() || "";

          if (eselon === "JPTP" || eselon === "JPTM" || eselon === "JPTU") {
                    usia_pensiun = 60;
                } else if (eselon === "JF" && jabatan.includes("UTAMA")) {
                    usia_pensiun = 65;
                } else if (eselon === "JF" && jabatan.includes("MADYA")) {
                    usia_pensiun = 60;
                } else if (jabatan.includes("DOSEN")) {
                    usia_pensiun = 65;
                } else if (jabatan.includes("GURU BESAR")) {
                    usia_pensiun = 70;
                }

            return res.status(200).json({ ...pegawai, foto_url, usia_pensiun });
        } catch (error) {
            console.error('Error fetching pegawai by id:', error);
            return res.status(500).json({ error: 'Gagal mengambil data pegawai' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Metode ${req.method} tidak diizinkan`);
    }
}

