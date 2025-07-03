import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: "unit_kerja_id tidak valid" });
  }

  const unitKerjaId = parseInt(unit_kerja_id);
  try {
    const pegawaiList = await prisma.pegawai.findMany({
      where: {
        unit_kerja_id: unitKerjaId,
      },
      select: {
        id: true,
        nama: true,
      },
    });

    // Return the employee list directly as an array of objects
    return res.status(200).json(pegawaiList);
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return res.status(500).json({ error: "Terjadi kesalahan saat mengambil data pegawai" });
  }
}