import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useKanban } from './KanbanContext';
import { useAuth } from '../src/hooks/useAuth';
import { TaskService } from '../src/services/taskService';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus: 'todo' | 'scheduled' | 'booked' | 'complete';
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  defaultStatus
}) => {
  const { user } = useAuth();
  const { setTasks } = useKanban();
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
    dueDate: '',
    provider: '' as string
  });

  if (!isOpen) return null;

  // Handle form field changes
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!user || !user.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create task data for API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || 'Add description here',
        status: defaultStatus,
        priority: formData.priority,
        due_date: formData.dueDate || new Date().toISOString(),
        provider: formData.provider || undefined,
        assignee_id: user.id.toString()
      };

      console.log('Creating task with data:', taskData);

      // Create task via API
      const newTask = await TaskService.createTask(taskData);
      console.log('Task created successfully:', newTask);

      // Refresh tasks to show the new task
      const updatedTasks = await TaskService.getTasks(user.id.toString(), user.id.toString());
      setTasks(updatedTasks);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        provider: ''
      });
      onClose();

    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      provider: ''
    });
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Provider Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
            <select
              value={formData.provider}
              onChange={(e) => handleFieldChange('provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            >
              <option value="">Select Provider Type (Optional)</option>
              <option value="Plumbing">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="Painting">Painting</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleFieldChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCreating}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
