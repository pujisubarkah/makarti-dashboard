"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Clock, 
  MapPin, 
  CalendarDays, 
  Plus, 
  Users, 
  Bell,
  Star,
  ChevronRight,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";

// Interface untuk event dari API
interface Event {
  id: number;
  date: string | Date;
  title: string;
  location?: string;
  time?: string;
  type?: string;
  priority?: string;
  attendees?: number;
  description?: string;
  unit_kerja_id: number;
  created_at?: string;
}

// Interface untuk form data
interface EventFormData {
  title: string;
  date: string;
  location: string;
  time: string;
  type: string;
  priority: string;
  attendees: number;
  description: string;
}

export default function ScheduleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Form data untuk tambah/edit event
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    location: "",
    time: "",
    type: "meeting",
    priority: "medium",
    attendees: 0,
    description: ""
  });

  // Load events from API
  useEffect(() => {
    // Delay untuk memastikan localStorage sudah terisi
    const timer = setTimeout(() => {
      fetchEvents();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true); // Set loading state
      const unitKerjaId = localStorage.getItem('id');
      
      if (!unitKerjaId) {
        toast.error('Unit kerja ID tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await fetch(`/api/kegiatan/${unitKerjaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Handle both response formats: array directly or {success, data} object
      let events = [];
      if (Array.isArray(data)) {
        // Direct array response
        events = data;
      } else if (data.success && data.data) {
        // Structured response with success flag
        events = data.data;
      } else if (data && !data.success) {
        toast.error(data.message || 'Gagal memuat kegiatan dari server');
        return;
      }

      setEvents(events || []);
      
      if (events && events.length > 0) {
        toast.success(`Berhasil memuat ${events.length} kegiatan`);
      } else {
        toast.info('Tidak ada kegiatan ditemukan');
      }
    } catch {
      toast.error('Gagal memuat kegiatan: terjadi kesalahan tak terduga');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const handleCreateEvent = async () => {
  try {
    const unitKerjaId = localStorage.getItem('id');
    if (!unitKerjaId) {
      toast.error('Unit kerja ID tidak ditemukan');
      return;
    }

    const response = await fetch(`/api/kegiatan/${unitKerjaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      // Jika respon tidak OK, coba baca sebagai teks untuk debugging
      const errorText = await response.text();

      // Coba parse sebagai JSON jika memungkinkan
      let errorMessage = "Gagal menambahkan kegiatan";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Jika parsing gagal, gunakan text mentah
      }

      toast.error(errorMessage);
      return;
    }

    // Parsing JSON hanya jika response.ok
    const data = await response.json();

    // Jika API mengembalikan pesan sukses meskipun success: false
    if (data.success === false && /berhasil/i.test(data.message)) {
      toast.info(data.message); // Contoh: "Data tersimpan, notifikasi gagal"
    } else if (data.success !== false) {
      toast.success('Kegiatan berhasil ditambahkan');
      setShowAddDialog(false);
      resetForm();
      fetchEvents(); // Refresh daftar kegiatan
    } else {
      toast.error(data.message || 'Gagal menambahkan kegiatan');
    }

  } catch {
    toast.error("Terjadi kesalahan saat menambahkan kegiatan");
  }
};
  // Update event
  const handleUpdateEvent = async () => {
    try {
      const unitKerjaId = localStorage.getItem('id');
      if (!unitKerjaId || !editingEvent) {
        toast.error('Data tidak lengkap');
        return;
      }

      const response = await fetch(`/api/kegiatan/${unitKerjaId}/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kegiatan berhasil diperbarui');
        setShowEditDialog(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
      } else {
        toast.error(data.message || 'Gagal memperbarui kegiatan');
      }
    } catch {
      toast.error('Gagal memperbarui kegiatan');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    try {
      const unitKerjaId = localStorage.getItem('id');
      if (!unitKerjaId) {
        toast.error('Unit kerja ID tidak ditemukan');
        return;
      }

      const response = await fetch(`/api/kegiatan/${unitKerjaId}/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kegiatan berhasil dihapus');
        fetchEvents();
      } else {
        toast.error(data.message || 'Gagal menghapus kegiatan');
      }
    } catch {
      toast.error('Gagal menghapus kegiatan');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      location: "",
      time: "",
      type: "meeting",
      priority: "medium",
      attendees: 0,
      description: ""
    });
  };

  // Open edit dialog
  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: typeof event.date === 'string' ? event.date.split('T')[0] : format(new Date(event.date), "yyyy-MM-dd"),
      location: event.location || "",
      time: event.time || "",
      type: event.type || "meeting",
      priority: event.priority || "medium",
      attendees: event.attendees || 0,
      description: event.description || ""
    });
    setShowEditDialog(true);
  };

  // Filter event berdasarkan tanggal yang dipilih
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const selectedDate = date?.toDateString();
    const eventDateString = eventDate.toDateString();
    
    return eventDateString === selectedDate;
  });

  // Function to get event type styling
  const getEventTypeStyle = (type: string, priority: string): { bg: string; border: string; icon: string; color: string } => {
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
                <p className="text-2xl font-bold">{filteredEvents.reduce((sum, event) => sum + (event.attendees || 0), 0)}</p>
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
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kegiatan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Tambah Kegiatan Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Kegiatan</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Masukkan judul kegiatan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Waktu</Label>
                      <Input
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        placeholder="09:00 - 12:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Lokasi</Label>
                      <Select value={formData.location} onValueChange={(value) => {
                        if (value === 'custom') {
                          setFormData({...formData, location: ''});
                        } else {
                          setFormData({...formData, location: value});
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih atau ketik lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ruang Meeting A">📍 Ruang Meeting A</SelectItem>
                          <SelectItem value="Ruang Meeting B">📍 Ruang Meeting B</SelectItem>
                          <SelectItem value="Auditorium">📍 Auditorium</SelectItem>
                          <SelectItem value="Ruang Training">📍 Ruang Training</SelectItem>
                          <SelectItem value="Zoom Meeting">💻 Zoom Meeting</SelectItem>
                          <SelectItem value="Google Meet: meet.google.com/xyz-abc-123">💻 Google Meet</SelectItem>
                          <SelectItem value="Microsoft Teams - Channel: Rapat Harian">💻 Microsoft Teams</SelectItem>
                          <SelectItem value="Webex">💻 Webex</SelectItem>
                          <SelectItem value="Hybrid (Ruangan + Online)">🔗 Hybrid (Ruangan + Online)</SelectItem>
                          <SelectItem value="custom">✏️ Lokasi Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Input manual jika pilih custom atau tidak ada di preset */}
                      {(!formData.location || 
                        !['Ruang Meeting A', 'Ruang Meeting B', 'Auditorium', 'Ruang Training', 
                          'Zoom Meeting', 'Google Meet: meet.google.com/xyz-abc-123', 'Microsoft Teams - Channel: Rapat Harian', 'Webex', 
                          'Hybrid (Ruangan + Online)'].includes(formData.location)) && (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Ketik lokasi custom (contoh: Zoom ID: 123-456-789)"
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Jenis Kegiatan</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="fieldwork">Fieldwork</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Tinggi</SelectItem>
                          <SelectItem value="medium">Sedang</SelectItem>
                          <SelectItem value="low">Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendees">Jumlah Peserta</Label>
                      <Input
                        id="attendees"
                        type="number"
                        value={formData.attendees}
                        onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Deskripsi kegiatan..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleCreateEvent}>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Daftar Kegiatan */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Kegiatan pada {format(date || new Date(), "EEEE, dd MMMM yyyy")}
              </CardTitle>

          
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat kegiatan...</p>
                <p className="text-xs text-gray-400 mt-2">
                  Unit ID: {localStorage.getItem('id') || 'Tidak ditemukan'}
                </p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const eventStyle = getEventTypeStyle(event.type || 'meeting', event.priority || 'medium');
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
                                {event.time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{event.time}</span>
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{event.attendees || 0} peserta</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Priority Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(event.priority || 'medium')}`}>
                              {event.priority === 'high' ? 'Prioritas Tinggi' : 
                               event.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                            </span>
                          </div>

                          {/* Expandable Description and Actions */}
                          {selectedEvent?.id === event.id && (
                            <div className="mt-3 p-3 bg-white/50 rounded-lg">
                              {event.description && (
                                <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                              )}
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                  <Bell className="w-4 h-4 mr-1" />
                                  Set Reminder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    openEditDialog(event);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Hapus
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
                <div className="text-xs text-gray-400 mb-4 space-y-1">
                  <p>Total events loaded: {events.length}</p>
                  <p>Selected date: {date?.toDateString()}</p>
                  <p>Unit ID: {localStorage.getItem('id') || 'Tidak ditemukan'}</p>
                  {events.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Semua events:</p>
                      {events.map((event, index) => (
                        <p key={index} className="text-xs">
                          {index + 1}. {event.title} - {new Date(event.date).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kegiatan Baru
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Kegiatan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul Kegiatan</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Masukkan judul kegiatan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Waktu</Label>
              <Input
                id="edit-time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                placeholder="09:00 - 12:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Lokasi</Label>
              <Select value={formData.location} onValueChange={(value) => {
                if (value === 'custom') {
                  setFormData({...formData, location: ''});
                } else {
                  setFormData({...formData, location: value});
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih atau ketik lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ruang Meeting A">📍 Ruang Meeting A</SelectItem>
                  <SelectItem value="Ruang Meeting B">📍 Ruang Meeting B</SelectItem>
                  <SelectItem value="Auditorium">📍 Auditorium</SelectItem>
                  <SelectItem value="Ruang Training">📍 Ruang Training</SelectItem>
                  <SelectItem value="Zoom Meeting">💻 Zoom Meeting</SelectItem>
                  <SelectItem value="Google Meet: meet.google.com/xyz-abc-123">💻 Google Meet</SelectItem>
                  <SelectItem value="Microsoft Teams - Channel: Rapat Harian">💻 Microsoft Teams</SelectItem>
                  <SelectItem value="Webex">💻 Webex</SelectItem>
                  <SelectItem value="Hybrid (Ruangan + Online)">🔗 Hybrid (Ruangan + Online)</SelectItem>
                  <SelectItem value="custom">✏️ Lokasi Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {/* Input manual jika pilih custom atau tidak ada di preset */}
              {(!formData.location || 
                !['Ruang Meeting A', 'Ruang Meeting B', 'Auditorium', 'Ruang Training', 
                  'Zoom Meeting', 'Google Meet: meet.google.com/xyz-abc-123', 'Microsoft Teams - Channel: Rapat Harian', 'Webex', 
                  'Hybrid (Ruangan + Online)'].includes(formData.location)) && (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ketik lokasi custom (contoh: Zoom ID: 123-456-789)"
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Jenis Kegiatan</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="fieldwork">Fieldwork</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Prioritas</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-attendees">Jumlah Peserta</Label>
              <Input
                id="edit-attendees"
                type="number"
                value={formData.attendees}
                onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Deskripsi kegiatan..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingEvent(null);
              resetForm();
            }}>
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleUpdateEvent}>
              <Save className="w-4 h-4 mr-2" />
              Perbarui
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
