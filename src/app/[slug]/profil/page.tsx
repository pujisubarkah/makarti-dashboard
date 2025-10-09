"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ProfilPage() {
  const params = useParams() as Record<string, string | undefined>;
  const slug = params?.slug as string;
  const id = params?.id || localStorage.getItem('username'); // Get from params or localStorage
  
  type PegawaiDetailItem = {
    id?: number;
    nip?: string;
    email?: string;
    status_kepegawaian?: string;
    alamat?: string;
    pendidikan?: string;
    tingkat_pendidikan?: string;
    telp?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    nm_goldar?: string;
    peg_cpns_tmt?: string;
    photo_url?: string;
    agama?: string;
    tempat_lahir?: string;
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
        body: JSON.stringify({ id: data.pegawai_detail[0].id, nip: data.nip, detail: form }),
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
    <div className="p-6 space-y-6">
      {/* Header dengan Context */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Profil
        </h1>
        <p className="text-blue-100">
          Kelola informasi profil dan data personal Anda
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-end mb-6">
          {!editMode && (
            <button className="bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition" onClick={() => setEditMode(true)}>
              Edit Profil
            </button>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Informasi Profil</h2>
        
        <div className="flex items-start space-x-6">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 rounded-full">
            <div className="flex flex-col items-center w-full">
              <div className="relative group w-full h-full flex items-center justify-center">
                <label htmlFor="edit-photo" className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-full">
                  <span className="flex flex-col items-center">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="2" d="M4 7h2l2-3h4l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"/><circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2"/></svg>
                    <span className="text-white text-xs mt-1">Edit Foto</span>
                  </span>
                </label>
                <Image
                  alt="Profile"
                  src={detail.photo_url || "/avatar.png"}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover rounded-full"
                />
                <input id="edit-photo" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !id) return;
                  setLoading(true);
                  const formData = new FormData();
                  formData.append("photo", file);
                  formData.append("id", id);
                  const res = await fetch("/api/upload-photo", {
                    method: "POST",
                    body: formData
                  });
                  setLoading(false);
                  if (res.ok) {
                    const { photo_url } = await res.json();
                    setForm(f => ({ ...f, photo_url }));
                    setData(d => d ? { ...d, pegawai_detail: [{ ...d.pegawai_detail[0], photo_url }] } : d);
                  } else {
                    alert("Gagal upload foto");
                  }
                }} />
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="border border-gray-300 rounded-md divide-y divide-gray-300">
              <div className="flex justify-between p-3 bg-gray-100">
                <div className="font-semibold">NIP</div>
                <div>{detail.nip || "-"}</div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-semibold">Nama Lengkap</div>
                <div>{data.nama || "-"}</div>
              </div>
              <div className="flex justify-between p-3 bg-gray-100">
                <div className="font-semibold">Jabatan</div>
                <div>{data.jabatan || "-"}</div>
              </div>
              <div className="flex justify-between p-3">
                <div className="font-semibold">Email</div>
                <div>{detail.email || "-"}</div>
              </div>
              <div className="flex justify-between p-3 bg-gray-100">
                <div className="font-semibold">Status Kepegawaian</div>
                <div>{detail.status_kepegawaian || "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setEditMode(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-4 text-yellow-700">Edit Data Pegawai</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NIP</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.nip || ""} onChange={e => setForm({ ...form, nip: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full border rounded px-2 py-1" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status Kepegawaian</label>
                  <select className="w-full border rounded px-2 py-1" value={form.status_kepegawaian || ""} onChange={e => setForm({ ...form, status_kepegawaian: e.target.value })}>
                    <option value="">Pilih Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Pensiun">Pensiun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.alamat || ""} onChange={e => setForm({ ...form, alamat: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tingkat Pendidikan</label>
                  <select className="w-full border rounded px-2 py-1" value={form.tingkat_pendidikan || ""} onChange={e => setForm({ ...form, tingkat_pendidikan: e.target.value })}>
                    <option value="">Pilih Tingkat Pendidikan</option>
                    <option value="SLTA">SLTA</option>
                    <option value="Diploma III">Diploma III</option>
                    <option value="Diploma IV">Diploma IV</option>
                    <option value="S-1">S-1</option>
                    <option value="S-2">S-2</option>
                    <option value="S-3">S-3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pendidikan</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.pendidikan || ""} onChange={e => setForm({ ...form, pendidikan: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telp</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.telp || ""} onChange={e => setForm({ ...form, telp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input type="date" className="w-full border rounded px-2 py-1" value={form.tanggal_lahir ? form.tanggal_lahir.slice(0,10) : ""} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select className="w-full border rounded px-2 py-1" value={form.jenis_kelamin || ""} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })}>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Golongan Darah</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.nm_goldar || ""} onChange={e => setForm({ ...form, nm_goldar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">TMT CPNS</label>
                  <input type="date" className="w-full border rounded px-2 py-1" value={form.peg_cpns_tmt ? form.peg_cpns_tmt.slice(0,10) : ""} onChange={e => setForm({ ...form, peg_cpns_tmt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agama</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.agama || ""} onChange={e => setForm({ ...form, agama: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={form.tempat_lahir || ""} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Simpan</button>
                <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Batal</button>
              </div>
            </div>
          </div>
        )}

        {/* Data Pribadi */}
        <div id="data-pribadi" className="w-full mt-8 p-2 border rounded-md bg-gray-50">
          <table className="w-full border-collapse border">
            <tbody>
              <tr className="bg-teal-50">
                <td className="px-4 py-2 font-semibold w-1/6">Tempat, Tanggal Lahir</td>
                <td className="px-4 py-2 w-2/6">{detail.tempat_lahir || "-"}, {detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</td>
                <td className="px-4 py-2 font-semibold w-1/6">Jenis Kelamin</td>
                <td className="px-4 py-2 w-2/6">{detail.jenis_kelamin === "L" ? "Laki-laki" : detail.jenis_kelamin === "P" ? "Perempuan" : "-"}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-semibold w-1/6">Agama</td>
                <td className="px-4 py-2 w-2/6">{detail.agama || "-"}</td>
                <td className="px-4 py-2 font-semibold w-1/6">Golongan Darah</td>
                <td className="px-4 py-2 w-2/6">{detail.nm_goldar || "-"}</td>
              </tr>
              <tr className="bg-teal-50">
                <td className="px-4 py-2 font-semibold w-1/6">Alamat</td>
                <td className="px-4 py-2 w-2/6">{detail.alamat || "-"}</td>
                <td className="px-4 py-2 font-semibold w-1/6">Telp</td>
                <td className="px-4 py-2 w-2/6">{detail.telp || "-"}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-semibold w-1/6">Pendidikan</td>
                <td className="px-4 py-2 w-2/6">{detail.pendidikan || "-"}</td>
                <td className="px-4 py-2 font-semibold w-1/6">Tingkat Pendidikan</td>
                <td className="px-4 py-2 w-2/6">{detail.tingkat_pendidikan || "-"}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2 font-semibold w-1/6">TMT CPNS</td>
                <td className="px-4 py-2 w-2/6">{detail.peg_cpns_tmt ? new Date(detail.peg_cpns_tmt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
          
          {/* Riwayat Pelatihan */}
          <div className="flex items-center gap-3 mb-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md border-b border-blue-200 mt-6">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-200 rounded-full">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </div>
            <span className="text-xl font-bold text-blue-700 tracking-wide">Riwayat Pelatihan</span>
          </div>
          
          <div className="border border-gray-300 rounded-md bg-gray-50">
            <div className="flex justify-between items-center p-3 bg-gray-100">
              <span className="font-semibold text-blue-600">Jam Pembelajaran</span>
              {loadingPelatihan ? (
                <span className="text-gray-400">Memuat...</span>
              ) : (
                <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-semibold">
                  {pelatihan.length > 0 ? pelatihan.reduce((sum, p) => sum + (p.jam || 0), 0) : 0}
                </span>
              )}
            </div>
            <div className="p-3">
              {loadingPelatihan ? (
                <div className="text-gray-400 text-sm">Memuat data pelatihan...</div>
              ) : pelatihan.length === 0 ? (
                <div className="text-gray-400 text-sm">Belum ada data pelatihan.</div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Judul</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Tanggal</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Jam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pelatihan.map((p) => (
                      <tr key={p.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2">{p.judul}</td>
                        <td className="px-4 py-2">{p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                        <td className="px-4 py-2">{p.jam || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}