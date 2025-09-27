import React from 'react';
import Image from 'next/image';
import type { Task, Subtask } from '../../types/task';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[parts.length - 1][0];
};


type PegawaiDummy = {
  id: number;
  nama: string;
  jabatan?: string;
  photo_url?: string;
};

type SubtaskDummy = Omit<Subtask, 'pegawai'> & { pegawai?: PegawaiDummy };
type TaskDummy = Omit<Task, 'subtasks'> & { subtasks: SubtaskDummy[] };

type Props = {
  tasks: TaskDummy[];
};

const getStatusCircle = (status: string) => {
  let color = '';
  switch (status) {
    case 'rencana':
      color = 'bg-red-500'; break;
    case 'proses':
      color = 'bg-yellow-400'; break;
    case 'selesai':
      color = 'bg-green-500'; break;
    case 'terhambat':
      color = 'bg-gray-400'; break;
    default:
      color = 'bg-gray-300';
  }
  return <span className={`inline-block w-3 h-3 rounded-full mr-2 align-middle ${color}`}></span>;
};


const dummyTasks: TaskDummy[] = [
  {
    id: 1,
    title: 'Penyusunan SOP Baru',
    status: 'rencana',
    subtasks: [
      {
        id: 101,
        title: 'Draft SOP',
        is_done: false,
        pegawai: { id: 1, nama: 'Budi Santoso', jabatan: 'Staff', photo_url: '' }
      },
      {
        id: 102,
        title: 'Review Manajer',
        is_done: false,
        pegawai: { id: 2, nama: 'Siti Aminah', jabatan: 'Manajer', photo_url: '' }
      }
    ]
  },
  {
    id: 2,
    title: 'Pelatihan Digitalisasi',
    status: 'proses',
    subtasks: [
      {
        id: 201,
        title: 'Persiapan Materi',
        is_done: true,
        pegawai: { id: 3, nama: 'Rudi Hartono', jabatan: 'Trainer', photo_url: '' }
      },
      {
        id: 202,
        title: 'Pelaksanaan Training',
        is_done: false,
        pegawai: { id: 4, nama: 'Dewi Lestari', jabatan: 'Peserta', photo_url: '' }
      }
    ]
  },
  {
    id: 3,
    title: 'Evaluasi Kinerja Bulanan',
    status: 'selesai',
    subtasks: [
      {
        id: 301,
        title: 'Pengumpulan Data',
        is_done: true,
        pegawai: { id: 5, nama: 'Agus Prabowo', jabatan: 'HRD', photo_url: '' }
      },
      {
        id: 302,
        title: 'Rapat Evaluasi',
        is_done: true,
        pegawai: { id: 6, nama: 'Lina Sari', jabatan: 'Supervisor', photo_url: '' }
      }
    ]
  }
];

const PetaKinerjaPegawai: React.FC<Props> = ({ tasks }) => {
  const dataToShow = tasks.length > 0 ? tasks : dummyTasks;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[400px]">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Peta Kinerja Pegawai</h2>
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-12 items-center">
          {dataToShow.map((task) => (
            <div key={task.id} className="flex flex-col items-center w-full">
              {/* Task node */}
              <div className="flex flex-col items-center">
                <div className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow font-bold text-lg mb-2">
                  {task.title}
                </div>
                {/* Status badge di task utama dihilangkan agar lebih clean */}
              </div>
              {/* Connector line */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="h-6 w-1 bg-blue-300 my-2" />
              )}
              {/* Subtasks horizontal */}
              <div className="flex flex-row gap-8 justify-center">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex flex-col items-center">
                      <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow text-gray-800 font-medium">
                        {subtask.title}
                      </div>
                      {subtask.pegawai && (
                        <div className="mt-1 flex items-center gap-2">
                          {getStatusCircle(subtask.is_done ? 'selesai' : 'rencana')}
                          <span className="flex items-center gap-2">
                            {/* Dummy avatar bulat */}
                            <span className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                              {subtask.pegawai.photo_url ? (
                                <Image
                                  src={subtask.pegawai.photo_url}
                                  alt={subtask.pegawai.nama}
                                  width={28}
                                  height={28}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              ) : (
                                getInitials(subtask.pegawai.nama)
                              )}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{subtask.pegawai.nama}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Tidak ada subtask.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetaKinerjaPegawai;
