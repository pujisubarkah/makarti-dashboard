'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Plus, 
  Calendar, 
  Users, 
  Flag, 
  CheckCircle2, 
  Clock, 
  Star,
  Lightbulb,
  Network,
  Megaphone,
  GraduationCap,
  Search,
  MoreHorizontal,
  Edit,
  Filter
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SubtaskForm from "../../../components/SubtaskForm"
import type { Task, Subtask } from "../../../../types/task";

const categories = [
  { 
    id: 'inovasi', 
    name: 'Inovasi', 
    icon: Lightbulb, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50'
  },
  { 
    id: 'networking', 
    name: 'Networking', 
    icon: Network, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'branding', 
    name: 'Branding', 
    icon: Megaphone, 
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50'
  },
  { 
    id: 'learning', 
    name: 'Learning', 
    icon: GraduationCap, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50'
  }
]

export default function TaskPage() {
  const params = useParams()
  const slug = params?.slug as string

  // --- Board logic for Task Management ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // untuk modal subtask
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [uploadFile, setUploadFile] = useState<string>('');
  const [uploadNote, setUploadNote] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  
  // --- Subtasks State ---
  const [subtasksData, setSubtasksData] = useState<any>(null);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true); // Change to true by default

  const handleUploadBukti = async () => {
    if (!editingTask || !uploadFile.trim()) return;
    
    setIsUploading(true);
    try {
      // Here you would implement the actual file upload
      // For now, we'll just simulate it and update the status
      await updateTaskStatus(String(editingTask.id), 'proses');
      
      // Show achievement notification
      setAchievementMessage('🎉 Link bukti berhasil dikirim! +5 XP');
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
      
      setEditingTask(null);
      setUploadFile('');
      setUploadNote('');
    } catch {
      alert('Gagal mengupload bukti tugas');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch subtasks data
  const fetchSubtasks = async () => {
    setSubtasksLoading(true);
    try {
      const pegawaiId = localStorage.getItem('id');
      console.log('Fetching subtasks for pegawai ID:', pegawaiId);
      
      if (!pegawaiId) {
        console.error('Pegawai ID not found in localStorage');
        return;
      }

      const response = await fetch(`/api/subtasks/${pegawaiId}`);
      console.log('Subtasks API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Subtasks data loaded successfully:', data);
        setSubtasksData(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch subtasks. Status:', response.status, 'Error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setSubtasksLoading(false);
    }
  };

  useEffect(() => {
    const currentUserId = localStorage.getItem('id');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (currentUserId) {
      headers['x-user-id'] = currentUserId;
    }
    fetch('/api/tasks', {
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setFilteredTasks(data);
        setLoading(false);
      })
  .catch(() => setLoading(false));

    // Fetch subtasks data on component mount
    fetchSubtasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.pilar === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      const statusToFilter = (status: string) => {
        switch (status) {
          case 'not-started':
            return (task: Task) => task.status === 'rencana';
          case 'in-progress':
            return (task: Task) => task.status === 'proses';
          case 'completed':
            return (task: Task) => task.status === 'selesai';
          case 'blocked':
            return (task: Task) => task.status === 'terhambat';
          default:
            return (task: Task) => task.status === status;
        }
      };
      filtered = filtered.filter(statusToFilter(selectedStatus));
    }
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.label?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedCategory, selectedStatus, searchTerm]);



  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus
        })
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          String(task.id) === String(taskId) 
            ? updatedTask
            : task
        ));
      }
    } catch {
      //
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Handle subtask status update
  const handleUpdateSubtask = async (subtaskId: number, isDone: boolean) => {
    try {
      const response = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: subtaskId,
          is_done: isDone
        })
      });

      if (response.ok) {
        // Refresh subtasks data after update
        fetchSubtasks();
        
        // Show achievement notification
        if (isDone) {
          setAchievementMessage('🎉 Subtask selesai! +2 XP');
          setShowAchievement(true);
          setTimeout(() => setShowAchievement(false), 3000);
        }
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };



  // Note: Drag and drop disabled for employees - status changes only through upload workflow

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  const getLabelColorScheme = (label: string) => {
    const colorSchemes = {
      'inovasi': {
        borderColor: 'border-l-purple-500',
        textColor: 'text-purple-600'
      },
      'networking': {
        borderColor: 'border-l-blue-500',
        textColor: 'text-blue-600'
      },
      'branding': {
        borderColor: 'border-l-green-500',
        textColor: 'text-green-600'
      },
      'learning': {
        borderColor: 'border-l-orange-500',
        textColor: 'text-orange-600'
      }
    };
    return colorSchemes[label as keyof typeof colorSchemes] || {
      borderColor: 'border-l-gray-500',
      textColor: 'text-gray-600'
    };
  }

  const getTasksByStatus = (status: string) => {
    let result: Task[];
    switch (status) {
      case 'not-started':
        result = filteredTasks.filter(task => task.status === 'rencana');
        break;
      case 'in-progress':
        result = filteredTasks.filter(task => task.status === 'proses');
        break;
      case 'completed':
        result = filteredTasks.filter(task => task.status === 'selesai');
        break;
      case 'blocked':
        result = filteredTasks.filter(task => task.status === 'terhambat');
        break;
      default:
        result = filteredTasks.filter(task => task.status === status);
    }
    return result;
  }

  // --- Tab UI ---
  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <p className="font-semibold">{achievementMessage}</p>
        </div>
      )}

      {/* Header dengan Context */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Task Management - {slug}
        </h1>
        <p className="text-blue-100">
          Kelola tugas dan upload bukti penyelesaian dengan sistem gamifikasi
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* --- Task Management Board --- */}
            {loading ? (
              <div className="p-6">
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-600">Loading tugas...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Assignment</h1>
                    <p className="text-gray-600">Kelola tugas yang diberikan dan upload bukti penyelesaian</p>
                  </div>

                  <Button className="bg-gray-400 cursor-not-allowed shadow-lg" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Task Diterima dari Atasan
                  </Button>
                </div>
                {/* Subtasks Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Subtask Saya</h2>
                        <p className="text-gray-600">Tugas-tugas detail yang ditugaskan kepada saya</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowSubtasks(!showSubtasks)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {showSubtasks ? 'Sembunyikan' : 'Tampilkan'} Subtasks
                          {subtasksData?.statistics && (
                            <Badge variant="secondary" className="ml-2">
                              {subtasksData.statistics.total}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          onClick={fetchSubtasks}
                          variant="outline"
                          size="sm"
                          disabled={subtasksLoading}
                          className="flex items-center gap-1"
                        >
                          {subtasksLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Loading...
                            </>
                          ) : (
                            '🔄 Refresh'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {showSubtasks && (
                    <div className="p-6">
                      {/* Debug Info */}
                      <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                        <strong>Debug Info:</strong><br />
                        Pegawai ID: {localStorage.getItem('id')}<br />
                        Subtasks Loading: {subtasksLoading ? 'Yes' : 'No'}<br />
                        Subtasks Data: {subtasksData ? 'Loaded' : 'Not loaded'}<br />
                        Statistics Total: {subtasksData?.statistics?.total || 'N/A'}<br />
                        Grouped Subtasks Count: {subtasksData?.grouped_subtasks?.length || 'N/A'}
                      </div>
                      
                      {subtasksLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-blue-600">Loading subtasks...</span>
                        </div>
                      ) : subtasksData ? (
                        <>
                          {/* Subtask Statistics */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Total Subtasks</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics.total}</p>
                                </div>
                                <div className="text-3xl">📋</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Selesai</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics.completed}</p>
                                </div>
                                <div className="text-3xl">✅</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Pending</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics.pending}</p>
                                </div>
                                <div className="text-3xl">⏳</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Completion</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics.completion_rate}%</p>
                                </div>
                                <div className="text-3xl">🎯</div>
                              </div>
                            </div>
                          </div>

                          {/* Subtasks Cards */}
                          <div className="space-y-6">
                            {subtasksData.grouped_subtasks.map((taskGroup: any) => (
                              <div key={taskGroup.task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                {/* Task Header */}
                                <div className="mb-4 pb-3 border-b border-gray-300">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        {taskGroup.task.title}
                                      </h3>
                                      <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {new Date(taskGroup.task.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                        <Badge 
                                          variant="outline" 
                                          className={`
                                            ${taskGroup.task.status === 'selesai' ? 'bg-green-100 text-green-800' : ''}
                                            ${taskGroup.task.status === 'proses' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${taskGroup.task.status === 'rencana' ? 'bg-gray-100 text-gray-800' : ''}
                                            ${taskGroup.task.status === 'terhambat' ? 'bg-red-100 text-red-800' : ''}
                                          `}
                                        >
                                          {taskGroup.task.status === 'selesai' ? 'Selesai' : 
                                           taskGroup.task.status === 'proses' ? 'Sedang Proses' : 
                                           taskGroup.task.status === 'rencana' ? 'Rencana' : 
                                           taskGroup.task.status === 'terhambat' ? 'Terhambat' : taskGroup.task.status}
                                        </Badge>
                                        {typeof taskGroup.task.progress === 'number' && (
                                          <span className="flex items-center gap-1">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                              <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${taskGroup.task.progress}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-xs">{taskGroup.task.progress}%</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Subtasks Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {taskGroup.subtasks.map((subtask: any) => (
                                    <Card key={subtask.id} className={`hover:shadow-md transition-all duration-200 border-l-4 ${
                                      subtask.is_done ? 'border-green-400 bg-green-50' : 'border-blue-400 bg-white'
                                    }`}>
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex-1">
                                            <h4 className={`font-medium mb-2 ${
                                              subtask.is_done ? 'text-green-800 line-through' : 'text-gray-800'
                                            }`}>
                                              {subtask.title}
                                            </h4>
                                            <div className="text-xs text-gray-500 mb-2">
                                              <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {subtask.pegawai.nama}
                                              </span>
                                              <span className="block mt-1">
                                                {subtask.pegawai.jabatan}
                                              </span>
                                              <span className="block mt-1 text-gray-400">
                                                NIP: {subtask.pegawai.nip}
                                              </span>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant={subtask.is_done ? "secondary" : "default"}
                                            onClick={() => handleUpdateSubtask(subtask.id, !subtask.is_done)}
                                            className={`ml-2 ${
                                              subtask.is_done 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                          >
                                            {subtask.is_done ? (
                                              <>
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Selesai
                                              </>
                                            ) : (
                                              <>
                                                <Clock className="h-4 w-4 mr-1" />
                                                Tandai Selesai
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          Dibuat: {new Date(subtask.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {subtasksData.grouped_subtasks?.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <div className="text-6xl mb-4">📝</div>
                              <h3 className="text-lg font-semibold mb-2">Belum Ada Subtask</h3>
                              <p className="text-sm">Subtask akan muncul di sini ketika atasan menugaskan tugas detail kepada Anda</p>
                            </div>
                          )}

                          {/* Raw Data Display for Debugging */}
                          <div className="mt-6 p-4 bg-gray-100 rounded">
                            <h4 className="font-semibold mb-2">Raw API Response:</h4>
                            <pre className="text-xs overflow-auto max-h-40">
                              {JSON.stringify(subtasksData, null, 2)}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-6xl mb-4">❌</div>
                          <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
                          <p className="text-sm">Tidak dapat memuat data subtask</p>
                          <Button 
                            onClick={fetchSubtasks} 
                            variant="outline" 
                            className="mt-4"
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Overall Progress & Level System */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Progress Keseluruhan - {slug}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <p className="text-sm opacity-90">Level</p>
                            <p className="text-xl font-bold">
                              {Math.floor((tasks.filter(t => t.status === 'selesai').length || 0) / 3) + 1}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="text-sm opacity-90">Total XP</p>
                            <p className="text-xl font-bold">
                              {(tasks.filter(t => t.status === 'selesai').length || 0) * 10}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📈</span>
                          <div>
                            <p className="text-sm opacity-90">Completion Rate</p>
                            <p className="text-xl font-bold">
                              {tasks.length > 0 ? Math.round(((tasks.filter(t => t.status === 'selesai').length || 0) / tasks.length) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <p className="text-sm opacity-90">Streak</p>
                            <p className="text-xl font-bold">
                              {Math.min(tasks.filter(t => t.status === 'selesai').length || 0, 7)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl mb-2">
                        {tasks.filter(t => t.status === 'selesai').length >= 20 ? '🏆' : 
                         tasks.filter(t => t.status === 'selesai').length >= 10 ? '🥇' : 
                         tasks.filter(t => t.status === 'selesai').length >= 5 ? '🥈' : 
                         tasks.filter(t => t.status === 'selesai').length >= 1 ? '🥉' : '🎯'}
                      </div>
                      <p className="text-sm opacity-90">
                        {tasks.filter(t => t.status === 'selesai').length >= 20 ? 'Legendary Performer!' : 
                         tasks.filter(t => t.status === 'selesai').length >= 10 ? 'Gold Achiever!' : 
                         tasks.filter(t => t.status === 'selesai').length >= 5 ? 'Silver Star!' : 
                         tasks.filter(t => t.status === 'selesai').length >= 1 ? 'Bronze Beginner!' : 'Ready to Start!'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress to Next Level */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm opacity-90 mb-1">
                      <span>Progress ke Level Berikutnya</span>
                      <span>{(tasks.filter(t => t.status === 'selesai').length || 0) % 3}/3 tasks</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((tasks.filter(t => t.status === 'selesai').length || 0) % 3) * 33.33}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards berdasarkan Status dengan Gamification */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      status: 'rencana',
                      title: 'Belum Dikerjakan',
                      icon: Clock,
                      bgGradient: 'from-gray-500 to-gray-600',
                      bgLight: 'bg-gray-100',
                      textColor: 'text-gray-600',
                      textDark: 'text-gray-800',
                      borderColor: 'border-gray-500',
                      emoji: '⏳',
                      message: 'Ayo mulai mengerjakan!'
                    },
                    {
                      status: 'proses',
                      title: 'Sedang Review',
                      icon: Star,
                      bgGradient: 'from-yellow-500 to-yellow-600',
                      bgLight: 'bg-yellow-100',
                      textColor: 'text-yellow-600',
                      textDark: 'text-yellow-800',
                      borderColor: 'border-yellow-500',
                      emoji: '⭐',
                      message: 'Menunggu persetujuan'
                    },
                    {
                      status: 'selesai',
                      title: 'Selesai',
                      icon: CheckCircle2,
                      bgGradient: 'from-green-500 to-green-600',
                      bgLight: 'bg-green-100',
                      textColor: 'text-green-600',
                      textDark: 'text-green-800',
                      borderColor: 'border-green-500',
                      emoji: '🎉',
                      message: 'Kerja bagus!'
                    },
                    {
                      status: 'terhambat',
                      title: 'Perlu Revisi',
                      icon: Flag,
                      bgGradient: 'from-red-500 to-red-600',
                      bgLight: 'bg-red-100',
                      textColor: 'text-red-600',
                      textDark: 'text-red-800',
                      borderColor: 'border-red-500',
                      emoji: '🔄',
                      message: 'Perlu diperbaiki'
                    }
                  ].map((statusCard) => {
                    const statusTasks = tasks.filter(task => task.status === statusCard.status);
                    const percentage = tasks.length > 0 ? Math.round((statusTasks.length / tasks.length) * 100) : 0;
                    const IconComponent = statusCard.icon;
                    
                    return (
                      <div
                        key={statusCard.status}
                        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${statusCard.borderColor} hover:scale-105 group overflow-hidden relative`}
                      >
                        {/* Achievement Badge */}
                        {statusCard.status === 'selesai' && statusTasks.length >= 5 && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-2 shadow-lg animate-bounce">
                            <span className="text-xs font-bold">🏆</span>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">{statusCard.emoji}</span>
                                <p className={`text-sm font-medium ${statusCard.textDark}`}>
                                  {statusCard.title}
                                </p>
                              </div>
                              <p className={`text-3xl font-bold ${statusCard.textColor} mb-1`}>
                                {statusTasks.length}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{percentage}% dari total</span>
                                {statusCard.status === 'selesai' && statusTasks.length > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    +{statusTasks.length * 10} XP
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`${statusCard.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${statusCard.bgGradient} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Motivational Message */}
                          <p className="text-xs text-gray-600 text-center italic">
                            {statusCard.message}
                          </p>
                          
                          {/* Special Messages */}
                          {statusCard.status === 'selesai' && statusTasks.length >= 10 && (
                            <div className="mt-2 text-center">
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                                🌟 Task Master! 🌟
                              </span>
                            </div>
                          )}
                          
                          {statusCard.status === 'rencana' && statusTasks.length >= 5 && (
                            <div className="mt-2 text-center">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                💪 Banyak tantangan menanti!
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Filter dan Search */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Cari tugas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Pilar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Pilar</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center">
                                <category.icon className="h-4 w-4 mr-2" />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="not-started">Belum Dikerjakan</SelectItem>
                          <SelectItem value="in-progress">Sedang Review</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="blocked">Perlu Revisi</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedStatus('all');
                        }}
                        className="px-3"
                        title="Bersihkan filter"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Menampilkan {filteredTasks.length} dari {tasks.length} tugas
                    {(searchTerm || (selectedCategory !== 'all') || (selectedStatus !== 'all')) && (
                      <span className="ml-2 text-blue-600">(dengan filter)</span>
                    )}
                  </div>
                </div>
                {/* Board View */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {[
                    { status: 'not-started', title: 'Belum Dikerjakan', icon: Clock, bgColor: 'bg-gray-50', cardBorder: 'border-gray-300' },
                    { status: 'in-progress', title: 'Sedang Review', icon: Star, bgColor: 'bg-yellow-50', cardBorder: 'border-yellow-300' },
                    { status: 'completed', title: 'Selesai', icon: CheckCircle2, bgColor: 'bg-green-50', cardBorder: 'border-green-300' },
                    { status: 'blocked', title: 'Perlu Revisi', icon: Flag, bgColor: 'bg-red-50', cardBorder: 'border-red-300' }
                  ].map(column => {
                    const columnTasks = getTasksByStatus(column.status as Task['status'])
                    const IconComponent = column.icon
                    return (
                      <div 
                        key={column.status} 
                        className={`${column.bgColor} rounded-lg p-4 transition-all duration-200 border-2 ${column.cardBorder}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <IconComponent className="h-5 w-5 mr-2 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                          </div>
                          <Badge variant="secondary" className="bg-gray-200">
                            {columnTasks.length}
                          </Badge>
                        </div>
                        <div className="space-y-3 min-h-[200px]">
                          {columnTasks.map(task => {
                            const categoryData = getCategoryData(task.pilar || 'inovasi');
                            const CategoryIcon = categoryData?.icon || Lightbulb;
                            const labelColors = getLabelColorScheme(task.label ?? '');
                            return (
                              <Card
                                key={task.id}
                                className={`hover:shadow-md transition-all duration-200 border-l-4 ${labelColors.borderColor} hover:scale-[1.02]`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={categoryData?.color}>
                                        <CategoryIcon className="h-3 w-3 mr-1" />
                                        {categoryData?.name}
                                      </Badge>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {task.status === 'rencana' && (
                                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Upload Link Bukti
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                    {task.title}
                                  </h4>
                                  {task.tags && (
                                    <div className="mb-2">
                                      <div className="flex flex-wrap gap-1">
                                        {task.tags.split(',').map((tag, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="outline" 
                                            className="text-xs px-1 py-0 bg-gray-50"
                                          >
                                            {tag.trim()}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {task.created_at ? new Date(task.created_at).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                    <Badge variant="outline" className={`${labelColors.textColor} border-current`}>
                                      {task.label || '-'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Users className="h-3 w-3 mr-1" />
                                      {task.pj_kegiatan || '-'}
                                    </span>
                                  </div>
                                  {typeof task.progress === 'number' && (
                                    <div className="mt-3">
                                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{task.progress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                          {columnTasks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Tidak ada tugas</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* Modal Subtasks */}
                  {selectedTask && (
                    <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Subtasks untuk: {selectedTask?.title ?? ''}</DialogTitle>
                        </DialogHeader>
                        {selectedTask && (
                          <SubtaskForm selectedTask={selectedTask!} setTasks={setTasks} tasks={tasks} />
                        )}
                        <div className="space-y-3 mt-4">
                          {!selectedTask || selectedTask?.subtasks.length === 0 ? (
                            <div className="text-gray-500">Belum ada subtask.</div>
                          ) : (
                            selectedTask?.subtasks.map((subtask: Subtask) => (
                              <div key={subtask.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <span className={subtask.is_done ? 'line-through text-gray-400' : ''}>{subtask.title}</span>
                                  {subtask.assigned_to && (
                                    <span className="ml-2 text-xs text-blue-600">({subtask.assigned_to})</span>
                                  )}
                                </div>
                                <div>
                                  {subtask.is_done ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-700">Selesai</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Belum</Badge>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {/* Upload Bukti Dialog */}
                  {editingTask && (
                    <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Link Bukti Tugas</DialogTitle>
                          <DialogDescription>
                            Masukkan link Google Drive atau link bukti penyelesaian untuk: {editingTask.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bukti-link">Link Bukti (Google Drive/URL)</Label>
                            <Input
                              id="bukti-link"
                              type="url"
                              placeholder="https://drive.google.com/file/... atau link lainnya"
                              onChange={(e) => setUploadFile(e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Pastikan file dapat diakses dengan link yang dibagikan
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="catatan">Catatan (Opsional)</Label>
                            <Input
                              id="catatan"
                              value={uploadNote}
                              onChange={(e) => setUploadNote(e.target.value)}
                              placeholder="Tambahkan catatan mengenai penyelesaian tugas..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={handleUploadBukti} 
                              disabled={!uploadFile.trim() || isUploading}
                              className="flex-1"
                            >
                              {isUploading ? 'Mengirim...' : 'Kirim Link untuk Review'}
                            </Button>
                            <Button variant="outline" onClick={() => setEditingTask(null)} className="flex-1">
                              Batal
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </>
            )}
      </div>
    </div>
  );
}