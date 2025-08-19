import { useState, useEffect, useCallback } from 'react';
import { TaskService } from '../src/services/taskService';
import { Task } from '../src/types/api';

/**
 * Custom hook for managing maintenance tasks in the "My Home" page
 * Integrates with TaskService API and provides maintenance-specific data mapping
 * 
 * @param userId - User ID to fetch tasks for
 * @returns Object with tasks, loading state, error state, and CRUD operations
 */

// Maintenance-specific interface for display
export interface MaintenanceTask {
  id: string;
  name: string;
  system: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  status: 'upcoming' | 'overdue' | 'on-track' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  provider?: string;
}

// Map API Task status to maintenance schedule status
const mapTaskStatusToMaintenance = (apiStatus: string, dueDate?: number): MaintenanceTask['status'] => {
  switch (apiStatus) {
    case 'complete':
      return 'completed';
    case 'booked':
      return 'on-track';
    case 'todo':
    case 'scheduled':
      // Check if overdue based on due date
      if (dueDate && new Date(dueDate) < new Date()) {
        return 'overdue';
      }
      return 'upcoming';
    default:
      return 'upcoming';
  }
};

// Map provider field to system display name
const mapProviderToSystem = (provider?: string, providerType?: string): string => {
  if (provider) {
    return provider;
  }
  if (providerType) {
    switch (providerType.toLowerCase()) {
      case 'hvac':
        return 'HVAC';
      case 'plumbing':
        return 'Plumbing';
      case 'electrical':
        return 'Electrical';
      case 'exterior':
      case 'painting':
        return 'Exterior';
      default:
        return providerType;
    }
  }
  return 'General';
};

// Format Unix timestamp to display date
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return 'Not set';
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// Map maintenance schedule status to API status
const mapMaintenanceStatusToApi = (maintenanceStatus: string): 'todo' | 'scheduled' | 'booked' | 'complete' => {
  switch (maintenanceStatus) {
    case 'completed':
      return 'complete';
    case 'on-track':
      return 'booked';
    case 'upcoming':
      return 'scheduled';
    case 'overdue':
      return 'todo';
    default:
      return 'todo';
  }
};

// Map frontend system to API provider enum
const mapSystemToProvider = (system: string): 'Plumbing' | 'HVAC' | 'Painting' | 'Electrical' => {
  switch (system.toLowerCase()) {
    case 'plumbing':
      return 'Plumbing';
    case 'hvac':
      return 'HVAC';
    case 'painting':
      return 'Painting';
    case 'electrical':
      return 'Electrical';
    case 'exterior':
      return 'Painting'; // Map exterior to painting as closest match
    case 'windows & doors':
      return 'Electrical'; // Map to electrical as closest match
    case 'security & safety':
      return 'Electrical'; // Map to electrical as closest match
    default:
      return 'HVAC'; // Default fallback
  }
};

// Convert API Task to MaintenanceTask for display
const mapApiTaskToMaintenance = (apiTask: Task): MaintenanceTask => {
  return {
    id: apiTask.id,
    name: apiTask.title,
    system: mapProviderToSystem(apiTask.provider, apiTask.provider_type),
    frequency: 'As needed', // Default frequency since not in API
    lastDone: formatDate(apiTask.created_at),
    nextDue: formatDate(apiTask.due_date),
    status: mapTaskStatusToMaintenance(apiTask.status, apiTask.due_date),
    priority: apiTask.priority,
    provider: apiTask.provider
  };
};

export const useMaintenanceTasks = (userId: number = 2) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch maintenance tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TaskService.getTasks(userId, userId);
      const maintenanceTasks = response.task.map(mapApiTaskToMaintenance);
      
      setTasks(maintenanceTasks);
    } catch (err) {
      console.error('Failed to fetch maintenance tasks:', err);
      setError('Failed to load maintenance tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks by maintenance schedule status
  const getFilteredTasks = useCallback((filter: string) => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  }, [tasks]);

  // Get task counts for filter buttons
  const getTaskCounts = useCallback(() => {
    return {
      all: tasks.length,
      upcoming: tasks.filter(t => t.status === 'upcoming').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      'on-track': tasks.filter(t => t.status === 'on-track').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
  }, [tasks]);

  // Create new maintenance task
  const createTask = useCallback(async (taskData: Partial<MaintenanceTask>) => {
    try {
      setError(null);
      
      // Map maintenance task data to API format
      const apiTaskData = {
        title: taskData.name || '',
        description: taskData.notes || `Maintenance task: ${taskData.name}`,
        status: mapMaintenanceStatusToApi(taskData.status || 'upcoming'),
        priority: taskData.priority || 'medium' as const,
        assignee_id: userId, // Fix: Use integer instead of string
        due_date: taskData.nextDue ? new Date(taskData.nextDue).getTime() : new Date().getTime(), // Fix: Use timestamp and actual due date
        provider: mapSystemToProvider(taskData.system || ''),
        provider_type: taskData.system || '',
        position: 0
      };

      const newTask = await TaskService.createTask(apiTaskData);
      const maintenanceTask = mapApiTaskToMaintenance(newTask);
      
      setTasks(prev => [...prev, maintenanceTask]);
      return maintenanceTask;
    } catch (err) {
      console.error('Failed to create maintenance task:', err);
      setError('Failed to create task. Please try again.');
      throw err;
    }
  }, [userId]);

  // Update existing maintenance task
  const updateTask = useCallback(async (taskId: string, taskData: Partial<MaintenanceTask>) => {
    try {
      setError(null);
      
      // Map maintenance task data to API format
      const apiUpdateData = {
        title: taskData.name,
        priority: taskData.priority,
        provider: taskData.system
      };

      const updatedTask = await TaskService.updateTask(taskId, apiUpdateData);
      const maintenanceTask = mapApiTaskToMaintenance(updatedTask);
      
      setTasks(prev => prev.map(t => t.id === taskId ? maintenanceTask : t));
      return maintenanceTask;
    } catch (err) {
      console.error('Failed to update maintenance task:', err);
      setError('Failed to update task. Please try again.');
      throw err;
    }
  }, []);

  // Delete maintenance task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setError(null);
      
      await TaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete maintenance task:', err);
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  }, []);

  // Refresh tasks (useful for manual refresh)
  const refreshTasks = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    getFilteredTasks,
    getTaskCounts,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  };
};
