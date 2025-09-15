import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        // Ambil semua data pegawai
        try {
            const pegawaiList = await prisma.pegawai.findMany({
                include: {
                    users: {
                        select: { unit_kerja: true }
                    },
                    pegawai_detail: true
                }
            });
            // Proses pegawai dan ambil tahun pensiun
            const tahunList: number[] = [];
            type Pegawai = typeof pegawaiList[number];
            const pegawaiTahun: { tahun: number, pegawai: Pegawai }[] = [];
            const result = pegawaiList.map(pegawai => {
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

                // Hitung tahun pensiun
                let tahun_pensiun = null;
                const tanggal_lahir = pegawai.pegawai_detail?.[0]?.tanggal_lahir;
                if (tanggal_lahir) {
                    const tgl = new Date(tanggal_lahir);
                    tgl.setFullYear(tgl.getFullYear() + usia_pensiun);
                    tahun_pensiun = tgl.getFullYear();
                    tahunList.push(tahun_pensiun);
                    pegawaiTahun.push({ tahun: tahun_pensiun, pegawai });
                }

                return { ...pegawai, foto_url, usia_pensiun, tahun_pensiun };
            });

            // Rekap jumlah pegawai per tahun pensiun
            const rekap: Record<number, number> = {};
            tahunList.forEach(tahun => {
                rekap[tahun] = (rekap[tahun] || 0) + 1;
            });

            return res.status(200).json({
                rekap,
                pegawai: result
            });
        } catch (error) {
            console.error('Error fetching pegawai:', error);
            return res.status(500).json({ error: 'Gagal mengambil data pegawai' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Metode ${req.method} tidak diizinkan`);
    }
}
