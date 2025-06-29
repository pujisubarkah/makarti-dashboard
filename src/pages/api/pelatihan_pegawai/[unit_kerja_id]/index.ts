// api/pelatihan/[unit_kerja_id]/index.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (req.method === "GET") {
    try {
      const unitKerjaId = parseInt(unit_kerja_id as string);

      if (isNaN(unitKerjaId)) {
        return res.status(400).json({ error: "unit_kerja_id tidak valid" });
      }

      const data = await prisma.pelatihan.findMany({
        where: { unit_kerja_id: unitKerjaId },
        include: {
          pegawai: {
            select: { nama: true },
          }
         
        },
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching pelatihan data:", error);
      return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
