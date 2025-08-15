import { useEffect, useMemo, useState } from 'react';
import TaskService from '../services/taskService';
import { Task, TaskCount } from '../types/api';

export const useTasksSummary = (userId: number) => {
  const [tasksWrap, setTasksWrap] = useState<{task: Task[]} | null>(null);
  const [counts, setCounts] = useState<TaskCount[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c] = await Promise.all([
        TaskService.getTasks(userId, userId),
        TaskService.getTaskCounts(userId)
      ]);
      setTasksWrap(t);
      setCounts(c);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [userId]);

  const tasks = tasksWrap?.task || [];
  const getCount = (status: string) => counts?.find(c => c.task_status === status)?.count ?? 0;

  const upcoming = useMemo(() => {
    const now = Date.now();
    return tasks.filter(t => Number(t.due_date) >= now).sort((a, b) => (Number(a.due_date) || 0) - (Number(b.due_date) || 0)).slice(0, 5);
  }, [tasks]);

  const overdue = useMemo(() => {
    const now = Date.now();
    return tasks.filter(t => Number(t.due_date) < now).sort((a, b) => (Number(a.due_date) || 0) - (Number(b.due_date) || 0)).slice(0, 5);
  }, [tasks]);

  return { loading, error, tasks, counts, getCount, upcoming, overdue, refresh };
};

