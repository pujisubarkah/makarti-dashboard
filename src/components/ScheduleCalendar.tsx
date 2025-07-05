"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Clock, 
  MapPin, 
  CalendarDays, 
  Plus, 
  Users, 
  Bell,
  Star,
  ChevronRight
} from "lucide-react";

// Enhanced dummy data untuk kegiatan harian
const dummyEvents = [
  {
    id: 1,
    date: new Date(2025, 6, 5), // July 5, 2025 (current date)
    title: "Rapat Evaluasi Triwulan",
    location: "Ruangan A",
    time: "10:00 - 12:00",
    type: "meeting",
    priority: "high",
    attendees: 12,
    description: "Evaluasi kinerja triwulan dan perencanaan strategi"
  },
  {
    id: 2,
    date: new Date(2025, 6, 5), // July 5, 2025
    title: "Pelatihan Teknologi Baru",
    location: "Zoom Meeting",
    time: "14:00 - 16:00",
    type: "training",
    priority: "medium",
    attendees: 25,
    description: "Workshop implementasi AI dalam workflow"
  },
  {
    id: 3,
    date: new Date(2025, 6, 8), // July 8, 2025
    title: "Kunjungan Lapangan",
    location: "Proyek Site X",
    time: "09:00 - 15:00",
    type: "fieldwork",
    priority: "high",
    attendees: 8,
    description: "Monitoring progress dan quality control"
  },
  {
    id: 4,
    date: new Date(2025, 6, 6), // July 6, 2025
    title: "Presentasi Inovasi Q2",
    location: "Auditorium Utama",
    time: "13:00 - 15:00",
    type: "presentation",
    priority: "high",
    attendees: 45,
    description: "Showcase inovasi terbaru dari semua unit kerja"
  },
  {
    id: 5,
    date: new Date(2025, 6, 7), // July 7, 2025
    title: "Workshop Bigger Better Smarter",
    location: "Ruangan Training B",
    time: "09:00 - 12:00",
    type: "workshop",
    priority: "medium",
    attendees: 30,
    description: "Sesi kolaboratif peningkatan kualitas layanan"
  }
];

export default function ScheduleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Filter event berdasarkan tanggal yang dipilih
  const filteredEvents = dummyEvents.filter(
    (event) => event.date.toDateString() === date?.toDateString()
  );

  // Function to get event type styling
  const getEventTypeStyle = (type: string, priority: string) => {
    const styles: { [key: string]: any } = {
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

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Kegiatan Hari Ini</p>
                <p className="text-2xl font-bold">{filteredEvents.length}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Peserta</p>
                <p className="text-2xl font-bold">{filteredEvents.reduce((sum, event) => sum + event.attendees, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Prioritas Tinggi</p>
                <p className="text-2xl font-bold">{filteredEvents.filter(event => event.priority === 'high').length}</p>
              </div>
              <Star className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Kalender */}
        <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Pilih Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0 w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-indigo-100 rounded-md transition-colors",
                day_selected: "bg-indigo-500 text-primary-foreground hover:bg-indigo-600 focus:bg-indigo-600",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            
            {/* Quick Add Event Button */}
            <div className="mt-4">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kegiatan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Daftar Kegiatan */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Kegiatan pada {format(date || new Date(), "EEEE, dd MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event, index) => {
                  const eventStyle = getEventTypeStyle(event.type, event.priority);
                  return (
                    <div
                      key={event.id}
                      className={`${eventStyle.bg} ${eventStyle.border} border-l-4 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer group`}
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{eventStyle.icon}</span>
                            <div>
                              <h4 className={`font-semibold ${eventStyle.color} text-lg`}>
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{event.attendees} peserta</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Priority Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(event.priority)}`}>
                              {event.priority === 'high' ? 'Prioritas Tinggi' : 
                               event.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                            </span>
                          </div>

                          {/* Expandable Description */}
                          {selectedEvent?.id === event.id && (
                            <div className="mt-3 p-3 bg-white/50 rounded-lg">
                              <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                  <Bell className="w-4 h-4 mr-1" />
                                  Set Reminder
                                </Button>
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight 
                          className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform ${
                            selectedEvent?.id === event.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada kegiatan</h3>
                <p className="text-gray-500 mb-4">Belum ada kegiatan yang dijadwalkan pada tanggal ini.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kegiatan Baru
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}