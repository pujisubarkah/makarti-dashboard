"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function PegawaiDetailPage() {
  const params = useParams() as Record<string, string | undefined>;
  const id = params?.id;
  type PegawaiDetailItem = {
    email?: string;
    status_kepegawaian?: string;
    alamat?: string;
    pendidikan?: string;
    telp?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    nm_goldar?: string;
    peg_cpns_tmt?: string;
  };
  type PegawaiDetail = {
    pegawai_detail: PegawaiDetailItem[];
    foto_url?: string;
    nama: string;
    jabatan: string;
    nip: string;
    users?: { unit_kerja?: string };
    golongan?: string;
    eselon?: string;
  };
  type Pelatihan = {
    id: number;
    judul: string;
    jam?: number;
    tanggal?: string;
  };
  const [data, setData] = useState<PegawaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loadingPelatihan, setLoadingPelatihan] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/employee/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data pegawai");
        setLoading(false);
      });

    setLoadingPelatihan(true);
    fetch(`/api/employee/pelatihan/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setPelatihan(res);
        setLoadingPelatihan(false);
      })
      .catch(() => {
        setPelatihan([]);
        setLoadingPelatihan(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;

  const detail = Array.isArray(data.pegawai_detail) ? data.pegawai_detail[0] || {} : {};

  return (
    <div className="max-w-2xl mx-auto p-6">
  <Link href="/admin/pegawai" className="inline-block mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">← Kembali</Link>
      <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <Image
          src={data.foto_url || "/avatar.png"}
          alt={data.nama}
          width={112}
          height={112}
          className="w-28 h-28 object-cover rounded-full border mb-4"
        />
        <div className="text-xl font-semibold text-gray-800 mb-1">{data.nama}</div>
        <div className="text-sm text-gray-500 mb-4">{data.jabatan}</div>
        <div className="w-full border-t my-4"></div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><rect width="16" height="12" x="4" y="7" rx="2" stroke="#2563eb" strokeWidth="2"/></svg> NIP:</span> <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">{data.nip}</span></div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 2v20M2 12h20"/></svg> Unit Kerja:</span> {data.users?.unit_kerja}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/></svg> Golongan:</span> {data.golongan}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="2"/></svg> Eselon:</span> {data.eselon}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 4h16v16H4z"/><path stroke="#2563eb" strokeWidth="2" d="M8 8h8v8H8z"/></svg> Email:</span> {detail.email || <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 2v20"/></svg> Status Kepegawaian:</span> {detail.status_kepegawaian ? <span className={`px-2 py-0.5 rounded text-white font-semibold ${detail.status_kepegawaian === 'Aktif' ? 'bg-blue-500' : 'bg-gray-400'}`}>{detail.status_kepegawaian}</span> : <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex flex-col gap-2">
            <span className="font-medium text-blue-600 flex items-center gap-1">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 20v-8a8 8 0 0 1 16 0v8"/></svg> Alamat:
            </span>
            {detail.alamat ? (
              <>
                <span>{detail.alamat}</span>
                <iframe
                  title="Google Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(detail.alamat)}&output=embed`}
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: '8px', marginTop: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 2v20M2 12h20"/></svg> Pendidikan:</span> {detail.pendidikan || <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M2 12h20"/></svg> Telp:</span> {detail.telp || <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/></svg> Tanggal Lahir:</span> {detail.tanggal_lahir ? <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">{new Date(detail.tanggal_lahir).toLocaleDateString()}</span> : <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 2v20"/></svg> Jenis Kelamin:</span> {detail.jenis_kelamin === 'L' ? <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-semibold">Laki - Laki</span> : detail.jenis_kelamin === 'P' ? <span className="bg-pink-100 px-2 py-0.5 rounded text-pink-700 font-semibold">Perempuan</span> : detail.jenis_kelamin || <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/></svg> Golongan Darah:</span> {detail.nm_goldar ? <span className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-semibold">{detail.nm_goldar}</span> : <span className="text-gray-400">-</span>}</div>
          <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600 flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="2"/></svg> TMT CPNS:</span> {detail.peg_cpns_tmt ? <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">{new Date(detail.peg_cpns_tmt).toLocaleDateString()}</span> : <span className="text-gray-400">-</span>}</div>
        </div>
        {/* Section: Riwayat Pelatihan */}
        <div className="w-full mt-8">
          <div className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            Riwayat Pelatihan
          </div>
          <div className="mb-2 text-sm text-gray-700 flex items-center gap-2">
            <span className="font-semibold text-blue-600">Jam Pembelajaran:</span>
            {loadingPelatihan ? (
              <span className="text-gray-400">Memuat...</span>
            ) : (
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">
                {pelatihan.length > 0 ? pelatihan.reduce((sum, p) => sum + (p.jam || 0), 0) : 0}
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded p-4">
            {loadingPelatihan ? (
              <div className="text-gray-400 text-sm">Memuat data pelatihan...</div>
            ) : pelatihan.length === 0 ? (
              <div className="text-gray-400 text-sm">Belum ada data pelatihan.</div>
            ) : (
              <ul className="pl-0">
                {pelatihan.map((p) => (
                  <li key={p.id} className="mb-2 flex justify-between items-center text-gray-700 text-sm border-b last:border-b-0 py-2">
                    <span className="flex-1 pr-4">{p.judul}</span>
                    <span className="text-gray-500 text-xs whitespace-nowrap">{p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
