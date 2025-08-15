# TASK-017 Frontend Refactoring Plan

## Overview
This document outlines the specific refactoring required to implement drag-and-drop task reordering with live drop indicators for TASK-017.

## Current State Analysis

### ✅ What's Working
- Native HTML5 drag-and-drop implementation
- Comprehensive drag state management
- Basic visual feedback (column highlighting, task opacity)
- Custom drag images with task previews
- Touch support for mobile devices
- Screen reader accessibility
- Error handling with rollback mechanisms

### ❌ What Needs Refactoring

#### 1. Position Strategy (CRITICAL)
**Current Problem:**
```typescript
// Sequential positioning (0, 1, 2, 3...)
const finalUpdatedTasks = updatedTasks.map((task, index) => ({
  ...task,
  position: index
}));
```

**Required Solution:**
```typescript
// Increments of 10 (10, 20, 30, 40...)
const finalUpdatedTasks = updatedTasks.map((task, index) => ({
  ...task,
  position: (index + 1) * 10
}));
```

#### 2. API Integration (CRITICAL)
**Current Problem:**
- Uses individual `PATCH /task/{id}` calls
- No bulk reorder support
- Missing `reorderTasks()` method in TaskService

**Required Solution:**
- Add `TaskService.reorderTasks()` method
- Use `PATCH /tasks/reorder` endpoint
- Implement bulk position updates

#### 3. Visual Drop Indicators (HIGH PRIORITY)
**Current Problem:**
- No horizontal line/gap indicators between tasks
- Only column-level visual feedback
- No precise drop position visualization

**Required Solution:**
- Implement horizontal drop line indicators
- Show exact drop location during drag
- Real-time position feedback

## Detailed Refactoring Tasks

### Phase 1: TaskService Enhancement
**File:** `src/src/services/taskService.ts`

```typescript
// Add new method for bulk reordering
reorderTasks: async (reorderData: { reorder: Array<{ id: number; position: number }> }) => {
  const response = await homeApiClient.patch('/tasks/reorder', reorderData);
  return response.data;
}
```

### Phase 2: KanbanContext Enhancement
**File:** `src/components/KanbanContext.tsx`

```typescript
// Add bulk reorder method
const reorderTasks = async (reorderData: Array<{ id: string; position: number }>) => {
  setError(null);
  try {
    const updatedTasks = await TaskService.reorderTasks({ reorder: reorderData });
    // Update local state with bulk changes
    setTasks(prevTasks => {
      // Merge updated tasks with existing tasks
      return prevTasks.map(task => {
        const updatedTask = updatedTasks.find(ut => ut.id === task.id);
        return updatedTask ? mapApiTaskToTask(updatedTask) : task;
      });
    });
  } catch (err) {
    const apiError = parseApiError(err);
    setError(apiError.message);
    throw err; // Re-throw for error handling in components
  }
};
```

### Phase 3: Position Calculation Fix
**File:** `src/components/KanbanBoard.tsx`

```typescript
// Replace current position calculation
const calculateNewPositions = (tasks: Task[], draggedTask: Task, targetIndex: number) => {
  const updatedTasks = [...tasks];
  
  // Remove dragged task
  const draggedIndex = updatedTasks.findIndex(t => t.id === draggedTask.id);
  updatedTasks.splice(draggedIndex, 1);
  
  // Insert at target position
  updatedTasks.splice(targetIndex, 0, draggedTask);
  
  // Recalculate positions with increments of 10
  return updatedTasks.map((task, index) => ({
    ...task,
    position: (index + 1) * 10
  }));
};
```

### Phase 4: Visual Drop Indicators
**File:** `src/components/Column.tsx`

```typescript
// Add drop indicator state
const [dropIndicatorPosition, setDropIndicatorPosition] = useState<number | null>(null);

// Enhanced drag over handler
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  
  if (enableReordering && draggedTaskId) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cardHeight = 100; // Approximate task card height
    const position = Math.floor(y / cardHeight);
    
    setDropIndicatorPosition(position);
    if (onPositionChange) {
      onPositionChange(draggedTaskId, position);
    }
  }
};

// Add drop indicator JSX
{dropIndicatorPosition !== null && (
  <div 
    className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10"
    style={{ top: `${dropIndicatorPosition * 100}px` }}
  />
)}
```

### Phase 5: Bulk Reorder Integration
**File:** `src/components/KanbanBoard.tsx`

```typescript
// Replace individual API calls with bulk reorder
const handleDragEnd = async () => {
  if (draggedTaskId && draggedStatus && dropPosition !== null && dragOverColumn) {
    setIsReordering(true);
    setSyncError(null);
    
    // Calculate new positions for affected tasks
    const reorderData = calculateBulkReorderData(
      tasks, 
      draggedTaskId, 
      dragOverColumn as Status, 
      dropPosition
    );
    
    // Update local state optimistically
    setTasks(newTaskOrder);
    
    try {
      // Use bulk reorder API
      await reorderTasks(reorderData);
    } catch (error) {
      // Rollback on failure
      if (previousTasksState) {
        setTasks(previousTasksState);
        setSyncError('Failed to save task order. Please try again.');
      }
    } finally {
      setIsReordering(false);
    }
  }
};
```

## Implementation Priority

### Critical (Must Have)
1. ✅ API validation completed
2. 🔧 Add TaskService.reorderTasks() method
3. 🔧 Fix position calculation strategy
4. 🔧 Implement bulk reorder in KanbanContext

### High Priority (Should Have)
5. 🔧 Add visual drop indicators
6. 🔧 Enhance drag position detection
7. 🔧 Improve error handling and rollback

### Medium Priority (Nice to Have)
8. 🔧 Consolidate duplicate KanbanContext implementations
9. 🔧 Add authentication to API calls
10. 🔧 Performance optimizations

## Testing Strategy

### Unit Tests
- TaskService.reorderTasks() method
- Position calculation functions
- Bulk reorder state management

### Integration Tests
- Drag-and-drop with API integration
- Error handling and rollback scenarios
- Visual drop indicator positioning

### Browser Tests
- Cross-browser drag-and-drop compatibility
- Mobile touch interactions
- Performance with large task lists

## Success Criteria

### Functional Requirements
- ✅ Tasks can be reordered within columns
- ✅ Tasks can be moved between columns
- ✅ Visual drop indicators show exact drop location
- ✅ Position increments of 10 work correctly
- ✅ Bulk API calls reduce network overhead

### Performance Requirements
- ✅ Smooth drag interactions (60fps)
- ✅ Fast API response times (<500ms)
- ✅ Minimal re-renders during drag operations

### User Experience Requirements
- ✅ Clear visual feedback during drag
- ✅ Intuitive drop positioning
- ✅ Graceful error handling
- ✅ Mobile-friendly interactions

## Estimated Timeline
- **Phase 1-2 (API Integration)**: 2-3 hours
- **Phase 3 (Position Strategy)**: 1-2 hours  
- **Phase 4 (Visual Indicators)**: 2-3 hours
- **Phase 5 (Bulk Integration)**: 2-3 hours
- **Testing & Refinement**: 2-3 hours
- **Total**: 9-14 hours

## Risk Assessment

### Low Risk
- API endpoint is validated and working
- Basic drag-and-drop foundation exists
- Error handling patterns established

### Medium Risk
- Visual drop indicators require precise positioning
- Bulk operations need careful state management
- Mobile touch interactions may need refinement

### High Risk
- Performance with large task lists
- Complex position calculation edge cases
- Cross-browser compatibility issues

## Conclusion

TASK-017 is ready for implementation with the identified refactoring. The solid foundation of existing drag-and-drop functionality, combined with the validated API endpoint, provides a clear path to successful implementation of live drop indicators and bulk task reordering.
