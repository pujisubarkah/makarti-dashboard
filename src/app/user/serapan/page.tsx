"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
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

// Interface untuk tipe data
interface SerapanDetailItem {
  id: number;
  bulan: string;
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
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function SerapanAnggaranPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bulan: 'Januari',
    paguAnggaran: '',
    realisasiPengeluaran: '',
  });

  const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Ambil userId dari localStorage dengan pengecekan client-side
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || localStorage.getItem('userUnitId') || '17';
    }
    return '17';
  };

  const userId = getUserId();
  const { data, error, isLoading } = useSWR<SerapanData>(`/api/serapan/${userId}`, fetcher);

  // Format currency
  const formatRupiah = (amount: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  // Loading state
  if (isLoading) return <Loader />;
  
  // Error state
  if (error) return <ErrorState error={error.message} />;
  
  // No data state
  if (!data) return <ErrorState error="Data tidak ditemukan" />;

  // Destructure data dengan default values
  const { 
    pagu_anggaran = 0, 
    total_realisasi = 0, 
    sisa_anggaran = 0, 
    capaian_realisasi = 0, 
    detail_per_bulan = [] 
  } = data;

  // Summary cards configuration
  const summaryCards = [
    {
      title: "Total Pagu Anggaran",
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
      description: 'Anggaran keseluruhan'
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
      change: '+15%',
      description: 'Pengeluaran sampai saat ini'
    },
    {
      title: "Sisa Anggaran",
      value: formatRupiah(sisa_anggaran),
      numericValue: sisa_anggaran,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      textDark: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      change: '-10%',
      description: 'Anggaran tersisa'
    },
    {
      title: "Capaian Realisasi",
      value: `${capaian_realisasi.toFixed(1)}%`,
      numericValue: capaian_realisasi,
      icon: <Target className="w-6 h-6" />,
      color: capaian_realisasi >= 80 ? 'green' : capaian_realisasi >= 60 ? 'yellow' : 'red',
      bgGradient: capaian_realisasi >= 80 ? 'from-green-500 to-green-600' :
                capaian_realisasi >= 60 ? 'from-yellow-500 to-yellow-600' :
                'from-red-500 to-red-600',
      bgLight: capaian_realisasi >= 80 ? 'bg-green-100' : capaian_realisasi >= 60 ? 'bg-yellow-100' : 'bg-red-100',
      textColor: capaian_realisasi >= 80 ? 'text-green-600' :
                capaian_realisasi >= 60 ? 'text-yellow-600' : 'text-red-600',
      textDark: capaian_realisasi >= 80 ? 'text-green-800' : capaian_realisasi >= 60 ? 'text-yellow-800' : 'text-red-800',
      borderColor: capaian_realisasi >= 80 ? 'border-green-500' :
                capaian_realisasi >= 60 ? 'border-yellow-500' : 'border-red-500',
      change: '+8%',
      description: 'Persentase penyerapan'
    }
  ];

  // Chart data dengan pengecekan array
  const chartData = Array.isArray(detail_per_bulan) ? detail_per_bulan.map(item => ({
    bulan: item.bulan ? item.bulan.substring(0, 3) : '',
    realisasi: (item.realisasi_pengeluaran || 0) / 1000000,
    persentase: item.capaian_realisasi || 0,
    capaian_realisasi_kumulatif: item.capaian_realisasi_kumulatif || 0
  })) : [];

  // Pie chart data
  const pieData = [
    { name: 'Realisasi', value: total_realisasi, color: '#34d399' },
    { name: 'Sisa Anggaran', value: sisa_anggaran, color: '#60a5fa' }
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/serapan/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bulan: formData.bulan,
          pagu_anggaran: parseFloat(formData.paguAnggaran),
          realisasi_pengeluaran: parseFloat(formData.realisasiPengeluaran),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data');
      }

      const result = await response.json();

      // Update data dengan SWR
      mutate(`/api/serapan/${userId}`, result, false);

      // Reset form dan tutup modal
      setFormData({
        bulan: 'Januari',
        paguAnggaran: '',
        realisasiPengeluaran: '',
      });
      setShowModal(false);
      alert('Data berhasil disimpan!');
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard Serapan Anggaran</h1>
          <p className="text-blue-600">Monitor dan kelola realisasi anggaran bulanan</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <DollarSign className="w-4 h-4 mr-2" />
              Input Data Anggaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Form Serapan Anggaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bulan */}
              <div className="space-y-1">
                <Label htmlFor="bulan">Bulan</Label>
                <Select
                  name="bulan"
                  value={formData.bulan}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bulan: value }))}
                >
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

              {/* Pagu Anggaran */}
              <div className="space-y-1">
                <Label htmlFor="paguAnggaran">Pagu Anggaran (Rp)</Label>
                <Input
                  id="paguAnggaran"
                  name="paguAnggaran"
                  type="number"
                  value={formData.paguAnggaran}
                  onChange={(e) => setFormData(prev => ({ ...prev, paguAnggaran: e.target.value }))}
                  required
                  placeholder="Contoh: 6786042000"
                />
                <p className="text-xs text-gray-500">
                  Current Pagu: {formatRupiah(pagu_anggaran)}
                </p>
              </div>

              {/* Realisasi Pengeluaran */}
              <div className="space-y-1">
                <Label htmlFor="realisasiPengeluaran">Realisasi Pengeluaran (Rp)</Label>
                <Input
                  id="realisasiPengeluaran"
                  name="realisasiPengeluaran"
                  type="number"
                  value={formData.realisasiPengeluaran}
                  onChange={(e) => setFormData(prev => ({ ...prev, realisasiPengeluaran: e.target.value }))}
                  required
                  placeholder="Contoh: 45000000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)} type="button">
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Summary Cards */}
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
              
              {/* Progress Bar */}
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
                  formatter={(value, name) => [
                    `${value} Juta`,
                    name === 'realisasi' ? 'Realisasi' : name
                  ]}
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
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-green-500" />
            Komposisi Anggaran
          </h2>
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
        </div>
      </div>

      {/* Enhanced Table */}
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
                    <TableCell className="text-right font-medium text-green-600">
                      {formatRupiah(item.realisasi_pengeluaran)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          item.capaian_realisasi >= 80 ? 'bg-green-100 text-green-800' :
                          item.capaian_realisasi >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          item.capaian_realisasi >= 40 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.capaian_realisasi >= 80 ? <CheckCircle className="w-3 h-3 mr-1" /> :
                           item.capaian_realisasi >= 60 ? <Target className="w-3 h-3 mr-1" /> :
                           <AlertCircle className="w-3 h-3 mr-1" />}
                          {item.capaian_realisasi.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.capaian_realisasi_kumulatif >= 80 ? 'bg-green-100 text-green-800' :
                        item.capaian_realisasi_kumulatif >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        item.capaian_realisasi_kumulatif >= 40 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.capaian_realisasi_kumulatif.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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

// Component Loader
function Loader() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Memuat data...</p>
      </div>
    </div>
  );
}

// Component Error
function ErrorState({ error = "Gagal memuat data" }: { error?: string }) {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}