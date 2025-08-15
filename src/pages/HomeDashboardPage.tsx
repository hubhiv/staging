import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, FileText, Home, Plus, Trash2, AlertCircle, Clock, Edit2, X, Save, Star } from 'lucide-react';
import { TaskService } from '../src/services/taskService';
import { Task, TaskRequest, TaskPriority, TaskStatus, ProviderType, HomeProfile, ServiceProvider } from '../src/types/api';
import { useAuth } from '../src/hooks/useAuth';
import { useTasksSummary } from '../src/hooks/useTasksSummary';
import { HomeProfileService } from '../src/services/homeProfileService';
import ProviderService from '../src/services/providerService';
import { CreateHomeProfileModal } from '../components/CreateHomeProfileModal';

// util helpers
const formatDate = (ts: number | string | null | undefined) => {
  if (!ts && ts !== 0) return '';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.getTime();
};

// Minimal ring
const Ring: React.FC<{ value: number }> = ({ value }) => {
  const deg = Math.max(0, Math.min(360, Math.round(value * 3.6)));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <div className="rounded-full" style={{ width: 48, height: 48, backgroundImage: `conic-gradient(#3B82F6 ${deg}deg, #e5e7eb 0deg)` }} />
      <div className="absolute rounded-full bg-white" style={{ width: 36, height: 36 }} />
      <div className="absolute text-xs font-semibold text-gray-700">{value}%</div>
    </div>
  );
};

// Types for UI usage (we keep API snake_case fields to avoid confusion)
interface UILists {
  upcoming: Task[];
  overdue: Task[];
}

export const HomeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id ?? 2; // fallback demo id
  // Default to mock styling unless explicitly set to compact
  const params = new URLSearchParams(window.location.search);
  const styleMock = params.get('style') !== 'compact';
  const selftest = params.get('selftest') === '1';

  const summary = useTasksSummary(userId);
  const loading = summary.loading;
  const error = summary.error;

  // Local optimistic state for tasks (counts come from summary)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ dueDate?: string; priority?: TaskPriority; provider?: ProviderType } | null>(null);
  const [providerTypes, setProviderTypes] = useState<{ id: string; name: string }[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const refresh = summary.refresh;

  useEffect(() => {
    // sync local tasks once when summary.tasks changes size or by identity
    if (summary.tasks && (tasks.length !== summary.tasks.length || tasks === summary.tasks)) {
      setTasks(summary.tasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary.tasks]);

  // Load home profile (demo: try id = userId)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setProfileLoading(true);
      try {
        const hp = await HomeProfileService.getHomeProfileById(Number(userId));
        if (mounted) {
          setHomeProfile(hp);
          setShowCreateProfile(false);
        }
      } catch (e) {
        // No profile exists - show create modal
        if (mounted) {
          setHomeProfile(null);
          setShowCreateProfile(true);
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
      try {
        const types = await ProviderService.getProviderTypes();
        if (mounted) setProviderTypes(types);
      } catch (e) {
        // fallback handled by UI
      }
      try {
        const list = await ProviderService.getServiceProviders();
        if (mounted) setProviders(list);
      } catch (e) {
        // optional; may require auth
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const lists: UILists = useMemo(() => {
    const now = Date.now();
    const upcoming: Task[] = [];
    const overdue: Task[] = [];
    for (const t of tasks) {
      const due = typeof t.due_date === 'string' ? Number(t.due_date) : (t.due_date as unknown as number);
      if (!due) continue;
      if (due < now) overdue.push(t); else upcoming.push(t);
    }
    // sort by due_date ascending
    const byDue = (a: Task, b: Task) => (Number(a.due_date) || 0) - (Number(b.due_date) || 0);
    return { upcoming: upcoming.sort(byDue).slice(0, 5), overdue: overdue.sort(byDue).slice(0, 5) };
  }, [tasks]);

  const getCount = (status: TaskStatus) => summary.getCount(status);

  const handleQuickAdd = async () => {
    try {
      setCreating(true);
      const payload: TaskRequest = {
        title: 'New maintenance task',
        description: 'Add details...',
        status: 'todo',
        priority: 'medium' as TaskPriority,
        assignee_id: String(userId),
        due_date: String(addDays(7))
      };
      const created = await TaskService.createTask(payload);
      // optimistic prepend
      setTasks(prev => [created, ...prev]);
      // refresh via summary hook
      await refresh();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      setDeletingId(id);
      const prev = tasks;
      setTasks(prev.filter(t => String(t.id) !== String(id)));
      await TaskService.deleteTask(id);
      await refresh();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete task');
      // rollback by reloading
      refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (t: Task) => {
    setEditId(String(t.id));
    setEditState({
      dueDate: t.due_date ? new Date(Number(t.due_date)).toISOString().slice(0, 10) : undefined,
      priority: t.priority as TaskPriority,
      provider: (t.provider as ProviderType) || undefined
    });
  };
  const handleCancelEdit = () => { setEditId(null); setEditState(null); };
  const handleSaveEdit = async (id: string) => {
    if (!editState) return;
    try {
      const prev = tasks;
      // optimistic
      const updated = prev.map(t => String(t.id) === String(id) ? ({
        ...t,
        priority: editState.priority ?? t.priority,
        provider: editState.provider ?? t.provider,
        due_date: editState.dueDate ? String(new Date(editState.dueDate).getTime()) : t.due_date
      }) : t);
      setTasks(updated);
      await TaskService.updateTask(id, {
        priority: editState.priority,
        provider: editState.provider,
        due_date: editState.dueDate ? String(new Date(editState.dueDate).getTime()) : undefined
      });
      setEditId(null); setEditState(null);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update task');
      refresh();
    }
  };

  // Handle successful profile creation
  const handleProfileCreated = (profile: HomeProfile) => {
    setHomeProfile(profile);
    setShowCreateProfile(false);
  };

  // Handle create profile modal close
  const handleCreateProfileClose = () => {
    // Only allow closing if we have a profile, otherwise user must create one
    if (homeProfile) {
      setShowCreateProfile(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f9]">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Home Dashboard v2</h1>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={creating} onClick={handleQuickAdd} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 inline-flex items-center gap-1 disabled:opacity-60">
              <Plus className="w-4 h-4" /> Quick Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-white border rounded-xl p-4">
          {loading ? (
            <div className="animate-pulse h-20 bg-gray-100 rounded" />
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Counts */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-4">
                <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">To Do</div>
                    <div className="text-lg font-semibold text-gray-900">{getCount('todo')}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">Scheduled</div>
                    <div className="text-lg font-semibold text-gray-900">{getCount('scheduled')}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">Booked</div>
                    <div className="text-lg font-semibold text-gray-900">{getCount('booked')}</div>
                  </div>
                </div>
              </div>
              {/* Home profile */}
              <div className="bg-white rounded-lg border p-3 flex items-center gap-3 lg:col-span-2">
                <Ring value={homeProfile?.health_scores?.overall ?? 0} />
                <div>
                  <div className="text-xs text-gray-500">Overall Health</div>
                  <div className="text-sm font-semibold text-gray-900">{homeProfile?.address || 'Address unavailable'}</div>
                </div>
              </div>

        {/* Attention Needed (derived from overdue) */}
        {styleMock && (
          <section className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Attention Needed</h2>
              <a className="text-sm text-blue-600 hover:text-blue-700" href="#">View all</a>
            </div>
            <div className="grid gap-2">
              {lists.overdue.slice(0,3).map(o => (
                <div key={`al-${o.id}`} className="flex items-start gap-2 p-2 rounded border bg-gray-50">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                  <div className="text-sm text-gray-800 flex-1">{o.title} is overdue (was {formatDate(Number(o.due_date))})</div>
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700">Review</span>
                </div>
              ))}
              {lists.overdue.length === 0 && <div className="text-sm text-gray-500">No alerts. You're all set.</div>}
            </div>
          </section>
        )}

        {/* Systems Health (placeholder grid) */}
        {styleMock && (
          <section className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Systems Health</h2>
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">Add System</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["HVAC","Plumbing","Electrical"].map((n,idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{n}</div>
                    <div className="text-xs text-gray-500">Next due: —</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">Coming soon</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

            </div>
          )}
        </div>

        {/* Upcoming */}
        <section className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">Upcoming (next)</h2>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-100 animate-pulse rounded" />
              <div className="h-10 bg-gray-100 animate-pulse rounded" />
            </div>
          ) : (
            <>

            <div className="divide-y">
              {lists.upcoming.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.provider || t.provider_type || 'General'} • Priority {t.priority}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editId === String(t.id) ? (
                      <div className="flex items-center gap-2">
                        <input type="date" value={editState?.dueDate || ''} onChange={e => setEditState(s => ({ ...(s||{}), dueDate: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
                        <select value={editState?.priority || 'medium'} onChange={e => setEditState(s => ({ ...(s||{}), priority: e.target.value as TaskPriority }))} className="border rounded px-2 py-1 text-xs">
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                          <option value="urgent">urgent</option>
                        </select>
                        <select value={editState?.provider || ''} onChange={e => setEditState(s => ({ ...(s||{}), provider: e.target.value as any }))} className="border rounded px-2 py-1 text-xs">
                          <option value="">(provider)</option>
                          {(providerTypes?.length ? providerTypes : [
                            { id: 'HVAC', name: 'HVAC' },
                            { id: 'Plumbing', name: 'Plumbing' },
                            { id: 'Painting', name: 'Painting' },
                            { id: 'Electrical', name: 'Electrical' }
                          ]).map(pt => (
                            <option key={pt.id} value={pt.name}>{pt.name}</option>
                          ))}
                        </select>
                        <button onClick={() => handleSaveEdit(String(t.id))} className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" title="Save"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancelEdit} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Cancel"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <Calendar className="w-3 h-3" /> Due {formatDate(Number(t.due_date))}
                        </span>
                        <button onClick={() => handleStartEdit(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button disabled={deletingId === String(t.id)} onClick={() => handleDelete(String(t.id))} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-60" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {lists.upcoming.length === 0 && <div className="py-6 text-sm text-gray-500">No upcoming tasks found.</div>}
            </div>

        {/* Documents & Providers */}
        {styleMock && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">Documents & Warranties</h2>
                <button className="px-3 py-1 text-sm bg-white border rounded-md hover:bg-gray-50 inline-flex items-center gap-1"><FileText className="w-4 h-4" /> Upload</button>
              </div>
              <div className="text-sm text-gray-500">Connect your documents (endpoint TBD)</div>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">Trusted Providers</h2>
              </div>
              <ul className="divide-y">
                {(providers?.length ? providers : []).slice(0,5).map(p => (
                  <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.type}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-amber-600 text-xs"><Star className="w-3 h-3" />{p.rating ?? 0}</div>
                  </li>
                ))}
                {providers.length === 0 && (
                  <li className="py-2 text-sm text-gray-500">No providers yet.</li>
                )}
              </ul>
            </div>
          </section>
        )}

        {/* Quick actions footer */}
        {styleMock && (
          <div className="sticky bottom-3 flex justify-center">
            <div className="bg-white/90 backdrop-blur border rounded-full shadow px-3 py-2 flex items-center gap-2">
              <button onClick={handleQuickAdd} className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Task</button>
              <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> Schedule</button>
              <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm inline-flex items-center gap-1"><FileText className="w-4 h-4" /> Document</button>
            </div>
          </div>
        )}
          </>


          )}
        </section>

        {/* Overdue */}
        <section className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">Overdue</h2>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 bg-gray-100 animate-pulse rounded" />
              <div className="h-10 bg-gray-100 animate-pulse rounded" />
            </div>
          ) : (
            <div className="divide-y">
              {lists.overdue.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.provider || t.provider_type || 'General'} • Priority {t.priority}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editId === String(t.id) ? (
                      <div className="flex items-center gap-2">
                        <input type="date" value={editState?.dueDate || ''} onChange={e => setEditState(s => ({ ...(s||{}), dueDate: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
                        <select value={editState?.priority || 'medium'} onChange={e => setEditState(s => ({ ...(s||{}), priority: e.target.value as TaskPriority }))} className="border rounded px-2 py-1 text-xs">
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                          <option value="urgent">urgent</option>
                        </select>
                        <select value={editState?.provider || ''} onChange={e => setEditState(s => ({ ...(s||{}), provider: e.target.value as any }))} className="border rounded px-2 py-1 text-xs">
                          <option value="">(provider)</option>
                          {(providerTypes?.length ? providerTypes : [
                            { id: 'HVAC', name: 'HVAC' },
                            { id: 'Plumbing', name: 'Plumbing' },
                            { id: 'Painting', name: 'Painting' },
                            { id: 'Electrical', name: 'Electrical' }
                          ]).map(pt => (
                            <option key={pt.id} value={pt.name}>{pt.name}</option>
                          ))}
                        </select>
                        <button onClick={() => handleSaveEdit(String(t.id))} className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700" title="Save"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancelEdit} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Cancel"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" /> Overdue (was {formatDate(Number(t.due_date))})
                        </span>
                        <button onClick={() => handleStartEdit(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button disabled={deletingId === String(t.id)} onClick={() => handleDelete(String(t.id))} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-60" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {lists.overdue.length === 0 && <div className="py-6 text-sm text-gray-500">No overdue tasks. Great job!</div>}
            </div>
          )}
        </section>
      </div>

      {/* Create Home Profile Modal */}
      <CreateHomeProfileModal
        isOpen={showCreateProfile}
        onClose={handleCreateProfileClose}
        onSuccess={handleProfileCreated}
        userId={Number(userId)}
      />
    </div>
  );
};

export default HomeDashboardPage;

