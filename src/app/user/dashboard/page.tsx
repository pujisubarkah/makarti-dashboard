'use client'

import React from "react";
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
  PieChart,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'

const unitData = {
    namaUnit: "Pusat Inovasi dan Teknologi",
    kepalaUnit: "Dr. Siti Cerdas, M.Sc",
    jumlahPegawai: 42,
    jumlahInovasi: 15,
    targetBulanan: 20,
    kegiatanSelesai: 8,
    kegiatanBerlangsung: 3,
};

const activityData = [
  { bulan: 'Jan', inovasi: 3, komunikasi: 5, learning: 2 },
  { bulan: 'Feb', inovasi: 4, komunikasi: 6, learning: 3 },
  { bulan: 'Mar', inovasi: 5, komunikasi: 8, learning: 4 },
  { bulan: 'Apr', inovasi: 3, komunikasi: 7, learning: 5 },
]

const performanceData = [
  { name: 'Target Tercapai', value: 75, color: '#34d399' },
  { name: 'Dalam Progress', value: 20, color: '#60a5fa' },
  { name: 'Tertunda', value: 5, color: '#fbbf24' },
]

const COLORS = ['#34d399', '#60a5fa', '#fbbf24']

export default function UnitKerjaDashboard() {
    const progressPercentage = (unitData.jumlahInovasi / unitData.targetBulanan) * 100;

    const summaryCards = [
        {
            title: "Nama Unit",
            value: unitData.namaUnit,
            icon: <Building2 className="w-6 h-6" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-100',
            textColor: 'text-blue-600',
            textDark: 'text-blue-800',
            borderColor: 'border-blue-500',
            description: "Unit kerja utama"
        },
        {
            title: "Kepala Unit",
            value: unitData.kepalaUnit,
            icon: <User className="w-6 h-6" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-100',
            textColor: 'text-green-600',
            textDark: 'text-green-800',
            borderColor: 'border-green-500',
            description: "Pimpinan unit"
        },
        {
            title: "Total Pegawai",
            value: `${unitData.jumlahPegawai} orang`,
            icon: <Users className="w-6 h-6" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-100',
            textColor: 'text-purple-600',
            textDark: 'text-purple-800',
            borderColor: 'border-purple-500',
            description: "Sumber daya manusia"
        },
        {
            title: "Total Inovasi",
            value: unitData.jumlahInovasi,
            icon: <Award className="w-6 h-6" />,
            color: 'orange',
            bgGradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-100',
            textColor: 'text-orange-600',
            textDark: 'text-orange-800',
            borderColor: 'border-orange-500',
            description: "Inovasi aktif"
        },
    ];

    const performanceCards = [
        {
            title: "Target Bulanan",
            value: unitData.targetBulanan,
            icon: <Target className="w-6 h-6" />,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-100',
            textColor: 'text-blue-600',
            textDark: 'text-blue-800',
            borderColor: 'border-blue-500',
            progress: progressPercentage,
            change: '+15%'
        },
        {
            title: "Kegiatan Selesai",
            value: unitData.kegiatanSelesai,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-100',
            textColor: 'text-green-600',
            textDark: 'text-green-800',
            borderColor: 'border-green-500',
            progress: (unitData.kegiatanSelesai / (unitData.kegiatanSelesai + unitData.kegiatanBerlangsung)) * 100,
            change: '+8%'
        },
        {
            title: "Sedang Berlangsung",
            value: unitData.kegiatanBerlangsung,
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
            value: `${progressPercentage.toFixed(0)}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-100',
            textColor: 'text-purple-600',
            textDark: 'text-purple-800',
            borderColor: 'border-purple-500',
            progress: progressPercentage,
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
                    <p className="text-blue-600">Monitor dan kelola aktivitas unit kerja Anda</p>
                </div>
            </div>

            {/* Enhanced Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        {card.progress.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                        Aktivitas Bulanan
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
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
                                <Bar dataKey="inovasi" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="komunikasi" fill="#34d399" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="learning" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Performance Pie Chart */}
                <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <PieChart className="w-6 h-6 mr-2 text-green-500" />
                        Distribusi Kinerja
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={performanceData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* Recent Activities */}
            <section className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-purple-500" />
                    Aktivitas Terbaru
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="bg-blue-500 rounded-full p-2">
                            <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-blue-800">Inovasi Digital Baru</h3>
                            <p className="text-sm text-blue-600">Implementasi sistem manajemen dokumen digital</p>
                            <p className="text-xs text-blue-500 mt-1">2 hari yang lalu</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="bg-green-500 rounded-full p-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-green-800">Target Tercapai</h3>
                            <p className="text-sm text-green-600">Menyelesaikan 8 dari 10 target kegiatan bulan ini</p>
                            <p className="text-xs text-green-500 mt-1">5 hari yang lalu</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <div className="bg-yellow-500 rounded-full p-2">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-yellow-800">Workshop Mendatang</h3>
                            <p className="text-sm text-yellow-600">Pelatihan teknologi baru untuk semua pegawai</p>
                            <p className="text-xs text-yellow-500 mt-1">Minggu depan</p>
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
