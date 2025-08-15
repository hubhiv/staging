import { homeApiClient } from './api';
import { Task, TaskRequest, TaskUpdateRequest, TaskMoveRequest, TaskRatingRequest, TaskReorderRequest, TaskCount, PaginatedResponse } from '../types/api';
/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Service: TaskService
 * Used by: KanbanBoard, TaskDetail components
 *
 * @API_INTEGRATION Task Service
 * Handles task CRUD operations and status changes
 */
export const TaskService = {
  /**
   * Get tasks for a specific user (TASK-014 Integration)
   *
   * API: GET /tasks/{userid}
   * Headers:
   *   - Accept: application/json
   * Authentication: Not required
   *
   * Query Parameters:
   *   - assignee_id: User ID to filter tasks (required)
   *
   * Response Example (200 OK):
   * {
   *   "task": [
   *     {
   *       "id": 7,
   *       "created_at": 1754286649788,
   *       "title": "New Task",
   *       "description": "Add description here",
   *       "status": "scheduled",
   *       "priority": "medium",
   *       "due_date": 1754286648000,
   *       "comments_count": 0,
   *       "attachments_count": 0,
   *       "rating": 0,
   *       "position": 0,
   *       "provider_type": "general",
   *       "assignee_id": 2
   *     }
   *   ]
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "User not found or no tasks available."
   * }
   *
   * @param {number} userId - User ID to get tasks for
   * @param {number} assigneeId - Assignee ID to filter tasks (defaults to userId)
   * @returns {Promise<{task: Task[]}>} Task list wrapped in task property
   */
  getTasks: async (userId: number = 2, assigneeId?: number): Promise<{task: Task[]}> => {
    const actualAssigneeId = assigneeId || userId;
    const response = await homeApiClient.get<{task: Task[]}>(`/tasks/${userId}`, {
      params: {
        assignee_id: actualAssigneeId
      }
    });
    return response.data;
  },

  /**
   * Get all tasks with pagination (Legacy method - kept for compatibility)
   *
   * API: GET /task
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<PaginatedResponse<Task>>} Paginated task list
   */
  getTasksPaginated: async (params = {}): Promise<PaginatedResponse<Task>> => {
    const response = await homeApiClient.get<PaginatedResponse<Task>>('/task', {
      params
    });
    return response.data;
  },
  /**
   * Get task by ID
   *
   * API: GET /tasks/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_12345",
   *   "title": "Fix leaking faucet",
   *   "description": "The kitchen faucet is leaking and needs repair",
   *   "status": "todo",
   *   "priority": "medium",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-08-15T00:00:00Z",
   *   "created_at": "2023-07-01T09:15:22Z",
   *   "updated_at": "2023-07-01T09:15:22Z",
   *   "comments_count": 2,
   *   "attachments_count": 1,
   *   "rating": 0,
   *   "position": 1,
   *   "provider_type": "plumbing"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Task not found."
   * }
   *
   * @param {string} id - Task ID
   * @returns {Promise<Task>} Task details
   */
  getTask: async (id: string): Promise<Task> => {
    const response = await homeApiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },
  /**
   * Create new task
   *
   * API: POST /task
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "title": "Replace smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "todo",
   *   "priority": "high",
   *   "assignee_id": "usr_54321",
   *   "due_date": "2023-10-15T00:00:00Z",
   *   "provider_type": "security"
   * }
   *
   * Response Example (201 Created):
   * {
   *   "id": "task_45678",
   *   "title": "Replace smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "todo",
   *   "priority": "high",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-10-15T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-15T16:45:33Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 0,
   *   "position": 3,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "title": ["The title field is required."],
   *     "status": ["The selected status is invalid."]
   *   }
   * }
   *
   * @param {TaskRequest} data - Task data
   * @returns {Promise<Task>} Created task
   */
  createTask: async (data: TaskRequest): Promise<Task> => {
    const response = await homeApiClient.post<Task>('/task', data);
    return response.data;
  },
  /**
   * Update task
   *
   * API: PATCH /task/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "title": "Replace all smoke detectors",
   *   "priority": "urgent",
   *   "due_date": "2023-09-30T00:00:00Z"
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_45678",
   *   "title": "Replace all smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "todo",
   *   "priority": "urgent",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-09-30T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-15T17:22:45Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 0,
   *   "position": 3,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Task not found."
   * }
   *
   * @param {string} id - Task ID
   * @param {TaskUpdateRequest} data - Task data to update
   * @returns {Promise<Task>} Updated task
   */
  updateTask: async (id: string, data: TaskUpdateRequest): Promise<Task> => {
    const response = await homeApiClient.patch<Task>(`/task/${id}`, data);
    return response.data;
  },
  /**
   * Delete task
   *
   * API: DELETE /task/{task_id}
   * Headers:
   *   - Accept: application/json
   * Authentication: Not required
   *
   * Response Example (200 OK):
   * {
   *   // Empty object response
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Task not found."
   * }
   *
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  deleteTask: async (id: string): Promise<void> => {
    await homeApiClient.delete(`/task/${id}`);
  },
  /**
   * Move task (change status and/or position)
   *
   * API: PATCH /task/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "status": "scheduled",
   *   "position": 2
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_45678",
   *   "title": "Replace all smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "scheduled",
   *   "priority": "urgent",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-09-30T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-16T09:12:22Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 0,
   *   "position": 2,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (400 Bad Request):
   * {
   *   "message": "Invalid status provided."
   * }
   *
   * @param {string} id - Task ID
   * @param {TaskMoveRequest} data - Move data (status and optional position)
   * @returns {Promise<Task>} Updated task
   */
  moveTask: async (id: string, data: TaskMoveRequest): Promise<Task> => {
    const response = await homeApiClient.patch<Task>(`/task/${id}`, data);
    return response.data;
  },

  /**
   * Bulk reorder multiple tasks (TASK-017 Integration)
   *
   * API: PATCH /tasks/reorder
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "reorder": [
   *     { "id": 37, "position": 10 },
   *     { "id": 35, "position": 20 },
   *     { "id": 36, "position": 30 }
   *   ]
   * }
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": 37,
   *     "created_at": 1754432791520,
   *     "title": "Task Title",
   *     "description": "Task description",
   *     "status": "todo",
   *     "priority": "medium",
   *     "position": 10,
   *     "assignee_id": 2,
   *     "due_date": 1754432791000,
   *     "comments_count": 0,
   *     "attachments_count": 0,
   *     "rating": 0,
   *     "provider_type": "general"
   *   }
   * ]
   *
   * Error Response Example (400 Bad Request):
   * {
   *   "message": "Invalid task IDs provided."
   * }
   *
   * @param {TaskReorderRequest} data - Reorder data with array of task id/position pairs
   * @returns {Promise<Task[]>} Array of updated tasks
   */
  reorderTasks: async (data: TaskReorderRequest): Promise<Task[]> => {
    const response = await homeApiClient.patch<Task[]>('/tasks/reorder', data);
    return response.data;
  },
  /**
   * Update task rating
   *
   * API: PATCH /tasks/{id}/rating
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "rating": 4
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_45678",
   *   "title": "Replace all smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "scheduled",
   *   "priority": "urgent",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-09-30T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-16T10:30:15Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 4,
   *   "position": 2,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (400 Bad Request):
   * {
   *   "message": "Rating must be between 0 and 5."
   * }
   *
   * @param {string} id - Task ID
   * @param {TaskRatingRequest} data - Rating data
   * @returns {Promise<Task>} Updated task
   */
  updateTaskRating: async (id: string, data: TaskRatingRequest): Promise<Task> => {
    const response = await homeApiClient.patch<Task>(`/tasks/${id}/rating`, data);
    return response.data;
  },
  /**
   * Archive task
   *
   * API: PATCH /tasks/{id}/archive
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_45678",
   *   "title": "Replace all smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "archived",
   *   "priority": "urgent",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-09-30T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-16T11:45:30Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 4,
   *   "position": 0,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Task not found."
   * }
   *
   * @param {string} id - Task ID
   * @returns {Promise<Task>} Updated task
   */
  archiveTask: async (id: string): Promise<Task> => {
    const response = await homeApiClient.patch<Task>(`/tasks/${id}/archive`, {});
    return response.data;
  },
  /**
   * Unarchive task
   *
   * API: PATCH /tasks/{id}/unarchive
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "task_45678",
   *   "title": "Replace all smoke detectors",
   *   "description": "Replace all smoke detectors in the house",
   *   "status": "todo",
   *   "priority": "urgent",
   *   "assignee_id": "usr_54321",
   *   "assignee": "John Smith",
   *   "assignee_avatar": "https://example.com/avatars/johnsmith.jpg",
   *   "due_date": "2023-09-30T00:00:00Z",
   *   "created_at": "2023-07-15T16:45:33Z",
   *   "updated_at": "2023-07-16T12:15:10Z",
   *   "comments_count": 0,
   *   "attachments_count": 0,
   *   "rating": 4,
   *   "position": 4,
   *   "provider_type": "security"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Task not found."
   * }
   *
   * @param {string} id - Task ID
   * @returns {Promise<Task>} Updated task
   */
  unarchiveTask: async (id: string): Promise<Task> => {
    const response = await homeApiClient.patch<Task>(`/tasks/${id}/unarchive`, {});
    return response.data;
  },

  /**
   * Get task count by status for a specific user (TASK-018 Integration)
   *
   * API: GET /task/count/{userid}
   * Headers:
   *   - Accept: application/json
   * Authentication: Not required
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "task_status": "todo",
   *     "count": 5
   *   },
   *   {
   *     "task_status": "scheduled",
   *     "count": 3
   *   },
   *   {
   *     "task_status": "booked",
   *     "count": 2
   *   },
   *   {
   *     "task_status": "complete",
   *     "count": 10
   *   }
   * ]
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "User not found or no tasks available."
   * }
   *
   * @param {number} userId - User ID to get task counts for
   * @returns {Promise<TaskCount[]>} Array of task count objects by status
   */
  getTaskCounts: async (userId: number): Promise<TaskCount[]> => {
    const response = await homeApiClient.get<TaskCount[]>(`/task/count/${userId}`);
    return response.data;
  }
};
export default TaskService;