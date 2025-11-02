"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

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

  interface AiGoal {
    kompetensi: string;
    target: string;
    alasan: string;
    indikator: string;
  }

  interface AiActivity {
    judul: string;
    jenis: string;
    penyelenggara: string;
  }

  interface AiSuggestions {
    ai_suggestions: {
      goals: AiGoal[];
      activities: AiActivity[];
    };
  }
  
  const [data, setData] = useState<PegawaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loadingPelatihan, setLoadingPelatihan] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<PegawaiDetailItem>({});
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

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

    // Fetch AI suggestions from IDP data using username
    setLoadingAI(true);
    console.log('Fetching AI suggestions for username:', id);
    fetch(`/api/idp/${id}`)
      .then((res) => {
        console.log('AI suggestions response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        console.log('AI suggestions data:', res);
        if (res && res.ai_suggestions) {
          setAiSuggestions(res);
          console.log('AI suggestions loaded successfully');
        } else {
          console.log('No AI suggestions found in response');
        }
        setLoadingAI(false);
      })
      .catch((error) => {
        console.error('Error fetching AI suggestions:', error);
        setLoadingAI(false);
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
  const [showAiGoals, setShowAiGoals] = useState(false);
  const [showAiActivities, setShowAiActivities] = useState(false);

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
            {/* Profile Header with Photo */}
            <div className="w-full max-w-4xl mx-auto p-4 border rounded-md bg-gray-50 mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Informasi Profil</h2>
              <div className="flex items-start space-x-6">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 rounded-full relative group">
                  <label htmlFor="edit-photo" className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-full">
                    <span className="flex flex-col items-center">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="2" d="M4 7h2l2-3h4l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"/><circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2"/></svg>
                      <span className="text-white text-xs mt-1">Edit</span>
                    </span>
                  </label>
                  <Image
                    alt="Profile"
                    src={detail.photo_url || "/avatar.png"}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
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
                <div className="flex-1">
                  <div className="border border-gray-300 rounded-md divide-y divide-gray-300">
                    <div className="flex justify-between p-3 bg-gray-100">
                      <div className="font-semibold">NIP</div>
                      <div className="font-mono text-sm">{detail.nip || data.nip || "-"}</div>
                    </div>
                    <div className="flex justify-between p-3">
                      <div className="font-semibold">Nama Lengkap</div>
                      <div className="text-right break-words max-w-xs">{data.nama || "-"}</div>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100">
                      <div className="font-semibold">Jabatan</div>
                      <div className="text-right break-words max-w-xs">{data.jabatan || "-"}</div>
                    </div>
                    <div className="flex justify-between p-3">
                      <div className="font-semibold">Unit Kerja</div>
                      <div className="text-right break-words max-w-xs">{data.users_pegawai_unit_kerja_idTousers?.unit_kerja || "-"}</div>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100">
                      <div className="font-semibold">Email</div>
                      <div className="text-right break-all text-sm max-w-xs">{detail.email || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Pribadi Table */}
            <div id="data-pribadi" className="w-full p-2 border rounded-md bg-gray-50 mb-6">
              <h3 className="text-xl font-bold text-blue-600 mb-4 px-2">Data Pribadi</h3>
              <table className="w-full border-collapse border">
                <tbody>
                  <tr className="bg-teal-50">
                    <td className="px-4 py-2 font-semibold w-1/6">Tempat, Tanggal Lahir</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.tempat_lahir || "-"}, {detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Jenis Kelamin</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.jenis_kelamin === 'L' ? 'Laki-laki' : detail.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Agama</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.agama || "-"}</div>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-semibold w-1/6">Status Pegawai</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.status_kepegawaian || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">TMT CPNS</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.peg_cpns_tmt ? new Date(detail.peg_cpns_tmt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Golongan</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{data.golongan || "-"}</div>
                    </td>
                  </tr>
                  <tr className="bg-teal-50">
                    <td className="px-4 py-2 font-semibold w-1/6">Tingkat Pendidikan</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.tingkat_pendidikan || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Pendidikan</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.pendidikan || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Eselon</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{data.eselon || "-"}</div>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-semibold w-1/6">NIK</td>
                    <td className="px-4 py-2 w-2/6">
                      <div className="font-mono text-sm">{detail.nik || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">NPWP</td>
                    <td className="px-4 py-2 w-2/6">
                      <div className="font-mono text-sm">{detail.peg_npwp || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Golongan Darah</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.nm_goldar || "-"}</div>
                    </td>
                  </tr>
                  <tr className="bg-teal-50">
                    <td className="px-4 py-2 font-semibold w-1/6">Alamat Rumah</td>
                    <td className="px-4 py-2 w-2/6" colSpan={3}>
                      <div className="break-words">{detail.alamat || "-"}</div>
                    </td>
                    <td className="px-4 py-2 font-semibold w-1/6">Telp</td>
                    <td className="px-4 py-2 w-2/6">
                      <div>{detail.telp || "-"}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI Suggestions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Goals */}
              <div className="bg-gradient-to-br from-emerald-50/90 to-white/70 border border-emerald-200 rounded-lg shadow-md p-6">
                <h3 className="font-bold text-emerald-700 mb-4 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Goals Recommendations
                </h3>
                {loadingAI ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-gray-600">Memuat...</span>
                  </div>
                ) : !aiSuggestions?.ai_suggestions?.goals ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada AI goals tersedia</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-emerald-100 rounded-lg p-3 mb-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{aiSuggestions.ai_suggestions.goals.length}</div>
                      <div className="text-sm text-emerald-700">Goals yang disarankan AI</div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {aiSuggestions.ai_suggestions.goals.slice(0, 2).map((goal: AiGoal, index: number) => (
                        <div key={index} className="bg-emerald-50 p-3 rounded border border-emerald-100">
                          <div className="font-medium text-emerald-800 text-sm">{goal.kompetensi}</div>
                          <div className="text-gray-600 text-xs truncate">{goal.target}</div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowAiGoals(true)}
                      className="w-full mt-3 bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors text-sm"
                    >
                      Lihat Semua Goals
                    </button>
                  </>
                )}
              </div>

              {/* AI Activities */}
              <div className="bg-gradient-to-br from-teal-50/90 to-white/70 border border-teal-200 rounded-lg shadow-md p-6">
                <h3 className="font-bold text-teal-700 mb-4 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  AI Activities Recommendations
                </h3>
                {loadingAI ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-gray-600">Memuat...</span>
                  </div>
                ) : !aiSuggestions?.ai_suggestions?.activities ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada AI activities tersedia</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-teal-100 rounded-lg p-3 mb-4 text-center">
                      <div className="text-2xl font-bold text-teal-600">{aiSuggestions.ai_suggestions.activities.length}</div>
                      <div className="text-sm text-teal-700">Aktivitas yang disarankan AI</div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {aiSuggestions.ai_suggestions.activities.slice(0, 2).map((activity: AiActivity, index: number) => (
                        <div key={index} className="bg-teal-50 p-3 rounded border border-teal-100">
                          <div className="font-medium text-teal-800 text-sm">{activity.judul}</div>
                          <div className="text-gray-600 text-xs">
                            <span className="inline-block bg-teal-200 text-teal-800 px-1 py-0.5 rounded text-xs">
                              {activity.jenis}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowAiActivities(true)}
                      className="w-full mt-3 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors text-sm"
                    >
                      Lihat Semua Activities
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* AI Goals Modal */}
            {showAiGoals && aiSuggestions?.ai_suggestions?.goals && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative max-h-[80vh] overflow-auto">
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setShowAiGoals(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Goals Suggestions
                  </h3>
                  <div className="grid gap-4">
                    {aiSuggestions.ai_suggestions.goals.map((goal: AiGoal, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-emerald-800">{goal.kompetensi}</div>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">AI Goal</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>Target:</strong> {goal.target}</p>
                        <p className="text-sm text-gray-700 mb-2"><strong>Indikator:</strong> {goal.indikator}</p>
                        <p className="text-sm text-gray-600"><strong>Alasan:</strong> {goal.alasan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Activities Modal */}
            {showAiActivities && aiSuggestions?.ai_suggestions?.activities && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative max-h-[80vh] overflow-auto">
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setShowAiActivities(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-teal-700 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    AI Activities Suggestions
                  </h3>
                  <div className="grid gap-4">
                    {aiSuggestions.ai_suggestions.activities.map((activity: AiActivity, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-teal-800">{activity.judul}</div>
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">AI Activity</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1"><strong>Jenis:</strong> {activity.jenis}</p>
                        <p className="text-sm text-gray-600"><strong>Penyelenggara:</strong> {activity.penyelenggara}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
