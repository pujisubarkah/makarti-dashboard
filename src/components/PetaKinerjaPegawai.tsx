import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, MoreVertical, X, FileText, MessageCircle, Star } from 'lucide-react';

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
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const fetchSubmissionData = async (subtaskId: number) => {
    setLoadingSubmission(true);
    try {
      const res = await fetch(`/api/subtasks_submission/${subtaskId}`);
      if (!res.ok) {
        if (res.status === 404) {
          alert('Belum ada submission untuk subtask ini');
          return;
        }
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const data: SubmissionData = await res.json();
      
      // Try to fetch existing review
      try {
        const reviewRes = await fetch(`/api/subtask_reviews/${subtaskId}`);
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
      console.error('Error fetching submission:', err);
      alert('Gagal memuat data submission');
    } finally {
      setLoadingSubmission(false);
    }
  };

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
      
      // Update the selected submission with new review data
      setSelectedSubmission(prev => prev ? {
        ...prev,
        subtasks: {
          ...prev.subtasks,
          subtask_reviews: reviewData
        }
      } : null);
      
      setCurrentRating(rating);
      alert('Rating berhasil disimpan!');
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Gagal menyimpan rating');
    } finally {
      setSubmittingRating(false);
    }
  };

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
                    <div key={subtask.id} className={`relative flex flex-col items-center max-w-[200px] p-2 border-2 rounded-lg shadow ${getSubtaskCardBorder(subtask.is_done)} ${getSubtaskCardBg(subtask.is_done)}`}> 
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
                  <a
                    href={selectedSubmission.file_upload}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {selectedSubmission.file_upload}
                  </a>
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