'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Plus, 
  Calendar, 
  Flag, 
  CheckCircle2, 
  Clock, 
  Star,
  MoreHorizontal,
  Edit
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SubtaskForm from "../../../components/SubtaskForm"
import type { Task, Subtask } from "../../../../types/task";

// Interface for Subtasks API response
interface SubtaskStatistics {
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

interface SubtaskPegawai {
  id: number;
  nama: string;
  jabatan: string;
  nip: string;
  unit_kerja: string;
  email: string;
  status_kepegawaian: string;
}

interface SubtaskTask {
  id: number;
  title: string;
  status: string;
  progress: number;
  created_at: string;
}

interface SubtaskSubmission {
  id: number;
  subtask_id: number;
  file_upload: string;
  komentar: string | null;
  submitted_at: string;
  is_revised: boolean;
}

interface SubtaskReview {
  id: number;
  rating: number;
  reviewed_by: number;
  reviewed_at: string;
}

interface SubtaskItem {
  id: number;
  title: string;
  is_done: boolean;
  created_at: string;
  assigned_to: number;
  pegawai: SubtaskPegawai;
  subtask_reviews?: SubtaskReview; // Review info if exists
  subtask_submissions?: SubtaskSubmission; // Submission info if exists
}

interface TaskGroup {
  task: SubtaskTask;
  subtasks: SubtaskItem[];
}

interface SubtasksApiResponse {
  statistics: SubtaskStatistics;
  grouped_subtasks: TaskGroup[];
}



export default function TaskPage() {
  const params = useParams()
  const slug = params?.slug as string

  // --- Board logic for Task Management ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // untuk modal subtask
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [uploadFile, setUploadFile] = useState<string>('');
  const [uploadNote, setUploadNote] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  
  // --- Subtasks State ---
  const [subtasksData, setSubtasksData] = useState<SubtasksApiResponse | null>(null);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true); // Change to true by default
  
  // --- Subtask Upload State ---
  const [editingSubtask, setEditingSubtask] = useState<SubtaskItem | null>(null);
  const [subtaskUploadFile, setSubtaskUploadFile] = useState<string>('');
  const [subtaskUploadNote, setSubtaskUploadNote] = useState<string>('');
  const [isUploadingSubtask, setIsUploadingSubtask] = useState(false);

  const handleUploadBukti = async () => {
    if (!editingTask || !uploadFile.trim()) return;
    
    setIsUploading(true);
    try {
      // Here you would implement the actual file upload
      // For now, we'll just simulate it and update the status
      await updateTaskStatus(String(editingTask.id), 'proses');
      
      // Show achievement notification
      setAchievementMessage('🎉 Bukti berhasil dikirim! Menunggu penilaian  ⭐');
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
      const nip = localStorage.getItem('username'); // Use username as NIP
      console.log('Fetching subtasks for NIP:', nip);
      
      if (!nip) {
        console.error('NIP (username) not found in localStorage');
        return;
      }

      const response = await fetch(`/api/subtasks/${nip}?include_reviews=true&include_submissions=true`);
      console.log('Subtasks API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Subtasks data loaded successfully:', data);
        
        // Transform API response to match expected structure
        const transformedData: SubtasksApiResponse = {
          statistics: {
            total: data.overall_statistics?.total || 0,
            completed: data.overall_statistics?.completed || 0,
            pending: data.overall_statistics?.pending || 0,
            completion_rate: parseFloat(data.overall_statistics?.completion_rate?.replace('%', '') || '0')
          },
          grouped_subtasks: data.grouped_by_task || []
        };
        
        setSubtasksData(transformedData);
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
        setLoading(false);
      })
  .catch(() => setLoading(false));

    // Fetch subtasks data on component mount
    fetchSubtasks();
  }, []);



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
          setAchievementMessage('✅ Subtask ditandai selesai! Menunggu penilaian atasan ⭐');
          setShowAchievement(true);
          setTimeout(() => setShowAchievement(false), 3000);
        }
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  // Handle subtask upload bukti
  const handleSubtaskUpload = async () => {
    if (!editingSubtask || !subtaskUploadFile.trim()) return;
    
    setIsUploadingSubtask(true);
    try {
      // Determine if this is a new submission or revision
      const isRevision = editingSubtask.subtask_submissions?.is_revised;
      const method = isRevision ? 'PUT' : 'POST';
      
      const requestBody = isRevision ? {
        subtask_id: editingSubtask.id,
        file_upload: subtaskUploadFile,
        komentar: subtaskUploadNote || null,
        is_revised: false // Reset revision flag
      } : {
        subtask_id: editingSubtask.id,
        file_upload: subtaskUploadFile,
        komentar: subtaskUploadNote || null
      };
      
      // Submit bukti ke API subtasks_submission
      const response = await fetch('/api/subtasks_submission', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const submissionData = await response.json();
        console.log(`Subtask submission ${isRevision ? 'updated' : 'created'}:`, submissionData);
        
        // Refresh subtasks data after successful submission
        fetchSubtasks();
        
        // Show achievement notification
        const message = isRevision 
          ? '📤 Bukti revisi berhasil diupload! Menunggu review ulang atasan'
          : '📤 Bukti subtask berhasil diupload! Menunggu review & penilaian atasan';
        setAchievementMessage(message);
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 3000);
        
        // Reset form
        setEditingSubtask(null);
        setSubtaskUploadFile('');
        setSubtaskUploadNote('');
      } else {
        const errorData = await response.json();
        console.error('Failed to submit subtask:', errorData);
        
        if (response.status === 409) {
          alert('Bukti sudah pernah diupload untuk subtask ini');
        } else {
          alert(`Gagal mengupload bukti: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error uploading subtask submission:', error);
      alert('Gagal mengupload bukti subtask');
    } finally {
      setIsUploadingSubtask(false);
    }
  };

  // Handle edit subtask
  const handleEditSubtask = (subtask: SubtaskItem) => {
    setEditingSubtask(subtask);
    // Pre-populate form if editing existing submission
    if (subtask.subtask_submissions) {
      setSubtaskUploadFile(subtask.subtask_submissions.file_upload);
      setSubtaskUploadNote(subtask.subtask_submissions.komentar || '');
    } else {
      setSubtaskUploadFile('');
      setSubtaskUploadNote('');
    }
  };



  // Note: Drag and drop disabled for employees - status changes only through upload workflow

  // Helper function to calculate total stars and level
  const calculateStarsAndLevel = () => {
    const completedTasks = tasks.filter(task => task.status === 'selesai');
    
    // Calculate total stars from both main tasks and subtasks
    let totalStars = 0;
    
    // Stars from main tasks
    totalStars += completedTasks.reduce((sum, task) => {
      return sum + (task.rating || 0);
    }, 0);
    
    // Stars from completed subtasks (if any)
    if (subtasksData && subtasksData.grouped_subtasks && Array.isArray(subtasksData.grouped_subtasks)) {
      subtasksData.grouped_subtasks.forEach(taskGroup => {
        if (taskGroup && taskGroup.subtasks && Array.isArray(taskGroup.subtasks)) {
          taskGroup.subtasks.forEach(subtask => {
            if (subtask.is_done && subtask.subtask_reviews?.rating) {
              totalStars += subtask.subtask_reviews.rating;
            }
          });
        }
      });
    }
    
    // Level calculation based on stars: every 15 stars = 1 level up
    const level = Math.floor(totalStars / 15) + 1;
    const starsToNextLevel = 15 - (totalStars % 15);
    
    return { totalStars, level, starsToNextLevel, completedTasks: completedTasks.length };
  };

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  


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
                              {calculateStarsAndLevel().level}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <p className="text-sm opacity-90">Total Bintang</p>
                            <p className="text-xl font-bold">
                              {calculateStarsAndLevel().totalStars}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📈</span>
                          <div>
                            <p className="text-sm opacity-90">Task Selesai</p>
                            <p className="text-xl font-bold">
                              {calculateStarsAndLevel().completedTasks}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="text-sm opacity-90">Completion Rate</p>
                            <p className="text-xl font-bold">
                              {tasks.length > 0 ? Math.round(((tasks.filter(t => t.status === 'selesai').length || 0) / tasks.length) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl mb-2">
                        {calculateStarsAndLevel().level >= 10 ? '🏆' : 
                         calculateStarsAndLevel().level >= 7 ? '🥇' : 
                         calculateStarsAndLevel().level >= 5 ? '🥈' : 
                         calculateStarsAndLevel().level >= 3 ? '🥉' : 
                         calculateStarsAndLevel().level >= 1 ? '🌟' : '🎯'}
                      </div>
                      <p className="text-sm opacity-90">
                        {calculateStarsAndLevel().level >= 10 ? 'Legendary Master!' : 
                         calculateStarsAndLevel().level >= 7 ? 'Gold Achiever!' : 
                         calculateStarsAndLevel().level >= 5 ? 'Silver Star!' : 
                         calculateStarsAndLevel().level >= 3 ? 'Bronze Performer!' :
                         calculateStarsAndLevel().level >= 1 ? 'Rising Star!' : 'Ready to Shine!'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress to Next Level */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm opacity-90 mb-1">
                      <span>Bintang ke Level Berikutnya</span>
                      <span>{calculateStarsAndLevel().starsToNextLevel} bintang lagi</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((15 - calculateStarsAndLevel().starsToNextLevel) / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Rating System Info */}
                  <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⭐</span>
                      <span className="text-sm font-medium">Sistem Penilaian</span>
                    </div>
                    <p className="text-xs opacity-90">
                      
                      Setiap 15 bintang naik 1 level!
                    </p>
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
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                      {statusTasks.reduce((sum, task) => sum + (task.rating || 0), 0)} ⭐
                                    </span>
                                  </div>
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
                                  <p className="text-2xl font-bold">{subtasksData.statistics?.total || 0}</p>
                                </div>
                                <div className="text-3xl">📋</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Selesai</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics?.completed || 0}</p>
                                </div>
                                <div className="text-3xl">✅</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Pending</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics?.pending || 0}</p>
                                </div>
                                <div className="text-3xl">⏳</div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm opacity-90">Completion</p>
                                  <p className="text-2xl font-bold">{subtasksData.statistics?.completion_rate || '0%'}</p>
                                </div>
                                <div className="text-3xl">🎯</div>
                              </div>
                            </div>
                          </div>

                          {/* Subtasks Cards */}
                          <div className="space-y-6">
                            {(subtasksData.grouped_subtasks || []).map((taskGroup: TaskGroup) => (
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
                                  {(taskGroup.subtasks || []).map((subtask: SubtaskItem) => {
                                    // Determine card color based on status
                                    let cardStyle = 'border-red-400 bg-red-50'; // Default: not started - Red
                                    
                                    if (subtask.subtask_submissions?.is_revised) {
                                      // Needs revision - Dark Red (highest priority)
                                      cardStyle = 'border-red-600 bg-red-100';
                                    } else if (subtask.is_done && subtask.subtask_reviews?.rating) {
                                      // Truly completed with rating - Green
                                      cardStyle = 'border-green-400 bg-green-50';
                                    } else if (subtask.subtask_submissions && !subtask.subtask_submissions.is_revised) {
                                      // Has submission but waiting for review - Yellow
                                      cardStyle = 'border-yellow-400 bg-yellow-50';
                                    }
                                    
                                    return (
                                    <Card key={subtask.id} className={`hover:shadow-md transition-all duration-200 border-l-4 ${cardStyle}`}>
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                              <h4 className={`font-medium ${
                                                subtask.is_done && subtask.subtask_reviews?.rating ? 'text-green-800' : 
                                                subtask.subtask_submissions && !subtask.subtask_submissions.is_revised ? 'text-yellow-800' :
                                                subtask.subtask_submissions?.is_revised ? 'text-red-800' :
                                                'text-red-800'
                                              }`}>
                                                {subtask.is_done && subtask.subtask_reviews?.rating && '✅ '}
                                                {subtask.subtask_submissions && !subtask.subtask_submissions.is_revised && !subtask.subtask_reviews?.rating && '⏳ '}
                                                {subtask.subtask_submissions?.is_revised && '🔄 '}
                                                {!subtask.subtask_submissions && !subtask.is_done && '� '}
                                                {subtask.title}
                                              </h4>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  {!subtask.is_done && !subtask.subtask_submissions && (
                                                    <DropdownMenuItem onClick={() => handleEditSubtask(subtask)}>
                                                      <Edit className="h-4 w-4 mr-2" />
                                                      Upload Bukti
                                                    </DropdownMenuItem>
                                                  )}
                                                  
                                                  {/* Show revision option if submission needs revision */}
                                                  {subtask.subtask_submissions?.is_revised && (
                                                    <DropdownMenuItem onClick={() => handleEditSubtask(subtask)}>
                                                      <Edit className="h-4 w-4 mr-2" />
                                                      Upload Bukti Revisi
                                                    </DropdownMenuItem>
                                                  )}
                                                  
                                                  {/* Show view submission link if exists */}
                                                  {subtask.subtask_submissions && (
                                                    <DropdownMenuItem 
                                                      onClick={() => window.open(subtask.subtask_submissions!.file_upload, '_blank')}
                                                    >
                                                      <Edit className="h-4 w-4 mr-2" />
                                                      Lihat Bukti
                                                    </DropdownMenuItem>
                                                  )}
                                                  
                                                  {/* Simple mark as done/undone for cases without submission required */}
                                                  {!subtask.subtask_submissions && (
                                                    <DropdownMenuItem 
                                                      onClick={() => handleUpdateSubtask(subtask.id, !subtask.is_done)}
                                                    >
                                                      {subtask.is_done ? (
                                                        <>
                                                          <Clock className="h-4 w-4 mr-2" />
                                                          Tandai Belum Selesai
                                                        </>
                                                      ) : (
                                                        <>
                                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                                          Tandai Selesai
                                                        </>
                                                      )}
                                                    </DropdownMenuItem>
                                                  )}
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                            
                                            {/* Submission Status */}
                                            {subtask.subtask_submissions && (
                                              <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-purple-800">
                                                      Bukti Diupload:
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <a
                                                      href={subtask.subtask_submissions.file_upload}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs text-purple-600 hover:text-purple-800 underline"
                                                    >
                                                      Lihat Bukti
                                                    </a>
                                                    {subtask.subtask_submissions.is_revised && (
                                                      <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">
                                                        Perlu Revisi
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                                {subtask.subtask_submissions.komentar && (
                                                  <p className="text-xs text-purple-700 mt-1 italic">
                                                    &quot;{subtask.subtask_submissions.komentar}&quot;
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* Not started yet */}
                                            {!subtask.subtask_submissions && !subtask.is_done && (
                                              <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                                                <div className="flex items-center gap-2">
                                                  <Clock className="h-3 w-3 text-red-600" />
                                                  <span className="text-xs text-red-700">
                                                    ⚠️ Belum dikerjakan - Silakan upload bukti segera
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Submitted but waiting for review/rating */}
                                            {subtask.subtask_submissions && !subtask.subtask_submissions.is_revised && !subtask.subtask_reviews?.rating && (
                                              <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <div className="flex items-center gap-2">
                                                  <Clock className="h-3 w-3 text-yellow-600" />
                                                  <span className="text-xs text-yellow-700">
                                                    ⏳ Bukti sudah diupload, menunggu review & penilaian atasan
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Truly completed with rating */}
                                            {subtask.is_done && subtask.subtask_reviews?.rating && (
                                              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-2">
                                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                  <span className="text-xs text-green-700">
                                                    ✅ Subtask selesai dan telah dinilai
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Dibuat: {new Date(subtask.created_at).toLocaleDateString('id-ID')}
                                          </span>
                                        </div>
                                        
                                        {/* Rating Display for Completed Subtasks - Moved to Bottom */}
                                        {subtask.is_done && subtask.subtask_reviews?.rating && (
                                          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-medium text-green-800">
                                                ✅ Penilaian Final:
                                              </span>
                                              <div className="flex items-center gap-1">
                                                {renderStars(subtask.subtask_reviews.rating)}
                                                <span className="text-xs font-bold text-green-600 ml-1">
                                                  {subtask.subtask_reviews.rating}/5
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                    );
                                  })}
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

                  {/* Upload Bukti Subtask Dialog */}
                  {editingSubtask && (
                    <Dialog open={!!editingSubtask} onOpenChange={() => setEditingSubtask(null)}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingSubtask.subtask_submissions?.is_revised ? 'Upload Bukti Revisi' : 'Upload Bukti Subtask'}
                          </DialogTitle>
                          <DialogDescription>
                            Masukkan link Google Drive atau bukti penyelesaian untuk: {editingSubtask.title}
                            {editingSubtask.subtask_submissions?.is_revised && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                ⚠️ Subtask ini perlu revisi. Silakan upload bukti yang sudah diperbaiki.
                              </div>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="subtask-bukti-link">Link Bukti (Google Drive/URL)</Label>
                            <Input
                              id="subtask-bukti-link"
                              type="url"
                              placeholder="https://drive.google.com/file/... atau link lainnya"
                              value={subtaskUploadFile}
                              onChange={(e) => setSubtaskUploadFile(e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Pastikan file dapat diakses dengan link yang dibagikan
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="subtask-catatan">Catatan Pengerjaan (Opsional)</Label>
                            <Input
                              id="subtask-catatan"
                              value={subtaskUploadNote}
                              onChange={(e) => setSubtaskUploadNote(e.target.value)}
                              placeholder="Tambahkan catatan mengenai penyelesaian subtask..."
                              className="mt-1"
                            />
                          </div>
                          
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Bukti akan dikirim untuk review atasan. Subtask akan selesai setelah diberi penilaian.
              </span>
            </div>
          </div>                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={handleSubtaskUpload} 
                              disabled={!subtaskUploadFile.trim() || isUploadingSubtask}
                              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            >
                              {isUploadingSubtask ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  {editingSubtask.subtask_submissions?.is_revised ? 'Mengupload Revisi...' : 'Mengupload...'}
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 mr-2" />
                                  {editingSubtask.subtask_submissions?.is_revised ? 'Upload Bukti Revisi' : 'Upload untuk Review'}
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setEditingSubtask(null);
                                setSubtaskUploadFile('');
                                setSubtaskUploadNote('');
                              }} 
                              className="flex-1"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
              </>
            )}
      </div>
    </div>
  );
}
