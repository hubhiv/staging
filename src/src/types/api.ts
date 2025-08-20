/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * API Types
 * Contains all TypeScript interfaces for API request/response data
 */
// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface ResetPasswordRequest {
  email: string;
}
export interface UserProfile {
  id: number;
  email: string | null;
  name: string;
  created_at: number;
}
export interface AuthResponse {
  authToken: string;
}
// Tasks
export type TaskStatus = 'todo' | 'scheduled' | 'booked' | 'complete' | 'archived';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ProviderType = 'Plumbing' | 'HVAC' | 'Painting' | 'Electrical';
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assignee_id?: string;
  assignee_avatar?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  comments_count: number;
  attachments_count: number;
  rating: number;
  position?: number;
  provider_type?: string;
  provider?: ProviderType; // NEW FIELD - Service provider category
}
export interface TaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  due_date: string;
  provider_type?: string;
  provider?: ProviderType; // NEW FIELD - Service provider category
}
export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  provider_type?: string;
  provider?: ProviderType; // NEW FIELD - Service provider category
}
export interface TaskMoveRequest {
  status: TaskStatus;
  position?: number;
}
export interface TaskRatingRequest {
  rating: number;
}
export interface TaskReorderRequest {
  reorder: Array<{
    id: number;
    position: number;
    status?: string; // TASK-019: Optional status field for drag-and-drop preservation
  }>;
}

// Task Count (TASK-018)
export interface TaskCount {
  task_status: string;
  count: number;
}
// Calendar Events
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  provider_id?: string;
  provider_name?: string;
  provider_type?: string;
  task_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  all_day: boolean;
  created_at: string;
  updated_at: string;
}
export interface CalendarEventRequest {
  title: string;
  start: string;
  end: string;
  provider_id?: string;
  task_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  all_day: boolean;
}
// Home Profile
export interface HomeProfile {
  id: string;
  user_id: string;
  address: string;
  year_built: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  lot_size: string;
  created_at: string;
  updated_at: string;
  health_scores: {
    overall: number;
    hvac: number;
    plumbing: number;
    electrical: number;
    exterior: number;
    security: number;
  };
}
export interface HomeProfileRequest {
  address?: string;
  year_built?: number;
  square_footage?: number;
  bedrooms?: number;
  bathrooms?: number;
  lot_size?: string;
}
// Home Systems
export interface HomeSystem {
  id: number;
  created_at: number;
  type: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'windows' | 'security';
  name: string;
  brand?: string;
  installed_date: string;
  last_service_date?: string;
  next_service_date?: string;
  health_score: number;
  details: string;
  user_id: number;
}
export interface HomeSystemRequest {
  type: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'windows' | 'security';
  name: string;
  brand?: string;
  installed_date: string;
  last_service_date?: string;
  next_service_date?: string;
  health_score?: number;
  details?: string;
  user_id: number;
}
// Maintenance Tasks
export interface MaintenanceTask {
  id: string;
  user_id: string;
  name: string;
  system: string;
  frequency: string;
  last_done: string;
  next_due: string;
  status: 'upcoming' | 'overdue' | 'on-track' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}
export interface MaintenanceTaskRequest {
  name: string;
  system: string;
  frequency: string;
  last_done: string;
  next_due: string;
  status: 'upcoming' | 'overdue' | 'on-track' | 'completed';
  notes?: string;
}
// Service Providers - API Response Interface
export interface ServiceProvider {
  id: number;
  user_id: number;
  name: string;
  type: string;
  phone: string;
  last_service: string;
  rating: number;
  created_at: number;
}

// Service Providers - Frontend Display Interface (with additional UI fields)
export interface ServiceProviderDisplay extends ServiceProvider {
  category?: string; // Alias for type field for backward compatibility
  email?: string; // Optional field for UI display
  address?: string; // Optional field for UI display
  notes?: string; // Optional field for UI display
  lastService?: string; // Alias for last_service for backward compatibility
}

export interface ServiceProviderRequest {
  name: string;
  type: string;
  phone: string;
  last_service?: string;
  rating?: number;
  user_id: number;
}