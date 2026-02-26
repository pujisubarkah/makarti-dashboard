import type { NextApiRequest, NextApiResponse } from "next";
import { getBknToken } from "@/lib/bkn";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { nip } = req.query;

  if (!nip || typeof nip !== "string") {
    return res.status(400).json({ message: "NIP tidak valid" });
  }

  try {
    // Ambil token dinamis dari getBknToken dan token statis dari .env
    const dynamicToken = await getBknToken();
    const staticToken = process.env.BKN_STATIC_TOKEN;
    console.log('Dynamic token:', dynamicToken);
    console.log('Static token:', staticToken);

    const bknRes = await fetch(
      `https://apimws.bkn.go.id:8243/pembinabknlan/1/pns/data-utama/${nip}`,
      {
        headers: {
          Authorization: `Bearer ${dynamicToken}`,
          auth: `Bearer ${staticToken}`,
          accept: "application/json",
        },
      }
    );

    const json = await bknRes.json();
    console.log("BKN response:", json);

    // 🔴 Kalau BKN balikin null
    if (!json?.data) {
      return res.status(200).json(null);
    }

    // 🔁 Mapping ke struktur PROFIL kamu
    return res.status(200).json({
      nip: json.data.nipBaru,
      nama: json.data.nama,
      jabatan: json.data.jabatanNama,
      golongan: json.data.golonganRuang,
      eselon: json.data.eselon,
      unit_kerja: json.data.unorNama,
      status_kepegawaian: json.data.statusPegawai,
      jenis_kelamin: json.data.jenisKelamin,
      tempat_lahir: json.data.lahirTempat,
      tanggal_lahir: json.data.lahirTanggal,
      agama: json.data.agama,
      pendidikan: json.data.pendidikanTerakhir,
    });
  } catch (error) {
    console.error("BKN data-utama error:", error);
    return res.status(500).json({ message: "Gagal ambil data utama BKN" });
  }
}