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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
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
  FileText,
  UserCheck,
  CalendarPlus
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
  priority: string;
  attendees: number;
  description: string;
  unit_kerja_id: number;
  requiredRoles: string[];
  maxParticipants: number;
  currentAssignments: number;
}

// Interface for API response from /api/kegiatan
interface ApiKegiatan {
  id: number;
  date: string;
  title: string;
  location: string;
  time: string;
  type: string;
  priority: string;
  attendees: number;
  description: string;
  unit_kerja_id: number;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  expertise: string[];
  eventHistory: EventHistoryItem[];
  upcomingEvents: UpcomingEvent[];
  status: "active" | "onleave" | "inactive"; // Added status property
}

// Enhanced Data Structure with Event Assignment capabilities
// Default fallback data while loading
const defaultTeamData: TeamMember[] = [];

const transformApiToTeamMember = (apiEmployee: ApiEmployee): TeamMember => {
  return {
    id: apiEmployee.id,
    name: apiEmployee.nama,
    position: apiEmployee.jabatan,
    email: `${apiEmployee.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@lan.go.id`,
    phone: "+62 8xx-xxxx-xxxx", // Default phone, bisa diupdate nanti
    department: getDepartmentFromJabatan(apiEmployee.jabatan),
    expertise: [], // No longer using getExpertiseFromJabatan
    eventHistory: [],
    upcomingEvents: [],
  status: "active" // Default status
};
};

// Helper function to determine department from jabatan
const getDepartmentFromJabatan = (jabatan: string): string => {
  // Return the unit/position name directly from jabatan
  return jabatan || "Unit Kerja";
};

// Helper function to normalize a date to midnight (00:00:00)
const normalizeToMidnight = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to transform API kegiatan to UpcomingEventItem
const transformApiKegiatanToEvent = (apiKegiatan: ApiKegiatan): UpcomingEventItem => {
  // Determine required roles based on event type
  const getRequiredRoles = (type: string): string[] => {
    switch (type.toLowerCase()) {
      case "workshop":
        return ["facilitator", "technical_support", "participant"];
      case "meeting":
        return ["lead", "participant"];
      case "training":
        return ["trainer", "assistant", "participant"];
      case "rapat":
        return ["moderator", "presenter", "participant"];
      case "seminar":
        return ["presenter", "moderator", "participant"];
      default:
        return ["participant"];
    }
  };

  // Determine max participants based on type and current attendees
  const getMaxParticipants = (type: string, currentAttendees: number): number => {
    const baseCapacity = Math.max(currentAttendees + 10, 20); // At least current + 10 or 20
    switch (type.toLowerCase()) {
      case "workshop":
        return Math.min(baseCapacity, 50);
      case "training":
        return Math.min(baseCapacity, 100);
      case "meeting":
      case "rapat":
        return Math.min(baseCapacity, 25);
      case "seminar":
        return Math.min(baseCapacity, 200);
      default:
        return baseCapacity;
    }
  };

  return {
    id: apiKegiatan.id,
    title: apiKegiatan.title,
    date: apiKegiatan.date,
    time: apiKegiatan.time || "Belum ditentukan",
    location: apiKegiatan.location || "Belum ditentukan",
    type: apiKegiatan.type || "event",
    priority: apiKegiatan.priority || "medium",
    attendees: apiKegiatan.attendees || 0,
    description: apiKegiatan.description || "",
    unit_kerja_id: apiKegiatan.unit_kerja_id,
    requiredRoles: getRequiredRoles(apiKegiatan.type || ""),
    maxParticipants: getMaxParticipants(apiKegiatan.type || "", apiKegiatan.attendees || 0),
    currentAssignments: 0 // Will be calculated from assignments
  };
};

export default function ManageTeam() {
  const [members, setMembers] = useState<TeamMember[]>(defaultTeamData);
  const [uniquePositions, setUniquePositions] = useState<string[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEventItem | null>(null);
  const [showEventAssignment, setShowEventAssignment] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventRoles, setEventRoles] = useState<{ id: number; role_name: string }[]>([]);
  const [eventRolesLoading, setEventRolesLoading] = useState(true);

  // Add state to track selected roles for each member
  const [selectedRoles, setSelectedRoles] = useState<{ [memberId: number]: string }>({});

  // Add state for assignments fetched from backend
  const [assignments, setAssignments] = useState<unknown[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  // State for view and edit dialogs
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // State for event report dialog
  const [showEventReport, setShowEventReport] = useState(false);

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

        // Extract unique positions (jabatan)
        const positionsSet = new Set(apiEmployees.map(emp => emp.jabatan).filter(Boolean));
        setUniquePositions(Array.from(positionsSet));
        
        setError(null);
      } catch {
        setError('Gagal memuat data tim. Menggunakan data fallback.');
        // Keep default empty data or show error message
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Fetch events data from API
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setEventsLoading(true);
        
        // Get unit_kerja_id from localStorage
        const unitKerjaId = localStorage.getItem('id');
        
        if (!unitKerjaId) {
          console.warn('No unit kerja ID found');
          setUpcomingEvents([]);
          return;
        }
        
        const response = await fetch(`/api/kegiatan/${unitKerjaId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiKegiatan: ApiKegiatan[] = await response.json();
        
        // Transform API data to UpcomingEventItem format
        const transformedEvents = apiKegiatan.map(transformApiKegiatanToEvent);
        
        // Filter future events only (today and after, normalized)
        const today = normalizeToMidnight(new Date());
        const futureEvents = transformedEvents.filter(event => {
          const eventDate = normalizeToMidnight(new Date(event.date));
          return eventDate >= today;
        });
        
        setUpcomingEvents(futureEvents);
      } catch {
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  // Fetch event roles from API
  useEffect(() => {
    const fetchEventRoles = async () => {
      try {
        setEventRolesLoading(true);
        const response = await fetch('/api/event_role');
        if (!response.ok) throw new Error('Failed to fetch event roles');
        const data = await response.json();
        setEventRoles(data);
      } catch {
        setEventRoles([]);
      } finally {
        setEventRolesLoading(false);
      }
    };
    fetchEventRoles();
  }, []);

  // Fetch assignments from API on mount and after assignment
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        const response = await fetch('/api/assignment');
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const data = await response.json();
        setAssignments(data);
      } catch {
        setAssignments([]);
      } finally {
        setAssignmentsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Function to handle posting assignments and refreshing state
  const handleAssignAndRefresh = async (assignmentsToPost: unknown[]) => {
    try {
      // Post assignments to backend
      const response = await fetch('/api/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentsToPost),
      });
      if (!response.ok) throw new Error('Failed to assign team members');
      // Refresh assignments
      const assignmentsRes = await fetch('/api/assignment');
      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data);
      }
      setShowEventAssignment(false);
    } catch {
      alert('Gagal melakukan assignment tim.');
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter((member: TeamMember) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
            disabled={upcomingEvents.length === 0}
          >
            <CalendarPlus className="w-4 h-4" />
            Assign ke Event ({upcomingEvents.length})
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              setEventsLoading(true);
              const unitKerjaId = localStorage.getItem('id');
              try {
                const response = await fetch(`/api/kegiatan/${unitKerjaId}`);
                if (response.ok) {
                  const apiKegiatan: ApiKegiatan[] = await response.json();
                  const transformedEvents = apiKegiatan.map(transformApiKegiatanToEvent);
                  const today = normalizeToMidnight(new Date());
                  const futureEvents = transformedEvents.filter(event => {
                    const eventDate = normalizeToMidnight(new Date(event.date));
                    return eventDate >= today;
                  });
                  setUpcomingEvents(futureEvents);
                }
              } catch {
                console.error('Error refreshing events');
              } finally {
                setEventsLoading(false);
              }
            }}
            className="flex items-center gap-2"
            disabled={eventsLoading}
          >
            <Calendar className="w-4 h-4" />
            {eventsLoading ? 'Memuat...' : 'Refresh Events'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowEventReport(true)}>
            <FileText className="w-4 h-4" />
            Laporan Event
          </Button>
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
              <p className="text-3xl font-bold text-orange-600">
                {eventsLoading ? '...' : upcomingEvents.length}
              </p>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {eventsLoading ? 'Memuat...' : 'Tersedia untuk assignment'}
            </p>
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
            
            <Select value="all">
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
                <TableHead>Event Mendatang</TableHead>
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
                      <div className="text-xs text-blue-600">
                        {member.expertise.slice(0, 2).join(", ")}
                        {member.expertise.length > 2 && ` +${member.expertise.length - 2}`}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {assignmentsLoading ? (
                        <span className="text-xs text-gray-400">Memuat assignment...</span>
                      ) : (
                        (assignments as Array<{ employee_id: number; event_id: number; role_id: number }>).filter(a => a.employee_id === member.id).length > 0 ? (
                          (assignments as Array<{ employee_id: number; event_id: number; role_id: number }>).
                            filter(a => a.employee_id === member.id).
                            map((a, idx: number) => (
                            <div key={idx} className="text-xs">
                              <Badge variant="outline" className="text-xs">
                                {upcomingEvents.find(e => e.id === a.event_id)?.title || `Event #${a.event_id}`}
                              </Badge>
                              <div className="text-gray-500 mt-1">
                                Role: {eventRoles.find(r => r.id === a.role_id)?.role_name || a.role_id}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Tidak ada assignment</span>
                        )
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-blue-50"
                        onClick={() => { setViewMember(member); setShowViewDialog(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-yellow-50"
                        onClick={() => { setEditMember(member); setShowEditDialog(true); }}
                      >
                        <Edit className="w-4 h-4" />
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
      <Dialog open={showEventAssignment} onOpenChange={(open) => {
  setShowEventAssignment(open);
  if (open) {
    setSelectedMembers([]); // Reset selection when dialog opens
    setSelectedEvent(null); // Optionally reset selected event
  }
}}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Tim ke Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Select Event */}
            <div className="space-y-2">
              <Label>Pilih Event</Label>
              <Select 
                value={selectedEvent?.id?.toString()} 
                onValueChange={(value) => {
                  const event = upcomingEvents.find((e: UpcomingEventItem) => e.id === parseInt(value));
                  setSelectedEvent(event || null);
                }}
                disabled={eventsLoading || upcomingEvents.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    eventsLoading ? "Memuat events..." : 
                    upcomingEvents.length === 0 ? "Tidak ada event tersedia" :
                    "Pilih event yang akan ditugaskan"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {upcomingEvents.map((event: UpcomingEventItem) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('id-ID')} • {event.time}
                        </span>
                        <span className="text-xs text-blue-600">
                          {event.type} • {event.location}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!eventsLoading && upcomingEvents.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  💡 Belum ada event yang terjadwal. Buat event baru di ScheduleCalendar untuk melakukan assignment tim.
                </p>
              )}
            </div>

            {selectedEvent && (
              <>
                {/* Event Details */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(selectedEvent.date).toLocaleDateString('id-ID')}</span>
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
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Jenis:</span>
                        <Badge variant="outline">{selectedEvent.type}</Badge>
                        <span className="font-medium">Prioritas:</span>
                        <Badge 
                          className={
                            selectedEvent.priority === 'high' ? 'bg-red-100 text-red-800' :
                            selectedEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {selectedEvent.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Role yang dibutuhkan:</span> {selectedEvent.requiredRoles.join(", ")}
                      </div>
                      {selectedEvent.description && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Deskripsi:</span> {selectedEvent.description}
                        </div>
                      )}
                      <div className="text-sm text-blue-600">
                        <span className="font-medium">Peserta saat ini:</span> {selectedEvent.attendees} orang
                      </div>
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
                            <div className="text-sm text-gray-500">{member.position}</div>
                            <div className="text-xs text-blue-600">
                              Keahlian: {member.expertise.slice(0, 2).join(", ")}
                              {member.expertise.length > 2 && ` +${member.expertise.length - 2} lainnya`}
                            </div>
                          </div>
                        </div>
                        {selectedMembers.includes(member.id) && (
                          <Select
                            value={selectedRoles[member.id] || eventRoles[0]?.role_name || ""}
                            onValueChange={(value) => setSelectedRoles({ ...selectedRoles, [member.id]: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {eventRolesLoading ? (
                                <SelectItem value="" disabled>Memuat role...</SelectItem>
                              ) : eventRoles.length === 0 ? (
                                <SelectItem value="" disabled>Tidak ada role</SelectItem>
                              ) : (
                                eventRoles.map(role => (
                                  <SelectItem key={role.id} value={role.role_name}>
                                    {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1).replace('_', ' ')}
                                  </SelectItem>
                                ))
                              )}
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
  onClick={async () => {
    const assignmentsToPost = selectedMembers.map(memberId => {
      const roleName = selectedRoles[memberId] || eventRoles[0]?.role_name;
      const roleObj = eventRoles.find(r => r.role_name === roleName);
      return {
        event_id: selectedEvent.id,
        employee_id: memberId,
        role_id: roleObj?.id,
        confirmed: false
      };
    });
    await handleAssignAndRefresh(assignmentsToPost);
  }}
  disabled={selectedMembers.length === 0 || selectedMembers.some(id => !selectedRoles[id])}
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

      {/* View Member Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pegawai</DialogTitle>
          </DialogHeader>
          {viewMember && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://i.pravatar.cc/150?img=${viewMember.id}`} />
                  <AvatarFallback>{viewMember.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{viewMember.name}</div>
                  <div className="text-sm text-gray-500">{viewMember.position}</div>
                  <div className="text-xs text-blue-600">{viewMember.expertise.join(", ")}</div>
                </div>
              </div>
              <div className="text-sm mt-2">
                <div><b>Email:</b> {viewMember.email}</div>
                <div><b>Telepon:</b> {viewMember.phone}</div>
                <div><b>Jabatan:</b> {viewMember.department}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Pegawai</DialogTitle>
          </DialogHeader>
          {editMember && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input 
                    value={editMember.name} 
                    onChange={e => setEditMember({ ...editMember, name: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Select value={editMember.position} onValueChange={value => setEditMember({ ...editMember, position: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePositions.map(pos => (
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
                    value={editMember.email} 
                    onChange={e => setEditMember({ ...editMember, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input 
                    value={editMember.phone} 
                    onChange={e => setEditMember({ ...editMember, phone: e.target.value })} 
                  />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => {
                setMembers(members.map(m => m.id === editMember.id ? editMember : m));
                setShowEditDialog(false);
              }}>
                Simpan Perubahan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Report Dialog */}
      <Dialog open={showEventReport} onOpenChange={setShowEventReport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Laporan Event & Assignment</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tim & Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400">Tidak ada event</TableCell>
                  </TableRow>
                ) : (
                  upcomingEvents.map(event => {
                    // Ambil assignment untuk event ini
                    const eventAssignments = (assignments as Array<{ employee_id: number; event_id: number; role_id: number }>).
                      filter(a => a.event_id === event.id);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>
                          {eventAssignments.length === 0 ? (
                            <span className="text-xs text-gray-400">Belum ada assignment</span>
                          ) : (
                            <ul className="text-xs space-y-1">
                              {eventAssignments.map((a, idx) => {
                                const member = members.find(m => m.id === a.employee_id);
                                const role = eventRoles.find(r => r.id === a.role_id)?.role_name || a.role_id;
                                return (
                                  <li key={idx}>
                                    <span className="font-medium">{member?.name || a.employee_id}</span> <span className="text-gray-500">({member?.position})</span> - <span className="text-blue-600">{role}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
