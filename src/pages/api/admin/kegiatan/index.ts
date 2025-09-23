import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Ambil data dari rencana_mingguan (kegiatan mingguan)
      const rencanaMingguan = await prisma.rencana_mingguan.findMany({
        orderBy: [
          { bulan: "desc" },
          { minggu: "desc" },
          { created_at: "desc" }
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

      // Ambil data dari event_schedule (kegiatan terjadwal)
      const eventSchedule = await prisma.event_schedule.findMany({
        orderBy: {
          date: "desc",
        },
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
        kegiatan: item.kegiatan,
        minggu: item.minggu,
        bulan: item.bulan,
        status: item.status,
        jenis_belanja: item.jenis_belanja,
        anggaran_rencana: Number(item.anggaran_rencana),
        anggaran_cair: Number(item.anggaran_cair),
        created_at: item.created_at,
        unit_kerja: item.users?.unit_kerja || null,
        unit_alias: item.users?.alias || null,
        unit_kerja_id: item.unit_id,
      }));

      // Format data event schedule
      const formattedEventSchedule = eventSchedule.map((item) => ({
        id: item.id,
        type: 'event_schedule' as const,
        kegiatan: item.title,
        tanggal: item.date,
        lokasi: item.location,
        waktu: item.time,
        tipe: item.type,
        prioritas: item.priority,
        peserta: item.attendees,
        deskripsi: item.description,
        created_at: item.created_at,
        unit_kerja: item.users?.unit_kerja || null,
        unit_alias: item.users?.alias || null,
        unit_kerja_id: item.unit_kerja_id,
      }));

      // Gabungkan statistik
      const totalRencanaMingguan = rencanaMingguan.length;
      const totalEventSchedule = eventSchedule.length;
      const totalKegiatan = totalRencanaMingguan + totalEventSchedule;

      // Statistik per unit kerja
      const unitStats: {
        [unitKey: string]: {
          unit_kerja: string;
          unit_alias: string;
          unit_kerja_id: number;
          rencana_mingguan: number;
          event_schedule: number;
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
            event_schedule: 0,
            total_kegiatan: 0,
            status_breakdown: {},
            total_anggaran_rencana: 0,
            total_anggaran_cair: 0,
          };
        }
        unitStats[unitKey].rencana_mingguan++;
        unitStats[unitKey].total_kegiatan++;
        unitStats[unitKey].total_anggaran_rencana += Number(item.anggaran_rencana);
        unitStats[unitKey].total_anggaran_cair += Number(item.anggaran_cair);
        
        if (!unitStats[unitKey].status_breakdown[item.status]) {
          unitStats[unitKey].status_breakdown[item.status] = 0;
        }
        unitStats[unitKey].status_breakdown[item.status]++;
      });

      // Hitung statistik event schedule per unit
      eventSchedule.forEach(item => {
        const unitKey = item.users?.unit_kerja || 'Unknown';
        if (!unitStats[unitKey]) {
          unitStats[unitKey] = {
            unit_kerja: unitKey,
            unit_alias: item.users?.alias || '',
            unit_kerja_id: item.unit_kerja_id,
            rencana_mingguan: 0,
            event_schedule: 0,
            total_kegiatan: 0,
            status_breakdown: {},
            total_anggaran_rencana: 0,
            total_anggaran_cair: 0,
          };
        }
        unitStats[unitKey].event_schedule++;
        unitStats[unitKey].total_kegiatan++;
      });

      // Statistik status rencana mingguan
      const statusStats = rencanaMingguan.reduce((acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Statistik per bulan untuk rencana mingguan
      const monthlyStats = rencanaMingguan.reduce((acc: Record<string, number>, item) => {
        const monthKey = `${item.bulan}`;
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
          event_schedule: formattedEventSchedule,
          combined: [...formattedRencanaMingguan, ...formattedEventSchedule],
        },
        statistics: {
          total_kegiatan: totalKegiatan,
          total_rencana_mingguan: totalRencanaMingguan,
          total_event_schedule: totalEventSchedule,
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
