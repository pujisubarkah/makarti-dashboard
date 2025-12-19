'use client'

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Users, 
  // TrendingUp, 
  Calendar, 
  Award,
  BarChart3,
  Activity,
  Zap,
  Star,
  Brain,
  Rocket,
  Trophy,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ManageTeam from "@/components/ManageTeam";
import ActivityTimeline from "@/components/ActivityTimeline";
import ReportView from "@/components/ReportView";
import {
  // XAxis,
  // YAxis,
  // CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'

// Interface untuk data unit kerja dari API
interface UnitKerjaData {
  unit_kerja_id: number;
  nama_unit_kerja: string;
  total_pegawai: number;
  kepala_unit: string | null;
}

// Interface untuk data pegawai
interface Pegawai {
  nama?: string;
  jabatan?: string;
  [key: string]: unknown;
}

// Interface untuk data BIGGER dari API

export interface ScoreData {
  bigger?: {
    branding_engagement_score?: number;
    branding_publikasi_score?: number;
    networking_kerjasama_score?: number;
    networking_koordinasi_score?: number;
    bigger_score?: number;
    bigger_generik_score?: number;
    bigger_total_score?: number;
    branding_score?: number;
    networking_score?: number;
  };
  smarter?: {
    learning_pelatihan_score?: number;
    learning_penyelenggaraan_score?: number;
    inovasi_kinerja_score?: number;
    inovasi_kajian_score?: number;
    smarter_score?: number;
    smarter_generik_score?: number;
    smarter_total_score?: number;
    learning_score?: number;
    inovasi_score?: number;
  };
  better?: {
    better_score?: number;
    better_generik_score?: number;
    better_total_score?: number;
    learning_score?: number;
    inovasi_score?: number;
    branding_score?: number;
    networking_score?: number;
  };
}

function InfoPopupGlobal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Penjelasan Indikator & Formula Makarti</h2>
        
        {/* Dimensi MAKARTI */}
        <div className="overflow-x-auto mb-6">
          <h3 className="text-md font-semibold mb-2 text-gray-700">Dimensi MAKARTI</h3>
          <table className="min-w-full text-xs border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">DIMENSI MAKARTI</th>
                <th className="border px-2 py-1">INDIKATOR & BOBOT</th>
                <th className="border px-2 py-1">FORMULA PENGHITUNGAN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>INOVASI</td>
                <td className="border px-2 py-1">KINERJA INOVASI (50%)</td>
                <td className="border px-2 py-1">Rata-rata kinerja inovasi: Ide (40%), Perencanaan (60%), Uji Coba (80%), Implementasi (100%)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">PRODUK KAJIAN (50%)</td>
                <td className="border px-2 py-1">Rata-rata progres kajian: Draft (40%), Revisi (60%), Review (80%), Selesai (100%)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>LEARNING</td>
                <td className="border px-2 py-1">PELATIHAN PEGAWAI INTERNAL (50%)</td>
                <td className="border px-2 py-1">Persentase pegawai yang telah mengikuti Pengembangan Kompetensi ASN minimal 20 JP</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">PENYELENGGARAAN BANGKOM UNIT (50%)</td>
                <td className="border px-2 py-1">Total peserta dari daftar kehadiran dibagi 5000 x 100%</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>BRANDING</td>
                <td className="border px-2 py-1">ENGAGEMENT (50%)</td>
                <td className="border px-2 py-1">(Jumlah Likes / Jumlah Views) x 100% dibagi 0.06 x 100%</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">JUMLAH PUBLIKASI (50%)</td>
                <td className="border px-2 py-1">Jumlah publikasi unit kerja dibagi 60 x 100%</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={2}>NETWORKING</td>
                <td className="border px-2 py-1">KERJASAMA (80%)</td>
                <td className="border px-2 py-1">Persentase kerjasama dengan status MoU Ditandatangani atau Selesai</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">KOORDINASI (20%)</td>
                <td className="border px-2 py-1">Persentase koordinasi dengan status SELESAI</td>
              </tr>
            </tbody>
          </table>

          {/* Pilar BSB (Bigger, Smarter, Better) */}
          <h3 className="text-md font-semibold mb-2 text-gray-700">Pilar Bigger, Smarter, Better</h3>
          <table className="min-w-full text-xs border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">PILAR BSB</th>
                <th className="border px-2 py-1">JENIS SKOR</th>
                <th className="border px-2 py-1">FORMULA PENGHITUNGAN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={3}>BIGGER</td>
                <td className="border px-2 py-1 font-medium">SKP-T</td>
                <td className="border px-2 py-1">50% Skor Branding SKP-T + 50% Skor Networking SKP-T</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">SKP-G</td>
                <td className="border px-2 py-1">Rata-rata capaian indikator SKP Generik pilar BIGGER (dalam persen)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">Total</td>
                <td className="border px-2 py-1">50% BIGGER SKP-T + 50% BIGGER SKP-G</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={3}>SMARTER</td>
                <td className="border px-2 py-1 font-medium">SKP-T</td>
                <td className="border px-2 py-1">50% Skor Learning SKP-T + 50% Skor Inovasi SKP-T</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">SKP-G</td>
                <td className="border px-2 py-1">Rata-rata capaian indikator SKP Generik pilar SMARTER (dalam persen)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">Total</td>
                <td className="border px-2 py-1">50% SMARTER SKP-T + 50% SMARTER SKP-G</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold align-top" rowSpan={3}>BETTER</td>
                <td className="border px-2 py-1 font-medium">SKP-T</td>
                <td className="border px-2 py-1">25% Branding SKP-T + 25% Networking SKP-T + 25% Learning SKP-T + 25% Inovasi SKP-T</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">SKP-G</td>
                <td className="border px-2 py-1">Rata-rata capaian indikator SKP Generik pilar BETTER (dalam persen)</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-medium">Total</td>
                <td className="border px-2 py-1">50% BETTER SKP-T + 50% BETTER SKP-G</td>
              </tr>
            </tbody>
          </table>

          {/* Penjelasan Kolom Tabel */}
          <h3 className="text-md font-semibold mb-2 text-gray-700">Penjelasan Kolom Tabel</h3>
          <div className="text-xs space-y-2">
            <div><strong>SKP-G:</strong> Skor dari SKP Generik</div>
            <div><strong>SKP-T:</strong> Skor dari SKP Transformasional</div>
            <div><strong>Total:</strong> Gabungan skor SKP-G dan SKP-T dengan bobot 50%-50%</div>
            <div><strong>Serapan Anggaran:</strong> Persentase realisasi anggaran terhadap pagu anggaran unit kerja</div>
          </div>
        </div>
        
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-600 text-sm" onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
}

function InfoButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button type="button" className="ml-2 align-middle" onClick={onClick} aria-label="Info">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="2" fill="#fff" />
        <path d="M10 7.5a1 1 0 110-2 1 1 0 010 2zm-1 2.5a1 1 0 012 0v5a1 1 0 11-2 0v-5z" fill="#2563eb" />
      </svg>
    </button>
  );
}

export default function UnitKerjaDashboard() {
    const [unitData, setUnitData] = useState<UnitKerjaData | null>(null);
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scoreLoading, setScoreLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scoreError, setScoreError] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showManageTeam, setShowManageTeam] = useState(false);
    const [showReportView, setShowReportView] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    // Fetch data unit kerja berdasarkan ID dari localStorage
    useEffect(() => {
        const fetchUnitData = async () => {
            try {
                setLoading(true);
                
                // Ambil unit_kerja_id dan unit_kerja dari localStorage
                const userUnitId = localStorage.getItem("id");
                const unitKerjaName = localStorage.getItem("unit_kerja");
                console.log(`Retrieved unit_kerja_id: ${userUnitId}, unit_kerja: ${unitKerjaName}`);
                
                if (!userUnitId) {
                    throw new Error("Unit kerja ID tidak ditemukan di localStorage. Silakan login ulang.");
                }

                // Validasi ID harus berupa angka
                const unitId = parseInt(userUnitId);
                if (isNaN(unitId)) {
                    throw new Error(`Unit kerja ID tidak valid: "${userUnitId}". Silakan login ulang.`);
                }

                // Fetch data pegawai dari unit kerja untuk mendapatkan statistik
                console.log(`Fetching data for unit_kerja_id: ${unitId}`);
                const response = await fetch(`/api/pegawai?unit_kerja_id=${unitId}`);
                
                console.log(`API Response status: ${response.status}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API Error Response: ${errorText}`);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                
                const pegawaiResponse = await response.json();
                
                // Construct unit kerja data dari response API
                const unitKerjaData: UnitKerjaData = {
                    unit_kerja_id: unitId,
                    nama_unit_kerja: unitKerjaName || 'Unit Kerja',
                    total_pegawai: pegawaiResponse.total_pegawai || 0,
                    kepala_unit: pegawaiResponse.kepala_unit || null
                };
                
                console.log('Unit kerja data constructed:', unitKerjaData);
                
                // Validasi data yang diterima
                if (!unitKerjaData || !unitKerjaData.nama_unit_kerja) {
                    throw new Error("Data unit kerja tidak lengkap.");
                }
                
                setUnitData(unitKerjaData);
                setError(null);
                
            } catch (err) {
                console.error('Error fetching unit data:', err);
                
                // More detailed error handling
                let errorMessage = 'Terjadi kesalahan saat memuat data';
                
                if (err instanceof TypeError && err.message.includes('fetch')) {
                    errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                
                setError(errorMessage);
                
                // Fallback data jika gagal fetch - ambil dari localStorage jika ada
                const fallbackName = localStorage.getItem("unit_kerja") || "Unit Kerja Tidak Tersedia";
                const fallbackId = parseInt(localStorage.getItem("unit_kerja_id") || "0");
                
                setUnitData({
                    unit_kerja_id: fallbackId,
                    nama_unit_kerja: fallbackName,
                    total_pegawai: 0,
                    kepala_unit: "Tidak tersedia"
                });
            } finally {
                setLoading(false);
            }
        };

        // Cek apakah kode berjalan di browser (client-side)
        if (typeof window !== 'undefined') {
            fetchUnitData();
        }
    }, []);

    // Fetch scores (BIGGER, SMARTER, BETTER) berdasarkan unit_kerja_id
    useEffect(() => {
        const fetchScoreData = async () => {
            try {
                setScoreLoading(true);
                setScoreError(null);
                const userUnitId = localStorage.getItem("id");
                if (!userUnitId) {
                    throw new Error("Unit kerja ID tidak ditemukan di localStorage.");
                }
                const unitId = parseInt(userUnitId);
                if (isNaN(unitId)) {
                    throw new Error("Unit kerja ID tidak valid.");
                }
                console.log(`Fetching scores for unit_kerja_id: ${unitId}`);
                const response = await fetch(`/api/scores/${unitId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const scoreResponse = await response.json();
                console.log('Score data received:', scoreResponse);
                setScoreData(scoreResponse);
            } catch (err) {
                console.error('Error fetching scores:', err);
                setScoreError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data skor');
                setScoreData(null);
            } finally {
                setScoreLoading(false);
            }
        };
        if (typeof window !== 'undefined' && unitData && !loading) {
            fetchScoreData();
        }
    }, [unitData, loading]);

    // Untuk menutup popup info jika klik di luar
      useEffect(() => {
        function handleClick() {
          setInfoOpen(false);
        }
        if (infoOpen) {
          window.addEventListener("click", handleClick);
          return () => window.removeEventListener("click", handleClick);
        }
      }, [infoOpen]);

    // Loading state
    if (loading) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <span className="text-lg text-gray-500">Memuat data unit kerja...</span>
                </div>
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </main>
        );
    }

    // Dynamic summary cards berdasarkan data API
    const summaryCards = [
        {
            title: "Nama Unit Kerja",
            value: unitData?.nama_unit_kerja || "Unit Tidak Diketahui",
            icon: <Building2 className="w-6 h-6" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-100',
            textColor: 'text-blue-600',
            textDark: 'text-blue-800',
            borderColor: 'border-blue-500',
            description: `Unit kerja dengan ID: ${unitData?.unit_kerja_id || 0}`
        },
        {
            title: "Kepala Unit",
            value: unitData?.kepala_unit || "Belum tersedia",
            icon: <User className="w-6 h-6" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-100',
            textColor: 'text-green-600',
            textDark: 'text-green-800',
            borderColor: 'border-green-500',
            description: "Pimpinan unit kerja"
        },
        {
            title: "Total Pegawai",
            value: `${unitData?.total_pegawai || 0} orang`,
            icon: <Users className="w-6 h-6" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-100',
            textColor: 'text-purple-600',
            textDark: 'text-purple-800',
            borderColor: 'border-purple-500',
            description: "Sumber daya manusia"
        },
    ];

    // Helper function untuk mengambil skor dari scoreData
    const getScore = (type: 'bigger' | 'smarter' | 'better', scoreType: 'total' | 'generic' | 'transform') => {
        if (!scoreData || !scoreData[type]) return 0;
        
        if (type === 'bigger') {
            if (scoreType === 'total') return scoreData.bigger?.bigger_total_score ?? 0;
            if (scoreType === 'generic') return scoreData.bigger?.bigger_generik_score ?? 0;
            if (scoreType === 'transform') return scoreData.bigger?.bigger_score ?? 0;
        }
        if (type === 'smarter') {
            if (scoreType === 'total') return scoreData.smarter?.smarter_total_score ?? 0;
            if (scoreType === 'generic') return scoreData.smarter?.smarter_generik_score ?? 0;
            if (scoreType === 'transform') return scoreData.smarter?.smarter_score ?? 0;
        }
        if (type === 'better') {
            if (scoreType === 'total') return scoreData.better?.better_total_score ?? 0;
            if (scoreType === 'generic') return scoreData.better?.better_generik_score ?? 0;
            if (scoreType === 'transform') return scoreData.better?.better_score ?? 0;
        }
        return 0;
    };

    // Progress data dengan skor dari API
    const biggerBetterSmarterProgress = [
        {
            name: 'BIGGER',
            value: scoreLoading ? 0 : getScore('bigger', 'total'),
            fill: '#3b82f6',
            description: 'Dampak & Jangkauan'
        },
        {
            name: 'SMARTER',
            value: scoreLoading ? 0 : getScore('smarter', 'total'),
            fill: '#8b5cf6',
            description: 'Teknologi & Inovasi'
        },
        {
            name: 'BETTER',
            value: scoreLoading ? 0 : getScore('better', 'total'),
            fill: '#10b981',
            description: 'Kualitas & Efisiensi'
        },
    ];

    // Bigger Smarter Better Cards - fetch from scoreData
    const biggerBetterSmarterCards = [
        {
            title: "BIGGER",
            subtitle: "Dampak & Jangkauan",
            metrics: [
                {
                    label: "Branding Engagement",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.branding_engagement_score ? `${scoreData.bigger.branding_engagement_score}%` : "Tidak ada data"
                },
                {
                    label: "Branding Publikasi",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.branding_publikasi_score ? `${scoreData.bigger.branding_publikasi_score}%` : "Tidak ada data"
                },
                {
                    label: "Networking Kerjasama",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.networking_kerjasama_score ? `${scoreData.bigger.networking_kerjasama_score}%` : "Tidak ada data"
                },
                {
                    label: "Networking Koordinasi",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.networking_koordinasi_score ? `${scoreData.bigger.networking_koordinasi_score}%` : "Tidak ada data"
                }
            ],
            icon: <Rocket className="w-8 h-8" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-500',
            overallScore: scoreLoading ? 0 : getScore('bigger', 'total'),
            genericScore: scoreLoading ? 0 : getScore('bigger', 'generic'),
            transformScore: scoreLoading ? 0 : getScore('bigger', 'transform'),
            isLoading: scoreLoading,
            error: scoreError
        },
        {
            title: "SMARTER",
            subtitle: "Teknologi & Inovasi",
            metrics: [
                {
                    label: "Learning Pelatihan",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.learning_pelatihan_score ? `${scoreData.smarter.learning_pelatihan_score}%` : "Tidak ada data"
                },
                {
                    label: "Learning Penyelenggaraan",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.learning_penyelenggaraan_score ? `${scoreData.smarter.learning_penyelenggaraan_score}%` : "Tidak ada data"
                },
                {
                    label: "Inovasi Kinerja",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.inovasi_kinerja_score ? `${scoreData.smarter.inovasi_kinerja_score}%` : "Tidak ada data"
                },
                {
                    label: "Inovasi Kajian",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.inovasi_kajian_score ? `${scoreData.smarter.inovasi_kajian_score}%` : "Tidak ada data"
                }
            ],
            icon: <Brain className="w-8 h-8" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-500',
            overallScore: scoreLoading ? 0 : getScore('smarter', 'total'),
            genericScore: scoreLoading ? 0 : getScore('smarter', 'generic'),
            transformScore: scoreLoading ? 0 : getScore('smarter', 'transform'),
            isLoading: scoreLoading,
            error: scoreError
        },
        {
            title: "BETTER",
            subtitle: "Kualitas & Efisiensi",
            description: "Skor Better merupakan keseluruhan dari SKP Transformasional yaitu Inovasi, Branding, Networking dan Learning.",
            metrics: [
                {
                    label: "Skor Better",
                    value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.better?.better_score ? `${scoreData.better.better_score}%` : "Tidak ada data"
                }
            ],
            icon: <Star className="w-8 h-8" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600',
            borderColor: 'border-green-500',
            overallScore: scoreLoading ? 0 : getScore('better', 'total'),
            genericScore: scoreLoading ? 0 : getScore('better', 'generic'),
            transformScore: scoreLoading ? 0 : getScore('better', 'transform'),
            isLoading: scoreLoading,
            error: scoreError
        },
    ];    // Performance cards dengan skor real dari API
    const performanceCards = [
        {
            title: "Networking",
            value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.networking_score ? `${scoreData.bigger.networking_score}%` : "Tidak ada data",
            icon: <Users className="w-6 h-6" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-100',
            textColor: 'text-blue-600',
            textDark: 'text-blue-800',
            borderColor: 'border-blue-500',
            progress: scoreLoading ? 0 : scoreData?.bigger?.networking_score || 0,
            loading: scoreLoading,
            error: scoreError
        },
        {
            title: "Branding",
            value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.bigger?.branding_score ? `${scoreData.bigger.branding_score}%` : "Tidak ada data",
            icon: <Award className="w-6 h-6" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-100',
            textColor: 'text-green-600',
            textDark: 'text-green-800',
            borderColor: 'border-green-500',
            progress: scoreLoading ? 0 : scoreData?.bigger?.branding_score || 0,
            loading: scoreLoading,
            error: scoreError
        },
        {
            title: "Learning",
            value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.learning_score ? `${scoreData.smarter.learning_score}%` : "Tidak ada data",
            icon: <Brain className="w-6 h-6" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-100',
            textColor: 'text-purple-600',
            textDark: 'text-purple-800',
            borderColor: 'border-purple-500',
            progress: scoreLoading ? 0 : scoreData?.smarter?.learning_score || 0,
            loading: scoreLoading,
            error: scoreError
        },
        {
            title: "Inovasi",
            value: scoreLoading ? "Loading..." : scoreError ? "Error" : scoreData?.smarter?.inovasi_score ? `${scoreData.smarter.inovasi_score}%` : "Tidak ada data",
            icon: <Lightbulb className="w-6 h-6" />,
            color: 'orange',
            bgGradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-100',
            textColor: 'text-orange-600',
            textDark: 'text-orange-800',
            borderColor: 'border-orange-500',
            progress: scoreLoading ? 0 : scoreData?.smarter?.inovasi_score || 0,
            loading: scoreLoading,
            error: scoreError
        },
    ];

    // Show calendar view
    if (showCalendar) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                {/* Header with back button */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => setShowCalendar(false)}
                        className="bg-blue-100 hover:bg-blue-200 p-3 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-blue-600" />
                    </button>
                    <div className="bg-green-100 p-3 rounded-full">
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-green-800">Jadwal Kegiatan</h1>
                        <p className="text-green-600">
                            Kelola dan lihat jadwal kegiatan {unitData?.nama_unit_kerja}
                        </p>
                    </div>
                </div>

                {/* Calendar Component */}
                <ScheduleCalendar />
            </main>
        );
    }

    // Show manage team view
    if (showManageTeam) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                {/* Header with back button */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => setShowManageTeam(false)}
                        className="bg-blue-100 hover:bg-blue-200 p-3 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-blue-600" />
                    </button>
                    <div className="bg-purple-100 p-3 rounded-full">
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-purple-800">Kelola Tim</h1>
                        <p className="text-purple-600">
                            Kelola anggota tim dan struktur organisasi {unitData?.nama_unit_kerja}
                        </p>
                    </div>
                </div>

                {/* ManageTeam Component */}
                <ManageTeam />
            </main>
        );
    }

    // Show report view
    if (showReportView) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                {/* Header with back button */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={() => setShowReportView(false)}
                        className="bg-blue-100 hover:bg-blue-200 p-3 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-blue-600" />
                    </button>
                    <div className="bg-orange-100 p-3 rounded-full">
                        <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-orange-800">Lihat Laporan</h1>
                        <p className="text-orange-600">
                            Analisis kinerja dan laporan {unitData?.nama_unit_kerja}
                        </p>
                    </div>
                </div>

                {/* ReportView Component */}
                <ReportView />
            </main>
        );
    }

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="bg-blue-100 p-3 rounded-full">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-blue-800">Dashboard Unit Kerja
                    <InfoButton onClick={(e) => { e.stopPropagation(); setInfoOpen(true); }} />
                        </h1>
                    <p className="text-blue-600">
                        Monitor dan kelola aktivitas {unitData?.nama_unit_kerja}
                    </p>
                </div>
            </div>
            <InfoPopupGlobal show={infoOpen} onClose={() => setInfoOpen(false)} />

            {/* Enhanced Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaryCards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                                        {card.title}
                                    </p>
                                    <p className={`text-lg font-bold ${card.textColor} break-words`}>
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                    <div className={card.textColor}>
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">{card.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Bigger Smarter Better Section */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Bigger Smarter Better</h2>
                        <p className="text-gray-600">Transformasi menuju pelayanan yang lebih besar, cerdas, dan baik</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {biggerBetterSmarterCards.map((card, idx) => (
                        <div
                            key={idx}
                            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${card.textColor}`}>
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{card.subtitle}</p>
                                        {card.description && (
                                            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                                        )}
                                        {/* Show data status for BIGGER card */}
                                        {card.title === 'BIGGER' && (
                                            <div className="mt-1">
                                                {card.isLoading && (
                                                    <span className="text-xs text-blue-500 flex items-center">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                                                        Loading data...
                                                    </span>
                                                )}
                                                {card.error && (
                                                    <span className="text-xs text-red-500">
                                                        ⚠️ {card.error}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                        <div className={card.textColor}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Score */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Overall Score</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-2xl font-bold ${card.textColor}`}>
                                                {card.isLoading ? '...' : `${card.overallScore}%`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`bg-gradient-to-r ${card.bgGradient} h-3 rounded-full transition-all duration-500 ${
                                                card.isLoading ? 'animate-pulse' : ''
                                            }`}
                                            style={{ width: `${card.isLoading ? 20 : card.overallScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Generic Score */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Generic Score</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xl font-bold ${card.textColor}`}>
                                                {card.isLoading ? '...' : `${card.genericScore}%`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500 ${
                                                card.isLoading ? 'animate-pulse' : ''
                                            }`}
                                            style={{ width: `${card.isLoading ? 20 : card.genericScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Transform Score */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Transform Score</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xl font-bold ${card.textColor}`}>
                                                {card.isLoading ? '...' : `${card.transformScore}%`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500 ${
                                                card.isLoading ? 'animate-pulse' : ''
                                            }`}
                                            style={{ width: `${card.isLoading ? 20 : card.transformScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-3">
                                    {card.metrics.map((metric, metricIdx) => (
                                        <div key={metricIdx} className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">{metric.label}</span>
                                            <span className={`text-sm font-semibold ${card.textColor} ${
                                                card.isLoading ? 'animate-pulse' : ''
                                            }`}>
                                                {metric.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>            {/* Performance Cards */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Skor Transformasi</h2>
                        <p className="text-gray-600">Pencapaian skor untuk masing-masing pilar transformasi</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceCards.map((card, idx) => (
                        <div
                            key={idx}
                            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                                            {card.title}
                                        </p>
                                        <p className={`text-2xl font-bold ${card.textColor} mb-2`}>
                                            {card.loading ? (
                                                <span className="animate-pulse text-gray-400">Loading...</span>
                                            ) : card.error ? (
                                                <span className="text-red-500 text-sm">Error</span>
                                            ) : (
                                                card.value
                                            )}
                                        </p>
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-500">Skor Transformasi</span>
                                        </div>
                                    </div>
                                    <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                        <div className={card.textColor}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                                            style={{ width: `${Math.min(card.progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                                        <span>Progress</span>
                                        <span className={`font-medium ${card.textColor}`}>
                                            {card.loading ? "0" : card.progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>{/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radial Progress Chart */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-green-500" />
                        Progress Overview
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={biggerBetterSmarterProgress}>
                                <RadialBar dataKey="value" cornerRadius={10}>
                                    {biggerBetterSmarterProgress.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </RadialBar>
                                <Legend iconSize={12} wrapperStyle={{ fontSize: '12px' }} />
                                <Tooltip 
                                    formatter={(value, name) => [`${value}%`, name]}
                                    contentStyle={{ 
                                        backgroundColor: '#f8fafc', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Activity Timeline */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl shadow-lg overflow-hidden">
                        <ActivityTimeline />
                    </div>
                </div>
            </div>

            {/* Recent Activities with BBS Focus */}
            <section className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-purple-500" />
                    Pencapaian Bigger Smarter Better Terbaru
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="bg-blue-500 rounded-full p-2">
                            <Rocket className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-blue-800">BIGGER: Ekspansi Layanan</h3>
                            <p className="text-sm text-blue-600">Memperluas jangkauan layanan ke 15 unit kerja baru</p>
                            <p className="text-xs text-blue-500 mt-1">Target: 2.500 penerima manfaat • 2 hari yang lalu</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <div className="bg-purple-500 rounded-full p-2">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-purple-800">SMARTER: Transformasi Digital</h3>
                            <p className="text-sm text-purple-600">Implementasi AI mencapai 35% dengan digitalisasi 82%</p>
                            <p className="text-xs text-purple-500 mt-1">Otomatisasi proses 65% • 1 minggu yang lalu</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="bg-green-500 rounded-full p-2">
                            <Star className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-green-800">BETTER: Peningkatan Kualitas</h3>
                            <p className="text-sm text-green-600">Kepuasan pengguna meningkat 88% dengan efisiensi proses 78%</p>
                            <p className="text-xs text-green-500 mt-1">Pengurangan waktu proses 45% • 5 hari yang lalu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Aksi Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                        <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-800">Tambah Inovasi</p>
                    </button>
                    <button 
                        onClick={() => setShowCalendar(true)}
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                    >
                        <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-800">Jadwal Kegiatan</p>
                    </button>
                    <button 
                        onClick={() => setShowManageTeam(true)}
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                    >
                        <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-purple-800">Kelola Tim</p>
                    </button>
                    <button 
                        onClick={() => setShowReportView(true)}
                        className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                    >
                        <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-800">Lihat Laporan</p>
                    </button>
                </div>
            </section>
        </main>
    );
}
