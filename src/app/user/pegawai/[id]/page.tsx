"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

// Komponen untuk rekomendasi pelatihan AI

export default function PegawaiDetailPage() {
  // ...existing code...
  const params = useParams() as Record<string, string | undefined>;
  const id = params?.id;
  type PegawaiDetailItem = {
  id?: number;
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
    photo_url?: string
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
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<PegawaiDetailItem>({});
  const [showStatusInfo, setShowStatusInfo] = useState(false);

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

  const detail = React.useMemo(() => {
    return Array.isArray(data?.pegawai_detail) ? data.pegawai_detail[0] || {} : {};
  }, [data]);
  // Sync form state with detail when entering edit mode
  useEffect(() => {
    if (editMode) setForm(detail);
  }, [editMode, detail]);

  // Save handler for edit mode
  async function handleSave() {
    if (!id || !data?.users?.unit_kerja || !data?.pegawai_detail?.[0]?.id) return;
    try {
      const res = await fetch(`/api/employee/unit/${data.users.unit_kerja}/detail`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.pegawai_detail[0].id, detail: form }),
      });
      if (res.ok) {
        // Refresh data
        const updated = await res.json();
        setData((prev) => prev ? { ...prev, pegawai_detail: [updated] } : prev);
        setEditMode(false);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch {
      alert("Gagal menyimpan data");
    }
  }

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/user/pegawai" className="inline-block mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">← Kembali</Link>
      <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <Image
          src={detail.photo_url || "/avatar.png"}
          alt={data.nama}
          width={112}
          height={112}
          className="w-28 h-28 object-cover rounded-full border mb-4"
        />
        <div className="text-xl font-semibold text-gray-800 mb-1">{data.nama}</div>
        <div className="text-sm text-gray-500 mb-4">{data.jabatan}</div>
        <div className="w-full border-t my-4"></div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {editMode ? (
            <React.Fragment>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Email</label>
                <input type="email" className="w-full border rounded px-2 py-1" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="mb-2 relative">
                <label className="flex text-sm font-medium text-blue-600 items-center gap-1">
                  Status Kepegawaian
                  <button
                    type="button"
                    className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                    onClick={() => setShowStatusInfo((v) => !v)}
                    aria-label="Keterangan Status Kepegawaian"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">!</span>
                  </button>
                </label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form.status_kepegawaian || ""}
                  onChange={e => setForm(f => ({ ...f, status_kepegawaian: e.target.value }))}
                >
                  <option value="">Pilih Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                  <option value="Pensiun">Pensiun</option>
                </select>
                {showStatusInfo && (
                  <div className="absolute z-10 left-0 mt-2 w-64 bg-white border border-blue-200 rounded shadow p-3 text-xs text-gray-700">
                    <div className="font-semibold text-blue-700 mb-1">Keterangan Status Kepegawaian:</div>
                    <ul className="list-disc pl-4">
                      <li><span className="font-bold text-blue-600">Aktif</span>: Pegawai masih bekerja dan aktif menjalankan tugas.</li>
                      <li><span className="font-bold text-blue-600">Pensiun</span>: Pegawai sudah pensiun, berhenti bekerja karena usia atau masa kerja.</li>
                      <li><span className="font-bold text-blue-600">Tidak Aktif</span>: Pegawai sudah tidak bekerja, bukan karena pensiun (misal diberhentikan, mengundurkan diri, wafat, dll).</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Alamat</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={form.alamat || ""} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Pendidikan</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={form.pendidikan || ""} onChange={e => setForm(f => ({ ...f, pendidikan: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Telp</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={form.telp || ""} onChange={e => setForm(f => ({ ...f, telp: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Tanggal Lahir</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={form.tanggal_lahir ? form.tanggal_lahir.slice(0,10) : ""} onChange={e => setForm(f => ({ ...f, tanggal_lahir: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Jenis Kelamin</label>
                <select className="w-full border rounded px-2 py-1" value={form.jenis_kelamin || ""} onChange={e => setForm(f => ({ ...f, jenis_kelamin: e.target.value }))}>
                  <option value="">Pilih</option>
                  <option value="L">Laki - Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">Golongan Darah</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={form.nm_goldar || ""} onChange={e => setForm(f => ({ ...f, nm_goldar: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-blue-600">TMT CPNS</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={form.peg_cpns_tmt ? form.peg_cpns_tmt.slice(0,10) : ""} onChange={e => setForm(f => ({ ...f, peg_cpns_tmt: e.target.value }))} />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Email:</span> {detail.email || <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Status Kepegawaian:</span> {detail.status_kepegawaian ? <span className={`px-2 py-0.5 rounded text-white font-semibold ${detail.status_kepegawaian === 'Aktif' ? 'bg-blue-500' : 'bg-gray-400'}`}>{detail.status_kepegawaian}</span> : <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex flex-col gap-2"><span className="font-medium text-blue-600">Alamat:</span> {detail.alamat || <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Pendidikan:</span> {detail.pendidikan || <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Telp:</span> {detail.telp || <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Tanggal Lahir:</span> {detail.tanggal_lahir ? <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">{new Date(detail.tanggal_lahir).toLocaleDateString()}</span> : <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Jenis Kelamin:</span> {detail.jenis_kelamin === 'L' ? <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-semibold">Laki - Laki</span> : detail.jenis_kelamin === 'P' ? <span className="bg-pink-100 px-2 py-0.5 rounded text-pink-700 font-semibold">Perempuan</span> : detail.jenis_kelamin || <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">Golongan Darah:</span> {detail.nm_goldar ? <span className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-semibold">{detail.nm_goldar}</span> : <span className="text-gray-400">-</span>}</div>
              <div className="text-sm text-gray-700 flex items-center gap-2"><span className="font-medium text-blue-600">TMT CPNS:</span> {detail.peg_cpns_tmt ? <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">{new Date(detail.peg_cpns_tmt).toLocaleDateString()}</span> : <span className="text-gray-400">-</span>}</div>
            </React.Fragment>
          )}
        </div>
        <div className="w-full flex gap-2 mt-4">
          {editMode ? (
            <React.Fragment>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Simpan</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Batal</button>
            </React.Fragment>
          ) : (
            <button className="bg-yellow-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(true)}>Edit</button>
          )}
        </div>
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