import React, { useState, createContext, useContext, useEffect } from 'react';
import { TaskService } from '../src/services/taskService';
import { Task as ApiTask, TaskCount } from '../src/types/api';
import { parseApiError } from '../src/services/api';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'scheduled' | 'booked' | 'complete' | 'archived';
export type ViewMode = 'board' | 'calendar';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  createdAt: string;
  comments: number;
  attachments: number;
  rating: number; // 0-5 rating
  position?: number;
  provider?: string; // NEW FIELD - Service provider category (Plumbing, HVAC, Painting, Electrical)
}
interface KanbanContextType {
  tasks: Task[];
  selectedTask: Task | null;
  currentView: ViewMode;
  isLoading: boolean;
  error: string | null;
  taskCounts: TaskCount[]; // TASK-018: Task count by status
  isLoadingCounts: boolean; // TASK-018: Loading state for counts
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewMode>>;
  moveTask: (taskId: string, newStatus: Status, newPosition?: number) => Promise<void>;
  reorderTasks: (reorderData: Array<{ id: string; position: number }>) => Promise<void>; // TASK-017
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<Task>;
  updateTaskRating: (taskId: string, rating: number) => void;
  deleteTask: (taskId: string) => Promise<void>;
  archiveTask: (taskId: string) => void;
  showArchived: boolean;
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTasks: () => Promise<void>;
  refreshTaskCounts: () => Promise<void>; // TASK-018: Refresh task counts
}
const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

/**
 * Helper function to convert API task to our internal format
 * Maps snake_case API fields to camelCase frontend fields
 */
const mapApiTaskToTask = (apiTask: ApiTask): Task => ({
  id: String(apiTask.id),
  title: apiTask.title,
  description: apiTask.description,
  status: apiTask.status,
  priority: apiTask.priority,
  assignee: apiTask.assignee || `User ${apiTask.assignee_id}`,
  assigneeAvatar: apiTask.assignee_avatar || '',
  dueDate: apiTask.due_date ? new Date(apiTask.due_date).toISOString() : '',
  createdAt: new Date(apiTask.created_at).toISOString(),
  comments: apiTask.comments_count || 0,
  attachments: apiTask.attachments_count || 0,
  rating: apiTask.rating || 0,
  position: apiTask.position || 0,
  provider: apiTask.provider || undefined // NEW FIELD - Map provider field from API
});
export const KanbanProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // TASK-018: Task count state management
  const [taskCounts, setTaskCounts] = useState<TaskCount[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(false);

  // Fetch tasks from API on initial load
  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use test user ID 2 from API validation
      const response = await TaskService.getTasks(2, 2);
      const mappedTasks = response.task.map(mapApiTaskToTask);

      // Sort tasks by position within each status
      const sortedTasks = mappedTasks.sort((a, b) => {
        if (a.status !== b.status) {
          return 0; // Keep original order for different statuses
        }
        return (a.position || 0) - (b.position || 0);
      });

      setTasks(sortedTasks);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to fetch tasks:', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // TASK-018: Fetch task counts from API
  const refreshTaskCounts = async () => {
    setIsLoadingCounts(true);
    try {
      // Use test user ID 2 from API validation
      const counts = await TaskService.getTaskCounts(2);
      setTaskCounts(counts);
    } catch (err) {
      const apiError = parseApiError(err);
      console.error('Failed to fetch task counts:', apiError);
      // Don't set error state for counts - fall back to local calculation
    } finally {
      setIsLoadingCounts(false);
    }
  };

  // Load tasks and task counts on component mount
  useEffect(() => {
    refreshTasks();
    refreshTaskCounts(); // TASK-018: Load task counts
  }, []);
  const moveTask = async (taskId: string, newStatus: Status, newPosition?: number) => {
    setError(null);
    try {
      // Prepare move data
      const moveData = {
        status: newStatus,
        ...(newPosition !== undefined && { position: newPosition })
      };

      // Call API to move task
      const updatedApiTask = await TaskService.moveTask(taskId, moveData);
      const updatedTask = mapApiTaskToTask(updatedApiTask);

      // Update local state
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));

      // Update selected task if it's the one being moved
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }

      console.log('Task moved successfully via API:', updatedTask);

    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to move task via API:', apiError);

      // Fallback to local state update if API fails
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
        ...task,
        status: newStatus
      } : task));
    }
  };

  /**
   * Bulk reorder multiple tasks (TASK-017 Integration)
   *
   * This method handles bulk task reordering using the /tasks/reorder API endpoint.
   * It implements optimistic UI updates with proper error handling and rollback.
   * TASK-019: Enhanced to support status preservation during drag-and-drop
   *
   * @param reorderData Array of task id/position/status data for bulk reordering
   * @returns Promise that resolves when reorder is complete
   */
  const reorderTasks = async (reorderData: Array<{ id: string; position: number; status?: string }>) => {
    setError(null);

    // Store current state for rollback on error
    const previousTasks = [...tasks];

    try {
      // Convert string IDs to numbers for API (TASK-019: Include status)
      const apiReorderData = {
        reorder: reorderData.map(item => ({
          id: parseInt(item.id, 10),
          position: item.position,
          ...(item.status && { status: item.status }) // Include status if provided
        }))
      };

      // Optimistic UI update: Apply changes immediately
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];

        // Update positions and status for the reordered tasks (TASK-019)
        reorderData.forEach(({ id, position, status }) => {
          const taskIndex = updatedTasks.findIndex(task => task.id === id);
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              position,
              ...(status && { status: status as Status }) // Update status if provided
            };
          }
        });

        // Sort tasks by position within each status group
        return updatedTasks.sort((a, b) => {
          if (a.status !== b.status) {
            return 0; // Don't change order between different statuses
          }
          return (a.position || 0) - (b.position || 0);
        });
      });

      // Call the bulk reorder API
      const updatedApiTasks = await TaskService.reorderTasks(apiReorderData);

      // Sync with API response to ensure consistency
      setTasks(prevTasks => {
        const taskMap = new Map(prevTasks.map(task => [task.id, task]));

        // Update tasks with API response data
        updatedApiTasks.forEach(apiTask => {
          const mappedTask = mapApiTaskToTask(apiTask);
          taskMap.set(mappedTask.id, mappedTask);
        });

        return Array.from(taskMap.values()).sort((a, b) => {
          if (a.status !== b.status) {
            return 0;
          }
          return (a.position || 0) - (b.position || 0);
        });
      });

    } catch (err) {
      const apiError = parseApiError(err);
      setError(`Failed to reorder tasks: ${apiError.message}`);
      console.error('Failed to reorder tasks via API:', apiError);

      // Rollback to previous state on error
      setTasks(previousTasks);

      // Re-throw error for component-level error handling
      throw err;
    }
  };

  const updateTaskRating = (taskId: string, rating: number) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      rating
    } : task));
    // Also update the selected task if it's the one being rated
    setSelectedTask(prevTask => prevTask && prevTask.id === taskId ? {
      ...prevTask,
      rating
    } : prevTask);
  };

  // Add updateTask method for TASK-013 task detail editing
  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      // Import TaskService dynamically to avoid circular dependencies
      const { TaskService } = await import('../src/services/taskService');

      // Prepare update data for API (only include updatable fields)
      const apiUpdateData = {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.priority && { priority: updateData.priority }),
        ...(updateData.dueDate && { due_date: updateData.dueDate }),
        ...(updateData.assignee && { assignee_id: updateData.assignee }), // Map to assignee_id
        ...(updateData.provider !== undefined && { provider: updateData.provider as any }), // NEW FIELD - Include provider field
        // Add other updatable fields as needed
      };

      // Call API to update task
      const updatedApiTask = await TaskService.updateTask(taskId, apiUpdateData);

      // Map API response back to local Task format
      const updatedTask = mapApiTaskToTask(updatedApiTask);

      // Update local state with API response
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Update selected task if it's the one being updated
      setSelectedTask(prevTask =>
        prevTask && prevTask.id === taskId ? updatedTask : prevTask
      );

      console.log('Task updated successfully via API:', updatedTask);
      return updatedTask;

    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to update task via API:', apiError);

      // Fallback to local state update if API fails
      const fallbackTask: Task = {
        ...tasks.find(task => task.id === taskId)!,
        ...updateData
      };

      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? fallbackTask : task
      ));

      // Update selected task locally
      setSelectedTask(prevTask =>
        prevTask && prevTask.id === taskId ? fallbackTask : prevTask
      );

      return fallbackTask;
    }
  };
  const deleteTask = async (taskId: string) => {
    setError(null);
    try {
      await TaskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      // If the deleted task is currently selected, close the detail view
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to delete task:', apiError);
    }
  };
  const archiveTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      status: 'archived'
    } : task));
    // If the archived task is currently selected, update its status in the detail view
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        status: 'archived'
      });
    }
  };
  return <KanbanContext.Provider value={{
    tasks,
    selectedTask,
    currentView,
    isLoading,
    error,
    taskCounts, // TASK-018: Task count by status
    isLoadingCounts, // TASK-018: Loading state for counts
    setTasks,
    setSelectedTask,
    setCurrentView,
    moveTask,
    reorderTasks, // TASK-017: Bulk reorder functionality
    updateTask,
    updateTaskRating,
    deleteTask,
    archiveTask,
    showArchived,
    setShowArchived,
    refreshTasks,
    refreshTaskCounts // TASK-018: Refresh task counts
  }}>
      {children}
    </KanbanContext.Provider>;
};