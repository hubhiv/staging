import React, { useState, createElement } from 'react';
import { Task, useKanban, Priority } from './KanbanContext';
import { Paperclip, MessageSquare, Calendar, Star } from 'lucide-react';
interface TaskCardProps {
  task: Task;
  onTouchStart?: (e: React.TouchEvent) => void;
  columnStatus: string;
  onDragStart?: (taskId: string) => void;
  providerType?: {
    id: string;
    name: string;
    icon: React.ReactNode;
    bgColor: string;
  };
}
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTouchStart,
  columnStatus,
  onDragStart,
  providerType
}) => {
  const {
    setSelectedTask
  } = useKanban();
  const [isDragging, setIsDragging] = useState(false);
  // Check if task is archived
  const isArchived = task.status === 'archived';
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceStatus', task.status);
    // Set a custom drag image (optional)
    const dragImage = document.createElement('div');
    dragImage.classList.add('bg-white', 'p-3', 'rounded-md', 'shadow-lg', 'border', 'border-blue-300');
    dragImage.style.width = '250px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    // Include provider type in drag image if available
    let providerHtml = '';
    if (providerType) {
      providerHtml = `
        <div class="flex items-center mt-1">
          <span class="w-3 h-3 rounded-full ${providerType.bgColor} mr-1"></span>
          <span class="text-xs text-gray-600">${providerType.name}</span>
        </div>
      `;
    }
    dragImage.innerHTML = `
      <h4 class="font-medium text-sm">${task.title}</h4>
      ${providerHtml}
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 125, 30);
    // Add a small delay to allow the drag image to be set
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    setIsDragging(true);
    // Notify the parent column that dragging has started
    if (onDragStart) {
      onDragStart(task.id);
    }
  };
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
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
  const getPriorityLabel = (priority: Priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  const handleBookingRequest = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    alert(`Booking requested for task: ${task.title}`);
  };

  // Format date consistently with TaskDetailModal
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Only allow dragging if the task is in the current column
  const isDraggable = task.status === columnStatus;
  // Apply border color based on provider type
  const getBorderColorClass = () => {
    if (!providerType) return 'border-gray-200';
    switch (providerType.id) {
      case 'hvac':
        return 'border-red-200';
      case 'plumbing':
        return 'border-blue-200';
      case 'electrical':
        return 'border-yellow-200';
      case 'painting':
        return 'border-purple-200';
      case 'carpentry':
        return 'border-amber-200';
      case 'landscaping':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };
  return <div className={`bg-white p-3 rounded-md border border-neutral-200 cursor-pointer transition-all duration-200
        ${getBorderColorClass()}
        ${isDragging ? 'opacity-50 scale-95 border-dashed shadow-lg' : 'hover:shadow-md'}
        ${isArchived ? 'opacity-70' : ''}`} onClick={() => setSelectedTask(task)} draggable={isDraggable} onDragStart={e => handleDragStart(e, task)} onDragEnd={handleDragEnd} onTouchStart={onTouchStart} style={{
    transform: isDragging ? 'rotate(-2deg)' : 'none'
  }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          {/* Show archived badge if task is archived */}
          {isArchived && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Archived
            </span>}
        </div>
        {providerType && <div className="flex items-center">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center ${providerType.bgColor} mr-1`}>
              {providerType.icon}
            </span>
            <span className="text-xs text-gray-500">{providerType.name}</span>
          </div>}
      </div>
      <h4 className="font-medium text-sm mb-2">{task.title}</h4>

      {/* Due Date Display */}
      {task.dueDate && formatDate(task.dueDate) && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
          <Calendar className="w-3 h-3" />
          <span>Due date: {formatDate(task.dueDate)}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center"></div>
        {!isArchived && <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md flex items-center" onClick={handleBookingRequest}>
            <Calendar className="w-3 h-3 mr-1" />
            <span className="whitespace-nowrap">Request Booking</span>
          </button>}
        <div className="flex space-x-2 text-gray-500">
          {task.comments > 0 && <div className="flex items-center text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              {task.comments}
            </div>}
          {task.attachments > 0 && <div className="flex items-center text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              {task.attachments}
            </div>}
        </div>
      </div>
    </div>;
};