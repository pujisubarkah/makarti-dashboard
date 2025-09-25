import React, { useState } from 'react';
import useSWR from 'swr';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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

  const handleAddSubtask = () => {
    if (!title) return;
    setLoading(true);
    const selectedEmployee = employees.find(emp => String(emp.id) === assignedTo);
    const newSubtask: Subtask = {
      id: Date.now(),
      title,
      is_done: false,
      assigned_to: selectedEmployee ? selectedEmployee.nama : '',
      created_at: new Date().toISOString(),
    };
    setTasks(
      tasks.map(task =>
        task.id === selectedTask.id
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      )
    );
    setTitle('');
    setAssignedTo('');
    setLoading(false);
  };

  return (
    <div className="mb-6">
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
            Tambah Subtask
          </span>
        </Button>
      </div>
    </div>
  );
};

export default SubtaskForm;
