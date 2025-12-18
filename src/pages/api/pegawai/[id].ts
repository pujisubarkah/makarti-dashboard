// pages/api/pegawai/groupByUnit/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type UnitGroup = {
  unit_kerja_id: number;
  nama_unit_kerja: string;
  total_pegawai: number;
  kepala_unit: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    if (req.method !== 'GET') {
      await prisma.$disconnect();
      return res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
    }

    const idParam = req.query.id;
    const idAsNumber = parseInt(Array.isArray(idParam) ? idParam[0] : idParam || '', 10);

    if (isNaN(idAsNumber)) {
      await prisma.$disconnect();
      return res.status(400).json({ error: 'ID unit tidak valid' });
    }

    // Mapping unit gabungan ➜ ke unit utama
    const unitMergeMap: Record<number, number> = {
      30: 22,
      31: 20,
    };

    const targetUnitId = unitMergeMap[idAsNumber] || idAsNumber;

    const allPegawai = await prisma.pegawai.findMany({
      // Adjust the include clause to match your schema, e.g., include related user if relation is 'user'
      // include: { user: true },
    });

    const filteredPegawai = allPegawai.filter(p =>
      (p.unit_kerja_id === targetUnitId) ||
      (unitMergeMap[p.unit_kerja_id || 0] === targetUnitId)
    );

    if (filteredPegawai.length === 0) {
      await prisma.$disconnect();
      return res.status(404).json({ error: 'Unit kerja tidak ditemukan atau tidak punya cukup pegawai' });
    }

    const sampleUnit = filteredPegawai.find(p => p.unit_kerja_id === targetUnitId);

    // Fetch unit name from the users table
    let namaUnitKerja = 'Unit Tidak Diketahui';
    if (sampleUnit?.unit_kerja_id) {
      const unit = await prisma.users.findUnique({
        where: { id: sampleUnit.unit_kerja_id },
        select: { unit_kerja: true },
      });
      if (unit?.unit_kerja) {
        namaUnitKerja = unit.unit_kerja;
      }
    }

    let totalPegawai = 0;
    let kepalaUnit: string | null = null;

    filteredPegawai.forEach((pegawai) => {
      totalPegawai++;
      if ((pegawai.eselon === 'JPTP' || pegawai.eselon === 'JF/D') && !kepalaUnit) {
        kepalaUnit = pegawai.nama || null;
      }
    });

    if (totalPegawai <= 1) {
      await prisma.$disconnect();
      return res.status(204).json({ message: 'Unit kerja tidak memenuhi syarat (total pegawai <= 1)' });
    }

    const result: UnitGroup = {
      unit_kerja_id: targetUnitId,
      nama_unit_kerja: namaUnitKerja,
      total_pegawai: totalPegawai,
      kepala_unit: kepalaUnit,
    };

    await prisma.$disconnect();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/pegawai/[id]:', error);
    await prisma.$disconnect();
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data unit kerja' });
  }
}
