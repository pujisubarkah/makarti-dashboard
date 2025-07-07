'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f87171', '#a78bfa'];

interface NetworkingData {
  id: number;
  instansi: string;
  jenis: string;
  catatan: string;
  status: string;
  unit_kerja: string;
}

export default function NetworkingPage() {
  const [dataKegiatan, setDataKegiatan] = useState<NetworkingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showChampionAlert, setShowChampionAlert] = useState(false);
    // Filter and sort states
  const [filterUnitKerja, setFilterUnitKerja] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/networking');
        if (!response.ok) {
          throw new Error('Failed to fetch networking data');
        }
        const data = await response.json();
        setDataKegiatan(data);
        
        // Show champion alert after data loads - with additional safety checks
        if (data && Array.isArray(data) && data.length > 0) {
          setTimeout(() => setShowChampionAlert(true), 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create summary cards with dynamic data - with null checks
  const safeDataKegiatan = dataKegiatan || [];
  const summaryCards = [
    { 
      label: 'Total Kegiatan', 
      value: safeDataKegiatan.length,
      icon: '🤝',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500'
    },
    { 
      label: 'In Progress', 
      value: safeDataKegiatan.filter(d => d.status === 'In Progress').length,
      icon: '⚡',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500'
    },
    { 
      label: 'Inisiasi', 
      value: safeDataKegiatan.filter(d => d.status === 'Inisiasi').length,
      icon: '🚀',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500'
    },
    { 
      label: 'Selesai', 
      value: safeDataKegiatan.filter(d => d.status === 'Selesai').length,
      icon: '✅',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500'
    },
  ];

  const kegiatanCount = (dataKegiatan || []).reduce((acc, item) => {
    if (item.jenis) {
      acc[item.jenis] = (acc[item.jenis] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Process pie data to show only top 5 categories and group others
  const sortedKegiatan = Object.entries(kegiatanCount)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  
  const topCategories = sortedKegiatan.slice(0, 4); // Top 4 categories
  const otherCategories = sortedKegiatan.slice(4);
  
  const pieData = [
    ...topCategories.map(([key, value]) => ({
      name: key,
      value,
      fullName: key
    })),
    ...(otherCategories.length > 0 ? [{
      name: 'Lainnya',
      value: otherCategories.reduce((sum, [, count]) => sum + (count as number), 0),
      fullName: `Lainnya (${otherCategories.length} kategori)`
    }] : [])
  ];
  // Hitung unit terpopuler - with null checks
  const unitCount = (dataKegiatan || []).reduce((acc, item) => {
    if (!item.unit_kerja) return acc; // Skip if no unit_kerja
    acc[item.unit_kerja] = (acc[item.unit_kerja] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUnits = Object.entries(unitCount)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  const championUnit = sortedUnits && sortedUnits.length > 0 ? sortedUnits[0] : null; // Most active unit with null check
  // Get unique values for filters
  const uniqueUnitKerja = [...new Set((dataKegiatan || []).map(item => item.unit_kerja).filter(Boolean))].sort();
  const uniqueStatus = [...new Set((dataKegiatan || []).map(item => item.status).filter(Boolean))].sort();

  // Filter and sort data
  const filteredData = (dataKegiatan || []).filter(item => {
    const matchesUnit = !filterUnitKerja || item.unit_kerja === filterUnitKerja;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesUnit && matchesStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: string | number = '';
    let bValue: string | number = '';
    
    switch (sortColumn) {
      case 'instansi':
        aValue = a.instansi || '';
        bValue = b.instansi || '';
        break;
      case 'jenis':
        aValue = a.jenis || '';
        bValue = b.jenis || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'unit_kerja':
        aValue = a.unit_kerja || '';
        bValue = b.unit_kerja || '';
        break;
      case 'catatan':
        aValue = a.catatan || '';
        bValue = b.catatan || '';
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });

  // Pagination calculations - with filtered data
  const filteredDataLength = sortedData.length;
  const totalPages = Math.ceil(filteredDataLength / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Sort function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter change handlers
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  const handleUnitClick = (unit: string) => {
    setSelectedUnit(unit);
    setShowUnitModal(true);
  };

  const getUnitDetails = (unit: string) => {
    const unitData = (dataKegiatan || []).filter(item => {
      return item.unit_kerja === unit;
    });

    const statusBreakdown = unitData.reduce((acc, item) => {
      if (item.status) {
        acc[item.status] = (acc[item.status] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const jenisBreakdown = unitData.reduce((acc, item) => {
      if (item.jenis) {
        acc[item.jenis] = (acc[item.jenis] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const instansiPartners = [...new Set(unitData.map(item => item.instansi).filter(Boolean))];

    return {
      totalKegiatan: unitData.length,
      statusBreakdown,
      jenisBreakdown,
      instansiPartners,      activities: unitData,
      fullUnitName: unitData[0]?.unit_kerja || unit
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data networking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Networking Eksternal</h1>
        <p className="text-blue-600">Pantau kegiatan networking, kunjungan, dan kerjasama unit kerja LAN ke instansi eksternal</p>
      </div>

      {/* Champion Alert Popup */}
      {showChampionAlert && championUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white bg-opacity-20 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white bg-opacity-20 rounded-full translate-x-8 translate-y-8"></div>
            <div className="absolute top-1/2 right-0 w-12 h-12 bg-white bg-opacity-10 rounded-full translate-x-6"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-2">JUARA NETWORKING!</h2>
              <div className="bg-white bg-opacity-90 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">{championUnit[0]}</h3>
                <p className="text-yellow-700">
                  Memimpin dengan <span className="font-bold text-2xl text-yellow-800">{championUnit[1]}</span> kegiatan
                </p>
                <div className="flex justify-center space-x-2 mt-3">
                  <span className="text-2xl">🥇</span>
                  <span className="text-2xl">🎉</span>
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <p className="text-white text-sm mb-6">
                Unit paling aktif dalam kegiatan networking dan kerjasama!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowChampionAlert(false);
                    if (championUnit && championUnit[0]) {
                      handleUnitClick(championUnit[0]);
                    }
                  }}
                  className="w-full bg-white text-yellow-600 font-bold py-3 px-6 rounded-lg hover:bg-yellow-50 transition-colors shadow-lg"
                >
                  🔍 Lihat Detail Prestasi
                </button>
                <button
                  onClick={() => setShowChampionAlert(false)}
                  className="w-full bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Banner for Champion Unit */}
      {championUnit && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="text-2xl font-bold">JUARA NETWORKING</h2>
                <p className="text-yellow-100">
                  <span className="font-bold">{championUnit[0]}</span> memimpin dengan {championUnit[1]} kegiatan!
                </p>
              </div>
            </div>
            <div className="flex space-x-2 text-3xl">
              <span className="animate-bounce">🥇</span>
              <span className="animate-pulse">⭐</span>
              <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🎉</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 group overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textDark} mb-1`}>
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min((card.value / Math.max(...summaryCards.map(c => c.value), 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>Progress</span>
                  <span className={`font-medium ${card.textColor}`}>
                    {card.value > 0 ? '✓ Aktif' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Unit Paling Aktif dalam Networking
        </h2>        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedUnits.map(([unit, count], index) => {
            const colors = [
              { 
                bg: 'from-yellow-400 to-yellow-500', 
                light: 'bg-yellow-100', 
                text: 'text-yellow-600', 
                dark: 'text-yellow-800',
                border: 'border-yellow-500',
                icon: '🥇',
                special: true
              },
              { 
                bg: 'from-gray-400 to-gray-500', 
                light: 'bg-gray-100', 
                text: 'text-gray-600', 
                dark: 'text-gray-800',
                border: 'border-gray-500',
                icon: '🥈',
                special: false
              },
              { 
                bg: 'from-orange-400 to-orange-500', 
                light: 'bg-orange-100', 
                text: 'text-orange-600', 
                dark: 'text-orange-800',
                border: 'border-orange-500',
                icon: '🥉',
                special: false
              }
            ][index]

            const percentage = (dataKegiatan || []).length > 0 ? ((count / (dataKegiatan || []).length) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={unit}
                onClick={() => handleUnitClick(unit)}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.border} hover:scale-105 group overflow-hidden cursor-pointer ${
                  colors.special ? 'ring-4 ring-yellow-200 ring-opacity-50' : ''
                }`}
              >
                <div className="p-6">
                  {colors.special && (
                    <div className="text-center mb-3">
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        🏆 CHAMPION
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${colors.dark} mb-1`} title={unit}>
                        {unit.length > 20 ? unit.substring(0, 20) + '...' : unit}
                      </p>
                      <p className={`text-3xl font-bold ${colors.text}`}>
                        {count}
                      </p>
                    </div>
                    <div className={`${colors.light} p-3 rounded-full group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{colors.icon}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors.bg} h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${sortedUnits.length > 0 ? ((count as number) / Math.max(...sortedUnits.map(([, c]) => c as number), 1)) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>{percentage}% total kegiatan</span>
                      <span className={`font-medium ${colors.text}`}>
                        Rank #{index + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Click indicator */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-gray-200 transition-colors">
                      👆 Klik untuk detail
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Statistik Kegiatan Networking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-2xl font-bold text-blue-600">
              {(dataKegiatan || []).filter(d => d.instansi.toLowerCase().includes('kementerian') || d.instansi.toLowerCase().includes('pemda')).length}
            </div>
            <div className="text-sm text-blue-800">Instansi Pemerintah</div>
            <div className="text-xs text-blue-600 mt-1">Kementerian & Pemda</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-green-600">
              {(dataKegiatan || []).filter(d => d.status === 'In Progress').length}
            </div>
            <div className="text-sm text-green-800">Sedang Berjalan</div>
            <div className="text-xs text-green-600 mt-1">Status In Progress</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-purple-600">
              {(dataKegiatan || []).filter(d => d.jenis.toLowerCase().includes('kerjasama')).length}
            </div>
            <div className="text-sm text-purple-800">Kerjasama</div>
            <div className="text-xs text-purple-600 mt-1">Kolaborasi Formal</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-orange-600">
              {(dataKegiatan || []).filter(d => d.status === 'Inisiasi').length}
            </div>
            <div className="text-sm text-orange-800">Inisiasi</div>
            <div className="text-xs text-orange-600 mt-1">Tahap Perencanaan</div>
          </div>
        </div>
      </div>      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail Kegiatan Networking</h2>
              <p className="text-blue-100 text-sm">Daftar lengkap kegiatan kunjungan, kerjasama, dan koordinasi</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-100 text-sm">Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-white/20 text-white rounded px-2 py-1 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value={5} className="text-gray-800">5</option>
                  <option value={10} className="text-gray-800">10</option>
                  <option value={25} className="text-gray-800">25</option>
                  <option value={50} className="text-gray-800">50</option>
                </select>
                <span className="text-blue-100 text-sm">data per halaman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏢 Filter Unit Kerja
              </label>
              <select
                value={filterUnitKerja}
                onChange={(e) => {
                  setFilterUnitKerja(e.target.value);
                  handleFilterChange();
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Unit Kerja</option>
                {uniqueUnitKerja.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                � Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  handleFilterChange();
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                {uniqueStatus.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">              <button
                onClick={() => {
                  setFilterUnitKerja('');
                  setFilterStatus('');
                  setSortColumn(null);
                  setSortDirection('asc');
                  handleFilterChange();
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                🔄 Reset Filter & Sort
              </button>
            </div>
          </div>          {/* Filter Summary */}
          {(filterUnitKerja || filterStatus) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filter aktif:</span>
              {filterUnitKerja && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Unit: {filterUnitKerja}
                </span>
              )}
              {filterStatus && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Status: {filterStatus}
                </span>
              )}              <span className="text-sm text-gray-500">
                ({filteredDataLength} dari {(dataKegiatan || []).length} data)
              </span>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">No</th>
                <th 
                  className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('instansi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Instansi</span>
                    {sortColumn === 'instansi' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('jenis')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Jenis Kegiatan</span>
                    {sortColumn === 'jenis' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortColumn === 'status' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('unit_kerja')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Unit Kerja</span>
                    {sortColumn === 'unit_kerja' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('catatan')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Catatan</span>
                    {sortColumn === 'catatan' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {currentData.map((item, index) => {
                const unitRank = sortedUnits.findIndex(([unit]) => unit === item.unit_kerja);
                const isTopUnit = unitRank !== -1 && unitRank < 3;
                const isChampion = unitRank === 0;
                const globalIndex = startIndex + index + 1; // Global row number

                return (
                  <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${isChampion ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 text-gray-600">{globalIndex}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {(item.instansi?.toLowerCase().includes('kementerian') || item.instansi?.toLowerCase().includes('pemda')) && <span className="mr-1">🏢</span>}
                      {item.instansi || 'Unknown Institution'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenis?.toLowerCase().includes('kerjasama') ? 'bg-purple-100 text-purple-800' :
                        item.jenis?.toLowerCase().includes('seminar') ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.jenis?.toLowerCase().includes('kerjasama') ? '🤝' :
                         item.jenis?.toLowerCase().includes('seminar') ? '🎓' : '📋'} {item.jenis || 'Unknown Type'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Inisiasi' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'Selesai' ? '✅' :
                         item.status === 'In Progress' ? '⚡' :
                         item.status === 'Inisiasi' ? '🚀' : '📋'} {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isTopUnit 
                            ? unitRank === 0 
                              ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300' 
                              : unitRank === 1 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`} 
                        title={item.unit_kerja}
                      >
                        {isTopUnit && ['🥇', '🥈', '🥉'][unitRank]} 
                        {item.unit_kerja && item.unit_kerja.length > 30 
                          ? item.unit_kerja.substring(0, 30) + '...' 
                          : item.unit_kerja || 'Unknown Unit'
                        }
                        {isChampion && <span className="ml-1 text-yellow-600">👑</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <div className="truncate" title={item.catatan || 'No notes'}>
                        {item.catatan || 'No notes available'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
          {/* Pagination Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                <span className="font-medium">{Math.min(endIndex, filteredDataLength)}</span> dari{' '}
                <span className="font-medium">{filteredDataLength}</span> hasil              {(filterUnitKerja || filterStatus) && (
                <span className="text-gray-500"> (difilter dari {(dataKegiatan || []).length} total data)</span>
              )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Sebelumnya
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      key="first-page"
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span key="start-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                  </>
                )}
                
                {/* Pages around current page */}
                {(() => {
                  const pages = [];
                  const startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, currentPage + 2);
                  
                  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                    pages.push(
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return pages;
                })()}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span key="end-ellipsis" className="px-2 py-1 text-gray-500">...</span>}
                    <button
                      key="last-page"
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          Proporsi Jenis Kegiatan (Top Kategori)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={40}
                  label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: { payload?: { fullName?: string } }) => [
                  `${value} kegiatan`,
                  props.payload?.fullName || name
                ]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800 mb-3">Breakdown Kegiatan</h3>
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    {item.fullName && item.fullName !== item.name && (
                      <div className="text-xs text-gray-500">{item.fullName}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{item.value}</div>                  <div className="text-xs text-gray-500">
                    {(dataKegiatan || []).length > 0 ? ((item.value / (dataKegiatan || []).length) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              </div>
            ))}
            
            {/* Summary of all categories */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Kategori:</span>
                  <span className="font-medium">{Object.keys(kegiatanCount).length}</span>
                </div>                <div className="flex justify-between">
                  <span>Total Kegiatan:</span>
                  <span className="font-medium">{(dataKegiatan || []).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* All Categories Table for reference */}
        {Object.keys(kegiatanCount).length > 5 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Semua Kategori Kegiatan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedKegiatan.map(([category, count], index) => (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700 truncate mr-2" title={category}>
                    {index < 4 ? (
                      <span className="inline-flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        {category}
                      </span>
                    ) : (
                      category
                    )}
                  </span>
                  <span className="font-medium text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unit Detail Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header - Special styling for champion */}
            {(() => {
              const isChampion = championUnit && championUnit[0] === selectedUnit;
              return (
                <div className={`text-white p-6 ${
                  isChampion 
                    ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      {isChampion && (
                        <div className="flex items-center mb-2">
                          <span className="bg-white text-yellow-600 text-xs font-bold px-3 py-1 rounded-full mr-2">
                            🏆 JUARA NETWORKING
                          </span>
                          <span className="text-2xl">👑</span>
                        </div>
                      )}
                      <h2 className="text-2xl font-bold">Detail Unit Kerja</h2>
                      <p className={`text-sm mt-1 ${isChampion ? 'text-yellow-100' : 'text-blue-100'}`}>
                        {getUnitDetails(selectedUnit).fullUnitName}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUnitModal(false)}
                      className="text-white hover:text-red-200 transition-colors text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const unitDetails = getUnitDetails(selectedUnit);
                const isChampion = championUnit && championUnit[0] === selectedUnit;
                return (
                  <div className="space-y-6">
                    {/* Champion Celebration Section */}
                    {isChampion && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🎉🏆🎉</div>
                          <h3 className="text-2xl font-bold text-yellow-800 mb-2">SELAMAT!</h3>
                          <p className="text-yellow-700 font-medium">
                            Unit ini adalah JUARA NETWORKING dengan pencapaian luar biasa!
                          </p>
                          <div className="flex justify-center space-x-3 mt-4">
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">🥇 Rank #1</span>
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">⭐ Champion</span>
                            <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">🚀 Top Performer</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg text-center ${isChampion ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50'}`}>
                        <div className={`text-2xl font-bold ${isChampion ? 'text-yellow-600' : 'text-blue-600'}`}>
                          {unitDetails.totalKegiatan}
                        </div>
                        <div className={`text-sm ${isChampion ? 'text-yellow-800' : 'text-blue-800'}`}>
                          Total Kegiatan
                        </div>
                        {isChampion && <div className="text-xs text-yellow-600 mt-1">👑 Terbanyak!</div>}
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {unitDetails.statusBreakdown['In Progress'] || 0}
                        </div>
                        <div className="text-sm text-green-800">Sedang Berjalan</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {unitDetails.statusBreakdown['Inisiasi'] || 0}
                        </div>
                        <div className="text-sm text-orange-800">Inisiasi</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{unitDetails.instansiPartners.length}</div>
                        <div className="text-sm text-purple-800">Mitra Instansi</div>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">📊</span>
                        Breakdown Status Kegiatan
                        {isChampion && <span className="ml-2 text-yellow-600">🏆</span>}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(unitDetails.statusBreakdown).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between bg-white p-3 rounded">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'Selesai' ? 'bg-green-100 text-green-800' :
                              status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              status === 'Inisiasi' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'Selesai' ? '✅' :
                               status === 'In Progress' ? '⚡' :
                               status === 'Inisiasi' ? '🚀' : '📋'} {status}
                            </span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Type Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🏷️</span>
                        Jenis Kegiatan
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(unitDetails.jenisBreakdown).map(([jenis, count]) => (
                          <div key={jenis} className="flex items-center justify-between bg-white p-3 rounded">
                            <span className="text-gray-700">{jenis}</span>
                            <span className="font-bold text-gray-800">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Partner Institutions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🏢</span>
                        Mitra Instansi ({unitDetails.instansiPartners.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {unitDetails.instansiPartners.map((instansi, index) => (
                          <div key={index} className="bg-white p-2 rounded text-sm">
                            {(instansi?.toLowerCase().includes('kementerian') || instansi?.toLowerCase().includes('pemda')) && 
                              <span className="mr-1">🏢</span>
                            }
                            {instansi || 'Unknown Institution'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">📋</span>
                        Aktivitas Terbaru (Max 5)
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {unitDetails.activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className={`bg-white p-3 rounded border-l-4 ${
                            isChampion ? 'border-yellow-500' : 'border-blue-500'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{activity.instansi || 'Unknown Institution'}</div>
                                <div className="text-sm text-gray-600">{activity.jenis || 'Unknown Type'}</div>
                                <div className="text-xs text-gray-500 mt-1" title={activity.catatan || 'No notes'}>
                                  {activity.catatan && activity.catatan.length > 100 ? 
                                    activity.catatan.substring(0, 100) + '...' : 
                                    activity.catatan || 'No notes available'
                                  }
                                </div>
                              </div>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                activity.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                                activity.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                activity.status === 'Inisiasi' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status || 'Unknown Status'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowUnitModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
