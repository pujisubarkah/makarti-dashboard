"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { 
  Clock, 
  MapPin, 
  CalendarDays, 
  Plus, 
  Users, 
  Bell,
  UserPlus,
  Eye,
  Trash2,
  CheckCircle
} from "lucide-react";

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
  email: string;
  phone: string;
  department: string;
  status: string;
  expertise: string[];
  avatar?: string;
}

interface EventAssignment {
  memberId: number;
  role: string;
  confirmed: boolean;
  assignedAt: Date;
  notes?: string;
}

interface Event {
  id: number;
  date: Date;
  title: string;
  location: string;
  time: string;
  type: string;
  priority: string;
  description: string;
  assignments: EventAssignment[];
  requiredRoles: string[];
  maxParticipants: number;
}

// Sample events data with more detailed assignments
const sampleEvents: Event[] = [
  {
    id: 1,
    date: new Date(2025, 6, 7), // July 7, 2025 (today)
    title: "Rapat Pagi Tim Teknis",
    location: "Ruangan A",
    time: "08:30 - 10:00",
    type: "meeting",
    priority: "high",
    description: "Evaluasi progress proyek dan koordinasi teknis mingguan",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true, assignedAt: new Date(), notes: "Moderator utama" },
      { memberId: 3, role: "presenter", confirmed: true, assignedAt: new Date() },
      { memberId: 6, role: "technical_support", confirmed: true, assignedAt: new Date() },
      { memberId: 8, role: "participant", confirmed: false, assignedAt: new Date() }
    ],
    requiredRoles: ["moderator", "presenter", "technical_support"],
    maxParticipants: 12
  },
  {
    id: 2,
    date: new Date(2025, 6, 7),
    title: "Workshop MAKARTI Implementation",
    location: "Auditorium",
    time: "10:30 - 12:00",
    type: "workshop",
    priority: "medium",
    description: "Workshop implementasi framework MAKARTI untuk semua unit",
    assignments: [
      { memberId: 2, role: "trainer", confirmed: true, assignedAt: new Date() },
      { memberId: 4, role: "facilitator", confirmed: true, assignedAt: new Date() },
      { memberId: 5, role: "facilitator", confirmed: true, assignedAt: new Date() },
      { memberId: 7, role: "coordinator", confirmed: true, assignedAt: new Date() }
    ],
    requiredRoles: ["trainer", "facilitator", "coordinator"],
    maxParticipants: 30
  },
  {
    id: 3,
    date: new Date(2025, 6, 7),
    title: "Presentasi Inovasi Q2",
    location: "Meeting Room B",
    time: "14:00 - 16:00",
    type: "presentation",
    priority: "high",
    description: "Showcase inovasi terbaru dari semua unit kerja",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true, assignedAt: new Date() },
      { memberId: 2, role: "presenter", confirmed: true, assignedAt: new Date() },
      { memberId: 3, role: "presenter", confirmed: true, assignedAt: new Date() },
      { memberId: 6, role: "technical_support", confirmed: true, assignedAt: new Date() },
      { memberId: 7, role: "coordinator", confirmed: false, assignedAt: new Date() }
    ],
    requiredRoles: ["moderator", "presenter", "technical_support"],
    maxParticipants: 25
  },
  {
    id: 4,
    date: new Date(2025, 6, 8), // Tomorrow
    title: "Kunjungan Lapangan Site Monitoring",
    location: "Proyek Site X",
    time: "09:00 - 15:00",
    type: "fieldwork",
    priority: "high",
    description: "Monitoring progress proyek dan quality control lapangan",
    assignments: [
      { memberId: 7, role: "coordinator", confirmed: true, assignedAt: new Date() },
      { memberId: 1, role: "participant", confirmed: true, assignedAt: new Date() },
      { memberId: 8, role: "participant", confirmed: false, assignedAt: new Date() }
    ],
    requiredRoles: ["coordinator", "participant"],
    maxParticipants: 8
  },
  {
    id: 5,
    date: new Date(2025, 6, 8),
    title: "Training Digital Transformation",
    location: "Lab Komputer",
    time: "13:00 - 17:00",
    type: "training",
    priority: "medium",
    description: "Pelatihan implementasi teknologi digital dalam workflow",
    assignments: [
      { memberId: 3, role: "trainer", confirmed: true, assignedAt: new Date() },
      { memberId: 6, role: "technical_support", confirmed: true, assignedAt: new Date() },
      { memberId: 4, role: "facilitator", confirmed: true, assignedAt: new Date() }
    ],
    requiredRoles: ["trainer", "technical_support", "facilitator"],
    maxParticipants: 20
  }
];

// Sample team members data
const sampleTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Ahmad Sutrisno",
    position: "Kepala Unit Pengembangan",
    email: "ahmad.sutrisno@lan.go.id",
    phone: "+62 811-1111-1111",
    department: "Pengembangan SDM",
    status: "active",
    expertise: ["Leadership", "Strategic Planning"],
    avatar: "/avatar.png"
  },
  {
    id: 2,
    name: "Siti Nurhaliza, M.Kom",
    position: "Senior Analis Kebijakan",
    email: "siti.nurhaliza@lan.go.id",
    phone: "+62 812-2222-2222",
    department: "Analisis Kebijakan",
    status: "active",
    expertise: ["Policy Analysis", "Research"],
    avatar: "/avatar.png"
  },
  {
    id: 3,
    name: "Budi Santoso",
    position: "Lead Developer",
    email: "budi.santoso@lan.go.id",
    phone: "+62 813-3333-3333",
    department: "IT Development",
    status: "active",
    expertise: ["Full-stack Development", "System Architecture"],
    avatar: "/avatar.png"
  },
  {
    id: 4,
    name: "Rina Marlina, S.Pd",
    position: "Training Specialist",
    email: "rina.marlina@lan.go.id",
    phone: "+62 814-4444-4444",
    department: "Pengembangan SDM",
    status: "active",
    expertise: ["Training Design", "Adult Learning"],
    avatar: "/avatar.png"
  },
  {
    id: 5,
    name: "Agus Wijaya",
    position: "Facilitator Senior",
    email: "agus.wijaya@lan.go.id",
    phone: "+62 815-5555-5555",
    department: "General Affairs",
    status: "active",
    expertise: ["Facilitation", "Workshop Management"],
    avatar: "/avatar.png"
  },
  {
    id: 6,
    name: "Lisa Permata, S.T",
    position: "IT Support Specialist",
    email: "lisa.permata@lan.go.id",
    phone: "+62 816-6666-6666",
    department: "IT Development",
    status: "active",
    expertise: ["Technical Support", "System Administration"],
    avatar: "/avatar.png"
  },
  {
    id: 7,
    name: "Hendra Gunawan",
    position: "Project Coordinator",
    email: "hendra.gunawan@lan.go.id",
    phone: "+62 817-7777-7777",
    department: "General Affairs",
    status: "active",
    expertise: ["Project Management", "Coordination"],
    avatar: "/avatar.png"
  },
  {
    id: 8,
    name: "Maya Sari, M.Si",
    position: "Research Assistant",
    email: "maya.sari@lan.go.id",
    phone: "+62 818-8888-8888",
    department: "Analisis Kebijakan",
    status: "active",
    expertise: ["Research", "Data Analysis"],
    avatar: "/avatar.png"
  }
];

const eventRoles = [
  { value: "moderator", label: "Moderator", icon: "🎤" },
  { value: "presenter", label: "Presenter", icon: "📊" },
  { value: "facilitator", label: "Facilitator", icon: "🤝" },
  { value: "trainer", label: "Trainer", icon: "🎓" },
  { value: "technical_support", label: "Technical Support", icon: "🔧" },
  { value: "participant", label: "Participant", icon: "👥" },
  { value: "coordinator", label: "Coordinator", icon: "📋" }
];

export default function DailyScheduleWithAvatars() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedMemberToAssign, setSelectedMemberToAssign] = useState<number | null>(null);
  const [assignmentRole, setAssignmentRole] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  // Load team members from API
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const unitKerjaId = localStorage.getItem('unit_kerja_id') || '4';
        const response = await fetch(`/api/employee/${unitKerjaId}`);
        if (response.ok) {
          const apiEmployees: ApiEmployee[] = await response.json();
          const transformedMembers = apiEmployees.map((emp: ApiEmployee) => ({
            id: emp.id,
            name: emp.nama,
            position: emp.jabatan,
            email: `${emp.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@lan.go.id`,
            phone: "+62 8xx-xxxx-xxxx",
            department: getDepartmentFromJabatan(emp.jabatan),
            status: "active",
            expertise: getExpertiseFromJabatan(emp.jabatan),
            avatar: "/avatar.png"
          }));
          setTeamMembers(transformedMembers);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };
    fetchTeamData();
  }, []);

  // Helper functions
  const getDepartmentFromJabatan = (jabatan: string): string => {
    if (jabatan.toLowerCase().includes('kepala') || jabatan.toLowerCase().includes('pimpinan')) {
      return "Pengembangan SDM";
    } else if (jabatan.toLowerCase().includes('analis') || jabatan.toLowerCase().includes('peneliti')) {
      return "Analisis Kebijakan";
    } else if (jabatan.toLowerCase().includes('developer') || jabatan.toLowerCase().includes('it') || jabatan.toLowerCase().includes('sistem')) {
      return "IT Development";
    }
    return "General Affairs";
  };

  const getExpertiseFromJabatan = (jabatan: string): string[] => {
    const expertise: string[] = [];
    if (jabatan.toLowerCase().includes('kepala') || jabatan.toLowerCase().includes('pimpinan')) {
      expertise.push("Leadership", "Strategic Planning");
    }
    if (jabatan.toLowerCase().includes('analis')) {
      expertise.push("Policy Analysis", "Research");
    }
    if (jabatan.toLowerCase().includes('developer')) {
      expertise.push("Development", "Technical Skills");
    }
    return expertise.length > 0 ? expertise : ["General"];
  };

  // Filter events berdasarkan tanggal yang dipilih
  const filteredEvents = events.filter(
    (event) => event.date.toDateString() === date?.toDateString()
  );

  // Get member by ID
  const getMemberById = (id: number): TeamMember | undefined => {
    return teamMembers.find(member => member.id === id);
  };

  // Get event type styling
  const getEventTypeStyle = (type: string, priority: string) => {
    const styles: { [key: string]: { bg: string; border: string; icon: string; color: string } } = {
      meeting: {
        bg: priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100' : 'bg-gradient-to-r from-blue-50 to-blue-100',
        border: priority === 'high' ? 'border-l-red-500' : 'border-l-blue-500',
        icon: '👥',
        color: priority === 'high' ? 'text-red-700' : 'text-blue-700'
      },
      training: {
        bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
        border: 'border-l-purple-500',
        icon: '🎓',
        color: 'text-purple-700'
      },
      fieldwork: {
        bg: 'bg-gradient-to-r from-green-50 to-green-100',
        border: 'border-l-green-500',
        icon: '🏗️',
        color: 'text-green-700'
      },
      presentation: {
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
        border: 'border-l-orange-500',
        icon: '📊',
        color: 'text-orange-700'
      },
      workshop: {
        bg: 'bg-gradient-to-r from-teal-50 to-teal-100',
        border: 'border-l-teal-500',
        icon: '🛠️',
        color: 'text-teal-700'
      }
    };
    return styles[type] || styles.meeting;
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const badges: { [key: string]: string } = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[priority] || badges.medium;
  };

  // Assign member to event
  const assignMemberToEvent = () => {
    if (!selectedEvent || !selectedMemberToAssign || !assignmentRole) return;

    const newAssignment: EventAssignment = {
      memberId: selectedMemberToAssign,
      role: assignmentRole,
      confirmed: false,
      assignedAt: new Date(),
      notes: assignmentNotes
    };

    setEvents(events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          assignments: [...event.assignments, newAssignment]
        };
      }
      return event;
    }));

    // Reset form
    setSelectedMemberToAssign(null);
    setAssignmentRole("");
    setAssignmentNotes("");
    setShowAssignmentDialog(false);
  };

  // Remove assignment
  const removeAssignment = (eventId: number, memberId: number) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          assignments: event.assignments.filter(assignment => assignment.memberId !== memberId)
        };
      }
      return event;
    }));
  };

  // Toggle assignment confirmation
  const toggleAssignmentConfirmation = (eventId: number, memberId: number) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          assignments: event.assignments.map(assignment => {
            if (assignment.memberId === memberId) {
              return { ...assignment, confirmed: !assignment.confirmed };
            }
            return assignment;
          })
        };
      }
      return event;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Acara Hari Ini</p>
                <p className="text-2xl font-bold">{filteredEvents.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Tim Terlibat</p>
                <p className="text-2xl font-bold">
                  {Array.from(new Set(filteredEvents.flatMap(event => event.assignments.map(a => a.memberId)))).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Penugasan Aktif</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.reduce((sum, event) => sum + event.assignments.length, 0)}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Konfirmasi Pending</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.reduce((sum, event) => sum + event.assignments.filter(a => !a.confirmed).length, 0)}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pilih Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Schedule with Avatars */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Harian - {format(date || new Date(), 'dd MMMM yyyy')}
            </CardTitle>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Acara
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Tidak ada acara hari ini</p>
                <p className="text-sm">Pilih tanggal lain untuk melihat jadwal</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const style = getEventTypeStyle(event.type, event.priority);
                const confirmedAssignments = event.assignments.filter(a => a.confirmed);
                const pendingAssignments = event.assignments.filter(a => !a.confirmed);
                
                return (
                  <Card key={event.id} className={`${style.bg} border-l-4 ${style.border} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{style.icon}</span>
                            <h3 className={`font-semibold ${style.color}`}>{event.title}</h3>
                            <Badge className={`text-xs ${getPriorityBadge(event.priority)}`}>
                              {event.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowAssignmentDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Team Assignments with Compact Avatar Display */}
                      <div className="border-t pt-3">
                        {event.assignments.length === 0 ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">Belum ada tim yang ditugaskan</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowAssignmentDialog(true);
                              }}
                              className="text-xs"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign Tim
                            </Button>
                          </div>
                        ) : (
                          <div>
                            {/* Header with count */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Tim Terlibat</span>
                                <Badge variant="secondary" className="text-xs">
                                  {event.assignments.length}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {pendingAssignments.length > 0 && (
                                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                                    {pendingAssignments.length} pending
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowAssignmentDialog(true);
                                  }}
                                  className="text-xs h-6"
                                >
                                  <UserPlus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Compact Avatar Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {event.assignments.map((assignment) => {
                                const member = getMemberById(assignment.memberId);
                                if (!member) return null;
                                
                                const roleInfo = eventRoles.find(r => r.value === assignment.role);
                                
                                return (
                                  <div 
                                    key={`${assignment.memberId}-${assignment.role}`} 
                                    className={`
                                      flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 hover:shadow-sm
                                      ${assignment.confirmed 
                                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                        : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 opacity-80'
                                      }
                                    `}
                                  >
                                    <div className="relative">
                                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarImage src={member.avatar} alt={member.name} />
                                        <AvatarFallback className={`text-xs font-medium ${
                                          assignment.confirmed 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      {/* Status indicator */}
                                      <div className={`
                                        absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center
                                        ${assignment.confirmed ? 'bg-green-500' : 'bg-yellow-500'}
                                      `}>
                                        {assignment.confirmed ? (
                                          <CheckCircle className="h-2 w-2 text-white" />
                                        ) : (
                                          <Clock className="h-2 w-2 text-white" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {member.name.split(' ')[0]} {member.name.split(' ')[1]?.[0]}.
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs">{roleInfo?.icon}</span>
                                        <span className="text-xs text-gray-600 truncate">
                                          {roleInfo?.label}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Quick actions */}
                                    <div className="flex flex-col gap-1">
                                      {!assignment.confirmed && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-4 w-4 p-0 text-green-600 hover:bg-green-100"
                                          onClick={() => toggleAssignmentConfirmation(event.id, assignment.memberId)}
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 text-red-600 hover:bg-red-100"
                                        onClick={() => removeAssignment(event.id, assignment.memberId)}
                                      >
                                        <Trash2 className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Summary stats */}
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {confirmedAssignments.length} dikonfirmasi
                                {pendingAssignments.length > 0 && `, ${pendingAssignments.length} pending`}
                              </span>
                              <span>
                                {event.assignments.length}/{event.maxParticipants} kapasitas
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tugaskan Anggota Tim</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600">{selectedEvent.time} • {selectedEvent.location}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-select">Pilih Anggota Tim</Label>
                  <Select value={selectedMemberToAssign?.toString()} onValueChange={(value) => setSelectedMemberToAssign(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih anggota tim..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers
                        .filter(member => !selectedEvent.assignments.some(a => a.memberId === member.id))
                        .map(member => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role-select">Peran</Label>
                  <Select value={assignmentRole} onValueChange={setAssignmentRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peran..." />
                    </SelectTrigger>
                    <SelectContent>
                      {eventRoles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <span>{role.icon}</span>
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk penugasan..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={assignMemberToEvent}
                  disabled={!selectedMemberToAssign || !assignmentRole}
                >
                  Tugaskan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
