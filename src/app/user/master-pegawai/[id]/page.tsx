"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Edit, ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Briefcase, User, Users } from "lucide-react";

export default function PegawaiDetailPage() {
  const params = useParams() as Record<string, string | undefined>;
  const router = useRouter();
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
    photo_url?: string;
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8"><div className="max-w-6xl mx-auto text-center"><div className="animate-pulse flex flex-col items-center"><div className="w-32 h-32 bg-gray-300 rounded-full mb-4"></div><div className="h-4 bg-gray-300 rounded w-48 mb-2"></div><div className="h-4 bg-gray-300 rounded w-64"></div></div></div></div>;
  if (error || !data) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8"><div className="max-w-6xl mx-auto text-center text-red-500 bg-white rounded-lg shadow-lg p-8">{error || "Data tidak ditemukan"}</div></div>;

  const detail = Array.isArray(data.pegawai_detail) ? data.pegawai_detail[0] || {} : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan tombol kembali */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={() => router.push(`/user/master-pegawai/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Edit className="w-4 h-4" />
            Edit Profil
          </button>
        </div>

        {/* Card Profil Utama */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16">
              {/* Foto Profil */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  <Image
                    src={detail.photo_url || "/avatar.png"}
                    alt={data.nama}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${detail.status_kepegawaian === 'Aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>

              {/* Info Utama */}
              <div className="flex-1 text-center md:text-left mt-4 md:mt-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.nama}</h1>
                <p className="text-lg text-gray-600 mb-3">{data.jabatan}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {data.nip}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {data.golongan}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {data.eselon}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Informasi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Informasi Kontak */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Informasi Kontak
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800">{detail.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Telepon</p>
                  <p className="text-sm font-medium text-gray-800">{detail.telp || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Alamat</p>
                  <p className="text-sm font-medium text-gray-800">{detail.alamat || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Personal */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Informasi Personal
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Tanggal Lahir</p>
                  <p className="text-sm font-medium text-gray-800">
                    {detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Jenis Kelamin</p>
                  <p className="text-sm font-medium text-gray-800">
                    {detail.jenis_kelamin === 'L' ? 'Laki-laki' : detail.jenis_kelamin === 'P' ? 'Perempuan' : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Golongan Darah</p>
                  <p className="text-sm font-medium text-gray-800">{detail.nm_goldar || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Pendidikan</p>
                  <p className="text-sm font-medium text-gray-800">{detail.pendidikan || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Kepegawaian */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Informasi Kepegawaian
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Unit Kerja</p>
                  <p className="text-sm font-medium text-gray-800">{data.users?.unit_kerja || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Status Kepegawaian</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${detail.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {detail.status_kepegawaian || "-"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">TMT CPNS</p>
                  <p className="text-sm font-medium text-gray-800">
                    {detail.peg_cpns_tmt ? new Date(detail.peg_cpns_tmt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section (jika ada alamat) */}
        {detail.alamat && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Lokasi
            </h2>
            <div className="rounded-lg overflow-hidden">
              <iframe
                title="Google Map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(detail.alamat)}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        )}

        {/* Riwayat Pelatihan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              Riwayat Pelatihan
            </h2>
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-orange-600 font-medium">Total JP:</span>
              <span className="text-lg font-bold text-orange-700">
                {loadingPelatihan ? "..." : pelatihan.reduce((sum, p) => sum + (p.jam || 0), 0)}
              </span>
            </div>
          </div>

          {loadingPelatihan ? (
            <div className="text-center py-8 text-gray-400">Memuat data pelatihan...</div>
          ) : pelatihan.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada data pelatihan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul Pelatihan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">JP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pelatihan.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{p.judul}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {p.jam || 0} JP
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
