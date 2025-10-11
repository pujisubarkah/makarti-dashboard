import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, MoreVertical, X, FileText, MessageCircle, Star, User, Loader2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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

interface SubmissionData {
  id: number;
  subtask_id: number;
  file_upload: string;
  komentar: string | null;
  submitted_at: string;
  is_revised: boolean;
  subtasks: {
    id: number;
    task_id: number;
    title: string;
    is_done: boolean;
    assigned_to: number;
    created_at: string;
    pegawai: {
      id: number;
      nama: string;
      nip: string;
      jabatan: string;
    };
    tasks: {
      id: number;
      title: string;
      owner: number;
    };
    subtask_reviews?: {
      id: number;
      rating: number;
      reviewed_by: string;
      reviewed_at: string;
    };
  };
}

interface Props {
  tasks?: Task[];
}

// Removed unused getInitials function

// Optimized Image Component with better error handling and loading states
const OptimizedAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src, alt, size = 40, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Use fallback immediately if no src
  if (!src || imageError) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-gray-200 shadow-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <User size={size * 0.6} className="opacity-80" />
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden border-2 border-gray-200 shadow-sm ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <Loader2 size={size * 0.4} className="animate-spin text-gray-400" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        priority={false}
      />
    </div>
  );
};

const getSubtaskCardBorder = (subtask: Subtask, submissionData?: { id: number; file_upload: string; has_review: boolean }) => {
  // Hijau: sudah ada rating (is_done = true)
  if (subtask.is_done) return 'border-green-500';
  
  // Kuning: ada bukti dukung tapi belum ada rating
  if (submissionData && submissionData.file_upload && !submissionData.has_review) {
    return 'border-yellow-500';
  }
  
  // Merah: belum ada bukti dukung atau masih pending
  return 'border-red-500';
};

const getSubtaskCardBg = (subtask: Subtask, submissionData?: { id: number; file_upload: string; has_review: boolean }) => {
  // Hijau: sudah ada rating (is_done = true)
  if (subtask.is_done) return 'bg-green-50';
  
  // Kuning: ada bukti dukung tapi belum ada rating
  if (submissionData && submissionData.file_upload && !submissionData.has_review) {
    return 'bg-yellow-50';
  }
  
  // Merah: belum ada bukti dukung atau masih pending
  return 'bg-red-50';
};

// Removed unused isAllSubtasksDone function

const PetaKinerjaPegawai: React.FC<Props> = ({ tasks: fallbackTasks = [] }) => {
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submissionsData, setSubmissionsData] = useState<Map<number, { id: number; file_upload: string; has_review: boolean }>>(new Map());
  const [submissionCache, setSubmissionCache] = useState<Map<number, { data: { id: number; file_upload: string; has_review: boolean }; timestamp: number }>>(new Map());
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default 6 tasks per page
  const [searchTerm, setSearchTerm] = useState('');


  // Cache expiry time (5 minutes)
  const CACHE_EXPIRY_MS = 5 * 60 * 1000;

  // Optimized batch submission fetching with caching and error handling
  const fetchAllSubmissions = useCallback(async (tasks: Task[]) => {
    if (isLoadingSubmissions) return; // Prevent multiple concurrent calls
    
    setIsLoadingSubmissions(true);
    const submissions = new Map<number, { id: number; file_upload: string; has_review: boolean }>();
    const subtaskIds: number[] = [];
    
    // Collect all subtask IDs and check cache validity
    const now = Date.now();
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        const cached = submissionCache.get(subtask.id);
        
        // Check if cache exists and is still valid
        if (cached && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
          // Use cached data
          submissions.set(subtask.id, cached.data);
        } else {
          // Need to fetch fresh data
          subtaskIds.push(subtask.id);
        }
      });
    });

    // Batch process in chunks to avoid overwhelming the network
    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < subtaskIds.length; i += BATCH_SIZE) {
      batches.push(subtaskIds.slice(i, i + BATCH_SIZE));
    }

    try {
      for (const batch of batches) {
        const batchPromises = batch.map(async (subtaskId) => {
          try {
            // Use AbortController for better request management
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            
            const submissionRes = await fetch(`/api/subtasks_submission/${subtaskId}`, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (submissionRes.ok) {
              const submissionData = await submissionRes.json();
              
              // Quick review check with timeout
              let hasReview = false;
              try {
                const reviewController = new AbortController();
                const reviewTimeoutId = setTimeout(() => reviewController.abort(), 3000); // 3s timeout
                
                const reviewRes = await fetch(`/api/subtask_reviews/${subtaskId}`, {
                  signal: reviewController.signal
                });
                clearTimeout(reviewTimeoutId);
                hasReview = reviewRes.ok;
              } catch {
                hasReview = false;
              }
              
              const result = {
                id: submissionData.id,
                file_upload: submissionData.file_upload,
                has_review: hasReview
              };
              
              submissions.set(subtaskId, result);
              
              // Cache the result with timestamp
              setSubmissionCache(prev => new Map(prev).set(subtaskId, {
                data: result,
                timestamp: Date.now()
              }));
              
              return { subtaskId, success: true };
            }
          } catch (error) {
            console.warn(`Failed to fetch submission for subtask ${subtaskId}:`, error);
            return { subtaskId, success: false };
          }
        });

        // Process batch with some delay to prevent rate limiting
        await Promise.allSettled(batchPromises);
        
        // Small delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error in batch submission fetching:', error);
    } finally {
      setSubmissionsData(submissions);
      setIsLoadingSubmissions(false);
    }
  }, [isLoadingSubmissions, submissionCache, CACHE_EXPIRY_MS]);

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
        
        // Initially don't fetch all submissions - will be fetched per page
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

  const dataToShow = useMemo(() => {
    return apiTasks.length > 0 ? apiTasks : fallbackTasks;
  }, [apiTasks, fallbackTasks]);

  // Enhanced memoized tasks with search filtering
  const filteredTasks = useMemo(() => {
    let filtered = dataToShow.map((task) => ({
      ...task,
      allSubtasksDone: task.subtasks.length > 0 && task.subtasks.every((s) => s.is_done),
      subtaskCount: task.subtasks.length
    }));

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.subtasks.some(subtask => 
          subtask.title.toLowerCase().includes(search) ||
          subtask.pegawai?.nama.toLowerCase().includes(search)
        )
      );
    }

    return filtered;
  }, [dataToShow, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Fetch submissions only for current page tasks (optimized bandwidth usage)
  useEffect(() => {
    if (currentTasks.length > 0) {
      fetchAllSubmissions(currentTasks);
    }
  }, [currentTasks, fetchAllSubmissions]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't interfere with input fields
      
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  // Throttled submission fetch to prevent rapid clicks
  const fetchSubmissionData = useCallback(async (subtaskId: number) => {
    if (loadingSubmission) return; // Prevent multiple concurrent requests
    
    setLoadingSubmission(true);
    try {
      // Use timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const res = await fetch(`/api/subtasks_submission/${subtaskId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 404) {
          alert('Belum ada submission untuk subtask ini');
          return;
        }
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const data: SubmissionData = await res.json();
      
      // Try to fetch existing review with timeout
      try {
        const reviewController = new AbortController();
        const reviewTimeoutId = setTimeout(() => reviewController.abort(), 5000);
        
        const reviewRes = await fetch(`/api/subtask_reviews/${subtaskId}`, {
          signal: reviewController.signal
        });
        clearTimeout(reviewTimeoutId);
        
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          data.subtasks.subtask_reviews = reviewData;
          setCurrentRating(reviewData.rating);
        } else {
          setCurrentRating(0);
        }
      } catch {
        console.log('No existing review found');
        setCurrentRating(0);
      }
      
      setSelectedSubmission(data);
      setHoverRating(0);
      setShowSubmissionModal(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted due to timeout');
        alert('Request timeout - coba lagi dalam beberapa saat');
      } else {
        console.error('Error fetching submission:', err);
        alert('Gagal memuat data submission. Periksa koneksi internet Anda.');
      }
    } finally {
      setLoadingSubmission(false);
    }
  }, [loadingSubmission]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const submitRating = async (rating: number) => {
    if (!selectedSubmission || submittingRating) return;
    
    setSubmittingRating(true);
    try {
      const userId = localStorage.getItem('id') || localStorage.getItem('username') || 'unknown';
      const subtaskId = selectedSubmission.subtask_id;
      
      const method = selectedSubmission.subtasks.subtask_reviews ? 'PUT' : 'POST';
      const res = await fetch(`/api/subtask_reviews/${subtaskId}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          reviewed_by: userId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const reviewData = await res.json();
      
      // Update subtask is_done status to true when rating is given
      const updateRes = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_done: true
        })
      });

      if (!updateRes.ok) {
        console.warn('Failed to update subtask is_done status');
      }
      
      // Update the selected submission with new review data
      setSelectedSubmission(prev => prev ? {
        ...prev,
        subtasks: {
          ...prev.subtasks,
          subtask_reviews: reviewData,
          is_done: true
        }
      } : null);
      
      // Update submissions data to reflect new review status
      setSubmissionsData(prev => {
        const newData = new Map(prev);
        const submissionData = newData.get(subtaskId);
        if (submissionData) {
          newData.set(subtaskId, {
            ...submissionData,
            has_review: true
          });
        }
        return newData;
      });
      
      // Update apiTasks to reflect is_done status change
      setApiTasks(prev => prev.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, is_done: true }
            : subtask
        )
      })));
      
      setCurrentRating(rating);
      alert('Rating berhasil disimpan!');
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Gagal menyimpan rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 min-h-[400px]">
      <div className="h-8 bg-gray-200 rounded-lg mb-6 w-64 mx-auto animate-pulse"></div>
      <div className="flex flex-wrap gap-8 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center w-full max-w-xs">
            {/* Task skeleton */}
            <div className="h-12 bg-gray-200 rounded-lg mb-4 w-full animate-pulse"></div>
            <div className="h-6 w-1 bg-gray-200 my-2 animate-pulse"></div>
            {/* Subtasks skeleton */}
            <div className="flex flex-wrap justify-center gap-6">
              {[1, 2].map((j) => (
                <div key={j} className="p-4 border-2 border-gray-200 rounded-lg w-48">
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
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
      {/* Header with title and loading indicator */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Peta Kinerja Pegawai</h2>
        {isLoadingSubmissions && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 size={16} className="animate-spin" />
            <span>Memuat submissions...</span>
          </div>
        )}
      </div>

      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas, subtask, atau nama pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 tugas</option>
              <option value={6}>6 tugas</option>
              <option value={9}>9 tugas</option>
              <option value={12}>12 tugas</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Menampilkan {currentTasks.length} dari {filteredTasks.length} tugas
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                (hasil pencarian &quot;{searchTerm}&quot;)
              </span>
            )}
          </div>
          {totalPages > 1 && (
            <div>
              Halaman {currentPage} dari {totalPages}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-8 justify-center items-start w-full">
        {currentTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            {searchTerm ? (
              <>
                <p className="text-gray-500 text-lg">Tidak ada hasil untuk &quot;{searchTerm}&quot;</p>
                <p className="text-gray-400 text-sm">Coba kata kunci yang berbeda atau hapus filter pencarian.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hapus Filter
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg">Tidak ada tugas ditemukan.</p>
                <p className="text-gray-400 text-sm">Tugas akan muncul setelah dibuat oleh admin.</p>
              </>
            )}
          </div>
        ) : (
          currentTasks.map((task) => (
            <div key={task.id} className="flex flex-col items-center w-full max-w-xs min-w-[260px] flex-1">
              {/* Task Node dengan status indikator yang lebih informatif */}
              <div className={`flex items-center px-6 py-3 text-white rounded-lg shadow font-bold text-lg mb-4 gap-2 w-full justify-center transition-all duration-300 ${
                task.allSubtasksDone 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}>
                <span className="text-center leading-tight">{task.title}</span>
                <div className="flex flex-col items-center gap-1">
                  <div title={task.allSubtasksDone ? "Semua subtasks selesai" : "Masih ada subtasks belum selesai"}>
                    {task.allSubtasksDone ? (
                      <CheckCircle size={20} className="text-green-200" />
                    ) : (
                      <XCircle size={20} className="text-red-200" />
                    )}
                  </div>
                  <span className="text-xs opacity-75">
                    {task.subtasks.filter(s => s.is_done).length}/{task.subtaskCount}
                  </span>
                </div>
              </div>
              {/* Garis penghubung */}
              {task.subtasks.length > 0 && (
                <div className="h-6 w-1 bg-blue-300 my-2" />
              )}
              {/* Subtasks */}
              <div className="flex flex-wrap justify-center gap-6">
                {task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <div key={subtask.id} className={`relative flex flex-col items-center max-w-[200px] p-2 border-2 rounded-lg shadow ${getSubtaskCardBorder(subtask, submissionsData.get(subtask.id))} ${getSubtaskCardBg(subtask, submissionsData.get(subtask.id))}`}> 
                      {/* Three dots menu */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => fetchSubmissionData(subtask.id)}
                          disabled={loadingSubmission}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                          title="Lihat submission"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Title subtask di atas */}
                      <div className="text-gray-800 font-medium text-center mb-2 pr-6">
                        {subtask.title}
                      </div>
                      {/* Nama dan photo pegawai di bawah title */}
                      {subtask.pegawai && (
                        <div className="flex flex-col items-center gap-2">
                          <OptimizedAvatar
                            src={subtask.pegawai.photo_url}
                            alt={subtask.pegawai.nama}
                            size={40}
                          />
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const showPages = 5; // Show max 5 page numbers
                let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                const endPage = Math.min(totalPages, startPage + showPages - 1);
                
                // Adjust start if we're near the end
                if (endPage - startPage + 1 < showPages) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }

                // First page + ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => {
                        setCurrentPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                    );
                  }
                }

                // Page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-2 border rounded-lg transition-colors ${
                        i === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Last page + ellipsis if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => {
                        setCurrentPage(totalPages);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Performance Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>📊 Data: {filteredTasks.length} tugas</span>
            <span>📄 Halaman: {currentPage}/{totalPages}</span>
            <span>🖼️ Gambar: lazy loading aktif</span>
            <span>⚡ Cache: {submissionCache.size} submissions</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingSubmissions && (
              <span className="text-blue-600">Sinkronisasi...</span>
            )}
            <span className="text-gray-400">Optimized for low bandwidth</span>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Detail Submission</h3>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Task & Subtask Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Informasi Tugas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Task:</span>
                    <p className="text-gray-900">{selectedSubmission.subtasks.tasks.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Subtask:</span>
                    <p className="text-gray-900">{selectedSubmission.subtasks.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pegawai:</span>
                    <p className="text-gray-900">{selectedSubmission.subtasks.pegawai.nama}</p>
                    <p className="text-gray-600 text-xs">{selectedSubmission.subtasks.pegawai.nip}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Jabatan:</span>
                    <p className="text-gray-900">{selectedSubmission.subtasks.pegawai.jabatan}</p>
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Detail Submission</h4>
                
                {/* File Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-700">File Upload</span>
                  </div>
                  <div className="space-y-2">
                    <a
                      href={selectedSubmission.file_upload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <FileText size={16} />
                      Buka File
                    </a>
                    <p className="text-xs text-gray-500 break-all">
                      {selectedSubmission.file_upload.length > 80 
                        ? `${selectedSubmission.file_upload.substring(0, 80)}...`
                        : selectedSubmission.file_upload
                      }
                    </p>
                  </div>
                </div>

                {/* Komentar */}
                {selectedSubmission.komentar && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageCircle size={20} className="text-green-600" />
                      <span className="font-medium text-gray-700">Komentar</span>
                    </div>
                    <p className="text-gray-900">{selectedSubmission.komentar}</p>
                  </div>
                )}

                {/* Status & Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedSubmission.subtasks.is_done 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedSubmission.subtasks.is_done ? 'Selesai' : 'Dalam Proses'}
                      </span>
                      {selectedSubmission.is_revised && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Direvisi
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="font-medium text-gray-700">Tanggal Submit:</span>
                    <p className="text-gray-900 text-sm mt-1">
                      {formatDate(selectedSubmission.submitted_at)}
                    </p>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-3">Beri Rating untuk Submission</h4>
                  
                  {/* Current Rating Display */}
                  {selectedSubmission.subtasks.subtask_reviews && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating saat ini:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${
                                  star <= selectedSubmission.subtasks.subtask_reviews!.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            ({selectedSubmission.subtasks.subtask_reviews.rating}/5)
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dinilai oleh: {selectedSubmission.subtasks.subtask_reviews.reviewed_by} • {formatDate(selectedSubmission.subtasks.subtask_reviews.reviewed_at)}
                      </div>
                    </div>
                  )}

                  {/* Star Rating Input */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedSubmission.subtasks.subtask_reviews ? 'Ubah rating:' : 'Berikan rating:'}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => submitRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            disabled={submittingRating}
                            className="p-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Beri rating ${star} bintang`}
                          >
                            <Star
                              size={24}
                              className={`transition-colors duration-200 ${
                                star <= (hoverRating || currentRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {(hoverRating > 0 || currentRating > 0) && (
                        <span className="text-sm text-gray-600 ml-2">
                          {hoverRating > 0 ? `${hoverRating}/5` : `${currentRating}/5`}
                        </span>
                      )}
                    </div>
                    
                    {submittingRating && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Menyimpan rating...</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Klik bintang untuk memberikan rating (1-5 bintang)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetaKinerjaPegawai;
