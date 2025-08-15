import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
interface MaintenanceTask {
  id: string;
  name: string;
  system: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  status: 'upcoming' | 'overdue' | 'on-track' | 'completed';
  notes?: string;
}
interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask | null;
  onSave: (task: MaintenanceTask) => Promise<void>;
}
export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave
}) => {
  const [formData, setFormData] = useState<MaintenanceTask>({
    id: '',
    name: '',
    system: '',
    frequency: '',
    lastDone: '',
    nextDue: '',
    status: 'upcoming',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    if (task) {
      setFormData({
        ...task
      });
    }
  }, [task]);
  if (!isOpen) return null;
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    if (!formData.system) {
      newErrors.system = 'System is required';
    }
    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    if (!formData.lastDone) {
      newErrors.lastDone = 'Last done date is required';
    }
    if (!formData.nextDue) {
      newErrors.nextDue = 'Next due date is required';
    }
    // Check date relationship - next due date should be after last done date
    if (formData.lastDone && formData.nextDue) {
      const lastDone = new Date(formData.lastDone);
      const nextDue = new Date(formData.nextDue);
      if (nextDue <= lastDone) {
        newErrors.nextDue = 'Next due date must be after last done date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing in a field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
        setIsSuccess(true);
        // Close the modal after a short delay to show success state
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
        }, 1500);
      } catch (error) {
        console.error('Error saving task:', error);
        setErrors({
          submit: 'Failed to save task. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">Edit Maintenance Task</h3>
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Success message */}
          {isSuccess && <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">Task updated successfully!</p>
            </div>}
          {/* Error message */}
          {errors.submit && <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{errors.submit}</p>
            </div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., HVAC Filter Replacement" className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System
              </label>
              <select name="system" value={formData.system} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.system ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}>
                <option value="">Select a system</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Exterior">Exterior</option>
                <option value="Windows">Windows & Doors</option>
                <option value="Security">Security & Safety</option>
              </select>
              {errors.system && <p className="mt-1 text-sm text-red-600">{errors.system}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select name="frequency" value={formData.frequency} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.frequency ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}>
                <option value="">Select frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-annual">Bi-annual</option>
                <option value="Annual">Annual</option>
                <option value="Custom">Custom</option>
              </select>
              {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Done
              </label>
              <input type="date" name="lastDone" value={formData.lastDone} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.lastDone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`} />
              {errors.lastDone && <p className="mt-1 text-sm text-red-600">{errors.lastDone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Due
              </label>
              <input type="date" name="nextDue" value={formData.nextDue} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.nextDue ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`} />
              {errors.nextDue && <p className="mt-1 text-sm text-red-600">{errors.nextDue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
                <option value="on-track">On Track</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Any additional information about this task" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 sticky bottom-0 bg-white z-10">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className={`px-4 py-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded flex items-center`} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>;
};