import { Users, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Ambil struktur dan logic dari ReportView
interface TeamMember {
  id: number;
  name: string;
  position: string;
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
  description: string;
  location: string;
  assignments: EventAssignment[];
  duration: string;
}

export default function ActivityTimeline() {
  const [eventData, setEventData] = useState<ReportData[]>([]);
  const [teamData, setTeamData] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Ambil data event dan tim dari API (seperti ReportView)
    const fetchData = async () => {
      const unitKerjaId = localStorage.getItem('id') || '4';
      const [eventRes, teamRes] = await Promise.all([
        fetch(`/api/kegiatan/${unitKerjaId}`),
        fetch(`/api/employee/unit/${unitKerjaId}`)
      ]);
      let events: ReportData[] = [];
      let team: TeamMember[] = [];
      if (eventRes.ok) {
        const apiEvents = await eventRes.json() as Array<{
          id: number;
          date: string;
          title: string;
          status?: string;
          description?: string;
          location?: string;
          assignments?: EventAssignment[];
          time?: string;
        }>;

        events = apiEvents.map((ev) => ({
          id: ev.id,
          date: new Date(ev.date),
          initiative: ev.title,
          status: ev.status || 'Scheduled',
          description: ev.description || '',
          location: ev.location || '-',
          assignments: Array.isArray(ev.assignments) ? ev.assignments : [],
          duration: ev.time || '-',
        }));
      }
      if (teamRes.ok) {
        const apiEmployees = await teamRes.json();
        // Handle if response is { data: [...] } or just [...]
        const employeesArray = Array.isArray(apiEmployees)
          ? apiEmployees
          : Array.isArray(apiEmployees.data)
            ? apiEmployees.data
            : [];
        team = employeesArray.map((emp: { id: number; nama: string; jabatan: string; }) => ({
          id: emp.id,
          name: emp.nama,
          position: emp.jabatan,
          avatar: "/avatar.png"
        }));
      }
      setEventData(events);
      setTeamData(team);
    };
    fetchData();
  }, []);

  const getMemberById = (id: number) => teamData.find(m => m.id === id);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <CardTitle>Jadwal Harian</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventData.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Tidak ada kegiatan hari ini</div>
          ) : (
            eventData.map((event) => (
              <div key={event.id} className="relative pl-8 pb-4 last:pb-0">
                {/* Icon status */}
                <div className="absolute left-0 top-1 flex items-center justify-center h-8 w-8 rounded-full border-2 z-10 bg-white shadow-sm">
                  {event.status === "Selesai" && (
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  )}
                  {event.status === "Sedang Berlangsung" && (
                    <Clock className="text-yellow-500 w-5 h-5 animate-spin" />
                  )}
                  {event.status !== "Selesai" && event.status !== "Sedang Berlangsung" && (
                    <AlertCircle className="text-gray-400 w-5 h-5" />
                  )}
                </div>
                {/* Line Connector */}
                <div className="absolute left-3.5 top-9 bottom-0 w-px bg-gray-200"></div>
                {/* Content */}
                <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{event.initiative}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === "Selesai"
                        ? "bg-green-100 text-green-700"
                        : event.status === "Sedang Berlangsung"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{event.duration}</span>
                    <Users className="w-3 h-3 ml-4" />
                    <span>{event.assignments.length} anggota</span>
                  </div>
                  {/* Tim terlibat */}
                  <div className="flex -space-x-2 mt-2">
                    {event.assignments.slice(0, 5).map((a) => {
                      const member = getMemberById(a.memberId);
                      if (!member) return null;
                      return (
                        <div key={a.memberId} className="flex flex-col items-center mr-2">
                          <Avatar className="h-7 w-7 border-2 border-white">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-gray-500 mt-1 text-center max-w-[56px] truncate">{a.role}</span>
                        </div>
                      );
                    })}
                    {event.assignments.length > 5 && (
                      <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{event.assignments.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {event.assignments.filter(a => a.confirmed).length} dikonfirmasi
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
