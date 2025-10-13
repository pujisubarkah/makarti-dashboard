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
            select: { id: true, nama: true },
          },
        },
      });

      // Struktur ulang respons sesuai frontend
      const formattedData = data.map(item => ({
        id: item.id,
        pegawai_id: item.pegawai_id,
        unit_kerja_id: item.unit_kerja_id,
        judul: item.judul,
        jam: item.jam,
        tanggal: item.tanggal.toISOString().split("T")[0], // Format YYYY-MM-DD
        sertifikat: item.sertifikat,
        pegawai: {
          id: item.pegawai.id,
          nama: item.pegawai.nama,
        },
      }));

      return res.status(200).json(formattedData);
    } catch (error) {
      console.error("Error fetching pelatihan data:", error);
      return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
    }
  } else if (req.method === "POST") {
    try {
      const unitKerjaId = parseInt(unit_kerja_id as string);

      if (isNaN(unitKerjaId)) {
        return res.status(400).json({ error: "unit_kerja_id tidak valid" });
      }

      const { pegawai_id, judul, jam, tanggal, sertifikat } = req.body;

      console.log('Received data:', { pegawai_id, judul, jam, tanggal, sertifikat, unitKerjaId });

      // Validasi data yang diterima
      if (!judul || !tanggal || !jam) {
        return res.status(400).json({ error: "Data pelatihan tidak lengkap. judul, jam, dan tanggal diperlukan." });
      }

      if (!pegawai_id || pegawai_id === 0 || pegawai_id === "0") {
        return res.status(400).json({ error: "pegawai_id tidak valid. Pilih pegawai terlebih dahulu." });
      }

      // Validasi tipe data
      const jamInt = parseInt(jam);
      if (isNaN(jamInt) || jamInt <= 0) {
        return res.status(400).json({ error: "Jam pelatihan harus berupa angka positif." });
      }

      // Cari pegawai berdasarkan pegawai_id
      const pegawai = await prisma.pegawai.findFirst({
        where: { id: Number(pegawai_id) },
        include: {
          users_pegawai_unit_kerja_idTousers: {
            select: { id: true, unit_kerja: true }
          }
        }
      });

      if (!pegawai) {
        return res.status(404).json({ error: "Pegawai tidak ditemukan dengan ID tersebut" });
      }

      // Debug info untuk melihat data pegawai
      console.log('Pegawai ditemukan:', {
        id: pegawai.id,
        nama: pegawai.nama,
        nip: pegawai.nip,
        unit_kerja_id: pegawai.unit_kerja_id,
        received_pegawai_id: pegawai_id,
        expected_unit: unitKerjaId
      });

      // Validasi unit_kerja_id dari pegawai tidak boleh null
      if (!pegawai.unit_kerja_id) {
        return res.status(400).json({ 
          error: "Pegawai tidak memiliki unit kerja yang valid",
          pegawai_id: pegawai.id,
          pegawai_nama: pegawai.nama
        });
      }

      const pelatihanBaru = await prisma.pelatihan.create({
        data: {
          judul,
          jam: jamInt, // Gunakan jamInt yang sudah divalidasi
          tanggal: new Date(tanggal),
          sertifikat: sertifikat ?? null,
          unit_kerja_id: pegawai.unit_kerja_id, // Sekarang sudah dipastikan tidak null
          pegawai_id: Number(pegawai_id), // Gunakan pegawai_id yang diteriman langsung
        },
      });

      console.log('Pelatihan berhasil dibuat:', {
        id: pelatihanBaru.id,
        pegawai_id: pelatihanBaru.pegawai_id,
        unit_kerja_id: pelatihanBaru.unit_kerja_id,
        judul: pelatihanBaru.judul
      });

      // Format respons sesuai frontend
      return res.status(201).json({
        id: pelatihanBaru.id,
        pegawai_id: pelatihanBaru.pegawai_id,
        unit_kerja_id: pelatihanBaru.unit_kerja_id,
        judul: pelatihanBaru.judul,
        jam: pelatihanBaru.jam,
        tanggal: pelatihanBaru.tanggal.toISOString().split("T")[0],
        sertifikat: pelatihanBaru.sertifikat,
        pegawai: {
          id: pegawai.id,
          nama: pegawai.nama,
        },
        unit_kerja: pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja || "Tidak diketahui"
      });
    } catch (error) {
      console.error("Error creating pelatihan:", error);
      return res.status(500).json({ error: "Gagal membuat data pelatihan" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}