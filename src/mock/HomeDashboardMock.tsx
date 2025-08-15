import React from 'react';
import { Home, AlertCircle, Calendar, ClipboardList, FileText, Plus, Wrench, Shield, Droplet, Zap, Wind, Thermometer, MapPin, Star, ChevronRight } from 'lucide-react';

// Small circular progress using pure CSS conic-gradient (no external deps)
const Ring: React.FC<{ value: number; size?: number; color?: string; label?: string }>
  = ({ value, size = 64, color = '#3B82F6', label }) => {
  const bg = `conic-gradient(${color} ${value * 3.6}deg, #e5e7eb 0deg)`; // value in % -> deg
  return (
    <div style={{ width: size, height: size }} className="relative inline-flex items-center justify-center">
      <div className="rounded-full" style={{ width: size, height: size, backgroundImage: bg }} />
      <div className="absolute rounded-full bg-white" style={{ width: size - 16, height: size - 16 }} />
      <div className="absolute text-xs font-semibold text-gray-700">{label ?? `${value}%`}</div>
    </div>
  );
};

// Simple badge
const Badge: React.FC<{ tone?: 'blue'|'green'|'red'|'amber'|'gray'; children: React.ReactNode }> = ({ tone='gray', children }) => {
  const map: Record<string,string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-800',
    gray: 'bg-gray-100 text-gray-700',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[tone]}`}>{children}</span>;
};

// Mock data (static; no API calls)
const mock = {
  profile: {
    address: '123 Maple Street, Anytown, ST 12345',
    overallHealth: 86,
  },
  kpis: {
    upcomingWeek: 3,
    overdue: 1,
    estMonthlyBudget: 1000,
    spentThisMonth: 320,
  },
  alerts: [
    { id: 'a1', text: 'Water heater last serviced 20 months ago', severity: 'amber' as const },
    { id: 'a2', text: 'Exterior caulking due next week', severity: 'blue' as const },
  ],
  systems: [
    { key: 'hvac', name: 'HVAC', icon: Thermometer, health: 90, nextDue: 'Sep 15', lastService: 'Mar 2025' },
    { key: 'plumbing', name: 'Plumbing', icon: Droplet, health: 74, nextDue: 'Aug 30', lastService: 'Oct 2024' },
    { key: 'electrical', name: 'Electrical', icon: Zap, health: 95, nextDue: 'Nov 10', lastService: 'Jan 2025' },
    { key: 'exterior', name: 'Exterior', icon: Wind, health: 70, nextDue: 'Sep 05', lastService: 'May 2024' },
    { key: 'security', name: 'Security', icon: Shield, health: 90, nextDue: 'Oct 01', lastService: 'Feb 2025' },
  ],
  upcoming: [
    { id: 1, title: 'Replace HVAC filter', date: 'Aug 12', system: 'HVAC', priority: 'Medium' },
    { id: 2, title: 'Clean gutters', date: 'Aug 14', system: 'Exterior', priority: 'Low' },
    { id: 3, title: 'Test smoke detectors', date: 'Aug 15', system: 'Electrical', priority: 'High' },
  ],
  overdue: [
    { id: 4, title: 'Water heater flush', date: 'Aug 01', system: 'Plumbing', priority: 'High' },
  ],
  documents: [
    { id: 'w1', name: 'Roof Warranty.pdf', tag: 'Warranty', added: 'Feb 2024' },
    { id: 'm1', name: 'HVAC Manual.pdf', tag: 'Manual', added: 'Nov 2023' },
  ],
  providers: [
    { id: 'p1', name: 'Cool Air Pros', type: 'HVAC', rating: 4.6 },
    { id: 'p2', name: 'Spark Electric', type: 'Electrical', rating: 4.8 },
  ]
};

export const HomeDashboardMock: React.FC = () => {
  const budgetPct = Math.round((mock.kpis.spentThisMonth / mock.kpis.estMonthlyBudget) * 100);
  const budgetTone = budgetPct > 80 ? 'red' : budgetPct > 60 ? 'amber' : 'green';

  return (
    <div className="w-full min-h-screen bg-[#f7f7f9]">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Home Overview (Mock)</h1>
            <Badge tone="blue">Prototype</Badge>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 inline-flex items-center gap-1">
              <Plus className="w-4 h-4" /> Quick Add Task
            </button>
            <button className="px-3 py-1.5 bg-white border rounded-md text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1">
              <FileText className="w-4 h-4" /> Add Document
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero / At-a-glance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Ring value={mock.profile.overallHealth} label={`${mock.profile.overallHealth}%`} />
              <div>
                <div className="text-sm text-gray-500">Overall Home Health</div>
                <div className="text-2xl font-bold text-gray-900">Good condition</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" /> {mock.profile.address}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
              <KPI title="Upcoming (7 days)" value={`${mock.kpis.upcomingWeek}`} icon={Calendar} />
              <KPI title="Overdue" value={`${mock.kpis.overdue}`} icon={AlertCircle} tone="red" />
              <KPI title="Budget Used" value={`$${mock.kpis.spentThisMonth}`} subtitle={`of $${mock.kpis.estMonthlyBudget}`} icon={ClipboardList} />
              <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
                <Ring value={budgetPct} size={48} color={budgetTone==='red'?'#ef4444':budgetTone==='amber'?'#f59e0b':'#10b981'} />
                <div>
                  <div className="text-xs text-gray-500">This Month</div>
                  <div className="text-sm font-semibold text-gray-800">{budgetPct}% Budget</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority alerts */}
        <section className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Attention Needed</h2>
            <a className="text-sm text-blue-600 hover:text-blue-700" href="#">View all</a>
          </div>
          <div className="grid gap-2">
            {mock.alerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded border bg-gray-50">
                <AlertCircle className={`w-4 h-4 mt-0.5 ${a.severity==='red'?'text-red-600':a.severity==='amber'?'text-amber-600':'text-blue-600'}`} />
                <div className="text-sm text-gray-800 flex-1">{a.text}</div>
                <Badge tone={a.severity as any}>Action</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Systems health grid */}
        <section className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Systems Health</h2>
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 inline-flex items-center gap-1"><Wrench className="w-4 h-4" /> Add System</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mock.systems.map(s => (
              <div key={s.key} className="rounded-lg border p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className="w-4 h-4 text-gray-600" />
                    <div className="font-semibold text-gray-900">{s.name}</div>
                  </div>
                  <Ring value={s.health} size={44} label={`${s.health}%`} />
                </div>
                <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
                  <div>Next due: <span className="font-medium text-gray-800">{s.nextDue}</span></div>
                  <div className="text-xs">Last: {s.lastService}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">Schedule <ChevronRight className="w-4 h-4" /></button>
                  <Badge tone={s.health<75?'amber':s.health<85?'blue':'green'}>{s.health<75?'Needs attention':s.health<85?'Stable':'Excellent'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming vs Overdue */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Upcoming (7 days)</h2>
              <a className="text-sm text-blue-600 hover:text-blue-700" href="#">Add Task</a>
            </div>
            <div className="divide-y">
              {mock.upcoming.map(t => (
                <Row key={t.id} title={t.title} date={t.date} system={t.system} priority={t.priority} />
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Overdue</h2>
              <a className="text-sm text-blue-600 hover:text-blue-700" href="#">Review</a>
            </div>
            <div className="divide-y">
              {mock.overdue.map(t => (
                <Row key={t.id} title={t.title} date={t.date} system={t.system} priority={t.priority} overdue />
              ))}
            </div>
          </div>
        </section>

        {/* Docs and Providers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Documents & Warranties</h2>
              <button className="px-3 py-1 text-sm bg-white border rounded-md hover:bg-gray-50 inline-flex items-center gap-1"><FileText className="w-4 h-4" /> Upload</button>
            </div>
            <ul className="divide-y">
              {mock.documents.map(d => (
                <li key={d.id} className="py-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />{d.name}</div>
                  <Badge tone="gray">{d.tag}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Trusted Providers</h2>
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
            </div>
            <ul className="divide-y">
              {mock.providers.map(p => (
                <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.type}</div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-amber-600"><Star className="w-4 h-4 fill-current" /> {p.rating.toFixed(1)}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick actions footer */}
        <div className="sticky bottom-3 flex justify-center">
          <div className="bg-white/90 backdrop-blur border rounded-full shadow px-3 py-2 flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Task</button>
            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> Schedule</button>
            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm inline-flex items-center gap-1"><FileText className="w-4 h-4" /> Document</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPI: React.FC<{ title: string; value: string; subtitle?: string; icon: any; tone?: 'default'|'red' }>
  = ({ title, value, subtitle, icon: Icon, tone='default' }) => (
  <div className={`bg-white rounded-lg border p-3 flex items-center gap-3 ${tone==='red'?'border-red-200':''}`}>
    <Icon className={`w-5 h-5 ${tone==='red'?'text-red-600':'text-blue-600'}`} />
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  </div>
);

const Row: React.FC<{ title: string; date: string; system: string; priority: string; overdue?: boolean }>
  = ({ title, date, system, priority, overdue }) => (
  <div className="py-3 flex items-center justify-between text-sm">
    <div>
      <div className="font-medium text-gray-900">{title}</div>
      <div className="text-xs text-gray-500">{system} • Priority {priority}</div>
    </div>
    <div className="flex items-center gap-2">
      {overdue ? <Badge tone="red">Overdue</Badge> : <Badge tone="blue">Due {date}</Badge>}
    </div>
  </div>
);

export default HomeDashboardMock;

