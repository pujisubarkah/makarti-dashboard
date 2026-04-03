
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import ProfileHero from "@/components/ProfileHeroes";
import { CareerInsight } from "@/components/CareerInsight";
import TrainingHistory from "@/components/TrainingHistory";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { usePelatihanData } from "@/hooks/usePelatihanData";
import { useAISuggestions } from "@/hooks/useAISuggestions";

export default function ProfilPage() {
  const params = useParams() as Record<string, string | undefined>;
  const [id, setId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (params?.slug) {
        setId(params.slug);
      } else {
        const username = localStorage.getItem('username');
        if (username) setId(username);
      }
    }
  }, [params?.slug]);

  const { data, loading, error } = useEmployeeData(id);
  const { pelatihan, loading: loadingPelatihan } = usePelatihanData(id);
  const { aiSuggestions, loading: loadingAI } = useAISuggestions(id);

  const detail = useMemo(() => {
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
          <TrainingHistory pelatihan={pelatihan} loading={loadingPelatihan} />
        </div>
      </div>
    </div>
  );
}
