import { Task, TaskRequest, TaskUpdateRequest, TaskPriority, TaskStatus, ProviderType } from '../types/api';

// UI-friendly camelCase type
export interface TaskUI {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: number; // ms epoch
  createdAt?: number; // ms epoch
  updatedAt?: number; // ms epoch
  commentsCount?: number;
  attachmentsCount?: number;
  rating?: number;
  position?: number;
  providerType?: string;
  provider?: ProviderType;
}

// Convert API Task (snake_case) to UI TaskUI (camelCase)
export const toTaskUI = (t: Task): TaskUI => ({
  id: String(t.id),
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  assigneeId: t.assignee_id ? String(t.assignee_id) : undefined,
  dueDate: t.due_date ? Number(t.due_date) : undefined,
  createdAt: t.created_at ? Number(t.created_at) : undefined,
  updatedAt: t.updated_at ? Number(t.updated_at) : undefined,
  commentsCount: t.comments_count,
  attachmentsCount: t.attachments_count,
  rating: t.rating,
  position: t.position,
  providerType: t.provider_type,
  provider: t.provider
});

// Convert UI create payload to API TaskRequest (snake_case)
export const toTaskRequest = (u: Partial<TaskUI> & { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; assigneeId?: string; dueDate?: number; provider?: ProviderType; providerType?: string; }): TaskRequest => ({
  title: u.title,
  description: u.description ?? '',
  status: (u.status ?? 'todo') as TaskStatus,
  priority: (u.priority ?? 'medium') as TaskPriority,
  assignee_id: u.assigneeId,
  due_date: u.dueDate ? String(u.dueDate) : '' as any,
  provider: u.provider,
  provider_type: u.providerType
});

// Convert UI update payload to API TaskUpdateRequest
export const toTaskUpdate = (u: Partial<TaskUI>): TaskUpdateRequest => ({
  title: u.title,
  description: u.description,
  priority: u.priority,
  assignee_id: u.assigneeId,
  due_date: u.dueDate !== undefined ? String(u.dueDate) : undefined,
  provider: u.provider,
  provider_type: u.providerType
});

