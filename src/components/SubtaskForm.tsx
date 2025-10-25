import React, { useState } from 'react';
import useSWR from 'swr';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2, User, Calendar, CheckCircle } from 'lucide-react';

interface Employee {
  id: number;
  nama: string;
  jabatan: string;
}

import type { Subtask, Task } from "../../types/task";
interface SubtaskFormProps {
  selectedTask: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}

// Helper function to refresh task data from API
async function refreshTaskProgress(taskId: number): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`);
    if (response.ok) {
      const updatedTask = await response.json();
      return updatedTask;
    }
  } catch (error) {
    console.error('Error refreshing task progress:', error);
  }
  return null;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({ selectedTask, setTasks, tasks }) => {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const unitKerjaId = typeof window !== "undefined" ? localStorage.getItem('id') : undefined;
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  
  const { data: employeesData } = useSWR(
    unitKerjaId ? `/api/employee/unit/${unitKerjaId}` : null,
    fetcher
  );
  const employees: Employee[] = employeesData || [];

  // Fetch subtasks for the selected task
  const { data: subtasksData, mutate: mutateSubtasks } = useSWR(
    selectedTask ? `/api/subtasks?task_id=${selectedTask.id}` : null,
    fetcher
  );
  const subtasks: Subtask[] = subtasksData?.subtasks || [];

  const handleAddSubtask = async () => {
    if (!title) return;
    setLoading(true);

    try {
      const requestData = {
        task_id: Number(selectedTask.id),
        title,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      };
      
      console.log('Creating subtask with data:', requestData);
      
      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const newSubtask = await response.json();
        console.log('Subtask created successfully:', newSubtask);
        
        // Refresh subtasks list
        mutateSubtasks();
        
        // Refresh task progress from API
        const updatedTask = await refreshTaskProgress(selectedTask.id);
        if (updatedTask) {
          setTasks(tasks.map(task =>
            task.id === selectedTask.id ? { ...task, progress: updatedTask.progress } : task
          ));
        }
        
        // Reset form
        setTitle('');
        setAssignedTo('');
      } else {
        const errorData = await response.json();
        console.error('Failed to create subtask:', errorData);
        alert(errorData.error || 'Gagal membuat subtask');
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert('Terjadi kesalahan saat membuat subtask');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtasks: [{
            id: subtaskId,
            is_done: !currentStatus,
          }]
        })
      });

      if (response.ok) {
        console.log('Subtask status updated successfully');
        mutateSubtasks();
        
        // Refresh task progress from API after toggle
        const updatedTask = await refreshTaskProgress(selectedTask.id);
        if (updatedTask) {
          setTasks(tasks.map(task =>
            task.id === selectedTask.id ? { ...task, progress: updatedTask.progress } : task
          ));
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to update subtask:', errorData);
        alert(errorData.error || 'Gagal mengupdate status subtask');
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      alert('Terjadi kesalahan saat mengupdate subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus subtask ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subtasks?id=${subtaskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Subtask deleted successfully');
        mutateSubtasks();
        
        // Refresh task progress from API after delete
        const updatedTask = await refreshTaskProgress(selectedTask.id);
        if (updatedTask) {
          setTasks(tasks.map(task =>
            task.id === selectedTask.id 
              ? { ...task, progress: updatedTask.progress, subtasks: task.subtasks.filter(s => s.id !== subtaskId) }
              : task
          ));
        } else {
          // Fallback: just remove subtask from local state
          setTasks(
            tasks.map(task =>
              task.id === selectedTask.id
                ? { ...task, subtasks: task.subtasks.filter(s => s.id !== subtaskId) }
                : task
            )
          );
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete subtask:', errorData);
        alert(errorData.error || 'Gagal menghapus subtask');
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
      alert('Terjadi kesalahan saat menghapus subtask');
    }
  };

  return (
    <div className="space-y-6">
      {/* Form tambah subtask */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-blue-200 w-full max-w-xl mx-auto">
        {/* Judul Subtask */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="subtask-title" className="font-semibold text-gray-700">Judul Subtask</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-blue-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6M12 9v6"/></svg>
            </span>
            <textarea
              id="subtask-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Masukkan judul subtask (boleh panjang)"
              rows={2}
              className="pl-10 py-2 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm w-full resize-vertical min-h-[48px]"
              style={{ fontSize: '1rem' }}
            />
          </div>
        </div>
        {/* Orang yang mengerjakan */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="subtask-assigned" className="font-semibold text-gray-700">Orang yang mengerjakan</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-green-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
            </span>
            <select
              id="subtask-assigned"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="pl-10 py-2 rounded-xl border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm w-full"
              style={{ fontSize: '1rem' }}
            >
              <option value="">Pilih penanggung jawab...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nama} {emp.jabatan ? `- ${emp.jabatan}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Tombol tambah subtask */}
        <Button
          onClick={handleAddSubtask}
          disabled={!title || loading}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold px-7 py-2 rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-green-600 transition-transform duration-200 focus:ring-2 focus:ring-blue-300 w-full"
        >
          <span className="inline-flex items-center gap-2 justify-center">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            {loading ? 'Menambahkan...' : 'Tambah Subtask'}
          </span>
        </Button>
      </div>

      {/* List Subtasks */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Daftar Subtasks</h3>
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
            {subtasks.length} item
          </span>
        </div>

        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Belum ada subtask</p>
            <p className="text-xs text-gray-400 mt-1">Tambahkan subtask untuk memecah tugas menjadi bagian kecil</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
                  subtask.is_done 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
              >
                <Checkbox
                  checked={subtask.is_done}
                  onCheckedChange={() => handleToggleSubtask(subtask.id, subtask.is_done)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${subtask.is_done ? 'line-through text-green-600' : 'text-gray-800'}`}>
                    {subtask.title}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {subtask.pegawai && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{subtask.pegawai.nama}</span>
                        {subtask.pegawai.jabatan && (
                          <span className="text-gray-400">• {subtask.pegawai.jabatan}</span>
                        )}
                      </div>
                    )}
                    {subtask.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(subtask.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                  title="Hapus subtask"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {subtasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress:</span>
              <span className="font-medium">
                {subtasks.filter(s => s.is_done).length} dari {subtasks.length} selesai
                ({Math.round((subtasks.filter(s => s.is_done).length / subtasks.length) * 100)}%)
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(subtasks.filter(s => s.is_done).length / subtasks.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtaskForm;
