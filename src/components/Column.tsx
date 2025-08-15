import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskCreateModal } from './TaskCreateModal';
import { Task, useKanban, Priority, Status } from './KanbanContext';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';
interface ColumnProps {
  title: string;
  tasks: Task[];
  status: 'todo' | 'scheduled' | 'booked' | 'complete';
  count: number;
  isMobile?: boolean;
  onDragStart?: (taskId: string, status: string, position: number) => void;
  onDragOver?: () => void;
  onPositionChange?: (taskId: string, newPosition: number) => void;
  draggedTaskId?: string | null;
  draggedStatus?: string | null;
  dragPosition?: number | null;
  isDropTarget?: boolean;
  isReordering?: boolean;
  className?: string;
  enableReordering?: boolean;
  providerTypes?: any[];
  autoHeight?: boolean;
}
export const Column: React.FC<ColumnProps> = ({
  title,
  tasks,
  status,
  count,
  isMobile = false,
  onDragStart,
  onDragOver,
  onPositionChange,
  draggedTaskId,
  draggedStatus,
  dragPosition,
  isDropTarget,
  isReordering,
  className = '',
  enableReordering = false,
  providerTypes = [],
  autoHeight = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'scheduled':
        return 'Scheduled';
      case 'booked':
        return 'Booked';
      case 'complete':
        return 'Complete';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  const {
    moveTask,
    tasks: kanbanTasks,
    setTasks
  } = useKanban();

  // Get current user for assignee_id
  const { user } = useAuth();
  // Function to add a new task using Xano API
  const handleAddTask = async () => {
    try {
      // Check if user is available (required for assignee_id)
      if (!user || !user.id) {
        alert('User not authenticated. Please log in again.');
        return;
      }

      // Import TaskService dynamically to avoid circular dependencies
      const { TaskService } = await import('../src/services/taskService');

      // Create task data for Xano API (matching actual Xano structure)
      const taskData = {
        title: 'New Task',
        description: 'Add description here',
        status: status,
        priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
        due_date: new Date().toISOString(),
        provider_type: 'general',
        assignee_id: user.id.toString() // Add the current user as assignee
      };

      // Task data includes assignee_id to prevent orphaned tasks

      // Create task via Xano API
      const createdTask = await TaskService.createTask(taskData);

      // Map Xano response to our Task interface
      const newTask: Task = {
        id: createdTask.id.toString(),
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        priority: createdTask.priority,
        assignee: 'Unassigned',
        assigneeAvatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(createdTask.created_at).toISOString().split('T')[0],
        comments: createdTask.comments_count || 0,
        attachments: createdTask.attachments_count || 0,
        rating: createdTask.rating || 0
      };

      // Add to local state
      setTasks(prevTasks => [...prevTasks, newTask]);

      console.log('Task created successfully:', createdTask);

    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };
  // Get provider type for a task using real provider data from API
  const getProviderType = (task: any) => {
    if (!providerTypes || providerTypes.length === 0) return null;
    // Use actual provider field from task data instead of simulated assignment
    if (task.provider) {
      return providerTypes.find(p => p.id === task.provider);
    }
    return null; // No provider assigned
  };
  // Determine if this column is a valid drop target
  const isValidDropTarget = draggedTaskId && draggedStatus !== status;
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
    if (onDragOver) {
      onDragOver();
    }

    // Calculate position for reordering and visual drop indicator (TASK-017)
    if (enableReordering && draggedTaskId && onPositionChange) {
      const cardHeight = 120; // Approximate height of a task card including margins
      const containerRect = e.currentTarget.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top;

      // Calculate drop position based on mouse position
      const newPosition = Math.max(0, Math.floor(relativeY / cardHeight));

      // Set visual drop indicator position
      setDropIndicatorPosition(newPosition);

      // Notify parent component of position change
      onPositionChange(draggedTaskId, newPosition);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're leaving the column (not entering a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropIndicatorPosition(null); // Clear drop indicator (TASK-017)
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropIndicatorPosition(null); // Clear drop indicator (TASK-017)
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');
    // Only move if dropping to a different column
    if (sourceStatus !== status) {
      moveTask(taskId, status);
    }
  };
  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    // Store the task ID for potential move
    e.currentTarget.setAttribute('data-task-id', taskId);
    if (onDragStart) {
      const position = tasks.findIndex(t => t.id === taskId);
      onDragStart(taskId, status, position);
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Implementation for touch-based task moving would go here
    // This is a simplified version - a full implementation would need more logic
  };
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  // Handle task drag start from this column
  const handleTaskDragStart = (taskId: string) => {
    if (onDragStart) {
      const position = tasks.findIndex(t => t.id === taskId);
      onDragStart(taskId, status, position);
    }
  };
  // Get column-specific styles based on status
  const getColumnStyles = () => {
    switch (status) {
      case 'todo':
        return {
          background: 'bg-blue-50',
          border: 'border-blue-200',
          header: 'bg-blue-100 border-blue-300',
          headerText: 'text-blue-800',
          badge: 'bg-blue-200 text-blue-800',
          taskBorder: 'border-neutral-200'
        };
      case 'scheduled':
        return {
          background: 'bg-indigo-50',
          border: 'border-indigo-200',
          header: 'bg-indigo-100 border-indigo-300',
          headerText: 'text-indigo-800',
          badge: 'bg-indigo-200 text-indigo-800',
          taskBorder: 'border-neutral-200'
        };
      case 'booked':
        return {
          background: 'bg-[#edf9fa]',
          // updated to match the new soft teal
          border: 'border-cyan-200',
          header: 'bg-cyan-100 border-cyan-300',
          headerText: 'text-cyan-800',
          badge: 'bg-cyan-200 text-cyan-800',
          taskBorder: 'border-neutral-200'
        };
      case 'complete':
        return {
          background: 'bg-emerald-50',
          // matches the minty green from image
          border: 'border-emerald-200',
          header: 'bg-emerald-100 border-emerald-300',
          headerText: 'text-emerald-800',
          badge: 'bg-emerald-200 text-emerald-800',
          taskBorder: 'border-neutral-200'
        };
      case 'archived':
        return {
          background: 'bg-yellow-50',
          border: 'border-yellow-200',
          header: 'bg-yellow-100 border-yellow-300',
          headerText: 'text-yellow-800',
          badge: 'bg-yellow-200 text-yellow-800',
          taskBorder: 'border-neutral-200'
        };
      default:
        return {
          background: 'bg-gray-50',
          border: 'border-gray-200',
          header: 'bg-gray-100 border-gray-300',
          headerText: 'text-gray-800',
          badge: 'bg-gray-200 text-gray-700',
          taskBorder: 'border-neutral-200'
        };
    }
  };
  const styles = getColumnStyles();
  return (
    <>
      <div className={`flex flex-col ${isMobile ? 'w-full mb-4' : 'w-full min-w-0'} h-auto
        ${isDragOver ? 'bg-blue-100 border-2 border-blue-400 ring-2 ring-blue-300 shadow-md' : isValidDropTarget ? `${styles.background} border-2 ${styles.border} ring-1 ring-blue-200` : `${styles.background} border-2 ${styles.border} shadow-sm`} 
        rounded-lg transition-all duration-200 ease-in-out ${className}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onTouchEnd={handleTouchEnd}>
      <div className={`p-3 flex justify-between items-center border-b-2 
          ${isDragOver ? 'border-blue-400 bg-blue-100' : `${styles.header} ${styles.headerText}`}`}>
        <div className="flex items-center">
          <h3 className={`font-semibold text-sm ${styles.headerText}`}>
            {title}
          </h3>
          <span className={`ml-2 ${styles.badge} text-xs px-2 py-0.5 rounded-full`}>
            {count}
          </span>
        </div>
        <div className="flex items-center">
          <button className={`p-1 rounded hover:bg-opacity-70 hover:bg-white mr-1 ${styles.headerText}`} onClick={() => setShowCreateModal(true)} title={`Create new task for ${getStatusLabel(status)} column`}>
            <Plus className="w-4 h-4" />
          </button>
          {isMobile && <button className={`p-1 rounded hover:bg-opacity-70 hover:bg-white ${styles.headerText}`} onClick={toggleCollapse}>
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>}
        </div>
      </div>
      {(!isMobile || !isCollapsed) && <div className={`p-3 space-y-3 w-full relative
            ${isDragOver ? 'bg-blue-50' : styles.background}`}>
          {tasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* Visual drop indicator (TASK-017) */}
              {dropIndicatorPosition === index && draggedTaskId && (
                <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-blue-500 z-10 rounded-full shadow-sm">
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
              <TaskCard
                task={task}
                onTouchStart={e => handleTouchStart(e, task.id)}
                columnStatus={status}
                onDragStart={handleTaskDragStart}
                providerType={getProviderType(task)}
              />
            </div>
          ))}
          {/* Drop indicator at the end of the list */}
          {dropIndicatorPosition === tasks.length && draggedTaskId && (
            <div className="relative h-0.5 bg-blue-500 z-10 rounded-full shadow-sm">
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )}
          {tasks.length === 0 && <div className={`text-center py-8 px-2 border-2 border-dashed rounded-md 
                ${isDragOver ? 'border-blue-400 bg-blue-100 text-blue-700' : isValidDropTarget ? `border-${status}-300 bg-${status}-100/30 text-${status}-600` : `border-${status}-200 text-${status}-500`} 
                text-sm transition-colors duration-200`}>
              {isDragOver ? 'Drop to move task here' : isValidDropTarget ? 'Drag task here' : 'No tasks in this column'}
            </div>}
        </div>}

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultStatus={status}
      />
    </div>
    </>
  );
};