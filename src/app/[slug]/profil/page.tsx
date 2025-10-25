"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { User, GraduationCap, IdCard, Award, } from "lucide-react";
import { useParams } from "next/navigation";
import IDPSection from "@/components/IDPsection";
import IdentifikasiBSB from "@/components/identifikasi_bsb";

export default function ProfilPage() {
  const params = useParams() as Record<string, string | undefined>;
  //const slug = params?.slug as string;
  // Inisialisasi id hanya sekali, tidak berubah-ubah urutan hooks
  const [id, setId] = useState<string | undefined>(undefined);

  // Set id setelah komponen mount (client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (params?.id) {
        setId(params.id);
      } else {
        const username = localStorage.getItem('username');
        if (username) setId(username);
      }
    }
  }, [params?.id]);
  
  type PegawaiDetailItem = {
    id?: number;
    pegawai_id?: number;
    nip?: string;
    email?: string;
    unit_kerja?: string | null;
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
    peg_npwp?: string;
    nik?: string;
    tempat_lahir?: string;
  };
  
  type PegawaiDetail = {
    id: number;
    created_at?: string;
    nip: string;
    nama: string;
    unit_kerja_id?: number;
    jabatan?: string;
    golongan?: string;
    eselon?: string;
    users_pegawai_unit_kerja_idTousers?: { unit_kerja?: string };
    pegawai_detail: PegawaiDetailItem[];
    photo_url?: string;
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
    console.log('Fetching employee data for id:', id);
    fetch(`/api/employee/${id}`)
      .then((res) => res.json())
      .then((res) => {
        console.log('Employee data loaded:', res);
        setData(res);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading employee data:', error);
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
    // Get unit_kerja from different possible locations
    const unitKerja = data?.users_pegawai_unit_kerja_idTousers?.unit_kerja || 
                      data?.unit_kerja_id?.toString() ||
                      localStorage.getItem('id'); // fallback to user ID
    
    console.log('Save clicked - Data check:', {
      id,
      unitKerja,
      dataUsersRelation: data?.users_pegawai_unit_kerja_idTousers,
      unitKerjaId: data?.unit_kerja_id,
      pegawaiDetailId: data?.pegawai_detail?.[0]?.id,
      form,
      fullData: data
    });

    if (!id) {
      alert("ID tidak ditemukan");
      return;
    }
    
    if (!unitKerja) {
      alert("Unit kerja tidak ditemukan. Data tidak lengkap!");
      return;
    }
    
    if (!data?.pegawai_detail?.[0]?.id) {
      alert("Data pegawai detail tidak ditemukan");
      return;
    }

    try {
      const finalUnitKerja = unitKerja || localStorage.getItem('id'); // final fallback
      console.log('Sending PUT request to:', `/api/employee/unit/${finalUnitKerja}/detail`);
      
      const requestBody = { 
        id: data.pegawai_detail[0].id, 
        nip: data.nip, 
        detail: form 
      };
      
      console.log('Request body:', requestBody);

      const res = await fetch(`/api/employee/unit/${finalUnitKerja}/detail`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (res.ok) {
        // Refresh data
        const updated = await res.json();
        console.log('Updated data:', updated);
        setData((prev) => prev ? { ...prev, pegawai_detail: [updated] } : prev);
        setEditMode(false);
        alert("Data berhasil disimpan!");
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        alert(`Gagal menyimpan data: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert("Gagal menyimpan data: " + error);
    }
  }


  // Tab state (pindahkan ke atas agar urutan hooks konsisten)
  const [activeTab, setActiveTab] = useState<'profil' | 'pelatihan' | 'bsb' | 'idp'>('profil');

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header dengan Context */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Profil</h1>
        <p className="text-blue-100">Kelola informasi profil, pelatihan, dan IDP Anda</p>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 border-b">
          <button
            className={`px-6 py-2 font-semibold rounded-t-md focus:outline-none transition-colors ${activeTab === 'profil' ? 'bg-white text-blue-700 border-x border-t border-b-0 border-blue-300 shadow' : 'bg-blue-100 text-blue-600 hover:bg-white'}`}
            onClick={() => setActiveTab('profil')}
          >
            Profil
          </button>
          <button
            className={`px-6 py-2 font-semibold rounded-t-md focus:outline-none transition-colors ${activeTab === 'pelatihan' ? 'bg-white text-blue-700 border-x border-t border-b-0 border-blue-300 shadow' : 'bg-blue-100 text-blue-600 hover:bg-white'}`}
            onClick={() => setActiveTab('pelatihan')}
          >
            Histori Pelatihan
          </button>
          <button
            className={`px-6 py-2 font-semibold rounded-t-md focus:outline-none transition-colors ${activeTab === 'bsb' ? 'bg-white text-blue-700 border-x border-t border-b-0 border-blue-300 shadow' : 'bg-blue-100 text-blue-600 hover:bg-white'}`}
            onClick={() => setActiveTab('bsb')}
          >
            Identifikasi BSB
          </button>
          <button
            className={`px-6 py-2 font-semibold rounded-t-md focus:outline-none transition-colors ${activeTab === 'idp' ? 'bg-white text-blue-700 border-x border-t border-b-0 border-blue-300 shadow' : 'bg-blue-100 text-blue-600 hover:bg-white'}`}
            onClick={() => setActiveTab('idp')}
          >
            IDP
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profil' && (
          <>
            <div className="flex items-center justify-end mb-6">
              {!editMode && (
                <button className="bg-yellow-400 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition" onClick={() => setEditMode(true)}>
                  Edit Profil
                </button>
              )}
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Informasi Profil</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {/* Profile Photo and Edit */}
              <div className="w-48 h-48 bg-gradient-to-br from-blue-200/80 to-blue-400/60 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg rounded-full mb-4 mx-auto row-span-2 backdrop-blur-md">
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
              {/* Card 1: Identitas Utama */}
              <div className="min-w-[220px] max-w-sm flex flex-col justify-stretch">
                <div className="bg-gradient-to-br from-blue-50/80 to-white/60 border border-blue-200 rounded-2xl shadow-md p-6 h-full transition-all duration-200 hover:scale-[1.03] hover:shadow-xl group backdrop-blur-md">
                  <h3 className="font-bold text-blue-700 mb-4 text-lg tracking-wide flex items-center gap-2 border-b border-blue-100 pb-2">
                    <User className="w-5 h-5 text-blue-400" /> Identitas Utama
                  </h3>
                  <div className="space-y-3 divide-y divide-blue-50">
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">NIP</span><span className="font-mono text-blue-800">{detail.nip || data.nip || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Nama Lengkap</span><span>{data.nama || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Jabatan</span><span>{data.jabatan || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Unit Kerja</span><span>{data.users_pegawai_unit_kerja_idTousers?.unit_kerja || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Email</span><span>{detail.email || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Status Kepegawaian</span>
                      {detail.status_kepegawaian ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 
                          ${detail.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>{detail.status_kepegawaian}
                        </span>
                      ) : "-"}
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 2: Pendidikan & Pribadi */}
              <div className="min-w-[220px] max-w-sm flex flex-col justify-stretch">
                <div className="bg-gradient-to-br from-orange-50/80 to-white/60 border border-orange-200 rounded-2xl shadow-md p-6 h-full transition-all duration-200 hover:scale-[1.03] hover:shadow-xl group backdrop-blur-md">
                  <h3 className="font-bold text-orange-700 mb-4 text-lg tracking-wide flex items-center gap-2 border-b border-orange-100 pb-2">
                    <GraduationCap className="w-5 h-5 text-orange-400" /> Pendidikan & Pribadi
                  </h3>
                  <div className="space-y-0">
                    <div className="flex justify-between items-center text-gray-700 gap-2 flex-wrap border-b border-orange-100 pb-2 mb-2">
                      <span className="font-medium break-words">Tingkat Pendidikan</span>
                      <span className="break-all">{detail.tingkat_pendidikan || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 gap-2 flex-wrap border-b border-orange-100 pb-2 mb-2">
                      <span className="font-medium break-words">Pendidikan</span>
                      <span className="break-all">{detail.pendidikan || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 gap-2 flex-wrap border-b border-orange-100 pb-2 mb-2">
                      <span className="font-medium break-words">Telp</span>
                      <span className="break-all">{detail.telp || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 gap-2 flex-wrap border-b border-orange-100 pb-2 mb-2">
                      <span className="font-medium break-words">Tanggal Lahir</span>
                      <span className="break-all">{detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID') : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 gap-2 flex-wrap border-b border-orange-100 pb-2 mb-2">
                      <span className="font-medium break-words">Jenis Kelamin</span>
                      <span className="break-all">{detail.jenis_kelamin === 'L' ? 'Laki-laki' : detail.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card 3: Lainnya */}
              <div className="min-w-[220px] max-w-sm flex flex-col justify-stretch">
                <div className="bg-gradient-to-br from-purple-50/80 to-white/60 border border-purple-200 rounded-2xl shadow-md p-6 h-full transition-all duration-200 hover:scale-[1.03] hover:shadow-xl group backdrop-blur-md">
                  <h3 className="font-bold text-purple-700 mb-4 text-lg tracking-wide flex items-center gap-2 border-b border-purple-100 pb-2">
                    <Award className="w-5 h-5 text-purple-400" /> Lainnya
                  </h3>
                  <div className="space-y-3 divide-y divide-purple-50">
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Golongan Darah</span><span>{detail.nm_goldar || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">TMT CPNS</span><span>{detail.peg_cpns_tmt ? new Date(detail.peg_cpns_tmt).toLocaleDateString('id-ID') : "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Agama</span><span>{detail.agama || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Tempat Lahir</span><span>{detail.tempat_lahir || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Golongan</span><span>{data.golongan || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">Eselon</span><span>{data.eselon || "-"}</span></div>
                  </div>
                </div>
              </div>

              {/* Card 4: Identitas Kependudukan */}
              <div className="min-w-[220px] max-w-sm flex flex-col justify-stretch">
                <div className="bg-gradient-to-br from-green-50/80 to-white/60 border border-green-200 rounded-2xl shadow-md p-6 h-full transition-all duration-200 hover:scale-[1.03] hover:shadow-xl group backdrop-blur-md">
                  <h3 className="font-bold text-green-700 mb-4 text-lg tracking-wide flex items-center gap-2 border-b border-green-100 pb-2">
                    <IdCard className="w-5 h-5 text-green-400" /> Identitas Kependudukan
                  </h3>
                  <div className="space-y-3 divide-y divide-green-50">
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">NIK</span><span>{detail.nik || "-"}</span></div>
                    <div className="flex justify-between items-center text-gray-700"><span className="font-medium">NPWP</span><span>{detail.peg_npwp || "-"}</span></div>
                    <div className="flex justify-between items-start text-gray-700">
                      <span className="font-medium mt-1">Alamat</span>
                      <span className="text-right break-words max-w-[180px] whitespace-pre-line">{detail.alamat || "-"}</span>
                    </div>
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
                  {/* ...existing code for edit form... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ...existing code for edit fields... */}
                    <div className="min-w-0">
                      <label className="block text-sm font-medium mb-1 break-words">NIP</label>
                      <input type="text" className="w-full border rounded px-2 py-1 min-w-0" value={form.nip || ""} onChange={e => setForm({ ...form, nip: e.target.value })} />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium mb-1 break-words">Email</label>
                      <input type="email" className="w-full border rounded px-2 py-1 min-w-0" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium mb-1 break-words">Status Kepegawaian</label>
                      <select className="w-full border rounded px-2 py-1 min-w-0" value={form.status_kepegawaian || ""} onChange={e => setForm({ ...form, status_kepegawaian: e.target.value })}>
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
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" 
                      onClick={() => {
                        console.log('Simpan button clicked');
                        handleSave();
                      }}
                    >
                      Simpan
                    </button>
                    <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors" onClick={() => setEditMode(false)}>Batal</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'pelatihan' && (
          <div className="w-full mt-8 p-2 border rounded-md bg-gray-50">
            {/* Histori Belajar */}
            <div className="flex items-center gap-3 mb-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md border-b border-blue-200">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-200 rounded-full">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
              <span className="text-xl font-bold text-blue-700 tracking-wide">Histori Belajar</span>
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
        )}

        {activeTab === 'bsb' && (
          <div className="w-full mt-8">
            <IdentifikasiBSB />
          </div>
        )}
        {activeTab === 'idp' && (
          <div className="w-full mt-8">
            <IDPSection />
          </div>
        )}
      </div>
    </div>
  );
}
