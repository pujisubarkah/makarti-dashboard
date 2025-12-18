// pages/api/pelatihan/index.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

type RekapPelatihan = {
  nama: string;
  unit_kerja: string | null;
  total_jam: number;
  rata_rata_jam: number;
  jumlah_pelatihan: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = await prisma.pelatihan.findMany({
        include: {
          pegawai: {
            select: { nama: true },
          },
          users: {
            select: { unit_kerja: true },
          },
        },
      });

      // Grouping manual
      const rekapMap = new Map<string, RekapPelatihan>();

      data.forEach(item => {
        const nama = item.pegawai?.nama || "Tidak diketahui";
        const unit_kerja = item.users?.unit_kerja || null;
        const jam = item.jam ?? 0;

        if (!rekapMap.has(nama)) {
          rekapMap.set(nama, {
            nama,
            unit_kerja,
            total_jam: jam,
            rata_rata_jam: jam,
            jumlah_pelatihan: 1,
          });
        } else {
          const existing = rekapMap.get(nama)!;
          existing.total_jam += jam;
          existing.jumlah_pelatihan += 1;
          existing.rata_rata_jam = parseFloat((existing.total_jam / existing.jumlah_pelatihan).toFixed(2));
        }
      });

      const rekapList = Array.from(rekapMap.values());

      return res.status(200).json(rekapList);
    } catch (error) {
      console.error("Error fetching pelatihan data:", error);
      return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

