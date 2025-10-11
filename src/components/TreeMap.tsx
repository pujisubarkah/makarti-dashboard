import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { X, FileText, MessageCircle, Star, User, Loader2, Search, Filter, BarChart3 } from 'lucide-react';

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

// Force-Directed Graph data structure
interface ForceNode {
  id: string;
  name: string;
  completion: number;
  color: string;
  task?: Task;
  subtask?: Subtask;
  level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  photoUrl?: string;
  employeeName?: string;
  fx?: number; // fixed x position
  fy?: number; // fixed y position
}

interface ForceLink {
  source: string;
  target: string;
  strength: number;
}

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Optimized Image Component with better error handling and loading states
const OptimizedAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src, alt, size = 24, className = "" }) => {
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
        className={`rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        <User size={size * 0.6} className="opacity-80" />
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
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

// Force-Directed Graph Physics Simulation
class ForceSimulation {
  nodes: ForceNode[];
  links: ForceLink[];
  width: number;
  height: number;
  alpha: number;
  alphaDecay: number;
  velocityDecay: number;

  constructor(nodes: ForceNode[], links: ForceLink[], width: number, height: number) {
    this.nodes = nodes;
    this.links = links;
    this.width = width;
    this.height = height;
    this.alpha = 1;
    this.alphaDecay = 0.02;
    this.velocityDecay = 0.4;
  }

  // Initialize positions randomly
  initializePositions() {
    this.nodes.forEach(node => {
      if (node.fx === undefined) {
        node.x = Math.random() * this.width;
      }
      if (node.fy === undefined) {
        node.y = Math.random() * this.height;
      }
      node.vx = 0;
      node.vy = 0;
    });
  }

  // Apply forces for one simulation step
  tick() {
    // Skip simulation if alpha is 0 (stopped)
    if (this.alpha <= 0) return;
    
    // Center force - pulls nodes toward center
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.nodes.forEach(node => {
      // Skip fixed nodes
      if (node.fx !== undefined || node.fy !== undefined) return;
      
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * 0.001 * this.alpha;
      node.vy += dy * 0.001 * this.alpha;
    });

    // Link force - maintains connections
    this.links.forEach(link => {
      const source = this.nodes.find(n => n.id === link.source);
      const target = this.nodes.find(n => n.id === link.target);
      
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 100; // Desired link length
        
        if (distance > 0) {
          const force = (distance - targetDistance) * link.strength * this.alpha;
          const fx = (dx / distance) * force * 0.5;
          const fy = (dy / distance) * force * 0.5;
          
          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      }
    });

    // Collision force - prevents overlap
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j];
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = nodeA.radius + nodeB.radius + 10;
        
        if (distance < minDistance && distance > 0) {
          const force = (minDistance - distance) * 0.1 * this.alpha;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          nodeA.vx -= fx;
          nodeA.vy -= fy;
          nodeB.vx += fx;
          nodeB.vy += fy;
        }
      }
    }

    // Update positions only if simulation is active
    if (this.alpha > 0) {
      this.nodes.forEach(node => {
        if (node.fx === undefined) {
          node.vx *= this.velocityDecay;
          node.x += node.vx;
          
          // Boundary collision
          if (node.x < node.radius) {
            node.x = node.radius;
            node.vx = 0;
          } else if (node.x > this.width - node.radius) {
            node.x = this.width - node.radius;
            node.vx = 0;
          }
        } else {
          node.x = node.fx;
          node.vx = 0;
        }

        if (node.fy === undefined) {
          node.vy *= this.velocityDecay;
          node.y += node.vy;
          
          // Boundary collision
          if (node.y < node.radius) {
            node.y = node.radius;
            node.vy = 0;
          } else if (node.y > this.height - node.radius) {
            node.y = this.height - node.radius;
            node.vy = 0;
          }
        } else {
          node.y = node.fy;
          node.vy = 0;
        }
      });
    }

    // Cool down simulation
    this.alpha *= (1 - this.alphaDecay);
  }

  // Run simulation
  simulate(iterations: number = 300) {
    this.initializePositions();
    for (let i = 0; i < iterations; i++) {
      this.tick();
      if (this.alpha < 0.001) break;
    }
  }
}

// Force-Directed Graph Node Component (Photo-only circles)
const ForceGraphNode: React.FC<{
  node: ForceNode;
  onSubtaskClick?: (subtaskId: number) => void;
  submissionsData?: Map<number, { id: number; file_upload: string; has_review: boolean }>;
  isSelected?: boolean;
  onMouseEnter?: (node: ForceNode) => void;
  onMouseLeave?: () => void;
  onMouseDown?: (node: ForceNode, event: React.MouseEvent) => void;
  isDragging?: boolean;
}> = ({ node, onSubtaskClick, submissionsData, isSelected = false, onMouseEnter, onMouseLeave, onMouseDown, isDragging = false }) => {

  const getNodeColor = () => {
    if (node.subtask) {
      const submissionData = submissionsData?.get(node.subtask.id);
      if (node.subtask.is_done) return '#10b981'; // green-500
      if (submissionData?.file_upload && !submissionData.has_review) return '#f59e0b'; // yellow-500
      return '#ef4444'; // red-500
    }
    
    // Task color based on completion - slightly transparent for background
    const completionRate = node.completion;
    if (completionRate === 1) return '#059669'; // green-600
    if (completionRate > 0.5) return '#3b82f6'; // blue-500
    if (completionRate > 0) return '#f59e0b'; // yellow-500
    return '#6b7280'; // gray-500
  };

  const handleClick = () => {
    // Prevent drag from triggering click
    if (!isDragging && node.subtask && onSubtaskClick) {
      onSubtaskClick(node.subtask.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onMouseDown) {
      onMouseDown(node, e);
    }
  };

  const strokeWidth = isSelected ? 4 : 2;
  const strokeColor = isSelected ? '#fbbf24' : getNodeColor();

  return (
    <g 
      className="force-node" 
      onMouseEnter={() => onMouseEnter?.(node)} 
      onMouseLeave={onMouseLeave}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Background circle with status color */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.radius}
        fill={getNodeColor()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={`transition-all duration-300 hover:opacity-90 ${
          node.subtask ? 'hover:stroke-yellow-400' : ''
        } ${isSelected ? 'drop-shadow-lg' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleClick}
      />
      
      {/* Photo circle (clipped) */}
      <defs>
        <clipPath id={`clip-${node.id}`}>
          <circle cx={node.x} cy={node.y} r={node.radius - 3} />
        </clipPath>
      </defs>
      
      {node.photoUrl ? (
        <image
          x={node.x - node.radius + 3}
          y={node.y - node.radius + 3}
          width={(node.radius - 3) * 2}
          height={(node.radius - 3) * 2}
          href={node.photoUrl}
          clipPath={`url(#clip-${node.id})`}
          className="pointer-events-none"
        />
      ) : (
        // Fallback with initials for tasks or icon for subtasks without photos
        <>
          {node.level === 0 ? (
            // Task node - show initials
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize={node.radius * 0.4}
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {getInitials(node.name)}
            </text>
          ) : (
            // Subtask node without photo - show user icon
            <g className="pointer-events-none">
              <User 
                x={node.x - node.radius * 0.4} 
                y={node.y - node.radius * 0.4} 
                width={node.radius * 0.8} 
                height={node.radius * 0.8} 
                color="#ffffff" 
              />
            </g>
          )}
        </>
      )}

      {/* Completion ring for tasks */}
      {node.level === 0 && node.completion > 0 && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.radius + 3}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth={2}
          strokeDasharray={`${2 * Math.PI * (node.radius + 3) * node.completion} ${2 * Math.PI * (node.radius + 3)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${node.x} ${node.y})`}
          className="pointer-events-none"
        />
      )}

      {/* Status indicator dot */}
      {node.subtask && (
        <circle
          cx={node.x + node.radius - 6}
          cy={node.y - node.radius + 6}
          r={3}
          fill={node.subtask.is_done ? '#10b981' : '#ef4444'}
          stroke="#ffffff"
          strokeWidth={1}
          className="pointer-events-none"
        />
      )}
    </g>
  );
};

const MindMap: React.FC<Props> = ({ tasks: fallbackTasks = [] }) => {
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
  
  // Force-Directed Graph specific states
  const [viewMode, setViewMode] = useState<'force' | 'list'>('force');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState<ForceNode | null>(null);
  const [simulation, setSimulation] = useState<ForceSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<ForceNode | null>(null);
  
  // Cache expiry time (5 minutes)
  const CACHE_EXPIRY_MS = 5 * 60 * 1000;

  // Optimized batch submission fetching with caching and error handling
  const fetchAllSubmissions = useCallback(async (tasks: Task[]) => {
    if (isLoadingSubmissions) return;
    
    setIsLoadingSubmissions(true);
    const submissions = new Map<number, { id: number; file_upload: string; has_review: boolean }>();
    const subtaskIds: number[] = [];
    
    const now = Date.now();
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        const cached = submissionCache.get(subtask.id);
        
        if (cached && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
          submissions.set(subtask.id, cached.data);
        } else {
          subtaskIds.push(subtask.id);
        }
      });
    });

    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < subtaskIds.length; i += BATCH_SIZE) {
      batches.push(subtaskIds.slice(i, i + BATCH_SIZE));
    }

    try {
      for (const batch of batches) {
        const batchPromises = batch.map(async (subtaskId) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const submissionRes = await fetch(`/api/subtasks_submission/${subtaskId}`, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (submissionRes.ok) {
              const submissionData = await submissionRes.json();
              
              let hasReview = false;
              try {
                const reviewController = new AbortController();
                const reviewTimeoutId = setTimeout(() => reviewController.abort(), 3000);
                
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

        await Promise.allSettled(batchPromises);
        
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
        const userId = localStorage.getItem('id');
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
        
        // Fetch submissions for all tasks
        await fetchAllSubmissions(parsedTasks);
      } catch (err) {
        console.error('💥 Error fetching tasks:', err);
        setError((err instanceof Error ? err.message : 'Gagal memuat data'));
        setApiTasks(fallbackTasks);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [fallbackTasks, fetchAllSubmissions]);

  const dataToShow = useMemo(() => {
    return apiTasks.length > 0 ? apiTasks : fallbackTasks;
  }, [apiTasks, fallbackTasks]);

  // Convert tasks to Force-Directed Graph data structure
  const forceGraphData = useMemo(() => {
    let filteredTasks = dataToShow;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.subtasks.some(subtask => 
          subtask.title.toLowerCase().includes(search) ||
          subtask.pegawai?.nama.toLowerCase().includes(search)
        )
      );
    }

    // Filter by selected task if any
    if (selectedTaskId) {
      filteredTasks = filteredTasks.filter(task => task.id === selectedTaskId);
    }

    // Create nodes and links for Force-Directed Graph
    const nodes: ForceNode[] = [];
    const links: ForceLink[] = [];
    
    filteredTasks.forEach(task => {
      const completedSubtasks = task.subtasks.filter(s => s.is_done).length;
      const totalSubtasks = task.subtasks.length;
      const completion = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

      // Add task node (larger, central)
      const taskNode: ForceNode = {
        id: `task-${task.id}`,
        name: task.title,
        completion: completion,
        color: completion === 1 ? '#059669' : completion > 0.5 ? '#3b82f6' : '#6b7280',
        task: task,
        level: 0,
        x: 400 + (Math.random() - 0.5) * 100, // Random start near center
        y: 300 + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        radius: 35, // Larger for tasks
        employeeName: `Task: ${task.title}`
      };
      nodes.push(taskNode);

      // Add subtask nodes (smaller, with photos)
      task.subtasks.forEach(subtask => {
        const subtaskNode: ForceNode = {
          id: `subtask-${subtask.id}`,
          name: subtask.title,
          completion: subtask.is_done ? 1 : 0,
          color: subtask.is_done ? '#10b981' : '#ef4444',
          subtask: subtask,
          level: 1,
          x: 400 + (Math.random() - 0.5) * 200,
          y: 300 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0,
          radius: 25, // Smaller for subtasks
          photoUrl: subtask.pegawai?.photo_url,
          employeeName: subtask.pegawai?.nama || 'Unknown'
        };
        nodes.push(subtaskNode);

        // Create link between task and subtask
        links.push({
          source: taskNode.id,
          target: subtaskNode.id,
          strength: 0.1
        });
      });
    });

    return { nodes, links };
  }, [dataToShow, searchTerm, selectedTaskId]);

  // Initialize static layout (no physics)
  useEffect(() => {
    if (forceGraphData.nodes.length > 0) {
      // Create static layout with fixed positions
      const staticNodes = forceGraphData.nodes.map((node) => {
        let x, y;
        
        if (node.level === 0) {
          // Tasks arranged in a grid pattern
          const taskNodes = forceGraphData.nodes.filter(n => n.level === 0);
          const cols = Math.ceil(Math.sqrt(taskNodes.length));
          const taskIndex = taskNodes.findIndex(n => n.id === node.id);
          const row = Math.floor(taskIndex / cols);
          const col = taskIndex % cols;
          
          x = 150 + col * 200;
          y = 150 + row * 200;
        } else {
          // Subtasks arranged around their parent task
          const parentTask = forceGraphData.nodes.find(n => 
            n.level === 0 && n.task?.subtasks.some((s: Subtask) => s.id === node.subtask?.id)
          );
          
          if (parentTask) {
            const siblings = forceGraphData.nodes.filter(n => 
              n.level === 1 && parentTask.task?.subtasks.some((s: Subtask) => s.id === n.subtask?.id)
            );
            const siblingIndex = siblings.findIndex(n => n.id === node.id);
            const angle = (2 * Math.PI * siblingIndex) / siblings.length;
            const radius = 80;
            
            x = parentTask.x + Math.cos(angle) * radius;
            y = parentTask.y + Math.sin(angle) * radius;
          } else {
            x = 400 + (Math.random() - 0.5) * 100;
            y = 300 + (Math.random() - 0.5) * 100;
          }
        }
        
        return {
          ...node,
          x: Math.max(node.radius, Math.min(800 - node.radius, x)),
          y: Math.max(node.radius, Math.min(600 - node.radius, y)),
          vx: 0,
          vy: 0
        };
      });
      
      const staticSim = new ForceSimulation(staticNodes, forceGraphData.links, 800, 600);
      staticSim.nodes = staticNodes;
      setSimulation(staticSim);
    }
  }, [forceGraphData]);

  // Manual simulation trigger (now uses physics briefly then stops)
  const runSimulation = useCallback(() => {
    if (simulation && !isSimulating) {
      setIsSimulating(true);
      
      // Run simulation in steps to allow for smooth animation
      const runStep = (iterations: number) => {
        if (iterations > 0 && simulation.alpha > 0.001) {
          simulation.tick();
          // Force re-render to show movement
          setSimulation(prev => (prev ? Object.assign(Object.create(Object.getPrototypeOf(prev)), prev) : null));
          setTimeout(() => runStep(iterations - 1), 16); // ~60fps
        } else {
          // Stop simulation completely - fix all positions
          simulation.nodes.forEach(node => {
            node.vx = 0;
            node.vy = 0;
            node.fx = node.x; // Fix position
            node.fy = node.y; // Fix position
          });
          simulation.alpha = 0; // Completely stop
          setIsSimulating(false);
        }
      };
      
      // Reset velocities and release fixed positions before starting
      simulation.nodes.forEach(node => {
        node.fx = undefined;
        node.fy = undefined;
        node.vx = (Math.random() - 0.5) * 2; // Small random velocity
        node.vy = (Math.random() - 0.5) * 2;
      });
      
      simulation.alpha = 1; // Reset energy
      runStep(50); // Run for fewer steps to prevent continuous movement
    }
  }, [simulation, isSimulating]);

  // Get current node positions from simulation
  const currentNodes = simulation?.nodes || forceGraphData.nodes;

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((node: ForceNode) => {
    setIsDragging(true);
    setDraggedNode(node);
    
    // Fix the node position during drag
    node.fx = node.x;
    node.fy = node.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        const svg = document.querySelector('svg');
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Update node position
          draggedNode.x = Math.max(draggedNode.radius, Math.min(800 - draggedNode.radius, x));
          draggedNode.y = Math.max(draggedNode.radius, Math.min(600 - draggedNode.radius, y));
          draggedNode.fx = draggedNode.x;
          draggedNode.fy = draggedNode.y;
          
          // Force re-render
          setSimulation(sim => {
            if (!sim) return null;
            // Create a new ForceSimulation instance with the same data to force re-render
            return new ForceSimulation(
              sim.nodes,
              sim.links,
              sim.width,
              sim.height
            );
          });
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedNode(null);
      
      // Release the fixed position
      if (node) {
        node.fx = undefined;
        node.fy = undefined;
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [draggedNode]);

  // Reset layout to original static positions
  const resetLayout = useCallback(() => {
    if (simulation && forceGraphData.nodes.length > 0) {
      // Recreate static layout
      const staticNodes = forceGraphData.nodes.map((node) => {
        let x, y;
        
        if (node.level === 0) {
          // Tasks arranged in a grid pattern
          const taskNodes = forceGraphData.nodes.filter(n => n.level === 0);
          const cols = Math.ceil(Math.sqrt(taskNodes.length));
          const taskIndex = taskNodes.findIndex(n => n.id === node.id);
          const row = Math.floor(taskIndex / cols);
          const col = taskIndex % cols;
          
          x = 150 + col * 200;
          y = 150 + row * 200;
        } else {
          // Subtasks arranged around their parent task
          const parentTask = simulation.nodes.find(n => 
            n.level === 0 && n.task?.subtasks.some((s: Subtask) => s.id === node.subtask?.id)
          );
          
          // Define taskNodes before using it
          const taskNodes = forceGraphData.nodes.filter(n => n.level === 0);

          if (parentTask) {
            const siblings = forceGraphData.nodes.filter(n => 
              n.level === 1 && parentTask.task?.subtasks.some((s: Subtask) => s.id === n.subtask?.id)
            );
            const siblingIndex = siblings.findIndex(n => n.id === node.id);
            const angle = (2 * Math.PI * siblingIndex) / siblings.length;
            const radius = 80;
            
            x = 150 + Math.floor(taskNodes.findIndex(n => n.task?.id === parentTask.task?.id) / Math.ceil(Math.sqrt(taskNodes.length))) * 200 + Math.cos(angle) * radius;
            y = 150 + (taskNodes.findIndex(n => n.task?.id === parentTask.task?.id) % Math.ceil(Math.sqrt(taskNodes.length))) * 200 + Math.sin(angle) * radius;
          } else {
            x = 400;
            y = 300;
          }
        }
        
        return {
          ...node,
          x: Math.max(node.radius, Math.min(800 - node.radius, x)),
          y: Math.max(node.radius, Math.min(600 - node.radius, y)),
          vx: 0,
          vy: 0,
          fx: undefined,
          fy: undefined
        };
      });
      
      // Update simulation nodes
      simulation.nodes = staticNodes;
      simulation.alpha = 0; // Stop any movement
      setSimulation(new ForceSimulation(staticNodes, forceGraphData.links, 800, 600));
    }
  }, [simulation, forceGraphData]);

  // Throttled submission fetch
  const fetchSubmissionData = useCallback(async (subtaskId: number) => {
    if (loadingSubmission) return;
    
    setLoadingSubmission(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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
      
      setSelectedSubmission(prev => prev ? {
        ...prev,
        subtasks: {
          ...prev.subtasks,
          subtask_reviews: reviewData,
          is_done: true
        }
      } : null);
      
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
      <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
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
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Force-Directed Graph Kinerja Pegawai</h2>
        <div className="flex items-center gap-4">
          {isLoadingSubmissions && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 size={16} className="animate-spin" />
              <span>Memuat submissions...</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('force')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'force' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Force-Directed Graph"
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="List View"
            >
              <FileText size={20} />
            </button>
            {viewMode === 'force' && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isSimulating 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title="Jalankan simulasi physics"
                >
                  {isSimulating ? 'Running...' : 'Simulate'}
                </button>
                <button
                  onClick={resetLayout}
                  className="px-3 py-2 rounded-lg transition-colors text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
                  title="Reset posisi ke awal"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    if (simulation) {
                      simulation.alpha = 0;
                      simulation.nodes.forEach(node => {
                        node.vx = 0;
                        node.vy = 0;
                        node.fx = node.x;
                        node.fy = node.y;
                      });
                      setIsSimulating(false);
                      setSimulation(new ForceSimulation(
                        simulation.nodes,
                        simulation.links,
                        simulation.width,
                        simulation.height
                      ));
                    }
                  }}
                  className="px-3 py-2 rounded-lg transition-colors text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                  title="Stop semua gerakan"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
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
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tugas</option>
              {dataToShow.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Menampilkan {forceGraphData.nodes.filter(n => n.level === 0).length} tugas, {forceGraphData.nodes.filter(n => n.level === 1).length} subtasks
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                (hasil pencarian &quot;{searchTerm}&quot;)
              </span>
            )}
            {isSimulating && (
              <span className="ml-2 text-orange-600">
                (simulasi berjalan...)
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">Review Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Belum Mulai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Force-Directed Graph Visualization */}
      {viewMode === 'force' ? (
        <div className="w-full flex justify-center">
          {forceGraphData.nodes.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 size={32} className="text-gray-400" />
              </div>
              {searchTerm ? (
                <>
                  <p className="text-gray-500 text-lg">Tidak ada hasil untuk &quot;{searchTerm}&quot;</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Hapus Filter
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-lg">Tidak ada tugas ditemukan.</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <svg width="800" height="600" className="border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Connection lines */}
                {forceGraphData.links.map((link, index) => {
                  const sourceNode = currentNodes.find(n => n.id === link.source);
                  const targetNode = currentNodes.find(n => n.id === link.target);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  return (
                    <line
                      key={`link-${index}`}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="transition-all duration-300"
                    />
                  );
                })}
                
                {/* Render all nodes */}
                {currentNodes.map((node) => (
                  <ForceGraphNode
                    key={node.id}
                    node={node}
                    onSubtaskClick={fetchSubmissionData}
                    submissionsData={submissionsData}
                    isSelected={selectedNodeId === node.id}
                    onMouseEnter={setHoveredNode}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={handleMouseDown}
                    isDragging={isDragging && draggedNode?.id === node.id}
                  />
                ))}
              </svg>
              
              {/* Tooltip for hovered node */}
              {hoveredNode && (
                <div 
                  className="absolute bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10 transition-all duration-200"
                  style={{
                    left: hoveredNode.x + 30,
                    top: hoveredNode.y - 30,
                    transform: hoveredNode.x > 600 ? 'translateX(-100%)' : 'none'
                  }}
                >
                  <div className="font-semibold">{hoveredNode.name}</div>
                  <div className="text-xs text-gray-300">{hoveredNode.employeeName}</div>
                  {hoveredNode.level === 0 && (
                    <div className="text-xs text-gray-300">
                      Progress: {Math.round(hoveredNode.completion * 100)}%
                    </div>
                  )}
                  {hoveredNode.subtask && (
                    <div className="text-xs text-gray-300">
                      Status: {hoveredNode.subtask.is_done ? 'Selesai' : 'Pending'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Controls overlay */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="font-semibold text-gray-800 mb-2">Legend & Controls</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    <span>Tasks (Large circles)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Review Needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Pending</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                    <div className="space-y-1">
                      <div>🖱️ Drag: Move nodes</div>
                      <div>📍 Hover: Detail info</div>
                      <div>👆 Click: View submission</div>
                      <div>▶️ Simulate: Run physics briefly</div>
                      <div>🔄 Reset: Original static layout</div>
                      <div>⏹️ Stop: Freeze all movement</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Simulation status */}
              {isSimulating && (
                <div className="absolute top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Physics simulation running...</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Nodes are organizing themselves
                  </div>
                </div>
              )}
              
              {/* Drag status */}
              {isDragging && draggedNode && (
                <div className="absolute top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span>Dragging: {draggedNode.name}</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Release to drop
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // List View fallback
        <div className="space-y-4">
          {forceGraphData.nodes.filter(n => n.level === 0).map((taskNode) => {
            const taskSubtasks = forceGraphData.nodes.filter(n => 
              n.level === 1 && n.subtask && taskNode.task?.subtasks.some((s: Subtask) => s.id === n.subtask!.id)
            );
            
            return (
              <div key={taskNode.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{taskNode.name}</h3>
                  <span className="text-sm text-gray-500">
                    {Math.round(taskNode.completion * 100)}% selesai
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {taskSubtasks.map((subtaskNode) => (
                    <div
                      key={subtaskNode.id}
                      className={`p-2 rounded border-l-4 cursor-pointer hover:bg-gray-50 ${
                        subtaskNode.subtask?.is_done ? 'border-green-500' : 'border-red-500'
                      }`}
                      onClick={() => subtaskNode.subtask && fetchSubmissionData(subtaskNode.subtask.id)}
                    >
                      <div className="flex items-center gap-2">
                        {subtaskNode.photoUrl ? (
                          <OptimizedAvatar
                            src={subtaskNode.photoUrl}
                            alt={subtaskNode.employeeName || 'Employee'}
                            size={20}
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium">{subtaskNode.name}</span>
                      </div>
                      {subtaskNode.employeeName && (
                        <p className="text-xs text-gray-500 mt-1">
                          {subtaskNode.employeeName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>📊 Data: {forceGraphData.nodes.filter(n => n.level === 0).length} tugas</span>
            <span>🎯 Mode: {viewMode === 'force' ? 'Force Graph' : 'List'}</span>
            <span>🔗 Links: {forceGraphData.links.length}</span>
            <span>⚡ Cache: {submissionCache.size} submissions</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingSubmissions && (
              <span className="text-blue-600">Sinkronisasi...</span>
            )}
            <span className="text-gray-400">Force-Directed Graph</span>
          </div>
        </div>
      </div>

      {/* Submission Modal - Same as original */}
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

export default MindMap;
