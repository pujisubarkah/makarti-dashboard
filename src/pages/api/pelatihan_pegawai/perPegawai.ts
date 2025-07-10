import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

type RekapUnit = {
  unit_kerja: string;
  total_pegawai: number;
  jumlah_yang_input: number;
  belum_input: number;
  persentase_input: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Ambil semua pegawai dan kelompokkan berdasarkan unit kerja
      const semuaPegawai = await prisma.pegawai.findMany({
        include: {
          users: {
            select: { unit_kerja: true },
          },
        },
      });

      // Hitung jumlah pegawai per unit kerja
      const jumlahPegawaiPerUnit = new Map<string, number>();
      semuaPegawai.forEach((pegawai) => {
        const unit_kerja = pegawai.users?.unit_kerja || "Tidak diketahui";
        jumlahPegawaiPerUnit.set(
          unit_kerja,
          (jumlahPegawaiPerUnit.get(unit_kerja) || 0) + 1
        );
      });

      // Ambil semua pelatihan dan kelompokkan berdasarkan unit kerja
      const dataPelatihan = await prisma.pelatihan.findMany({
        include: {
          pegawai: {
            select: { nama: true, unit_kerja_id: true },
          },
          users: {
            select: { unit_kerja: true },
          },
        },
      });

      const rekapMap = new Map<string, Set<string>>();

      dataPelatihan.forEach((item) => {
        const unit_kerja = item.users?.unit_kerja || "Tidak diketahui";
        const namaPegawai = item.pegawai?.nama || "Anonim";

        if (!rekapMap.has(unit_kerja)) {
          rekapMap.set(unit_kerja, new Set());
        }

        const pegawaiSet = rekapMap.get(unit_kerja)!;

        if (!pegawaiSet.has(namaPegawai)) {
          pegawaiSet.add(namaPegawai);
        }
      });

      // Buat rekap akhir dengan perhitungan
      const hasilRekap: RekapUnit[] = [];

      for (const [unit_kerja, pegawaiSet] of rekapMap.entries()) {
        const totalPegawai = jumlahPegawaiPerUnit.get(unit_kerja) || 0;
        const jumlahYangInput = pegawaiSet.size;
        const belumInput = Math.max(0, totalPegawai - jumlahYangInput);
        const persentase = totalPegawai > 0
          ? ((jumlahYangInput / totalPegawai) * 100).toFixed(0) + "%"
          : "0%";

        hasilRekap.push({
          unit_kerja,
          total_pegawai: totalPegawai,
          jumlah_yang_input: jumlahYangInput,
          belum_input: belumInput,
          persentase_input: persentase,
        });
      }

      return res.status(200).json(hasilRekap);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
      return res.status(500).json({ error: "Gagal mengambil data rekap" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}