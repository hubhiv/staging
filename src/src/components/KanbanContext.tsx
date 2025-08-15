import React, { useEffect, useState, createContext, useContext, Component } from 'react';
import { TaskService } from '../services/taskService';
import { Task as ApiTask, TaskStatus, TaskPriority } from '../types/api';
import { parseApiError } from '../services/api';
/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Component: <KanbanProvider />
 * Handles:
 * - GET /tasks (fetching all tasks)
 * - PATCH /tasks/{id}/move (moving tasks between statuses)
 * - PATCH /tasks/{id}/rating (updating task ratings)
 * - DELETE /tasks/{id} (deleting tasks)
 * - PATCH /tasks/{id}/archive (archiving tasks)
 *
 * ==== BUSINESS LOGIC NOTES ====
 * - Task status flow: todo -> scheduled -> booked -> complete
 * - Tasks can be archived at any status
 * - Archived tasks are not shown by default (controlled by showArchived flag)
 * - Task health score calculation: Average of all system health scores
 * - Task priority affects UI display and sorting:
 *   - urgent: Highest priority, shown at top of columns
 *   - high: Second highest priority
 *   - medium: Default priority
 *   - low: Lowest priority
 * =============================
 *
 * ==== UI STATE HANDLING ====
 * - Loading: Set during API calls
 * - Error: Captured and displayed from API responses
 * - Data mapping: Converts backend task format to frontend format
 * =============================
 */
export type Priority = TaskPriority;
export type Status = TaskStatus;
export type ViewMode = 'board' | 'calendar' | 'myHome';
// Map API Task to our internal Task format
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
  rating: number;
  position?: number;
}
interface KanbanContextType {
  tasks: Task[];
  selectedTask: Task | null;
  currentView: ViewMode;
  isLoading: boolean;
  error: string | null;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewMode>>;
  moveTask: (taskId: string, newStatus: Status) => Promise<void>;
  updateTaskRating: (taskId: string, rating: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  showArchived: boolean;
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTasks: () => Promise<void>;
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
 *
 * NOTE: This is where field mapping happens between backend and frontend
 * Backend fields must match these names or this mapping needs to be updated
 */
const mapApiTaskToTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  status: apiTask.status,
  priority: apiTask.priority,
  assignee: apiTask.assignee,
  assigneeAvatar: apiTask.assignee_avatar || '',
  dueDate: apiTask.due_date,
  createdAt: apiTask.created_at,
  comments: apiTask.comments_count,
  attachments: apiTask.attachments_count,
  rating: apiTask.rating,
  position: apiTask.position
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
  // Fetch tasks on initial load
  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await TaskService.getTasks();
      const mappedTasks = response.data.map(mapApiTaskToTask);
      setTasks(mappedTasks);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to fetch tasks:', apiError);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refreshTasks();
  }, []);
  const moveTask = async (taskId: string, newStatus: Status) => {
    setError(null);
    try {
      const apiTask = await TaskService.moveTask(taskId, {
        status: newStatus
      });
      const updatedTask = mapApiTaskToTask(apiTask);
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));
      // Update selected task if it's the one being moved
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to move task:', apiError);
    }
  };
  const updateTaskRating = async (taskId: string, rating: number) => {
    setError(null);
    try {
      const apiTask = await TaskService.updateTaskRating(taskId, {
        rating
      });
      const updatedTask = mapApiTaskToTask(apiTask);
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));
      // Update selected task if it's the one being rated
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to update task rating:', apiError);
    }
  };
  const deleteTask = async (taskId: string) => {
    console.log('🗑️ DELETE TASK CALLED:', taskId);
    setError(null);
    try {
      console.log('🗑️ Calling TaskService.deleteTask with ID:', taskId);
      await TaskService.deleteTask(taskId);
      console.log('🗑️ TaskService.deleteTask completed successfully');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      console.log('🗑️ Task removed from local state');
      // If the deleted task is currently selected, close the detail view
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
        console.log('🗑️ Selected task cleared');
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('🗑️ Failed to delete task:', apiError);
    }
  };
  const archiveTask = async (taskId: string) => {
    setError(null);
    try {
      const apiTask = await TaskService.archiveTask(taskId);
      const updatedTask = mapApiTaskToTask(apiTask);
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));
      // If the archived task is currently selected, update its status in the detail view
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      console.error('Failed to archive task:', apiError);
    }
  };
  return <KanbanContext.Provider value={{
    tasks,
    selectedTask,
    currentView,
    isLoading,
    error,
    setTasks,
    setSelectedTask,
    setCurrentView,
    moveTask,
    updateTaskRating,
    deleteTask,
    archiveTask,
    showArchived,
    setShowArchived,
    refreshTasks
  }}>
      {children}
    </KanbanContext.Provider>;
};