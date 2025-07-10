import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!unit_kerja_id || isNaN(Number(unit_kerja_id))) {
    return res.status(400).json({ error: "unit_kerja_id harus angka" });
  }

  try {
    // Ambil semua pegawai di unit kerja ini
    const pegawais = await prisma.pegawai.findMany({
      where: {
        unit_kerja_id: Number(unit_kerja_id),
      },
      select: {
        id: true,
      },
    });

    const totalPegawai = pegawais.length;
    if (totalPegawai === 0) {
      return res.status(404).json({ error: "Tidak ada pegawai di unit ini" });
    }

    // Ambil daftar pegawai_id yang sudah input pelatihan
    const pelatihanData = await prisma.pelatihan.findMany({
      where: {
        pegawai_id: {
          in: pegawais.map((p) => p.id),
        },
      },
      distinct: ["pegawai_id"],
    });

    const pegawaiYangInputIds = pelatihanData.map((p) => p.pegawai_id);
    const jumlahYangInput = pegawaiYangInputIds.length;
    const jumlahBelumInput = totalPegawai - jumlahYangInput;

    // 🔢 Hitung persentase
    const persentaseInput = totalPegawai > 0 
      ? parseFloat(((jumlahYangInput / totalPegawai) * 100).toFixed(2)) 
      : 0;

    return res.status(200).json({
      unit_kerja_id: Number(unit_kerja_id),
      total_pegawai: totalPegawai,
      jumlah_yang_input: jumlahYangInput,
      jumlah_belum_input: jumlahBelumInput,
      persentase_input: persentaseInput, // 💰 Tambahkan field ini
    });
  } catch (error) {
    console.error("Error fetching data pelatihan:", error);
    return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
  }
}