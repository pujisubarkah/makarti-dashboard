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
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
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

interface SerapanData {
  pagu_anggaran: number;
  total_realisasi: number;
  sisa_anggaran: number;
  capaian_realisasi: number;
  detail_per_bulan: SerapanDetailItem[];
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
  const [formData, setFormData] = useState({
    bulan: 'Januari',
    paguAnggaran: '',
    realisasiPengeluaran: '',
  });

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
  }, []);

  // SWR hook - hanya fetch setelah mounted dan userId tersedia
  const { data, error, isLoading } = useSWR<SerapanData>(
    mounted && userId ? `/api/serapan/${userId}` : null,
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

    if (!formData.paguAnggaran || !formData.realisasiPengeluaran) {
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
          
          const response = await fetch(`/api/serapan/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bulan: formData.bulan,
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
            paguAnggaran: '',
            realisasiPengeluaran: '',
          });
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
      loading: 'Menyimpan data serapan anggaran...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Error: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`,
    });
  };

  // Render loading state saat belum mounted (hydration-safe)
  if (!mounted) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
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
  const { 
    pagu_anggaran = 0, 
    total_realisasi = 0, 
    sisa_anggaran = 0, 
    capaian_realisasi = 0, 
    detail_per_bulan = [] 
  } = data || {};

  const isEmptyData = pagu_anggaran === 0 && total_realisasi === 0 && detail_per_bulan.length === 0;

  // Chart data
  const chartData = detail_per_bulan.map(item => ({
    bulan: item.bulan,
    realisasi: Math.round(item.realisasi_pengeluaran / 1000000), // Convert to millions
  }));

  const pieData = [
    { name: 'Realisasi', value: total_realisasi, color: '#34d399' },
    { name: 'Sisa Anggaran', value: sisa_anggaran, color: '#60a5fa' },
  ];

  // Summary cards
  const summaryCards = [
    {
      title: "Pagu Anggaran",
      value: formatRupiah(pagu_anggaran),
      numericValue: pagu_anggaran,
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
      value: formatRupiah(total_realisasi),
      numericValue: total_realisasi,
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
      value: formatRupiah(sisa_anggaran),
      numericValue: sisa_anggaran,
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
      value: `${capaian_realisasi.toFixed(1)}%`,
      numericValue: capaian_realisasi,
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
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Form Serapan Anggaran</DialogTitle>
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
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
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
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            Tren Realisasi Anggaran (Juta Rp)
          </h2>
          {/* Show empty state or chart based on data */}
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
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value} Juta`, 'Realisasi']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="realisasi" 
                    stroke="#34d399" 
                    strokeWidth={3}
                    name="Realisasi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Komposisi Anggaran
          </h2>
          {/* Show empty state or chart based on data */}
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
                  <Tooltip 
                    formatter={(value) => formatRupiah(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Table - Updated dengan kolom Pagu Anggaran */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <h2 className="text-xl font-bold">Data Serapan Anggaran Bulanan</h2>
          <p className="text-blue-100 text-sm">Monitoring realisasi anggaran per bulan</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">No</TableHead>
                <TableHead className="font-medium">Bulan</TableHead>
                <TableHead className="font-medium text-right">Pagu Anggaran</TableHead>
                <TableHead className="font-medium text-right">Realisasi Pengeluaran</TableHead>
                <TableHead className="font-medium text-center">Capaian Realisasi</TableHead>
                <TableHead className="font-medium text-center">Capaian Kumulatif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(detail_per_bulan) && detail_per_bulan.length > 0 ? (
                detail_per_bulan.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">
                      <span className="inline-flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {item.bulan}
                      </span>
                    </TableCell>
                    {/* Kolom Pagu Anggaran - BARU */}
                    <TableCell className="text-right font-medium text-blue-600">
                      {formatRupiah(item.pagu_anggaran || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatRupiah(item.realisasi_pengeluaran)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.capaian_realisasi >= 80 ? 'bg-green-100 text-green-800' :
                        item.capaian_realisasi >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        item.capaian_realisasi >= 40 ? 'bg-orange-100 text-orange-800' :
                        item.capaian_realisasi >= 20 ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.capaian_realisasi >= 80 ? <CheckCircle className="w-3 h-3 mr-1" /> :
                         item.capaian_realisasi >= 60 ? <Target className="w-3 h-3 mr-1" /> :
                         item.capaian_realisasi >= 20 ? <AlertCircle className="w-3 h-3 mr-1" /> :
                         <AlertCircle className="w-3 h-3 mr-1" />}
                        {item.capaian_realisasi.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.capaian_realisasi_kumulatif >= 80 ? 'bg-green-100 text-green-800' :
                        item.capaian_realisasi_kumulatif >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        item.capaian_realisasi_kumulatif >= 40 ? 'bg-orange-100 text-orange-800' :
                        item.capaian_realisasi_kumulatif >= 20 ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.capaian_realisasi_kumulatif.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                      <p>Tidak ada data untuk ditampilkan</p>
                      <p className="text-sm">Silakan tambahkan data anggaran terlebih dahulu</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Target className="w-6 h-6 mr-2 text-purple-500" />
          Indikator Kinerja Anggaran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Kinerja Baik</p>
                <p className="text-xs text-green-600">≥ 80% realisasi</p>
              </div>
              <div className="bg-green-500 rounded-full p-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {Array.isArray(detail_per_bulan) 
                ? detail_per_bulan.filter(item => item.capaian_realisasi >= 80).length 
                : 0} bulan
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Perlu Perhatian</p>
                <p className="text-xs text-yellow-600">40-79% realisasi</p>
              </div>
              <div className="bg-yellow-500 rounded-full p-2">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-700 mt-2">
              {Array.isArray(detail_per_bulan) 
                ? detail_per_bulan.filter(item => item.capaian_realisasi >= 40 && item.capaian_realisasi < 80).length
                : 0} bulan
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Perlu Tindakan</p>
                <p className="text-xs text-red-600">{"<"} 40% realisasi</p>
              </div>
              <div className="bg-red-500 rounded-full p-2">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">
              {Array.isArray(detail_per_bulan) 
                ? detail_per_bulan.filter(item => item.capaian_realisasi < 40).length
                : 0} bulan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function untuk format rupiah
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}