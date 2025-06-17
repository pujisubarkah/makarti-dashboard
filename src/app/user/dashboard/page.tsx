import React from "react";
import { Building2, User, Users } from "lucide-react";

// /src/app/unit-kerja/dashboard/page.tsx

const unitData = {
    namaUnit: "Pusat Inovasi dan Teknologi",
    kepalaUnit: "Dr. Siti Cerdas, M.Sc",
    jumlahPegawai: 42,
};

export default function UnitKerjaDashboard() {
    return (
        <main className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Unit Kerja</h1>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border border-blue-100">
                    <Building2 className="w-10 h-10 text-blue-500" />
                    <div>
                        <p className="text-sm text-gray-500">Nama Unit</p>
                        <p className="text-lg font-semibold">{unitData.namaUnit}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border border-green-100">
                    <User className="w-10 h-10 text-green-500" />
                    <div>
                        <p className="text-sm text-gray-500">Kepala Unit</p>
                        <p className="text-lg font-semibold">{unitData.kepalaUnit}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border border-purple-100">
                    <Users className="w-10 h-10 text-purple-500" />
                    <div>
                        <p className="text-sm text-gray-500">Jumlah Pegawai</p>
                        <p className="text-lg font-semibold">{unitData.jumlahPegawai} orang</p>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Aktivitas Unit</h2>
                <p className="text-gray-600">Rekap kegiatan dan laporan unit akan tampil di sini. Anda bisa menambahkan grafik atau tabel performa unit kerja.</p>
            </section>
        </main>
    );
}
