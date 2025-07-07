"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  Search, 
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  UserCheck,
  CalendarPlus,
  FileText
} from "lucide-react";

// TypeScript interfaces
interface ApiEmployee {
  id: number;
  nama: string;
  jabatan: string;
}

interface EventHistoryItem {
  eventId: number;
  title: string;
  status: string;
  role: string;
}

interface UpcomingEvent {
  eventId: number;
  title: string;
  role: string;
  confirmed: boolean;
}

interface UpcomingEventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  requiredRoles: string[];
  maxParticipants: number;
  currentAssignments: number;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  status: string;
  expertise: string[];
  eventHistory: EventHistoryItem[];
  upcomingEvents: UpcomingEvent[];
}

// Enhanced Data Structure with Event Assignment capabilities
// Default fallback data while loading
const defaultTeamData: TeamMember[] = [];

// Helper function to transform API data to TeamMember format
const transformApiToTeamMember = (apiEmployee: ApiEmployee): TeamMember => {
  return {
    id: apiEmployee.id,
    name: apiEmployee.nama,
    position: apiEmployee.jabatan,
    email: `${apiEmployee.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@lan.go.id`,
    phone: "+62 8xx-xxxx-xxxx", // Default phone, bisa diupdate nanti
    department: getDepartmentFromJabatan(apiEmployee.jabatan),
    status: "active", // Default status
    expertise: getExpertiseFromJabatan(apiEmployee.jabatan),
    eventHistory: [],
    upcomingEvents: []
  };
};

// Helper function to determine department from jabatan
const getDepartmentFromJabatan = (jabatan: string): string => {
  if (jabatan.includes("Direktur")) return "Direksi";
  if (jabatan.includes("Analis")) return "Analisis Kebijakan";
  if (jabatan.includes("Pengolah Data")) return "IT Development";
  if (jabatan.includes("Pengadministrasi")) return "General Affairs";
  return "General Affairs";
};

// Helper function to determine expertise from jabatan
const getExpertiseFromJabatan = (jabatan: string): string[] => {
  if (jabatan.includes("Direktur")) return ["Leadership", "Management", "Strategic Planning"];
  if (jabatan.includes("Analis")) return ["Data Analysis", "Policy Research", "Report Writing"];
  if (jabatan.includes("Pengolah Data")) return ["Data Processing", "Information Management", "Analytics"];
  if (jabatan.includes("Pengadministrasi")) return ["Document Management", "Office Administration", "Administrative Support"];
  return ["General Skills"];
};

// Sample Events from ScheduleCalendar (untuk assignment)
const upcomingEvents: UpcomingEventItem[] = [
  {
    id: 5,
    title: "Workshop Bigger Better Smarter",
    date: "2025-07-07",
    time: "09:00 - 12:00",
    location: "Ruangan Training B",
    type: "workshop",
    requiredRoles: ["facilitator", "technical_support", "participant"],
    maxParticipants: 30,
    currentAssignments: 2
  },
  {
    id: 6,
    title: "Rapat Pagi Tim Teknis",
    date: "2025-07-08",
    time: "08:00 - 09:00",
    location: "Ruangan Meeting A",
    type: "meeting",
    requiredRoles: ["lead", "participant"],
    maxParticipants: 8,
    currentAssignments: 0
  },
  {
    id: 7,
    title: "Training Digital Transformation",
    date: "2025-07-10",
    time: "13:00 - 17:00",
    location: "Auditorium",
    type: "training",
    requiredRoles: ["trainer", "assistant", "participant"],
    maxParticipants: 50,
    currentAssignments: 0
  }
];

const departments = ["Pengembangan SDM", "Analisis Kebijakan", "IT Development", "General Affairs"];
const positions = ["Kepala Unit", "Senior Analis", "Lead Developer", "Administrasi", "Junior Staff"];
const eventRoles = ["moderator", "presenter", "facilitator", "trainer", "technical_support", "participant", "coordinator"];

export default function ManageTeam() {
  const [newMember, setNewMember] = useState({ 
    name: "", 
    position: "", 
    email: "", 
    phone: "",
    department: "",
    expertise: ""
  });
  const [members, setMembers] = useState<TeamMember[]>(defaultTeamData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEventItem | null>(null);
  const [showEventAssignment, setShowEventAssignment] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Fetch team data from API
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Get unit_kerja_id from localStorage
        const unitKerjaId = localStorage.getItem('id')  
        
        const response = await fetch(`/api/employee/${unitKerjaId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiEmployees: ApiEmployee[] = await response.json();
        
        // Transform API data to TeamMember format
        const transformedMembers = apiEmployees.map(transformApiToTeamMember);
        
        setMembers(transformedMembers);
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Gagal memuat data tim. Menggunakan data fallback.');
        // Keep default empty data or show error message
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.position || !newMember.email) return;
    
    const newId = Math.max(...members.map(m => m.id), 0) + 1;
    const fullNewMember: TeamMember = {
      ...newMember,
      id: newId,
      status: "active",
      expertise: newMember.expertise ? newMember.expertise.split(",").map(s => s.trim()) : [],
      eventHistory: [],
      upcomingEvents: []
    };
    
    setMembers([...members, fullNewMember]);
    setNewMember({ 
      name: "", 
      position: "", 
      email: "", 
      phone: "",
      department: "",
      expertise: ""
    });
  };

  const handleAssignToEvent = (eventId: number, memberIds: number[], roles: { [key: number]: string }) => {
    // Update member's upcomingEvents
    const updatedMembers = members.map((member: TeamMember) => {
      if (memberIds.includes(member.id)) {
        const newEvent: UpcomingEvent = {
          eventId,
          title: upcomingEvents.find(e => e.id === eventId)?.title || "Unknown Event",
          role: roles[member.id] || "participant",
          confirmed: false
        };
        return {
          ...member,
          upcomingEvents: [...member.upcomingEvents, newEvent]
        };
      }
      return member;
    });
    setMembers(updatedMembers);
    alert(`${memberIds.length} anggota tim berhasil ditugaskan ke acara!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case "onleave":
        return <Badge variant="secondary">Cuti</Badge>;
      case "inactive":
        return <Badge variant="outline">Nonaktif</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getEventParticipationBadge = (member: TeamMember) => {
    const totalEvents = member.eventHistory.length + member.upcomingEvents.length;
    const attendedEvents = member.eventHistory.filter((e: EventHistoryItem) => e.status === "attended").length;
    
    if (totalEvents === 0) {
      return <Badge variant="outline" className="text-xs">Belum Ada Event</Badge>;
    }
    
    const participationRate = attendedEvents / member.eventHistory.length || 0;
    if (participationRate >= 0.8) {
      return <Badge className="bg-green-500 text-xs">Aktif ({totalEvents} events)</Badge>;
    } else if (participationRate >= 0.5) {
      return <Badge className="bg-yellow-500 text-xs">Sedang ({totalEvents} events)</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Rendah ({totalEvents} events)</Badge>;
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter((member: TeamMember) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || member.status === filterStatus;
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Memuat data tim...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Header dengan Event Assignment */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Manajemen Tim & Event
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola anggota tim dan assignment untuk acara/rapat
                {members.length > 0 && ` (${members.length} anggota)`}
              </p>
            </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowEventAssignment(true)}
            className="flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Assign ke Event
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Laporan Event
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Pegawai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Anggota Tim Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      value={newMember.name} 
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jabatan</Label>
                    <Select value={newMember.position} onValueChange={(value) => setNewMember({...newMember, position: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={newMember.email} 
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input 
                      value={newMember.phone} 
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Departemen</Label>
                  <Select value={newMember.department} onValueChange={(value) => setNewMember({...newMember, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Keahlian (pisahkan dengan koma)</Label>
                  <Input 
                    value={newMember.expertise} 
                    onChange={(e) => setNewMember({...newMember, expertise: e.target.value})} 
                    placeholder="contoh: Leadership, Management, Data Analysis"
                  />
                </div>
                
                <Button onClick={handleAddMember} className="w-full mt-4">
                  Tambah Anggota Tim
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">{members.length}</p>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">+{members.filter((m: TeamMember) => m.status === "active").length} aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Event Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-orange-600">{upcomingEvents.length}</p>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-blue-600 mt-1">Perlu assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">
                {members.reduce((acc: number, m: TeamMember) => acc + m.upcomingEvents.length, 0)}
              </p>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {members.filter((m: TeamMember) => m.upcomingEvents.length > 0).length} anggota terlibat
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tingkat Partisipasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(
                  (members.reduce((acc: number, m: TeamMember) => acc + m.eventHistory.filter((e: EventHistoryItem) => e.status === "attended").length, 0) /
                  Math.max(members.reduce((acc: number, m: TeamMember) => acc + m.eventHistory.length, 0), 1)) * 100
                )}%
              </p>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">↗️ +15% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama, jabatan, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="onleave">Cuti</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Enhanced Team Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Tim ({filteredMembers.length})
            </span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredMembers.filter((m: TeamMember) => m.status === "active").length} Aktif
              </Badge>
              <Badge className="bg-orange-500 text-xs">
                {filteredMembers.reduce((acc: number, m: TeamMember) => acc + m.upcomingEvents.length, 0)} Assignment
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Event Mendatang</TableHead>
                <TableHead>Partisipasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member: TeamMember) => (
                <TableRow key={member.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://i.pravatar.cc/150?img=${member.id}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {member.name.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {member.position}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {member.email}
                      </div>
                      <div className="text-sm flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {member.phone}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{member.department}</div>
                      <div className="text-xs text-gray-500">
                        {member.expertise.slice(0, 2).join(", ")}
                        {member.expertise.length > 2 && ` +${member.expertise.length - 2}`}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(member.status)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {member.upcomingEvents.length > 0 ? (
                        member.upcomingEvents.map((event: UpcomingEvent, idx: number) => (
                          <div key={idx} className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {event.title}
                            </Badge>
                            <div className="text-gray-500 mt-1">
                              Role: {event.role}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Tidak ada assignment</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getEventParticipationBadge(member)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-yellow-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Event Assignment Dialog */}
      <Dialog open={showEventAssignment} onOpenChange={setShowEventAssignment}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Tim ke Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Select Event */}
            <div className="space-y-2">
              <Label>Pilih Event</Label>
              <Select value={selectedEvent?.id?.toString()} onValueChange={(value) => {
                const event = upcomingEvents.find(e => e.id === parseInt(value));
                setSelectedEvent(event || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih event yang akan ditugaskan" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingEvents.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-gray-500">{event.date} • {event.time}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEvent && (
              <>
                {/* Event Details */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{selectedEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>Max: {selectedEvent.maxParticipants} orang</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        Role yang dibutuhkan: {selectedEvent.requiredRoles.join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Selection */}
                <div className="space-y-3">
                  <Label>Pilih Anggota Tim</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {members.filter((m: TeamMember) => m.status === "active").map((member: TeamMember) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member.id]);
                              } else {
                                setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                              }
                            }}
                            className="rounded"
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://i.pravatar.cc/150?img=${member.id}`} />
                            <AvatarFallback>{member.name.slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.position} • {member.department}</div>
                            <div className="text-xs text-blue-600">
                              Keahlian: {member.expertise.slice(0, 2).join(", ")}
                              {member.expertise.length > 2 && ` +${member.expertise.length - 2} lainnya`}
                            </div>
                          </div>
                        </div>
                        {selectedMembers.includes(member.id) && (
                          <Select defaultValue="participant">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {eventRoles.map(role => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment Actions */}
                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-gray-600">
                    {selectedMembers.length} dari {selectedEvent.maxParticipants} anggota dipilih
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEventAssignment(false)}>
                      Batal
                    </Button>
                    <Button 
                      onClick={() => {
                        handleAssignToEvent(selectedEvent.id, selectedMembers, {});
                        setShowEventAssignment(false);
                        setSelectedMembers([]);
                        setSelectedEvent(null);
                      }}
                      disabled={selectedMembers.length === 0}
                    >
                      Assign Tim ({selectedMembers.length})
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
