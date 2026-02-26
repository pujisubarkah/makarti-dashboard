"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileHero from "@/components/ProfileHeroes";
import { CareerInsight } from "@/components/CareerInsight";

export default function ProfilPage() {
  const params = useParams() as Record<string, string | undefined>;
  const [id, setId] = useState<string | undefined>(undefined);

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
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetch(`/api/employee/${id}`)
      .then((res) => res.json())
      .then((res) => {
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

    setLoadingAI(true);
    fetch(`/api/idp/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res && res.ai_suggestions) {
          setAiSuggestions(res);
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

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Grid Profile & Career Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Profile Hero */}
        <div className="lg:col-span-1">
          <ProfileHero data={data} detail={detail} />
        </div>

        {/* RIGHT - Career Insight */}
        <div className="lg:col-span-2">
          <CareerInsight
            aiSuggestions={aiSuggestions}
            loading={loadingAI}
          />
        </div>
      </div>

      {/* Histori Pelatihan */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Histori Pelatihan
          </h2>
        </div>
        
        <div className="p-6">
          {loadingPelatihan ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat data pelatihan...</span>
            </div>
          ) : pelatihan.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Belum ada data pelatihan</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between bg-blue-50 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-700">Total Jam Pembelajaran</span>
                <span className="text-2xl font-bold text-blue-600">
                  {pelatihan.reduce((sum, p) => sum + (p.jam || 0), 0)} Jam
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50">Judul Pelatihan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50">Jam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pelatihan.map((p, index) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{p.judul}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {p.jam || 0} Jam
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
