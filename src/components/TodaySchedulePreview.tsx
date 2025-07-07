"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

// Types
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

interface TodayEvent {
  id: number;
  title: string;
  time: string;
  location: string;
  type: string;
  priority: string;
  assignments: EventAssignment[];
}

// Today's events preview data
const todayEvents: TodayEvent[] = [
  {
    id: 1,
    title: "Rapat Pagi Tim Teknis",
    time: "08:30 - 10:00",
    location: "Ruangan A",
    type: "meeting",
    priority: "high",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true },
      { memberId: 3, role: "presenter", confirmed: true },
      { memberId: 6, role: "technical_support", confirmed: true },
      { memberId: 8, role: "participant", confirmed: false }
    ]
  },
  {
    id: 2,
    title: "Workshop MAKARTI Implementation",
    time: "10:30 - 12:00",
    location: "Auditorium",
    type: "workshop",
    priority: "medium",
    assignments: [
      { memberId: 2, role: "trainer", confirmed: true },
      { memberId: 4, role: "facilitator", confirmed: true },
      { memberId: 5, role: "facilitator", confirmed: true },
      { memberId: 7, role: "coordinator", confirmed: true }
    ]
  },
  {
    id: 3,
    title: "Presentasi Inovasi Q2",
    time: "14:00 - 16:00",
    location: "Meeting Room B",
    type: "presentation",
    priority: "high",
    assignments: [
      { memberId: 1, role: "moderator", confirmed: true },
      { memberId: 2, role: "presenter", confirmed: true },
      { memberId: 3, role: "presenter", confirmed: true },
      { memberId: 6, role: "technical_support", confirmed: true },
      { memberId: 7, role: "coordinator", confirmed: false }
    ]
  }
];

// Sample team members
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Ahmad Sutrisno",
    position: "Kepala Unit Pengembangan",
    avatar: "/avatar.png"
  },
  {
    id: 2,
    name: "Siti Nurhaliza, M.Kom",
    position: "Senior Analis Kebijakan",
    avatar: "/avatar.png"
  },
  {
    id: 3,
    name: "Budi Santoso",
    position: "Lead Developer",
    avatar: "/avatar.png"
  },
  {
    id: 4,
    name: "Rina Marlina, S.Pd",
    position: "Training Specialist",
    avatar: "/avatar.png"
  },
  {
    id: 5,
    name: "Agus Wijaya",
    position: "Facilitator Senior",
    avatar: "/avatar.png"
  },
  {
    id: 6,
    name: "Lisa Permata, S.T",
    position: "IT Support Specialist",
    avatar: "/avatar.png"
  },
  {
    id: 7,
    name: "Hendra Gunawan",
    position: "Project Coordinator",
    avatar: "/avatar.png"
  },
  {
    id: 8,
    name: "Maya Sari, M.Si",
    position: "Research Assistant",
    avatar: "/avatar.png"
  }
];

export default function TodaySchedulePreview() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getMemberById = (id: number) => {
    return teamMembers.find(member => member.id === id);
  };

  const getEventTypeStyle = (type: string, priority: string) => {
    const styles: { [key: string]: { bg: string; border: string; icon: string; color: string } } = {
      meeting: {
        bg: priority === 'high' ? 'bg-red-50' : 'bg-blue-50',
        border: priority === 'high' ? 'border-red-200' : 'border-blue-200',
        icon: '👥',
        color: priority === 'high' ? 'text-red-700' : 'text-blue-700'
      },
      workshop: {
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        icon: '🛠️',
        color: 'text-teal-700'
      },
      presentation: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: '📊',
        color: 'text-orange-700'
      },
      training: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: '🎓',
        color: 'text-purple-700'
      }
    };
    return styles[type] || styles.meeting;
  };

  const isEventActive = (timeRange: string) => {
    const [startTime, endTime] = timeRange.split(' - ');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const nowMinutes = currentHour * 60 + currentMinute;
    
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  };

  const getUniqueParticipants = () => {
    const participantIds = new Set<number>();
    todayEvents.forEach(event => {
      event.assignments.forEach(assignment => {
        if (assignment.confirmed) {
          participantIds.add(assignment.memberId);
        }
      });
    });
    return Array.from(participantIds);
  };

  const uniqueParticipants = getUniqueParticipants();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-orange-500" />
          Jadwal Hari Ini
          <Badge variant="secondary" className="ml-2">
            {todayEvents.length} acara
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Events */}
        <div className="space-y-3">
          {todayEvents.map((event) => {
            const style = getEventTypeStyle(event.type, event.priority);
            const isActive = isEventActive(event.time);
            const confirmedAssignments = event.assignments.filter(a => a.confirmed);
            
            return (
              <div 
                key={event.id} 
                className={`
                  ${style.bg} border ${style.border} rounded-lg p-3 transition-all duration-200
                  ${isActive ? 'ring-2 ring-orange-300 shadow-md' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{style.icon}</span>
                      <h4 className={`font-medium text-sm ${style.color}`}>
                        {event.title}
                      </h4>
                      {isActive && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div className="flex -space-x-2">
                      {confirmedAssignments.slice(0, 4).map((assignment) => {
                        const member = getMemberById(assignment.memberId);
                        if (!member) return null;
                        
                        return (
                          <Avatar key={assignment.memberId} className="h-6 w-6 border-2 border-white">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {confirmedAssignments.length > 4 && (
                        <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{confirmedAssignments.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {confirmedAssignments.length} tim
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm text-gray-700">Tim Terlibat Hari Ini</h4>
            <Badge variant="outline" className="text-xs">
              {uniqueParticipants.length} orang
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {uniqueParticipants.slice(0, 8).map((participantId) => {
              const member = getMemberById(participantId);
              if (!member) return null;
              
              return (
                <div key={participantId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs bg-white text-gray-700">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-700">
                    {member.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
            {uniqueParticipants.length > 8 && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                <span className="text-xs text-gray-700">+{uniqueParticipants.length - 8}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
