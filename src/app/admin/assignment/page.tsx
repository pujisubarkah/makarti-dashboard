"use client";
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative mx-4">
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  eselon?: string;
  tahun_pensiun?: number;
  users?: { unit_kerja?: string };
};

interface EselonChartData {
  tahun: string;
  JPTM: number;
  JPTP: number;
  JA: number;
  JF: number;
  JPEL: number;
}

export default function PensiunRekapPage() {
  const [data, setData] = useState<{ rekap: Record<string, number>; pegawai: Pegawai[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employee/pensiun")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Memuat data...</div>;
  if (!data) return <div>Data tidak ditemukan</div>;

  // Format data untuk grafik
  const chartData = Object.entries(data.rekap).map(([tahun, jumlah]) => ({ tahun, jumlah }));

  // Filter pegawai sesuai tahun pensiun yang dipilih
  const detailPegawai = selectedYear
    ? data.pegawai.filter((p) => String(p.tahun_pensiun) === selectedYear)
    : [];

  // Menghitung statistik per periode 5 tahunan
  const calculatePeriodStats = () => {
    const periods = [
      { label: "2025", range: [2025, 2025], color: "from-red-500 to-red-600", icon: "🚨" },
      { label: "2026", range: [2026, 2026], color: "from-orange-500 to-orange-600", icon: "⚠️" },
      { label: "2027", range: [2027, 2027], color: "from-yellow-500 to-yellow-600", icon: "📅" },
      { label: "2028", range: [2028, 2028], color: "from-blue-500 to-blue-600", icon: "📊" },
      { label: "2029", range: [2029, 2029], color: "from-indigo-500 to-indigo-600", icon: "📈" },
      { label: "2030", range: [2030, 2030], color: "from-purple-500 to-purple-600", icon: "🎯" },
    ];

    return periods.map(period => {
      const count = Object.entries(data.rekap)
        .filter(([tahun]) => {
          const year = parseInt(tahun);
          return year >= period.range[0] && year <= period.range[1];
        })
        .reduce((sum, [, jumlah]) => sum + jumlah, 0);
      
      return { ...period, count };
    });
  };

  const periodStats = calculatePeriodStats();
  const totalPensiun = Object.values(data.rekap).reduce((sum, jumlah) => sum + jumlah, 0);

  // Menghitung statistik pensiun berdasarkan eselon per tahun
  const calculateEselonPensiunPerTahun = () => {
    const tahunRange = [2025, 2026, 2027, 2028, 2029, 2030];
    
    // Struktur data untuk chart: [{tahun: 2025, JPTM: 2, JPTP: 1, JA: 5, JF: 3, JPEL: 10}, ...]
    const chartData = tahunRange.map(tahun => {
      const yearData: EselonChartData = { 
        tahun: tahun.toString(),
        JPTM: 0,
        JPTP: 0,
        JA: 0,
        JF: 0,
        JPEL: 0
      };

      data.pegawai.forEach(pegawai => {
        if (pegawai.tahun_pensiun === tahun) {
          const eselon = pegawai.eselon?.toUpperCase() || "";
          if (eselon === 'JPTM') {
            yearData.JPTM++;
          } else if (eselon === 'JPTP') {
            yearData.JPTP++;
          } else if (eselon.includes('JA')) {
            yearData.JA++;
          } else if (eselon === 'JF') {
            yearData.JF++;
          } else if (eselon === 'JPEL') {
            yearData.JPEL++;
          }
        }
      });

      return yearData;
    });

    return chartData;
  };

  // Menghitung total per eselon untuk cards
  const calculateEselonTotalStats = () => {
    const eselonStats = {
      JPTM: 0,
      JPTP: 0,
      JA: 0,
      JF: 0,
      JPEL: 0
    };

    data.pegawai.forEach(pegawai => {
      const eselon = pegawai.eselon?.toUpperCase() || "";
      if (pegawai.tahun_pensiun && pegawai.tahun_pensiun >= 2025 && pegawai.tahun_pensiun <= 2030) {
        if (eselon === 'JPTM') {
          eselonStats.JPTM++;
        } else if (eselon === 'JPTP') {
          eselonStats.JPTP++;
        } else if (eselon.includes('JA')) {
          eselonStats.JA++;
        } else if (eselon === 'JF') {
          eselonStats.JF++;
        } else if (eselon === 'JPEL') {
          eselonStats.JPEL++;
        }
      }
    });

    return Object.entries(eselonStats)
      .map(([eselon, jumlah]) => ({ eselon, jumlah }))
      .filter(item => item.jumlah > 0);
  };

  const eselonPensiunPerTahun = calculateEselonPensiunPerTahun();
  const eselonTotalStats = calculateEselonTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📊 Dashboard Proyeksi Pensiun Pegawai
          </h1>
          <p className="text-gray-600 text-lg">
            Monitoring dan Proyeksi Pensiun Pegawai Tahun 2025-2030
          </p>
          <div className="mt-4 inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg">
            <span className="text-2xl font-bold text-blue-600">{totalPensiun}</span>
            <span className="ml-2 text-gray-600">Total Proyeksi Pensiun</span>
          </div>
        </div>

        {/* Statistik Cards per Tahun */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          {periodStats.map((period) => (
            <div key={period.label} className={`bg-gradient-to-r ${period.color} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer`}
                 onClick={() => setSelectedYear(period.label)}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{period.icon}</div>
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <span className="text-sm font-semibold">{period.label}</span>
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-sm font-medium opacity-90">Proyeksi Pensiun</h3>
                <p className="text-3xl font-bold">{period.count}</p>
              </div>
              <div className="text-xs opacity-75">
                Klik untuk detail pegawai
              </div>
            </div>
          ))}
        </div>

        {/* Statistik Cards Pensiun per Eselon */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              📊 Proyeksi Pensiun Berdasarkan Eselon (2025-2030)
            </h2>
            <p className="text-gray-600">Distribusi pegawai yang akan pensiun berdasarkan tingkat jabatan</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {eselonTotalStats.map((item) => {
              const colorMap: Record<string, { bg: string; icon: string }> = {
                'JPTM': { bg: "from-red-500 to-red-600", icon: "🌟" },
                'JPTP': { bg: "from-indigo-500 to-indigo-600", icon: "⭐" },
                'JA': { bg: "from-green-500 to-green-600", icon: "👔" },
                'JF': { bg: "from-purple-500 to-purple-600", icon: "🎓" },
                'JPEL': { bg: "from-orange-500 to-orange-600", icon: "💼" }
              };
              const color = colorMap[item.eselon] || { bg: "from-gray-500 to-gray-600", icon: "📋" };
              
              return (
                <div key={item.eselon} className={`bg-gradient-to-r ${color.bg} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{color.icon}</div>
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                      <span className="text-sm font-semibold">{item.eselon}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h3 className="text-sm font-medium opacity-90">Akan Pensiun</h3>
                    <p className="text-3xl font-bold">{item.jumlah}</p>
                  </div>
                  <div className="text-xs opacity-75">
                    {((item.jumlah / totalPensiun) * 100).toFixed(1)}% dari total
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Line Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Tren Pensiun per Tahun</h3>
                <p className="text-gray-600">Grafik perkembangan pensiun pegawai</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="jumlah" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} 
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart - Pensiun per Tahun per Eselon */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Pensiun per Tahun per Eselon</h3>
                <p className="text-gray-600">Breakdown eselon untuk setiap tahun</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eselonPensiunPerTahun}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#374151', fontWeight: 'bold' }}>{value}</span>}
                />
                <Bar dataKey="JPTM" stackId="a" fill="#ef4444" name="JPTM" radius={[0, 0, 0, 0]} />
                <Bar dataKey="JPTP" stackId="a" fill="#6366f1" name="JPTP" radius={[0, 0, 0, 0]} />
                <Bar dataKey="JA" stackId="a" fill="#10b981" name="JA" radius={[0, 0, 0, 0]} />
                <Bar dataKey="JF" stackId="a" fill="#8b5cf6" name="JF" radius={[0, 0, 0, 0]} />
                <Bar dataKey="JPEL" stackId="a" fill="#f59e0b" name="JPEL" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart Eselon */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Distribusi Eselon</h3>
                <p className="text-gray-600">Persentase pensiun per tingkat jabatan</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eselonTotalStats}
                  dataKey="jumlah"
                  nameKey="eselon"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={(entry: { eselon: string; jumlah: number }) => `${entry.eselon}: ${entry.jumlah}`}
                >
                  {eselonTotalStats.map((entry, index) => {
                    const colors = ["#ef4444", "#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#6b7280"];
                    return (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                  formatter={(value: number, name: string) => [`${value} pegawai`, name]}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#374151', fontWeight: 'bold' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">📋 Ringkasan Pensiun per Tahun</h3>
            <p className="opacity-90">Klik pada jumlah pegawai untuk melihat detail</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Pensiun</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Pegawai</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persentase</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.rekap).map(([tahun, jumlah]) => {
                  const percentage = ((jumlah / totalPensiun) * 100).toFixed(1);
                  const year = parseInt(tahun);
                  const currentYear = new Date().getFullYear();
                  const isUrgent = year <= currentYear + 2;
                  
                  return (
                    <tr key={tahun} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{tahun}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          onClick={() => setSelectedYear(tahun)}
                        >
                          {jumlah} Pegawai
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{percentage}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isUrgent 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isUrgent ? '🚨 Mendesak' : '✅ Terjadwal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal untuk detail pegawai */}
      <Modal open={!!selectedYear} onClose={() => setSelectedYear(null)}>
        {selectedYear && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                📋
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Detail Pegawai Pensiun Tahun {selectedYear}</h2>
                <p className="text-gray-600">Daftar pegawai yang akan pensiun pada tahun {selectedYear}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{detailPegawai.length}</div>
                  <div className="text-sm text-gray-600">Total Pegawai</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(detailPegawai.map(p => p.users?.unit_kerja)).size}
                  </div>
                  <div className="text-sm text-gray-600">Unit Kerja</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {((detailPegawai.length / totalPensiun) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Dari Total Pensiun</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <th className="border border-blue-400 p-3 text-left font-semibold">No</th>
                    <th className="border border-blue-400 p-3 text-left font-semibold">Nama Pegawai</th>
                    <th className="border border-blue-400 p-3 text-left font-semibold">NIP</th>
                    <th className="border border-blue-400 p-3 text-left font-semibold">Jabatan</th>
                    <th className="border border-blue-400 p-3 text-left font-semibold">Unit Kerja</th>
                  </tr>
                </thead>
                <tbody>
                  {detailPegawai.map((p, index) => (
                    <tr key={p.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                      <td className="border border-gray-300 p-3 text-center font-semibold text-gray-600">{index + 1}</td>
                      <td className="border border-gray-300 p-3 font-medium text-gray-800">{p.nama}</td>
                      <td className="border border-gray-300 p-3 text-gray-600 font-mono text-sm">{p.nip}</td>
                      <td className="border border-gray-300 p-3 text-gray-700">{p.jabatan}</td>
                      <td className="border border-gray-300 p-3 text-gray-700">{p.users?.unit_kerja || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
