import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Ambil data dari rencana_mingguan (kegiatan mingguan)
      const rencanaMingguan = await prisma.rencana_mingguan.findMany({
        orderBy: [
          { bulan: "desc" },
          { minggu: "desc" }
        ],
        include: {
          users: {
            select: {
              id: true,
              unit_kerja: true,
              alias: true,
            },
          },
        },
      });

      // Format data rencana mingguan
      const formattedRencanaMingguan = rencanaMingguan.map((item) => ({
        id: item.id,
        type: 'rencana_mingguan' as const,
        kegiatan: item.kegiatan || '',
        minggu: item.minggu || 0,
        bulan: item.bulan || 0,
        status: item.status || 'Direncanakan',
        jenis_belanja: item.jenis_belanja || '',
        anggaran_rencana: Number(item.anggaran_rencana) || 0,
        anggaran_cair: Number(item.anggaran_cair) || 0,
        created_at: item.created_at,
        unit_kerja: item.users?.unit_kerja || null,
        unit_alias: item.users?.alias || null,
        unit_kerja_id: item.unit_id || 0,
      }));

      // Gabungkan statistik
      const totalRencanaMingguan = rencanaMingguan.length;
      const totalKegiatan = totalRencanaMingguan;

      // Statistik per unit kerja
      const unitStats: {
        [unitKey: string]: {
          unit_kerja: string;
          unit_alias: string;
          unit_kerja_id: number;
          rencana_mingguan: number;
          total_kegiatan: number;
          status_breakdown: { [key: string]: number };
          total_anggaran_rencana: number;
          total_anggaran_cair: number;
        };
      } = {};

      // Hitung statistik rencana mingguan per unit
      rencanaMingguan.forEach(item => {
        const unitKey = item.users?.unit_kerja || 'Unknown';
        if (!unitStats[unitKey]) {
          unitStats[unitKey] = {
            unit_kerja: unitKey,
            unit_alias: item.users?.alias || '',
            unit_kerja_id: item.unit_id,
            rencana_mingguan: 0,
            total_kegiatan: 0,
            status_breakdown: {},
            total_anggaran_rencana: 0,
            total_anggaran_cair: 0,
          };
        }
        unitStats[unitKey].rencana_mingguan++;
        unitStats[unitKey].total_kegiatan++;
        unitStats[unitKey].total_anggaran_rencana += Number(item.anggaran_rencana) || 0;
        unitStats[unitKey].total_anggaran_cair += Number(item.anggaran_cair) || 0;
        
        const status = item.status || 'Direncanakan';
        if (!unitStats[unitKey].status_breakdown[status]) {
          unitStats[unitKey].status_breakdown[status] = 0;
        }
        unitStats[unitKey].status_breakdown[status]++;
      });

      // Statistik status rencana mingguan
      const statusStats = rencanaMingguan.reduce((acc: Record<string, number>, item) => {
        const status = item.status || 'Direncanakan';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Statistik per bulan untuk rencana mingguan
      const monthlyStats = rencanaMingguan.reduce((acc: Record<string, number>, item) => {
        const monthKey = `${item.bulan || 0}`;
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        acc[monthKey]++;
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        data: {
          rencana_mingguan: formattedRencanaMingguan,
          combined: formattedRencanaMingguan,
        },
        statistics: {
          total_kegiatan: totalKegiatan,
          total_rencana_mingguan: totalRencanaMingguan,
          status_breakdown: statusStats,
          monthly_breakdown: monthlyStats,
          unit_statistics: Object.values(unitStats),
        },
      });
    } catch (err) {
      console.error("Error fetching admin kegiatan data:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Gagal mengambil data kegiatan",
        error: typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : String(err)
      });
    }
  }

  return res.status(405).json({ message: "Metode tidak diizinkan" });
}
