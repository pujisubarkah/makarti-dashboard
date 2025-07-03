"use client";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { toast, Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Target,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
  CreditCard,
  Loader2,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Interface untuk tipe data - update untuk include pagu_anggaran per bulan
interface SerapanDetailItem {
  id: number;
  bulan: string;
  pagu_anggaran: number; // Tambahkan field ini
  realisasi_pengeluaran: number;
  capaian_realisasi: number;
  capaian_realisasi_kumulatif: number;
}

// Fungsi fetcher untuk SWR
const fetcher = async (url: string) => {
  console.log('Fetching:', url); // Debug log
  
  const res = await fetch(url);
  
  if (!res.ok) {
    // Jika 404, kembalikan data kosong
    if (res.status === 404) {
      console.log('Data not found, returning empty structure');
      return {
        pagu_anggaran: 0,
        total_realisasi: 0,
        sisa_anggaran: 0,
        capaian_realisasi: 0,
        detail_per_bulan: []
      };
    }
    
    // Untuk error lain, throw error
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('Fetched data:', data); // Debug log
  return data;
};

export default function SerapanAnggaranPage() {
  // State untuk hydration-safe client-side only operations
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    bulan: 'Januari',
    unitKerja: '',
    paguAnggaran: '',
    realisasiPengeluaran: '',
  });
  const [unitKerja, setUnitKerja] = useState('');

  const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // useEffect untuk handle client-side initialization
  useEffect(() => {
    setMounted(true);
    
    // Ambil userId dari localStorage setelah component mounted
    const id = localStorage.getItem('id');
    setUserId(id);

    // Ambil unit kerja dari localStorage jika ada
    const unit = localStorage.getItem('unit_kerja') || '';
    setUnitKerja(unit);
  }, []);

  // SWR hook - fetch semua unit kerja
  const { data, error, isLoading } = useSWR<{
    unit_kerja: string;
    pagu_anggaran: number;
    total_realisasi: number;
    sisa_anggaran: number;
    detail_per_bulan: SerapanDetailItem[];
  }[]>(
    mounted ? '/api/serapan' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User ID tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!formData.paguAnggaran || !formData.realisasiPengeluaran || !formData.unitKerja) {
      toast.error('Semua field harus diisi');
      return;
    }

    const paguAnggaran = parseFloat(formData.paguAnggaran);
    const realisasiPengeluaran = parseFloat(formData.realisasiPengeluaran);

    if (isNaN(paguAnggaran) || isNaN(realisasiPengeluaran)) {
      toast.error('Pagu anggaran dan realisasi pengeluaran harus berupa angka valid');
      return;
    }

    if (paguAnggaran <= 0 || realisasiPengeluaran <= 0) {
      toast.error('Pagu anggaran dan realisasi pengeluaran harus lebih dari 0');
      return;
    }

    if (realisasiPengeluaran > paguAnggaran) {
      toast.error('Realisasi pengeluaran tidak boleh melebihi pagu anggaran');
      return;
    }

    setIsSubmitting(true);

    const loadingPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log('Submitting to API:', `/api/serapan/${userId}`);
          
          const url = editingId ? `/api/serapan/${userId}/${editingId}` : `/api/serapan/${userId}`;
          const method = editingId ? 'PUT' : 'POST';
          
          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bulan: formData.bulan,
              unit_kerja: formData.unitKerja,
              pagu_anggaran: paguAnggaran,
              realisasi_pengeluaran: realisasiPengeluaran,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyimpan data');
          }

          const result = await response.json();
          console.log('API Response:', result);

          // Update data dengan SWR mutate
          mutate(`/api/serapan/${userId}`, result, false);

          // Reset form dan tutup modal
          setFormData({
            bulan: 'Januari',
            unitKerja: unitKerja,
            paguAnggaran: '',
            realisasiPengeluaran: '',
          });
          setEditingId(null);
          setShowModal(false);

          resolve(result);
        } catch (err) {
          console.error('Error saving data:', err);
          reject(err);
        } finally {
          setIsSubmitting(false);
        }
      }, 1000); // Simulate network delay
    });

    // Use Sonner's promise toast
    toast.promise(loadingPromise, {
      loading: editingId ? 'Memperbarui data serapan anggaran...' : 'Menyimpan data serapan anggaran...',
      success: editingId ? 'Data berhasil diperbarui!' : 'Data berhasil disimpan!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`,
    });
  };

  // Render loading state saat belum mounted (hydration-safe)
  if (!mounted) {
    return (
      <div>
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
          {/* ...all your page content... */}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat aplikasi...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case ketika userId tidak ada (belum login)
  if (!userId) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3 w-8 h-8" />
            <div>
              <h3 className="text-red-800 font-medium text-lg">Session Expired</h3>
              <p className="text-red-600 text-sm mt-1">User ID tidak ditemukan. Silakan login ulang.</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Memuat data serapan anggaran...</p>
            <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3 w-8 h-8" />
            <div>
              <h3 className="text-red-800 font-medium text-lg">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
              <p className="text-red-500 text-xs mt-1">API: /api/serapan/{userId}</p>
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Reload Halaman
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data processing
  const isEmptyData = !data || data.length === 0;

  // Helper function to format number as Rupiah
  function formatRupiah(value: number): string {
    if (isNaN(value)) return 'Rp 0';
    return 'Rp ' + value.toLocaleString('id-ID');
  }
  
  // Hitung summary keseluruhan
  let totalPaguAnggaran = 0;
  let totalRealisasi = 0;
  let totalSisaAnggaran = 0;
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((unitData) => {
      totalPaguAnggaran += unitData.pagu_anggaran || 0;
      totalRealisasi += unitData.total_realisasi || 0;
      totalSisaAnggaran += unitData.sisa_anggaran || 0;
    });
  }
  const totalCapaianRealisasi = totalPaguAnggaran > 0 ? (totalRealisasi / totalPaguAnggaran) * 100 : 0;

  // Bar chart: persentase serapan total per unit kerja
  const barChartData = Array.isArray(data) ? data.map((unitData: { unit_kerja: string; pagu_anggaran: number; total_realisasi: number; }) => {
    const pagu = unitData.pagu_anggaran || 0;
    const realisasi = unitData.total_realisasi || 0;
    const persentase = pagu > 0 ? (realisasi / pagu) * 100 : 0;
    return {
      unit_kerja: unitData.unit_kerja,
      persentase: persentase,
    };
  }) : [];

  // Pie chart komposisi total
  const pieData = [
    { name: 'Realisasi', value: totalRealisasi, color: '#34d399' },
    { name: 'Sisa Anggaran', value: totalSisaAnggaran, color: '#60a5fa' },
  ];

  // Summary cards (total)
  const summaryCards = [
    {
      title: "Pagu Anggaran",
      value: formatRupiah(totalPaguAnggaran),
      numericValue: totalPaguAnggaran,
      icon: <Wallet className="w-6 h-6" />,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      textColor: 'text-blue-600',
      textDark: 'text-blue-800',
      borderColor: 'border-blue-500',
      change: '+5%',
      description: 'Total anggaran tersedia'
    },
    {
      title: "Total Realisasi",
      value: formatRupiah(totalRealisasi),
      numericValue: totalRealisasi,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      textColor: 'text-green-600',
      textDark: 'text-green-800',
      borderColor: 'border-green-500',
      change: '+12%',
      description: 'Anggaran terrealisasi'
    },
    {
      title: "Sisa Anggaran",
      value: formatRupiah(totalSisaAnggaran),
      numericValue: totalSisaAnggaran,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-100',
      textColor: 'text-orange-600',
      textDark: 'text-orange-800',
      borderColor: 'border-orange-500',
      change: '-8%',
      description: 'Anggaran tersisa'
    },
    {
      title: "Capaian Realisasi",
      value: `${totalCapaianRealisasi.toFixed(1)}%`,
      numericValue: totalCapaianRealisasi,
      icon: <Target className="w-6 h-6" />,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      textColor: 'text-purple-600',
      textDark: 'text-purple-800',
      borderColor: 'border-purple-500',
      change: '+3%',
      description: 'Persentase capaian'
    },
  ];

  // Split bulan options for two tables
  const bulanOptions1 = bulanOptions.slice(0, 6); // Januari–Juni
  const bulanOptions2 = bulanOptions.slice(6);    // Juli–Desember

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Sonner Toaster */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={true}
        duration={4000}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        }}
      />
      {/* ...rest of your component code... */}
    {/* Empty State Banner - TAMBAHKAN INI */}
    {isEmptyData && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="text-blue-600 mr-3 w-6 h-6" />
          <div>
            <h3 className="text-blue-800 font-medium">Data Masih Kosong</h3>
            <p className="text-blue-600 text-sm">Silakan tambahkan data anggaran pertama Anda untuk memulai monitoring.</p>
          </div>
        </div>
      </div>
    )}
    
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Serapan Anggaran</h1>
          <p className="text-blue-600">Monitor dan kelola realisasi anggaran bulanan</p>
        </div>
        
        {/* Modal Dialog untuk Form */}
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              bulan: 'Januari',
              unitKerja: unitKerja,
              paguAnggaran: '',
              realisasiPengeluaran: '',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">
                {editingId ? 'Edit Data Serapan Anggaran' : 'Form Serapan Anggaran'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="bulan">Bulan</Label>
                <Select value={formData.bulan} onValueChange={(value) => setFormData(prev => ({ ...prev, bulan: value }))}>
                  <SelectTrigger id="bulan">
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulanOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="unitKerja">Unit Kerja</Label>
                <Input
                  id="unitKerja"
                  name="unitKerja"
                  value={formData.unitKerja}
                  onChange={e => setFormData(prev => ({ ...prev, unitKerja: e.target.value }))}
                  required
                  placeholder="Contoh: Direktorat Advokasi"
                  disabled={!!unitKerja}
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="paguAnggaran">Pagu Anggaran (Rp)</Label>
                <Input
                  id="paguAnggaran"
                  name="paguAnggaran"
                  type="number"
                  value={formData.paguAnggaran}
                  onChange={(e) => setFormData(prev => ({ ...prev, paguAnggaran: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: 6786042000"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="realisasiPengeluaran">Realisasi Pengeluaran (Rp)</Label>
                <Input
                  id="realisasiPengeluaran"
                  name="realisasiPengeluaran"
                  type="number"
                  value={formData.realisasiPengeluaran}
                  onChange={(e) => setFormData(prev => ({ ...prev, realisasiPengeluaran: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: 45000000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowModal(false)} 
                  type="button"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingId ? 'Memperbarui...' : 'Menyimpan...'}
                    </>
                  ) : (
                    editingId ? 'Perbarui' : 'Simpan'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
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
                <div className={`${card.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                  <div className={card.textColor}>
                    {card.icon}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${card.bgGradient} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${idx === 3 ? Math.min(card.numericValue, 100) : Math.min((card.numericValue / Math.max(...summaryCards.slice(0, 3).map(c => c.numericValue || 1))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>{card.description}</span>
                  <span className={`font-medium ${card.textColor}`}>
                    💰 {idx === 3 ? 'Target' : 'Aktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart per Unit Kerja (Persentase Serapan Total) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            Persentase Serapan per Unit Kerja
          </h2>
          {isEmptyData ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum Ada Data Chart</p>
                <p className="text-sm">Tambahkan data anggaran untuk melihat grafik</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="unit_kerja" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="persentase" fill="#34d399" name="Persentase Serapan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart Komposisi Total */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Komposisi Anggaran Keseluruhan
          </h2>
          {isEmptyData ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum Ada Data Komposisi</p>
                <p className="text-sm">Tambahkan data anggaran untuk melihat komposisi</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Table - Split menjadi dua: Jan-Jun dan Jul-Des */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabel 1: Januari–Juni */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">Data Serapan Anggaran Bulanan (Januari–Juni)</h2>
            <p className="text-blue-100 text-sm">Monitoring realisasi anggaran per bulan (Januari–Juni)</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">No</TableHead>
                  <TableHead className="font-medium">Unit Kerja</TableHead>
                  <TableHead className="font-medium">Pagu Anggaran</TableHead>
                  {bulanOptions1.map((bulan) => (
                    <TableHead key={bulan} className="font-medium text-center">{bulan}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((unitData: { unit_kerja: string; pagu_anggaran: number; detail_per_bulan: SerapanDetailItem[]; }, idx: number) => {
                    const realisasiPerBulan: { [bulan: string]: number } = {};
                    const paguAnggaran = unitData.pagu_anggaran || 0;
                    (unitData.detail_per_bulan || []).forEach((item: SerapanDetailItem) => {
                      realisasiPerBulan[item.bulan] = item.realisasi_pengeluaran;
                    });
                    return (
                      <TableRow key={unitData.unit_kerja + '-1'}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{unitData.unit_kerja}</TableCell>
                        <TableCell>{formatRupiah(paguAnggaran)}</TableCell>
                        {bulanOptions1.map(bulan => (
                          <TableCell key={bulan} className="text-center text-blue-600 font-semibold">
                            {realisasiPerBulan[bulan] ? formatRupiah(realisasiPerBulan[bulan]) : '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Belum ada data serapan anggaran.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Table 2: Juli–Desember + summary */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">Data Serapan Anggaran Bulanan (Juli–Desember &amp; Summary)</h2>
            <p className="text-blue-100 text-sm">Monitoring realisasi anggaran per bulan (Juli–Desember) &amp; ringkasan</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">No</TableHead>
                  <TableHead className="font-medium">Unit Kerja</TableHead>
                  {bulanOptions2.map((bulan) => (
                    <TableHead key={bulan} className="font-medium text-center">{bulan}</TableHead>
                  ))}
                  <TableHead className="font-medium text-right">Total Realisasi</TableHead>
                  <TableHead className="font-medium text-center">Persentase Serapan</TableHead>
                  <TableHead className="font-medium text-right">Sisa Anggaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((unitData: { unit_kerja: string; total_realisasi: number; sisa_anggaran: number; pagu_anggaran: number; detail_per_bulan: SerapanDetailItem[]; }, idx: number) => {
                    const realisasiPerBulan: { [bulan: string]: number } = {};
                    const totalRealisasi = unitData.total_realisasi || 0;
                    const sisaAnggaran = unitData.sisa_anggaran || 0;
                    const paguAnggaran = unitData.pagu_anggaran || 0;
                    const persentaseSerapan = paguAnggaran > 0 ? (totalRealisasi / paguAnggaran) * 100 : 0;
                    (unitData.detail_per_bulan || []).forEach((item: SerapanDetailItem) => {
                      realisasiPerBulan[item.bulan] = item.realisasi_pengeluaran;
                    });
                    return (
                      <TableRow key={unitData.unit_kerja + '-2'}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{unitData.unit_kerja}</TableCell>
                        {bulanOptions2.map(bulan => (
                          <TableCell key={bulan} className="text-center text-blue-600 font-semibold">
                            {realisasiPerBulan[bulan] ? formatRupiah(realisasiPerBulan[bulan]) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">{formatRupiah(totalRealisasi)}</TableCell>
                        <TableCell className="text-center">{persentaseSerapan.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{formatRupiah(sisaAnggaran)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Belum ada data serapan anggaran.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
