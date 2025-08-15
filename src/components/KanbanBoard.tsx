import React, { useEffect, useState, useRef, createElement } from 'react';
import { Column } from './Column';
import { useKanban } from './KanbanContext';
import { Status } from './KanbanContext';
import { Thermometer, Droplet, Zap, Paintbrush, Hammer, Flower2, Wrench, Filter, Archive } from 'lucide-react';
// Define provider types with their icons and colors - Updated to match API enum values
const providerTypes = [{
  id: 'HVAC', // Updated to match API enum
  name: 'HVAC',
  icon: <Thermometer className="w-3 h-3 text-white" />,
  bgColor: 'bg-red-500'
}, {
  id: 'Plumbing', // Updated to match API enum
  name: 'Plumbing',
  icon: <Droplet className="w-3 h-3 text-white" />,
  bgColor: 'bg-blue-500'
}, {
  id: 'Electrical', // Updated to match API enum
  name: 'Electrical',
  icon: <Zap className="w-3 h-3 text-white" />,
  bgColor: 'bg-yellow-500'
}, {
  id: 'Painting', // Updated to match API enum
  name: 'Painting',
  icon: <Paintbrush className="w-3 h-3 text-white" />,
  bgColor: 'bg-purple-500'
}, {
  id: 'carpentry',
  name: 'Carpentry',
  icon: <Hammer className="w-3 h-3 text-white" />,
  bgColor: 'bg-amber-700'
}, {
  id: 'landscaping',
  name: 'Landscaping',
  icon: <Flower2 className="w-3 h-3 text-white" />,
  bgColor: 'bg-green-500'
}, {
  id: 'general',
  name: 'General',
  icon: <Wrench className="w-3 h-3 text-white" />,
  bgColor: 'bg-gray-500'
}];
export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    setTasks,
    moveTask,
    reorderTasks, // TASK-017: Bulk reorder functionality
    showArchived,
    setShowArchived,
    isLoading,
    error,
    refreshTasks,
    taskCounts, // TASK-018: Task count by status
    isLoadingCounts, // TASK-018: Loading state for counts
    refreshTaskCounts // TASK-018: Refresh task counts
  } = useKanban();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragImage, setDragImage] = useState<HTMLElement | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [previousTasksState, setPreviousTasksState] = useState<typeof tasks | null>(null);
  // Provider filter states
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Toggle provider filter
  const toggleProviderFilter = (providerId: string) => {
    setSelectedProviders(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
  };
  // Clear all filters
  const clearFilters = () => {
    setSelectedProviders([]);
    setShowArchived(false);
  };
  // Toggle archived tasks visibility
  const toggleArchivedVisibility = () => {
    setShowArchived(prev => !prev);
  };
  // Get provider info for a task using real provider data from API
  const getProviderInfo = (task: any) => {
    // Use actual provider field from task data instead of simulated assignment
    if (task.provider) {
      return providerTypes.find(p => p.id === task.provider);
    }
    return null; // No provider assigned
  };
  // Sort tasks by position within each status
  const sortedTasks = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
  // Filter tasks by selected provider types and archive status
  const filterTasksByProviderAndArchive = (tasksList: typeof tasks) => {
    let filteredTasks = tasksList;
    // First filter by provider if any selected
    if (selectedProviders.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.provider && selectedProviders.includes(task.provider)
      );
    }
    // Then filter by archive status
    if (!showArchived) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'archived');
    }
    return filteredTasks;
  };
  // Get visible tasks for each column
  const todoTasks = sortedTasks.filter(task => task.status === 'todo');
  const scheduledTasks = sortedTasks.filter(task => task.status === 'scheduled');
  const bookedTasks = sortedTasks.filter(task => task.status === 'booked');
  const completeTasks = sortedTasks.filter(task => task.status === 'complete');
  const archivedTasks = sortedTasks.filter(task => task.status === 'archived');
  // Apply filters to each column
  const filteredTodoTasks = filterTasksByProviderAndArchive(todoTasks);
  const filteredScheduledTasks = filterTasksByProviderAndArchive(scheduledTasks);
  const filteredBookedTasks = filterTasksByProviderAndArchive(bookedTasks);
  const filteredCompleteTasks = filterTasksByProviderAndArchive(completeTasks);
  const filteredArchivedTasks = filterTasksByProviderAndArchive(archivedTasks);

  // TASK-018: Helper function to get count from API data with fallback to local count
  const getTaskCount = (status: string): number => {
    // Try to get count from API data first
    const apiCount = taskCounts.find(count => count.task_status === status)?.count;

    // Fallback to local calculation if API data not available or loading
    if (apiCount !== undefined && !isLoadingCounts) {
      return apiCount;
    }

    // Fallback to filtered task length
    switch (status) {
      case 'todo': return filteredTodoTasks.length;
      case 'scheduled': return filteredScheduledTasks.length;
      case 'booked': return filteredBookedTasks.length;
      case 'complete': return filteredCompleteTasks.length;
      case 'archived': return filteredArchivedTasks.length;
      default: return 0;
    }
  };
  // Handle drag start at the board level to track which task is being dragged
  const handleDragStart = (taskId: string, status: string, position: number) => {
    setDraggedTaskId(taskId);
    setDraggedStatus(status);
    setDragPosition(position);
    setPreviousTasksState(tasks); // Store the current state for rollback if needed
    // Create a custom drag image that follows the cursor
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const ghostElement = document.createElement('div');
      ghostElement.classList.add('fixed', 'pointer-events-none', 'z-50', 'bg-white', 'shadow-xl', 'rounded-md', 'border-2', 'border-blue-400', 'p-3', 'w-64', 'opacity-90');
      // Get provider info for the task using real provider data
      const providerInfo = getProviderInfo(task);
      ghostElement.innerHTML = `
        <div class="font-medium text-sm">${task.title}</div>
        <div class="flex items-center mt-1">
          <span class="w-3 h-3 rounded-full mr-1 flex items-center justify-center ${providerInfo?.bgColor || 'bg-gray-500'}"></span>
          <span class="text-xs text-gray-500">${providerInfo?.name || 'Unknown'} | Moving from ${status} column</span>
        </div>
      `;
      ghostElement.style.top = '-1000px';
      document.body.appendChild(ghostElement);
      setDragImage(ghostElement);
    }
    // Announce to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = `Dragging task ${taskId} from ${status} column`;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };
  // Handle task position change within a column
  const handleTaskPositionChange = (taskId: string, newPosition: number) => {
    setDropPosition(newPosition);
  };
  /**
   * Calculate bulk reorder data for TASK-017 implementation (OPTIMIZED)
   * This function determines which tasks need position updates after a drag operation
   * ONLY updates the target column, not all tasks globally
   * TASK-019: Enhanced to include status preservation for drag-and-drop
   */
  const calculateBulkReorderData = (
    allTasks: typeof tasks,
    draggedTaskId: string,
    targetStatus: Status,
    targetPosition: number
  ): Array<{ id: string; position: number; status?: string }> => {
    const reorderData: Array<{ id: string; position: number; status?: string }> = [];

    // Get the dragged task
    const draggedTask = allTasks.find(t => t.id === draggedTaskId);
    if (!draggedTask) return reorderData;

    // Get tasks in the target column (excluding the dragged task if it's already in this column)
    const targetColumnTasks = allTasks
      .filter(t => t.status === targetStatus && t.id !== draggedTaskId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Calculate the new position for the dragged task
    let newPosition: number;

    if (targetColumnTasks.length === 0) {
      // Empty column - use position 10
      newPosition = 10;
    } else if (targetPosition === 0) {
      // Drop at the beginning - use position before first task
      const firstTaskPosition = targetColumnTasks[0].position || 10;
      newPosition = Math.max(10, firstTaskPosition - 10);
    } else if (targetPosition >= targetColumnTasks.length) {
      // Drop at the end - use position after last task
      const lastTaskPosition = targetColumnTasks[targetColumnTasks.length - 1].position || 10;
      newPosition = lastTaskPosition + 10;
    } else {
      // Drop in the middle - calculate position between two tasks
      const prevTask = targetColumnTasks[targetPosition - 1];
      const nextTask = targetColumnTasks[targetPosition];
      const prevPosition = prevTask?.position || 0;
      const nextPosition = nextTask?.position || (prevPosition + 20);

      // Try to find a position between the two tasks
      const midPosition = Math.floor((prevPosition + nextPosition) / 2);

      if (midPosition > prevPosition && midPosition < nextPosition) {
        // Perfect! We can fit between existing positions
        newPosition = midPosition;
      } else {
        // No space between - need to resequence the target column
        // This happens when positions are too close (e.g., 10, 11, 12)
        const updatedPositions = calculateColumnResequence(targetColumnTasks, targetPosition);
        reorderData.push(...updatedPositions);
        newPosition = (targetPosition + 1) * 10;
      }
    }

    // Add the dragged task's new position and status (TASK-019)
    if (draggedTask.position !== newPosition || draggedTask.status !== targetStatus) {
      reorderData.push({
        id: draggedTaskId,
        position: newPosition,
        status: targetStatus // Include target status for drag-and-drop preservation
      });
    }

    return reorderData;
  };

  /**
   * Helper function to resequence a column when positions are too close
   * TASK-019: Updated to support optional status field
   */
  const calculateColumnResequence = (
    columnTasks: typeof tasks,
    insertIndex: number
  ): Array<{ id: string; position: number; status?: string }> => {
    const reorderData: Array<{ id: string; position: number }> = [];

    // Resequence all tasks in the column with proper spacing
    columnTasks.forEach((task, index) => {
      const adjustedIndex = index >= insertIndex ? index + 1 : index;
      const newPosition = (adjustedIndex + 1) * 10;

      if (task.position !== newPosition) {
        reorderData.push({ id: task.id, position: newPosition });
      }
    });

    return reorderData;
  };

  // Real API call to move task via Xano backend (Legacy - kept for fallback)
  const moveTaskToBackend = async (taskId: string, newStatus: Status, newPosition: number) => {
    try {
      await moveTask(taskId, newStatus, newPosition);
      console.log('Task moved successfully via API');
    } catch (error) {
      console.error('Failed to move task via API:', error);
      throw error; // Re-throw to trigger error handling in handleDragEnd
    }
  };
  /**
   * Handle drag end with bulk reordering (TASK-017 Implementation)
   * Uses the new bulk reorder API instead of individual task moves
   */
  const handleDragEnd = async () => {
    if (draggedTaskId && draggedStatus && dropPosition !== null && dragOverColumn) {
      setIsReordering(true);
      setSyncError(null);

      // Store current state for rollback on error
      setPreviousTasksState([...tasks]);

      try {
        // Calculate bulk reorder data for all affected tasks
        const reorderData = calculateBulkReorderData(
          tasks,
          draggedTaskId,
          dragOverColumn as Status,
          dropPosition
        );

        console.log(`🎯 Drag operation: ${draggedTaskId} to ${dragOverColumn} at position ${dropPosition}`);
        console.log(`📊 Reorder data:`, reorderData);

        // If no position changes needed, just update status if different
        if (reorderData.length === 0 && draggedStatus !== dragOverColumn) {
          // Fallback to individual move for status-only changes
          await moveTask(draggedTaskId, dragOverColumn as Status);
        } else if (reorderData.length > 0) {
          // Use bulk reorder API for position changes
          await reorderTasks(reorderData);
          console.log(`Bulk reordered ${reorderData.length} tasks successfully via API`);
        }

        // TASK-018: Refresh task counts after successful task operations
        await refreshTaskCounts();

      } catch (error) {
        console.error('Failed to reorder tasks via API:', error);

        // Rollback to previous state on error
        if (previousTasksState) {
          setTasks(previousTasksState);
          setSyncError('Failed to save task order. Please try again.');
          // Auto-dismiss error after 5 seconds
          setTimeout(() => setSyncError(null), 5000);
        }
      } finally {
        setIsReordering(false);
      }
    }
    // Reset drag state
    setDraggedTaskId(null);
    setDraggedStatus(null);
    setDragOverColumn(null);
    setDragPosition(null);
    setDropPosition(null);
    setPreviousTasksState(null);
    // Clean up the drag image
    if (dragImage) {
      document.body.removeChild(dragImage);
      setDragImage(null);
    }
    // Announce to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = 'Task dropped and reordered';
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };
  // Handle column drag over
  const handleColumnDragOver = (status: string) => {
    setDragOverColumn(status);
  };
  return <main className="flex flex-1 overflow-hidden">
      {/* Provider Type Sidebar */}
      

      <div className="flex-1 p-2 md:p-4 overflow-y-auto">
        {/* Error notification */}
        {syncError && <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50 animate-fade-in-out">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              {syncError}
            </p>
          </div>}

        {/* API Error notification */}
        {error && <div className="fixed top-16 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50">
            <div className="flex items-center justify-between">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                API Error: {error}
              </p>
              <button
                onClick={refreshTasks}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>}

        {/* Loading state */}
        {isLoading && <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 text-lg">Loading your tasks...</p>
              <p className="text-gray-500 text-sm mt-2">Fetching data from API</p>
            </div>
          </div>}

        {/* Show content only when not loading */}
        {!isLoading && (
          <>
            {/* Mobile provider filter dropdown */}
            <div className="mb-4 md:hidden">
              <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                <h3 className="font-medium text-sm">Filter by Provider</h3>
                <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="p-1 rounded-md hover:bg-gray-100">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {mobileFilterOpen && <div className="mt-2 bg-white p-3 rounded-md shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {providerTypes.map(provider => <div key={provider.id} className="flex items-center space-x-2">
                        <input type="checkbox" id={`mobile-provider-${provider.id}`} checked={selectedProviders.includes(provider.id)} onChange={() => toggleProviderFilter(provider.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <label htmlFor={`mobile-provider-${provider.id}`} className="flex items-center text-sm cursor-pointer">
                          <span className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${provider.bgColor}`}>
                            {provider.icon}
                          </span>
                          {provider.name}
                        </label>
                      </div>)}
                  </div>
                  {/* Mobile archive toggle */}
                  <div className="mt-2 flex items-center space-x-2">
                    <input type="checkbox" id="mobile-show-archived" checked={showArchived} onChange={toggleArchivedVisibility} className="rounded text-yellow-600 focus:ring-yellow-500" />
                    <label htmlFor="mobile-show-archived" className="flex items-center text-sm cursor-pointer">
                      <Archive className="w-3 h-3 mr-1 text-yellow-600" />
                      Show Archived
                    </label>
                  </div>
                  <button onClick={clearFilters} className="w-full mt-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition-colors">
                    Clear Filters
                  </button>
                </div>}
            </div>

        {/* Mobile provider filter dropdown */}
        <div className="mb-4 md:hidden">
          <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
            <h3 className="font-medium text-sm">Filter by Provider</h3>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="p-1 rounded-md hover:bg-gray-100">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {mobileFilterOpen && <div className="mt-2 bg-white p-3 rounded-md shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                {providerTypes.map(provider => <div key={provider.id} className="flex items-center space-x-2">
                    <input type="checkbox" id={`mobile-provider-${provider.id}`} checked={selectedProviders.includes(provider.id)} onChange={() => toggleProviderFilter(provider.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                    <label htmlFor={`mobile-provider-${provider.id}`} className="flex items-center text-sm cursor-pointer">
                      <span className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${provider.bgColor}`}>
                        {provider.icon}
                      </span>
                      {provider.name}
                    </label>
                  </div>)}
              </div>
              {/* Mobile archive toggle */}
              <div className="mt-2 flex items-center space-x-2">
                <input type="checkbox" id="mobile-show-archived" checked={showArchived} onChange={toggleArchivedVisibility} className="rounded text-yellow-600 focus:ring-yellow-500" />
                <label htmlFor="mobile-show-archived" className="flex items-center text-sm cursor-pointer">
                  <Archive className="w-3 h-3 mr-1 text-yellow-600" />
                  Show Archived
                </label>
              </div>
              <button onClick={clearFilters} className="w-full mt-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md transition-colors">
                Clear Filters
              </button>
            </div>}
        </div>

        {/* Resequencing indicator */}
        {isReordering && <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating task order...
          </div>}

        {/* Desktop view - horizontal layout without horizontal scrollbar */}
        <div className="hidden md:block h-full">
          <div className="flex gap-4 p-1 pb-4 bg-gray-100 rounded-lg min-h-full" onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()} aria-label="Kanban board with draggable tasks">
            <Column title="To Do" tasks={filteredTodoTasks} status="todo" count={getTaskCount('todo')} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('todo')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'todo'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm flex-1 ${draggedStatus === 'todo' ? 'opacity-80' : ''} ${dragOverColumn === 'todo' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
            <Column title="Scheduled" tasks={filteredScheduledTasks} status="scheduled" count={getTaskCount('scheduled')} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('scheduled')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'scheduled'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm flex-1 ${draggedStatus === 'scheduled' ? 'opacity-80' : ''} ${dragOverColumn === 'scheduled' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
            <Column title="Booked" tasks={filteredBookedTasks} status="booked" count={getTaskCount('booked')} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('booked')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'booked'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm flex-1 ${draggedStatus === 'booked' ? 'opacity-80' : ''} ${dragOverColumn === 'booked' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
            <Column title="Complete" tasks={filteredCompleteTasks} status="complete" count={getTaskCount('complete')} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('complete')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'complete'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm flex-1 ${draggedStatus === 'complete' ? 'opacity-80' : ''} ${dragOverColumn === 'complete' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
            {/* Show Archive column only when showArchived is true */}
            {showArchived && <Column title="Archived" tasks={filteredArchivedTasks} status="archived" count={getTaskCount('archived')} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('archived')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'archived'} isReordering={isReordering} className={`transition-all duration-200 border-yellow-200 border-2 shadow-sm flex-1 ${draggedStatus === 'archived' ? 'opacity-80' : ''} ${dragOverColumn === 'archived' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />}
          </div>
        </div>

        {/* Mobile view - vertical layout */}
        <div className="flex flex-col md:hidden gap-4" onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()} aria-label="Kanban board with draggable tasks (mobile view)">
          <Column title="To Do" tasks={filteredTodoTasks} status="todo" count={getTaskCount('todo')} isMobile={true} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('todo')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'todo'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm ${draggedStatus === 'todo' ? 'opacity-80' : ''} ${dragOverColumn === 'todo' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
          <Column title="Scheduled" tasks={filteredScheduledTasks} status="scheduled" count={getTaskCount('scheduled')} isMobile={true} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('scheduled')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'scheduled'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm ${draggedStatus === 'scheduled' ? 'opacity-80' : ''} ${dragOverColumn === 'scheduled' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
          <Column title="Booked" tasks={filteredBookedTasks} status="booked" count={getTaskCount('booked')} isMobile={true} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('booked')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'booked'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm ${draggedStatus === 'booked' ? 'opacity-80' : ''} ${dragOverColumn === 'booked' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
          <Column title="Complete" tasks={filteredCompleteTasks} status="complete" count={getTaskCount('complete')} isMobile={true} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('complete')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'complete'} isReordering={isReordering} className={`transition-all duration-200 border-blue-200 border-2 shadow-sm ${draggedStatus === 'complete' ? 'opacity-80' : ''} ${dragOverColumn === 'complete' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />
          {/* Show Archive column in mobile view only when showArchived is true */}
          {showArchived && <Column title="Archived" tasks={filteredArchivedTasks} status="archived" count={getTaskCount('archived')} isMobile={true} onDragStart={handleDragStart} onDragOver={() => handleColumnDragOver('archived')} onPositionChange={handleTaskPositionChange} draggedTaskId={draggedTaskId} draggedStatus={draggedStatus} dragPosition={dragPosition} isDropTarget={dragOverColumn === 'archived'} isReordering={isReordering} className={`transition-all duration-200 border-yellow-200 border-2 shadow-sm ${draggedStatus === 'archived' ? 'opacity-80' : ''} ${dragOverColumn === 'archived' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`} enableReordering={true} providerTypes={providerTypes} autoHeight={true} />}
        </div>
        </>
        )}
      </div>
    </main>;
};