import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Tag, Star, Trash2, AlertCircle, Edit } from 'lucide-react';
import { Task, Priority, Status, useKanban } from './KanbanContext';
import { parseApiError } from '../src/services/api';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    updateTaskRating,
    deleteTask,
    moveTask
  } = useKanban();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: '',
    assignee: '',
    rating: 0,
    provider: '' as string // NEW FIELD - Provider selection
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate,
        assignee: selectedTask.assignee,
        rating: selectedTask.rating,
        provider: selectedTask.provider || '' // NEW FIELD - Initialize provider field
      });
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  // Handle form field changes
  const handleFieldChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle rating changes
  const handleRatingChange = (rating: number) => {
    if (isEditing) {
      // In edit mode, update form data
      setFormData(prev => ({
        ...prev,
        rating
      }));
      setError(null);
    } else {
      // In view mode, call API directly
      updateTaskRating(selectedTask.id, rating);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.length > 255) {
      setError('Title must be less than 255 characters');
      return false;
    }
    if (formData.description.length > 2000) {
      setError('Description must be less than 2000 characters');
      return false;
    }
    return true;
  };

  // Save task changes
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Transform formData to match API interface
      const apiData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.dueDate,
        provider: formData.provider || undefined, // NEW FIELD - Include provider in API call
        // Note: assignee_id would need to be mapped from assignee name to ID
        // For now, we'll omit it since we're not editing assignee in this test
      };

      // If rating changed, update it separately (different API endpoint)
      if (formData.rating !== selectedTask.rating) {
        await updateTaskRating(selectedTask.id, formData.rating);
      }

      await updateTask(selectedTask.id, apiData);
      setIsEditing(false);
    } catch (err: any) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      dueDate: selectedTask.dueDate,
      assignee: selectedTask.assignee,
      rating: selectedTask.rating
    });
    setIsEditing(false);
    setError(null);
  };

  // Handle modal close
  const handleClose = () => {
    if (isEditing) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        handleCancel();
        setSelectedTask(null);
      }
    } else {
      setSelectedTask(null);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isEditing]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Status change handler
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    moveTask(selectedTask.id, newStatus);
  };

  // Utility functions
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Status): string => {
    switch (status) {
      case 'todo': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isArchived = selectedTask.status === 'archived';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-gray-900">Task Details</h2>
            {isArchived && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Archived
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h3>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.description}</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Properties */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={handleStatusChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(selectedTask.status)}`}
                    disabled={isArchived}
                  >
                    <option value="todo">To Do</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="booked">Booked</option>
                    <option value="complete">Complete</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  {isEditing ? (
                    <select
                      value={formData.priority}
                      onChange={(e) => handleFieldChange('priority', e.target.value as Priority)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSaving}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedTask.dueDate)}
                    </div>
                  )}
                </div>

                {/* Provider Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
                  {isEditing ? (
                    <select
                      value={formData.provider}
                      onChange={(e) => handleFieldChange('provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSaving}
                    >
                      <option value="">Select Provider Type</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Painting">Painting</option>
                      <option value="Electrical">Electrical</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedTask.provider ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedTask.provider}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">No provider assigned</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <div className="flex items-center gap-2">
                    {selectedTask.assigneeAvatar && (
                      <img src={selectedTask.assigneeAvatar} alt={selectedTask.assignee} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-gray-700">{selectedTask.assignee}</span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer ${
                          star <= (isEditing ? formData.rating : selectedTask.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                        onClick={() => handleRatingChange(star)}
                      />
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Comments:</span>
                    <span>{selectedTask.comments}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Attachments:</span>
                    <span>{selectedTask.attachments}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Created:</span>
                    <span>{formatDate(selectedTask.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={() => {
            deleteTask(selectedTask.id);
            setShowDeleteConfirm(false);
            setSelectedTask(null);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
        />
      )}


    </div>
  );
};

// Confirmation Dialog Component
interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  confirmClass: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  confirmClass
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-md ${confirmClass}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);
