"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, Filter, TrendingUp, Target, CheckCircle2, Clock, BarChart3, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Enhanced Dummy Data Laporan
const reportData = [
  {
    id: 1,
    date: new Date("2025-07-01"),
    initiative: "Peningkatan Efisiensi Proses",
    status: "Selesai",
    impact: 85,
    smarter_score: 70,
    better_score: 90,
    category: "Process Improvement",
    team: "Tim Operasional",
    description: "Optimalisasi workflow dan pengurangan redundansi proses"
  },
  {
    id: 2,
    date: new Date("2025-07-03"),
    initiative: "Implementasi AI di Layanan Pelanggan",
    status: "Sedang Berlangsung",
    impact: 75,
    smarter_score: 85,
    better_score: 80,
    category: "Digital Innovation",
    team: "Tim IT",
    description: "Chatbot AI untuk customer service 24/7"
  },
  {
    id: 3,
    date: new Date("2025-07-05"),
    initiative: "Ekspansi Layanan Baru",
    status: "Belum Dimulai",
    impact: 90,
    smarter_score: 65,
    better_score: 85,
    category: "Business Development",
    team: "Tim Strategis",
    description: "Pengembangan produk untuk segmen baru"
  },
  {
    id: 4,
    date: new Date("2025-07-02"),
    initiative: "Digitalisasi Dokumen",
    status: "Selesai",
    impact: 78,
    smarter_score: 90,
    better_score: 75,
    category: "Digital Transformation",
    team: "Tim Administrasi",
    description: "Konversi arsip fisik ke digital dengan sistem pencarian"
  },
  {
    id: 5,
    date: new Date("2025-07-04"),
    initiative: "Pelatihan Keterampilan Digital",
    status: "Sedang Berlangsung",
    impact: 68,
    smarter_score: 75,
    better_score: 82,
    category: "Capacity Building",
    team: "Tim HR",
    description: "Program upskilling pegawai dalam teknologi digital"
  }
];

export default function ReportView() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Selesai":
        return {
          variant: "default" as const,
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: <CheckCircle2 className="w-4 h-4" />
        };
      case "Sedang Berlangsung":
        return {
          variant: "secondary" as const,
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: <Clock className="w-4 h-4" />
        };
      case "Belum Dimulai":
        return {
          variant: "outline" as const,
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: <Target className="w-4 h-4" />
        };
      default:
        return {
          variant: "outline" as const,
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: <Target className="w-4 h-4" />
        };
    }
  };

  // Get impact level styling
  const getImpactLevel = (impact: number) => {
    if (impact >= 80) return { level: "Tinggi", color: "text-green-600", bg: "bg-green-100" };
    if (impact >= 60) return { level: "Sedang", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Rendah", color: "text-red-600", bg: "bg-red-100" };
  };

  // Filter data berdasarkan status dan kategori
  const filteredData = reportData.filter((item) => {
    const statusMatch = filter === "all" || item.status.toLowerCase().replace(/\s+/g, '_') === filter;
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  // Search filter
  const searchedData = filteredData.filter((item) =>
    item.initiative.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler untuk download laporan
  const handleDownload = () => {
    toast("Berhasil! Laporan berhasil diunduh.");
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Filter & Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
              <p className="text-sm text-gray-600">Temukan laporan yang Anda butuhkan</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="hover:bg-orange-50 hover:border-orange-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter Lanjutan
            </Button>
            <Button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh Laporan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="hover:border-orange-300 focus:border-orange-500 transition-colors">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="sedang_berlangsung">Sedang Berlangsung</SelectItem>
              <SelectItem value="belum_dimulai">Belum Dimulai</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedCategory} defaultValue="all">
            <SelectTrigger className="hover:border-orange-300 focus:border-orange-500 transition-colors">
              <SelectValue placeholder="Filter Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="Process Improvement">Process Improvement</SelectItem>
              <SelectItem value="Digital Innovation">Digital Innovation</SelectItem>
              <SelectItem value="Business Development">Business Development</SelectItem>
              <SelectItem value="Digital Transformation">Digital Transformation</SelectItem>
              <SelectItem value="Capacity Building">Capacity Building</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="🔍 Cari inisiatif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hover:border-orange-300 focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Enhanced Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-100 text-sm font-medium">Total Inisiatif</CardTitle>
              <BarChart3 className="w-6 h-6 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">{reportData.length}</p>
            <p className="text-blue-200 text-sm">Proyek aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-100 text-sm font-medium">Inisiatif Selesai</CardTitle>
              <CheckCircle2 className="w-6 h-6 text-green-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">
              {reportData.filter((item) => item.status === "Selesai").length}
            </p>
            <p className="text-green-200 text-sm">Berhasil diselesaikan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-100 text-sm font-medium">Rata-rata Dampak</CardTitle>
              <TrendingUp className="w-6 h-6 text-purple-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">
              {Math.round(
                reportData.reduce((acc, item) => acc + item.impact, 0) /
                  reportData.length
              )}%
            </p>
            <p className="text-purple-200 text-sm">Tingkat dampak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-100 text-sm font-medium">Skor Rata-rata</CardTitle>
              <Award className="w-6 h-6 text-orange-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-1">
              {Math.round(
                reportData.reduce((acc, item) => acc + (item.smarter_score + item.better_score) / 2, 0) /
                  reportData.length
              )}%
            </p>
            <p className="text-orange-200 text-sm">SMARTER + BETTER</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Report Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Daftar Laporan Inisiatif</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Detail pencapaian dan progress setiap inisiatif</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {searchedData.length} dari {reportData.length} inisiatif
            </Badge>
          </div>
        </CardHeader>
        
        <div className="p-6">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">Tanggal</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Inisiatif & Tim</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Kategori</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Dampak</TableHead>
                  <TableHead className="text-gray-700 font-semibold">SMARTER</TableHead>
                  <TableHead className="text-gray-700 font-semibold">BETTER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchedData.length > 0 ? (
                  searchedData.map((item) => {
                    const statusStyle = getStatusStyle(item.status);
                    const impactLevel = getImpactLevel(item.impact);
                    
                    return (
                      <TableRow 
                        key={item.id} 
                        className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                      >
                        <TableCell className="font-medium text-gray-700">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{item.date.toLocaleDateString('id-ID', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                              {item.initiative}
                            </p>
                            <p className="text-sm text-gray-500">{item.team}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${statusStyle.bg} ${statusStyle.border} border`}>
                            {statusStyle.icon}
                            <Badge
                              variant={statusStyle.variant}
                              className={`${statusStyle.text} bg-transparent border-0 p-0 text-sm font-medium`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {item.category}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-700">{item.impact}%</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${impactLevel.bg} ${impactLevel.color} font-medium`}>
                                  {impactLevel.level}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${item.impact}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-purple-600">{item.smarter_score}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${item.smarter_score}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-blue-600">{item.better_score}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${item.better_score}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-700">Tidak ada data ditemukan</h3>
                          <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}