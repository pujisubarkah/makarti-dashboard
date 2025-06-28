import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: "unit_kerja_id tidak valid" });
  }

  try {
    const pegawai = await prisma.pegawai.findMany({
      where: {
        unit_kerja_id: parseInt(unit_kerja_id),
      },
      select: {
        nama: true,
      },
    });

    const nama_pegawai = pegawai.map(p => p.nama);

    res.status(200).json({
      unit_kerja_id: parseInt(unit_kerja_id),
      nama_pegawai,
    });
  } catch (error) {
    console.error("Error fetching employee data:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data pegawai" });
  }
}
