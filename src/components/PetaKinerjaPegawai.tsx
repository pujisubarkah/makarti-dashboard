import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle } from 'lucide-react';

// Tipe data
interface Pegawai {
  nama: string;
  photo_url?: string;
  pegawai_detail?: { photo_url?: string }[];
}

interface Subtask {
  id: number;
  title: string;
  is_done: boolean;
  pegawai?: Pegawai;
}

interface Task {
  id: number;
  title: string;
  status: string;
  subtasks: Subtask[];
}

interface Props {
  tasks?: Task[];
}

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getSubtaskCardBorder = (is_done: boolean) => {
  return is_done ? 'border-green-500' : 'border-red-500';
};

const getSubtaskCardBg = (is_done: boolean) => {
  return is_done ? 'bg-green-50' : 'bg-red-50';
};

const isAllSubtasksDone = (subtasks: Subtask[]) => {
  return subtasks.length > 0 && subtasks.every((s) => s.is_done);
};

const PetaKinerjaPegawai: React.FC<Props> = ({ tasks: fallbackTasks = [] }) => {
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = localStorage.getItem('id'); // gunakan 'id' sesuai instruksi
        if (!userId) {
          console.warn('❌ user_id tidak ditemukan di localStorage');
          setApiTasks(fallbackTasks);
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/tasks/subtasks?id=${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        const parsedTasks: Task[] = (data.tasks || []).map((task: Task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          subtasks: (task.subtasks || []).map((subtask: Subtask) => {
            let photo_url = '';
            if (subtask.pegawai) {
              // Ambil photo_url dari pegawai_detail
              photo_url = subtask.pegawai.pegawai_detail?.[0]?.photo_url || '';
            }
            return {
              id: subtask.id,
              title: subtask.title,
              is_done: Boolean(subtask.is_done),
              pegawai: subtask.pegawai
                ? {
                    nama: subtask.pegawai.nama,
                    photo_url,
                  }
                : undefined,
            };
          }),
        }));
        setApiTasks(parsedTasks);
      } catch (err) {
        console.error('💥 Error fetching tasks:', err);
        setError((err instanceof Error ? err.message : 'Gagal memuat data'));
        setApiTasks(fallbackTasks);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [fallbackTasks]);

  const dataToShow = apiTasks.length > 0 ? apiTasks : fallbackTasks;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 min-h-[400px]">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Peta Kinerja Pegawai</h2>
      <div className="flex flex-row flex-wrap gap-8 justify-center items-start w-full">
        {dataToShow.length === 0 ? (
          <p className="text-gray-500">Tidak ada tugas ditemukan.</p>
        ) : (
          dataToShow.map((task) => (
            <div key={task.id} className="flex flex-col items-center w-full max-w-xs min-w-[260px] flex-1">
              {/* Task Node tanpa status warna, tambahkan icon checklist jika semua subtasks selesai */}
              <div className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow font-bold text-lg mb-4 gap-2 w-full justify-center">
                <span>{task.title}</span>
                {isAllSubtasksDone(task.subtasks) ? (
                  <span title="Semua subtasks selesai">
                    <CheckCircle size={24} color="#22c55e" />
                  </span>
                ) : (
                  <span title="Masih ada subtasks belum selesai">
                    <XCircle size={24} color="#ef4444" />
                  </span>
                )}
              </div>
              {/* Garis penghubung */}
              {task.subtasks.length > 0 && (
                <div className="h-6 w-1 bg-blue-300 my-2" />
              )}
              {/* Subtasks */}
              <div className="flex flex-wrap justify-center gap-6">
                {task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <div key={subtask.id} className={`flex flex-col items-center max-w-[200px] p-2 border-2 rounded-lg shadow ${getSubtaskCardBorder(subtask.is_done)} ${getSubtaskCardBg(subtask.is_done)}`}> 
                      {/* Title subtask di atas */}
                      <div className="text-gray-800 font-medium text-center mb-2">
                        {subtask.title}
                      </div>
                      {/* Nama dan photo pegawai di bawah title */}
                      {subtask.pegawai && (
                        <div className="flex flex-col items-center gap-2">
                          {subtask.pegawai.photo_url ? (
                            <Image
                              src={subtask.pegawai.photo_url}
                              alt={subtask.pegawai.nama}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-400"
                              priority
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white border-2 border-gray-400">
                              {getInitials(subtask.pegawai.nama)}
                            </div>
                          )}
                          <span className="text-xs text-gray-700 font-medium text-center px-2">
                            {subtask.pegawai.nama}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Tidak ada subtask.</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PetaKinerjaPegawai;