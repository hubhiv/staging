import React, { useState, Component } from 'react';
import { useKanban, Status } from './KanbanContext';
import { X, Paperclip, Link2, MessageSquare, Calendar, AlertCircle, User, DollarSign, Tag, ChevronDown, Trash2 } from 'lucide-react';
import { StarRating } from './StarRating';
export const TaskDetail: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTaskRating,
    moveTask,
    deleteTask
  } = useKanban();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (!selectedTask) return null;
  const getPriorityColor = () => {
    switch (selectedTask.priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'todo':
        return 'border-gray-300 bg-gray-50 text-gray-700';
      case 'scheduled':
        return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'booked':
        return 'border-purple-300 bg-purple-50 text-purple-700';
      case 'complete':
        return 'border-green-300 bg-green-50 text-green-700';
      case 'archived':
        return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };
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
      case 'archived':
        return 'Archived';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    moveTask(selectedTask.id, newStatus);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedTask(null);
    }
  };
  const handleRequestBooking = () => {
    alert(`Booking requested for task: ${selectedTask.title}`);
  };
  const handleRatingChange = (newRating: number) => {
    updateTaskRating(selectedTask.id, newRating);
  };
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  const handleConfirmDelete = () => {
    deleteTask(selectedTask.id);
    setShowDeleteConfirm(false);
  };

  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          
          <div className="flex items-center">
            <button className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100" onClick={() => setSelectedTask(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-3 sm:p-6">
          <h1 className="text-lg sm:text-xl font-semibold mb-4">
            {selectedTask.title}
          </h1>
          {/* Star Rating Component */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Your Rating:
              </span>
              <StarRating rating={selectedTask.rating} onChange={handleRatingChange} color="yellow-400" />
            </div>
          </div>
          {/* Description Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700">{selectedTask.description}</p>
          </div>
          {/* Details Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Status Dropdown (moved from TaskCard) */}
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Status:
              </span>
              <div className="relative inline-block">
                <div className={`flex items-center space-x-1 text-sm px-3 py-1 rounded border ${getStatusColor(selectedTask.status)}`}>
                  <select value={selectedTask.status} onChange={handleStatusChange} className={`appearance-none pr-6 focus:outline-none cursor-pointer bg-transparent ${getStatusColor(selectedTask.status)}`} disabled={isArchived}>
                    <option value="todo">To Do</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="booked">Booked</option>
                    <option value="complete">Complete</option>
                    <option value="archived">Archived</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Provider:
              </span>
              <span className="text-sm">Web Development</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Price:
              </span>
              <span className="text-sm">$75-150/hour</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Priority:
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor()}`}>
                {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Assignee:
              </span>
              <div className="flex items-center">
                <img src={selectedTask.assigneeAvatar} alt={selectedTask.assignee} className="w-6 h-6 rounded-full mr-2" />
                <span className="text-sm">{selectedTask.assignee}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Due Date:
              </span>
              <span className="text-sm">
                {formatDate(selectedTask.dueDate)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 w-20 sm:w-24">
                Created:
              </span>
              <span className="text-sm">
                {formatDate(selectedTask.createdAt)}
              </span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center hover:bg-blue-700" onClick={handleRequestBooking}>
              <Calendar className="w-4 h-4 mr-2" />
              Request Booking
            </button>
          </div>
          {/* Task Management Buttons */}
          <div className="flex space-x-4 mt-4">
            <button className="flex-1 border border-red-500 text-red-600 py-2 rounded flex items-center justify-center hover:bg-red-50" onClick={handleDeleteClick}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </button>
          </div>
          <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4">
            <div className="flex flex-wrap gap-2 sm:space-x-4 mb-4">
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <MessageSquare className="w-4 h-4 mr-1" />
                Comment
              </button>
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <Paperclip className="w-4 h-4 mr-1" />
                Attach
              </button>
            </div>
            {selectedTask.comments > 0 && <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Comments ({selectedTask.comments})
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <img src="https://randomuser.me/api/portraits/women/33.jpg" alt="Commenter" className="w-8 h-8 rounded-full" />
                    <div className="flex-1 bg-gray-50 rounded-md p-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-xs">
                          Riley Johnson
                        </span>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                      <p className="text-sm mt-1">
                        Let's make sure we prioritize this for the next sprint.
                      </p>
                    </div>
                  </div>
                </div>
              </div>}
            <div className="mt-4">
              <textarea placeholder="Add a comment..." className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3}></textarea>
              <div className="flex justify-end mt-2">
                <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Task
              </h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>}

      </div>
    </div>;
};