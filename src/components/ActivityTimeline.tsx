import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityTimeline() {
  const timelineData = [
    {
      time: "08:00",
      title: "Rapat Pagi Tim Teknis",
      description: "Pembagian tugas proyek Q2",
      status: "completed",
    },
    {
      time: "10:30",
      title: "Pelatihan Sistem Baru",
      description: "Training internal penggunaan AI tools",
      status: "in-progress",
    },
    {
      time: "13:00",
      title: "Makan Siang & Networking",
      description: "Dengan mitra strategis dari Unit A",
      status: "upcoming",
    },
    {
      time: "15:00",
      title: "Review KPI Bulanan",
      description: "Evaluasi pencapaian target unit kerja",
      status: "upcoming",
    },
  ];

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
          {timelineData.map((event, index) => (
            <div key={index} className="relative pl-8 pb-4 last:pb-0">
              {/* Icon */}
              <div className="absolute left-0 top-1 flex items-center justify-center h-8 w-8 rounded-full border-2 z-10 bg-white shadow-sm">
                {event.status === "completed" && (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                )}
                {event.status === "in-progress" && (
                  <Clock className="text-yellow-500 w-5 h-5 animate-spin" />
                )}
                {event.status === "upcoming" && (
                  <AlertCircle className="text-gray-400 w-5 h-5" />
                )}
              </div>

              {/* Line Connector */}
              <div className="absolute left-3.5 top-9 bottom-0 w-px bg-gray-200"></div>

              {/* Content */}
              <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{event.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : event.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {event.status === "completed" ? "Selesai" :
                     event.status === "in-progress" ? "Sedang Berjalan" : "Akan Datang"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <p className="text-xs text-blue-600 mt-2">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}