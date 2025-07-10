"use client";

import { useState, useEffect } from "react";
import {
  Card,
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
import { Calendar, Download, Filter, Target, CheckCircle2, Clock, BarChart3, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

// TypeScript interfaces
interface ApiEmployee {
  id: number;
  nama: string;
  jabatan: string;
}

interface ApiKegiatan {
  id: number;
  date: string;
  title: string;
  status?: string;
  impact?: number;
  smarter_score?: number;
  better_score?: number;
  type?: string;
  description?: string;
  location?: string;
  assignments?: EventAssignment[];
  time?: string;
}

// Tambahkan tipe assignment dari API
interface ApiAssignment {
  id: number;
  event_id: number;
  employee_id: number;
  role_id: string;
  confirmed: boolean;
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

export default function ReportView() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [teamData, setTeamData] = useState<TeamMember[]>(teamMembers);
  // Fetch event data from API
  const [eventData, setEventData] = useState<ReportData[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  // Tambahkan state untuk assignments
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);

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

  // Fetch event data from API
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setEventLoading(true);
        const unitKerjaId = localStorage.getItem('id') || '4';
        const response = await fetch(`/api/kegiatan/${unitKerjaId}`);
        if (response.ok) {
          const apiEvents = await response.json();
          // Transform API data to ReportData[]
          const transformed = apiEvents.map((ev: ApiKegiatan) => ({
            id: ev.id,
            date: new Date(ev.date),
            initiative: ev.title,
            status: ev.status || 'Scheduled',
            impact: ev.impact || 80,
            smarter_score: ev.smarter_score || 80,
            better_score: ev.better_score || 80,
            category: ev.type || 'Event',
            description: ev.description || '',
            location: ev.location || '-',
            assignments: Array.isArray(ev.assignments) ? ev.assignments : [],
            duration: ev.time || '-',
          }));
          setEventData(transformed);
        } else {
          setEventData([]);
        }
      } catch {
        setEventData([]);
      } finally {
        setEventLoading(false);
      }
    };
    fetchEventData();
  }, []);

  // Fetch assignments dari API agar sinkron dengan ManageTeam
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignment');
        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
        } else {
          setAssignments([]);
        }
      } catch {
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, []);

  // Mapping assignment ke eventData setelah fetch assignments dan eventData
  useEffect(() => {
    if (eventData.length === 0 || assignments.length === 0) return;
    setEventData(prev => prev.map(ev => {
      // Ambil assignment yang event_id-nya sama
      const eventAssignments = assignments.filter((a: ApiAssignment) => a.event_id === ev.id);
      // Mapping ke format lama jika perlu
      const mappedAssignments = eventAssignments.map((a: ApiAssignment) => ({
        memberId: a.employee_id,
        role: a.role_id, // role_id, bisa di-mapping ke nama role jika ingin
        confirmed: a.confirmed
      }));
      return { ...ev, assignments: mappedAssignments };
    }));
  }, [assignments, eventData.length]);

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

  // Filter data berdasarkan status dan kategori
  const filteredData = eventData.filter((item) => {
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

  // Helper function to get role name (optional, if you want to map role_id to readable name)
  const getRoleName = (roleId: string) => {
    // You can map roleId to role name here if needed
    // Example: if (roleId === "1") return "Koordinator";
    return roleId;
  };

  // Handler untuk download laporan (Excel)
  const handleDownload = () => {
    // Siapkan data untuk diekspor sesuai searchedData (yang tampil di tabel)
    const exportData = searchedData.map((item) => {
      // Gabungkan anggota tim terlibat menjadi string
      const teamList = item.assignments.map((a) => {
        const member = getMemberById(a.memberId);
        const name = member ? member.name : `ID:${a.memberId}`;
        const role = getRoleName(a.role);
        const confirmed = a.confirmed ? "✔" : "✖";
        return `${name} (${role}, ${confirmed})`;
      }).join(", ");
      return {
        Tanggal: item.date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        Inisiatif: item.initiative,
        Deskripsi: item.description,
        Lokasi: item.location,
        Durasi: item.duration,
        Status: item.status,
        "Tim Terlibat": teamList,
      };
    });
    // Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Inisiatif");
    // Download file Excel
    XLSX.writeFile(wb, `Laporan_Inisiatif_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast("Berhasil! Laporan berhasil diunduh sebagai Excel.");
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
              {searchedData.length} dari {eventData.length} inisiatif
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-700">Memuat data laporan...</h3>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : searchedData.length > 0 ? (
                  searchedData.map((item) => {
                    const statusStyle = getStatusStyle(item.status);
                    
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
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
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
