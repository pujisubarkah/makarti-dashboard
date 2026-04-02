import Image from "next/image";
import type { Pegawai, PegawaiDetail } from "../../types/pegawai";

export default function ProfileHero({ data, detail }: { data: Pegawai; detail: PegawaiDetail }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex gap-6">
      <Image
        src={detail.photo_url || "/avatar.png"}
        width={96}
        height={96}
        className="rounded-full object-cover"
        alt="Foto ASN"
      />

      <div className="flex-1">
        <h2 className="text-xl font-bold">{data.nama}</h2>
        <p className="text-sm text-gray-600">{data.jabatan}</p>
        <p className="text-sm text-gray-500">
          {data.users_pegawai_unit_kerja_idTousers?.unit_kerja}
        </p>

        <div className="mt-3 flex gap-4 text-sm">
          <span><strong>NIP:</strong> {data.nip}</span>
          <span><strong>Gol:</strong> {data.golongan || "-"}</span>
          <span><strong>Eselon:</strong> {data.eselon || "-"}</span>
        </div>
      </div>
    </div>
  );
}