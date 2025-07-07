"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Download, Filter, TrendingUp, Target, CheckCircle2, Clock, BarChart3, Award, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// TypeScript interfaces
interface ApiEmployee {
  id: number;
  nama: string;
  jabatan: string;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar?: string;
}

interface EventAssignment {
  memberId: number;
  role: string;
  confirmed: boolean;
}

interface ReportData {
  id: number;
  date: Date;
  initiative: string;
  status: string;
  impact: number;
  smarter_score: number;
  better_score: number;
  category: string;
  description: string;
  location: string;
  assignments: EventAssignment[];
  duration: string;
}

// Sample team members data (matching DailyScheduleWithAvatars)
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Ahmad Sutrisno",
    position: "Kepala Unit Pengembangan",
    department: "Pengembangan SDM",
    avatar: "/avatar.png"
  },
  {
    id: 2,
    name: "Siti Nurhaliza, M.Kom",
    position: "Senior Analis Kebijakan",
    department: "Analisis Kebijakan",
    avatar: "/avatar.png"
  },
  {
    id: 3,
    name: "Budi Santoso",
    position: "Lead Developer",
    department: "IT Development",
    avatar: "/avatar.png"
  },
  {
    id: 4,
    name: "Rina Marlina, S.Pd",
    position: "Training Specialist",
    department: "Pengembangan SDM",
    avatar: "/avatar.png"
  },
  {
    id: 5,
    name: "Agus Wijaya",
    position: "Facilitator Senior",
    department: "General Affairs",
    avatar: "/avatar.png"
  },
  {
    id: 6,
    name: "Lisa Permata, S.T",
    position: "IT Support Specialist",
    department: "IT Development",
    avatar: "/avatar.png"
  },
  {
    id: 7,
    name: "Hendra Gunawan",
    position: "Project Coordinator",
    department: "General Affairs",
    avatar: "/avatar.png"
  },
  {
    id: 8,
    name: "Maya Sari, M.Si",
    position: "Research Assistant",
    department: "Analisis Kebijakan",
    avatar: "/avatar.png"
  }
];

// Enhanced Report Data with team assignments
const reportData: ReportData[] = [
  {
    id: 1,
    date: new Date("2025-07-07"),
    initiative: "Rapat Pagi Tim Teknis",
    status: "Completed",
    impact: 85,
    smarter_score: 78,
    better_score: 92,
    category: "Team Meeting",
    description: "Evaluasi progress proyek dan koordinasi teknis mingguan",
    location: "Ruangan A",
    duration: "08:30 - 10:00",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true },
      { memberId: 3, role: "presenter", confirmed: true },
      { memberId: 6, role: "technical_support", confirmed: true },
      { memberId: 8, role: "participant", confirmed: false }
    ]
  },
  {
    id: 2,
    date: new Date("2025-07-07"),
    initiative: "Workshop MAKARTI Implementation",
    status: "In Progress",
    impact: 92,
    smarter_score: 85,
    better_score: 88,
    category: "Workshop",
    description: "Workshop implementasi framework MAKARTI untuk semua unit",
    location: "Auditorium",
    duration: "10:30 - 12:00",
    assignments: [
      { memberId: 2, role: "trainer", confirmed: true },
      { memberId: 4, role: "facilitator", confirmed: true },
      { memberId: 5, role: "facilitator", confirmed: true },
      { memberId: 7, role: "coordinator", confirmed: true }
    ]
  },
  {
    id: 3,
    date: new Date("2025-07-07"),
    initiative: "Presentasi Inovasi Q2",
    status: "Scheduled",
    impact: 88,
    smarter_score: 90,
    better_score: 85,
    category: "Presentation",
    description: "Showcase inovasi terbaru dari semua unit kerja",
    location: "Meeting Room B",
    duration: "14:00 - 16:00",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true },
      { memberId: 2, role: "presenter", confirmed: true },
      { memberId: 3, role: "presenter", confirmed: true },
      { memberId: 6, role: "technical_support", confirmed: true },
      { memberId: 7, role: "coordinator", confirmed: false }
    ]
  },
  {
    id: 4,
    date: new Date("2025-07-06"),
    initiative: "Peningkatan Efisiensi Proses",
    status: "Completed",
    impact: 85,
    smarter_score: 70,
    better_score: 90,
    category: "Process Improvement",
    description: "Optimalisasi workflow dan pengurangan redundansi proses",
    location: "Ruang Kerja Tim",
    duration: "09:00 - 17:00",
    assignments: [
      { memberId: 1, role: "coordinator", confirmed: true },
      { memberId: 3, role: "technical_support", confirmed: true },
      { memberId: 8, role: "participant", confirmed: true }
    ]
  },
  {
    id: 5,
    date: new Date("2025-07-05"),
    initiative: "Implementasi AI di Layanan",
    status: "In Progress",
    impact: 75,
    smarter_score: 85,
    better_score: 80,
    category: "Digital Innovation",
    description: "Implementasi chatbot AI untuk customer service 24/7",
    location: "Lab IT",
    duration: "13:00 - 17:00",
    assignments: [
      { memberId: 3, role: "trainer", confirmed: true },
      { memberId: 6, role: "technical_support", confirmed: true },
      { memberId: 2, role: "facilitator", confirmed: true }
    ]
  }
];

export default function ReportView() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [teamData, setTeamData] = useState<TeamMember[]>(teamMembers);

  // Load team data from API (same as other components)
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const unitKerjaId = localStorage.getItem('id') || '4';
        const response = await fetch(`/api/employee/${unitKerjaId}`);
        if (response.ok) {
          const apiEmployees: ApiEmployee[] = await response.json();
          const transformedMembers = apiEmployees.map((emp: ApiEmployee) => ({
            id: emp.id,
            name: emp.nama,
            position: emp.jabatan,
            department: getDepartmentFromJabatan(emp.jabatan),
            avatar: "/avatar.png"
          }));
          setTeamData(transformedMembers);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };
    fetchTeamData();
  }, []);

  // Helper function to determine department
  const getDepartmentFromJabatan = (jabatan: string): string => {
    if (jabatan.includes("Direktur")) return "Direksi";
    if (jabatan.includes("Analis")) return "Analisis Kebijakan";
    if (jabatan.includes("Pengolah Data")) return "IT Development";
    if (jabatan.includes("Pengadministrasi")) return "General Affairs";
    return "General Affairs";
  };

  // Helper function to get member by ID
  const getMemberById = (id: number): TeamMember | undefined => {
    return teamData.find(member => member.id === id);
  };

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
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableHead className="text-gray-700 font-semibold">Inisiatif & Detail</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Tim Terlibat</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Dampak</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Skor</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>
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
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                              <Clock className="w-3 h-3 ml-2" />
                              <span>{item.duration}</span>
                            </div>
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
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {item.assignments.length} anggota
                              </span>
                            </div>
                            <div className="flex -space-x-2">
                              {item.assignments.slice(0, 4).map((assignment) => {
                                const member = getMemberById(assignment.memberId);
                                if (!member) return null;
                                
                                return (
                                  <Avatar key={assignment.memberId} className="h-8 w-8 border-2 border-white">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                );
                              })}
                              {item.assignments.length > 4 && (
                                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    +{item.assignments.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.assignments.filter(a => a.confirmed).length} dikonfirmasi
                            </div>
                          </div>
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
