'use client'

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Users, 
  TrendingUp, 
  Calendar, 
  Award,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Star,
  Brain,
  Rocket,
  Trophy,
  Lightbulb
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LineChart,
  Line,
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

const activityData = [
  { bulan: 'Jan', bigger: 75, better: 80, smarter: 60 },
  { bulan: 'Feb', bigger: 78, better: 85, smarter: 65 },
  { bulan: 'Mar', bigger: 82, better: 88, smarter: 70 },
  { bulan: 'Apr', bigger: 85, better: 92, smarter: 75 },
]

const biggerBetterSmarterProgress = [
    { 
        name: 'BIGGER', 
        value: 85, 
        fill: '#3b82f6',
        description: 'Dampak & Jangkauan'
    },
    { 
        name: 'BETTER', 
        value: 92, 
        fill: '#10b981',
        description: 'Kualitas & Efisiensi'
    },
    { 
        name: 'SMARTER', 
        value: 75, 
        fill: '#8b5cf6',
        description: 'Teknologi & Inovasi'
    },
];

export default function UnitKerjaDashboard() {
    const [unitData, setUnitData] = useState<UnitKerjaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data unit kerja berdasarkan ID dari localStorage
    useEffect(() => {
        const fetchUnitData = async () => {
            try {
                setLoading(true);
                
                // Ambil unit_kerja_id dari localStorage
                const userUnitId = localStorage.getItem("id");
                
                if (!userUnitId) {
                    throw new Error("Unit kerja ID tidak ditemukan di localStorage. Silakan login ulang.");
                }

                // Validasi ID harus berupa angka
                const unitId = parseInt(userUnitId);
                if (isNaN(unitId)) {
                    throw new Error("Unit kerja ID tidak valid. Silakan login ulang.");
                }

                // Fetch data dari API dengan ID spesifik
                const response = await fetch(`/api/pegawai/${unitId}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Unit kerja tidak ditemukan atau tidak memenuhi syarat.");
                    } else if (response.status === 204) {
                        throw new Error("Unit kerja tidak memenuhi syarat (jumlah pegawai terlalu sedikit).");
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }
                
                const unitKerjaData: UnitKerjaData = await response.json();
                
                // Validasi data yang diterima
                if (!unitKerjaData || !unitKerjaData.nama_unit_kerja) {
                    throw new Error("Data unit kerja tidak lengkap.");
                }
                
                setUnitData(unitKerjaData);
                setError(null);
                
            } catch (err) {
                console.error('Error fetching unit data:', err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
                
                // Fallback data jika gagal fetch
                setUnitData({
                    unit_kerja_id: 0,
                    nama_unit_kerja: "Unit Kerja Tidak Tersedia",
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

    // Loading state
    if (loading) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data unit kerja...</p>
                        <p className="text-sm text-gray-500 mt-2">Mengambil informasi dari database...</p>
                    </div>
                </div>
            </main>
        );
    }

    // Error state
    if (error) {
        return (
            <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="flex items-center mb-4">
                        <div className="text-red-600 mr-3 text-2xl">⚠️</div>
                        <div>
                            <h3 className="text-red-800 font-medium text-lg">Gagal Memuat Data</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
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

    // Bigger Better Smarter Cards
    const biggerBetterSmarterCards = [
        {
            title: "BIGGER",
            subtitle: "Dampak & Jangkauan",
            metrics: [
                { label: "Dampak Luas", value: "85%" },
                { label: "Kolaborasi Eksternal", value: "12" },
                { label: "Penerima Manfaat", value: "2,500 orang" },
                { label: "Jangkauan Wilayah", value: "15 unit" }
            ],
            icon: <Rocket className="w-8 h-8" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-500',
            overallScore: 85
        },
        {
            title: "BETTER",
            subtitle: "Kualitas & Efisiensi",
            metrics: [
                { label: "Efisiensi Proses", value: "+78%" },
                { label: "Kualitas Layanan", value: "92/100" },
                { label: "Kepuasan Pengguna", value: "88%" },
                { label: "Pengurangan Waktu", value: "45%" }
            ],
            icon: <Star className="w-8 h-8" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600',
            borderColor: 'border-green-500',
            overallScore: 92
        },
        {
            title: "SMARTER",
            subtitle: "Teknologi & Inovasi",
            metrics: [
                { label: "Otomatisasi", value: "65%" },
                { label: "Digitalisasi", value: "82%" },
                { label: "Data Analytics", value: "70%" },
                { label: "AI Implementation", value: "35%" }
            ],
            icon: <Brain className="w-8 h-8" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-500',
            overallScore: 75
        },
    ];

    const performanceCards = [
        {
            title: "Target Bulanan",
            value: 20,
            icon: <Target className="w-6 h-6" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-100',
            textColor: 'text-blue-600',
            textDark: 'text-blue-800',
            borderColor: 'border-blue-500',
            progress: 75,
            change: '+15%'
        },
        {
            title: "Kegiatan Selesai",
            value: 8,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-100',
            textColor: 'text-green-600',
            textDark: 'text-green-800',
            borderColor: 'border-green-500',
            progress: 73,
            change: '+8%'
        },
        {
            title: "Sedang Berlangsung",
            value: 3,
            icon: <Clock className="w-6 h-6" />,
            color: 'yellow',
            bgGradient: 'from-yellow-500 to-yellow-600',
            bgLight: 'bg-yellow-100',
            textColor: 'text-yellow-600',
            textDark: 'text-yellow-800',
            borderColor: 'border-yellow-500',
            progress: 65,
            change: '+3%'
        },
        {
            title: "Pencapaian Target",
            value: "75%",
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-100',
            textColor: 'text-purple-600',
            textDark: 'text-purple-800',
            borderColor: 'border-purple-500',
            progress: 75,
            change: '+12%'
        },
    ];

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="bg-blue-100 p-3 rounded-full">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-blue-800">Dashboard Unit Kerja</h1>
                    <p className="text-blue-600">
                        Monitor dan kelola aktivitas {unitData?.nama_unit_kerja}
                    </p>
                </div>
            </div>

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

            {/* Bigger Better Smarter Section */}
            <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Bigger Better Smarter</h2>
                        <p className="text-gray-600">Transformasi menuju pelayanan yang lebih besar, baik, dan cerdas</p>
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
                                    </div>
                                    <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                                        <div className={card.textColor}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Score */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Overall Score</span>
                                        <span className={`text-2xl font-bold ${card.textColor}`}>
                                            {card.overallScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`bg-gradient-to-r ${card.bgGradient} h-3 rounded-full transition-all duration-500`}
                                            style={{ width: `${card.overallScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-3">
                                    {card.metrics.map((metric, metricIdx) => (
                                        <div key={metricIdx} className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">{metric.label}</span>
                                            <span className={`text-sm font-semibold ${card.textColor}`}>
                                                {metric.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Performance Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    <p className={`text-3xl font-bold ${card.textColor} mb-2`}>
                                        {card.value}
                                    </p>
                                    <div className="flex items-center">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-sm font-medium text-green-600">
                                            {card.change}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">vs bulan lalu</span>
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
                                        {card.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bigger Better Smarter Trend */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <Lightbulb className="w-6 h-6 mr-2 text-blue-500" />
                        Tren Bigger Better Smarter
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#f8fafc', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="bigger" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    name="BIGGER"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="better" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    name="BETTER"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="smarter" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3}
                                    name="SMARTER"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

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
            </div>

            {/* Recent Activities with BBS Focus */}
            <section className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-purple-500" />
                    Pencapaian Bigger Better Smarter Terbaru
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
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                        <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-800">Jadwal Kegiatan</p>
                    </button>
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                        <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-purple-800">Kelola Tim</p>
                    </button>
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                        <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-800">Lihat Laporan</p>
                    </button>
                </div>
            </section>
        </main>
    );
}
