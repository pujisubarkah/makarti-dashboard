import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: "unit_kerja_id tidak valid" });
  }

  const unitKerjaId = parseInt(unit_kerja_id);

  if (req.method === "GET") {
    try {
      const pegawaiList = await prisma.pegawai.findMany({
        where: {
          unit_kerja_id: unitKerjaId,
        },
        include: {
          pegawai_detail: true, // LEFT JOIN pegawai_detail
        },
      });
      // Return the employee list with detail data
      return res.status(200).json(pegawaiList);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      return res.status(500).json({ error: "Terjadi kesalahan saat mengambil data pegawai" });
    }
  } else if (req.method === "PUT") {
    // Update pegawai_detail by id
    const { id, detail } = req.body;
    if (!id || !detail) {
      return res.status(400).json({ error: "id dan detail diperlukan" });
    }
    try {
      // Update pegawai_detail berdasarkan id (primary key)
      const updated = await prisma.pegawai_detail.update({
        where: { id: Number(id) },
        data: detail,
      });
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating pegawai_detail:", error);
      return res.status(500).json({ error: "Gagal mengupdate detail pegawai" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Metode ${req.method} tidak diizinkan`);
  }
}

// If you need to fetch pegawaiUnit, move this code inside the handler function after unitKerjaId is defined:
// const pegawaiUnit = await prisma.pegawai.findMany({
//   where: { unit_kerja_id: unitKerjaId },
//   include: {
//     users: true,
//     pegawai_detail: true,
//     pelatihan: true,
//     event_assignments: true,
//   },
// });

// Or remove this code if not needed outside the handler.
