import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Ambil data dari database
      const data = await prisma.penyelenggaraan.findMany({
        select: {
          jumlahPeserta: true,
          jenis_bangkom_non_pelatihan: {
            select: {
              jenis_bangkom: true,
            },
          },
        },
      });

      // Mapping untuk kumpulkan data per jenis_bangkom
      const summaryMap = new Map();

      data.forEach((item) => {
        const jenisBangkom = item.jenis_bangkom_non_pelatihan?.jenis_bangkom;
        const peserta = item.jumlahPeserta;

        if (!jenisBangkom) return;

        if (!summaryMap.has(jenisBangkom)) {
          summaryMap.set(jenisBangkom, {
            total_peserta: 0,
            jumlah_event: 0,
          });
        }

        const current = summaryMap.get(jenisBangkom);
        current.total_peserta += peserta;
        current.jumlah_event += 1;
      });

      // Buat array summary dengan id dan rata-rata
      const summary = Array.from(summaryMap.entries()).map(([jenis_bangkom, value], index) => ({
        id: index + 1,
        jenis_bangkom,
        total_peserta: value.total_peserta,
        jumlah_event: value.jumlah_event,
        rata_rata_peserta: Number((value.total_peserta / value.jumlah_event).toFixed(2)),
      }));

      // Hitung total keseluruhan
      const total_peserta_semua = summary.reduce(
        (acc, curr) => acc + curr.total_peserta,
        0
      );

      const total_event_semua = summary.reduce(
        (acc, curr) => acc + curr.jumlah_event,
        0
      );

      const rata_rata_semua = total_event_semua
        ? Number((total_peserta_semua / total_event_semua).toFixed(2))
        : 0;

      // Kirim response
      return res.status(200).json({
        summary,
        total_peserta_semua,
        total_event_semua,
        rata_rata_semua,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("API Error:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return res.status(500).json({
      message: "Server error",
      error: errorMessage,
    });
  }
}

