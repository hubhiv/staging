import React, { useState, useEffect } from 'react';
import { Home, Calendar, Phone, Clock, Shield, Thermometer, Droplet, Zap, Wind, Key, FileText, ChevronDown, ChevronUp, Plus, AlertCircle, Settings, Wrench, BarChart, Clipboard, MapPin, Filter, ArrowRight, Star, DollarSign, Trash2, Edit, X, Save, Upload } from 'lucide-react';
import { TaskEditorModal } from './TaskEditorModal';
import { EditHomeProfileModal } from './EditHomeProfileModal';
import { ConfirmDialog } from './ConfirmDialog';
import { HomeProfileService } from '../src/services/homeProfileService';
import { HomeProfile as APIHomeProfile } from '../src/types/api';
import { HomeSystemsSection } from './HomeSystemsSection';
// Types for our data models
interface HomeProfile {
  address: string;
  yearBuilt: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  lotSize: string;
}
interface Document {
  id: string;
  name: string;
  date: string;
  tags: string[];
  url: string;
}
interface HomeSystem {
  id: string;
  type: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'windows' | 'security';
  name: string;
  brand?: string;
  installed: string;
  lastService?: string;
  nextService?: string;
  healthScore: number;
  details: Record<string, string>;
}
interface MaintenanceTask {
  id: string;
  name: string;
  system: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  status: 'upcoming' | 'overdue' | 'on-track' | 'completed';
  notes?: string;
}
interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  phone: string;
  lastService: string;
  rating: number;
}
// Helper component for circular progress
const CircularProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  label?: string;
}> = ({
  percentage,
  size = 40,
  strokeWidth = 4,
  color,
  bgColor = '#E5E7EB',
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = percentage * circumference / 100;
  return <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - dash} strokeLinecap="round" />
      </svg>
      {label && <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {label}
        </div>}
    </div>;
};
// Collapsible section component
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  actions?: React.ReactNode;
}> = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className = '',
  actions
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
          <div className="mr-2 text-blue-600 group-hover:text-blue-700 transition-colors">
            {icon}
          </div>
          <h2 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
          <button className="ml-3 p-1 rounded-full hover:bg-blue-100 transition-colors group-hover:bg-blue-50">
            {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />}
          </button>
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      {isOpen && <div className="animate-accordion-down overflow-hidden">{children}</div>}
    </div>;
};
// Modal component for CRUD operations
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions
}) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
        {actions && <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 sticky bottom-0 bg-white z-10">
            {actions}
          </div>}
      </div>
    </div>;
};
interface MyHomeViewProps {
  userId: number;
  homeProfile?: APIHomeProfile | null;
  onProfileUpdate?: (profile: APIHomeProfile) => void;
}

export const MyHomeView: React.FC<MyHomeViewProps> = ({ userId, homeProfile, onProfileUpdate }) => {
  // State for tab selection in home systems
  const [activeSystemTab, setActiveSystemTab] = useState<string>('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState<string>('all');
  const [maintenanceSort, setMaintenanceSort] = useState<string>('dueDate');
  // Health scores from API data or defaults
  const healthScores = homeProfile?.health_scores || {
    overall: 85,
    hvac: 90,
    plumbing: 75,
    electrical: 95,
    exterior: 70,
    security: 90
  };
  // State for CRUD operations
  const [editHomeProfile, setEditHomeProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);






  // Display data from API homeProfile or fallback values
  const displayProfile = homeProfile ? {
    address: homeProfile.address,
    yearBuilt: homeProfile.year_built,
    squareFootage: homeProfile.square_footage,
    bedrooms: homeProfile.bedrooms,
    bathrooms: homeProfile.bathrooms,
    lotSize: homeProfile.lot_size
  } : {
    address: '123 Maple Street, Anytown, ST 12345',
    yearBuilt: 2005,
    squareFootage: 2450,
    bedrooms: 4,
    bathrooms: 2.5,
    lotSize: '0.25 acres'
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (!homeProfile?.id) return;

    try {
      const profileId = parseInt(homeProfile.id);
      await HomeProfileService.deleteProfile(profileId);

      // Call the onProfileUpdate callback to trigger a refresh
      // This will cause the parent to reload and show the create profile flow
      if (onProfileUpdate) {
        onProfileUpdate(null as any); // This will trigger the "no profile" state
      }

      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Failed to delete home profile:', error);
      alert('Failed to delete home profile. Please try again.');
    }
  };
  // State for task editor modal
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  // Sample maintenance tasks data (in a real app, this would come from a database)
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([{
    id: 'task-1',
    name: 'HVAC Service',
    system: 'HVAC',
    frequency: 'Bi-annual',
    lastDone: '2023-03-15',
    nextDue: '2023-09-15',
    status: 'upcoming'
  }, {
    id: 'task-2',
    name: 'Gutter Cleaning',
    system: 'Exterior',
    frequency: 'Bi-annual',
    lastDone: '2022-11-10',
    nextDue: '2023-05-10',
    status: 'overdue'
  }, {
    id: 'task-3',
    name: 'Water Heater Flush',
    system: 'Plumbing',
    frequency: 'Annual',
    lastDone: '2023-01-20',
    nextDue: '2024-01-20',
    status: 'on-track',
    notes: 'Remember to check pressure relief valve'
  }]);
  // Function to open the task editor modal
  const handleEditTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsTaskEditorOpen(true);
  };
  // Function to save the edited task
  const handleSaveTask = async (updatedTask: MaintenanceTask) => {
    // Simulate API call with a delay
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          // Update the task in the state
          setMaintenanceTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1000); // 1 second delay to simulate API call
    });
  };
  // Function to filter maintenance tasks based on selected filter
  const getFilteredTasks = () => {
    if (maintenanceFilter === 'all') {
      return maintenanceTasks;
    } else if (maintenanceFilter === 'upcoming') {
      return maintenanceTasks.filter(task => task.status === 'upcoming');
    } else if (maintenanceFilter === 'overdue') {
      return maintenanceTasks.filter(task => task.status === 'overdue');
    }
    return maintenanceTasks;
  };
  // Function to sort maintenance tasks based on selected sort option
  const getSortedTasks = () => {
    const filteredTasks = getFilteredTasks();
    switch (maintenanceSort) {
      case 'dueDate':
        return [...filteredTasks].sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());
      case 'system':
        return [...filteredTasks].sort((a, b) => a.system.localeCompare(b.system));
      case 'status':
        return [...filteredTasks].sort((a, b) => a.status.localeCompare(b.status));
      default:
        return filteredTasks;
    }
  };
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Quick Stats Dashboard */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <Home className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold">Home Dashboard</h2>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">

          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Overall Health Score */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Home Health</div>
              <div className="text-xl font-bold text-gray-800">
                {healthScores.overall}%
              </div>
              <div className="text-xs text-blue-600">Good Condition</div>
            </div>
            <CircularProgress percentage={healthScores.overall} size={60} color="#3B82F6" label={`${healthScores.overall}%`} />
          </div>
          {/* Upcoming Maintenance */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">
              Upcoming Maintenance
            </div>
            <div className="text-xl font-bold text-gray-800">2 Tasks</div>
            <div className="text-xs text-orange-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />1 Due Soon
            </div>
          </div>
          {/* Alerts */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Alerts</div>
            <div className="text-xl font-bold text-gray-800">1 Alert</div>
            <div className="text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              HVAC Filter Replacement
            </div>
          </div>
          {/* Annual Maintenance Cost */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Annual Maintenance</div>
            <div className="text-xl font-bold text-gray-800">$2,450</div>
            <div className="text-xs text-green-600 flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              Under Budget
            </div>
          </div>
        </div>
        {/* Address with map link */}
        <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-gray-800">
              123 Maple Street, Anytown, ST 12345
            </span>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Map
          </a>
        </div>
      </div>
      {/* My Home Profile - Collapsible */}
      <CollapsibleSection title="My Home Profile" icon={<Home className="w-6 h-6 text-blue-600 mr-2" />} actions={
          <div className="flex items-center space-x-2">
            <button
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
              onClick={() => setEditHomeProfile(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </button>
            <button
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Profile
            </button>
          </div>
        }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Home Information - Enhanced with icons */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center">
              <Clipboard className="w-5 h-5 text-blue-600 mr-2" />
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <Home className="w-4 h-4 text-gray-400 mr-2" />
                  Address:
                </span>
                <span className="font-medium">{displayProfile.address}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  Year Built:
                </span>
                <span className="font-medium">{displayProfile.yearBuilt}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <BarChart className="w-4 h-4 text-gray-400 mr-2" />
                  Square Footage:
                </span>
                <span className="font-medium">
                  {displayProfile.squareFootage} sq ft
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Bedrooms:</span>
                <span className="font-medium">{displayProfile.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium">{displayProfile.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Lot Size:</span>
                <span className="font-medium">{displayProfile.lotSize}</span>
              </div>
            </div>
          </div>
          {/* Property Documents - Enhanced with badges and dates */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              Property Documents
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Home Inspection Report</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Mar 2022</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Important
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Warranty Information</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Jan 2023</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Floor Plans</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Jun 2020</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-md transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Insurance Documents</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Dec 2022</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                    Renewal Soon
                  </span>
                </div>
              </div>
              <button className="mt-3 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md text-sm font-medium w-full flex items-center justify-center transition-colors" onClick={() => setShowAddDocument(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      {/* Home Systems - Collapsible with tabs */}
      <CollapsibleSection title="Home Systems" icon={<Wrench className="w-6 h-6 text-blue-600 mr-2" />} actions={<button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors" onClick={() => setShowAddSystem(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add System
          </button>}>
        {/* System filtering tabs */}
        <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
          <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSystemTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveSystemTab('all')}>
            All Systems
          </button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSystemTab === 'hvac' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveSystemTab('hvac')}>
            <Thermometer className="w-3 h-3 inline mr-1" />
            HVAC
          </button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSystemTab === 'plumbing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveSystemTab('plumbing')}>
            <Droplet className="w-3 h-3 inline mr-1" />
            Plumbing
          </button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSystemTab === 'electrical' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveSystemTab('electrical')}>
            <Zap className="w-3 h-3 inline mr-1" />
            Electrical
          </button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeSystemTab === 'exterior' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveSystemTab('exterior')}>
            <Wind className="w-3 h-3 inline mr-1" />
            Exterior
          </button>
        </div>
        {/* Loading State */}
        {isLoadingSystems && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading systems...</span>
          </div>
        )}

        {/* Error State */}
        {systemsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {systemsError}
            <button
              onClick={loadHomeSystems}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingSystems && !systemsError && getFilteredSystems().length === 0 && (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Home Systems</h3>
            <p className="text-gray-600 mb-4">
              {activeSystemTab === 'all'
                ? "You haven't added any home systems yet."
                : `No ${activeSystemTab} systems found.`}
            </p>
            <button
              onClick={() => setShowAddSystem(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First System
            </button>
          </div>
        )}

        {/* Systems Grid */}
        {!isLoadingSystems && !systemsError && getFilteredSystems().length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredSystems().map((system) => {
              const SystemIcon = getSystemIcon(system.type);
              const status = getMaintenanceStatus(system);
              const statusColor = getStatusColor(status);
              const statusText = getStatusText(status);

              return (
                <div
                  key={system.id}
                  className="border border-l-4 border-l-blue-500 rounded-md p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50 relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button className="p-1 bg-white rounded-full hover:bg-gray-100">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 bg-white rounded-full hover:bg-gray-100">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                        <SystemIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold">{system.name}</h3>
                    </div>
                    <CircularProgress
                      percentage={system.health_score}
                      size={36}
                      color={system.health_score > 80 ? '#10B981' : system.health_score > 60 ? '#F59E0B' : '#EF4444'}
                      label={`${system.health_score}%`}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{system.type}</span>
                    </div>
                    {system.brand && (
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-600">Brand:</span>
                        <span>{system.brand}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-600">Install Date:</span>
                      <span>{new Date(system.installed_date).toLocaleDateString()}</span>
                    </div>
                    {system.last_service_date && (
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-600">Last Service:</span>
                        <span>{new Date(system.last_service_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    {system.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {system.details}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Schedule Service
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* Maintenance Schedule - Collapsible */}
      <CollapsibleSection title="Maintenance Schedule" icon={<Calendar className="w-6 h-6 text-blue-600 mr-2" />} actions={<button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors" onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </button>}>
        {/* Filter and sort controls */}
        <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${maintenanceFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setMaintenanceFilter('all')}>
              All Tasks
            </button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${maintenanceFilter === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setMaintenanceFilter('upcoming')}>
              Upcoming
            </button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${maintenanceFilter === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setMaintenanceFilter('overdue')}>
              Overdue
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white" value={maintenanceSort} onChange={e => setMaintenanceSort(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="system">System</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table headers with sticky position */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-2">
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                System
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Done
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Due
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </div>
            </div>
          </div>
          {/* Table rows with hover effect */}
          <div className="divide-y divide-gray-200">
            {/* Render sorted and filtered maintenance tasks */}
            {getSortedTasks().map(task => <div key={task.id} className="grid grid-cols-7 gap-2 hover:bg-blue-50 transition-colors">
                <div className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <div className={`bg-${task.system === 'HVAC' ? 'red' : task.system === 'Plumbing' ? 'blue' : task.system === 'Electrical' ? 'yellow' : 'gray'}-100 p-1 rounded-full mr-2`}>
                    {task.system === 'HVAC' && <Thermometer className="w-3 h-3 text-red-500" />}
                    {task.system === 'Plumbing' && <Droplet className="w-3 h-3 text-blue-500" />}
                    {task.system === 'Electrical' && <Zap className="w-3 h-3 text-yellow-500" />}
                    {task.system === 'Exterior' && <Wind className="w-3 h-3 text-gray-500" />}
                  </div>
                  {task.name}
                </div>
                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.system}
                </div>
                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.frequency}
                </div>
                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.lastDone).toLocaleDateString()}
                </div>
                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.nextDue).toLocaleDateString()}
                </div>
                <div className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : task.status === 'overdue' ? 'bg-red-100 text-red-800' : task.status === 'on-track' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {task.status === 'upcoming' ? 'Upcoming' : task.status === 'overdue' ? 'Overdue' : task.status === 'on-track' ? 'On Track' : 'Completed'}
                  </span>
                </div>
                <div className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                  <button className="p-1 rounded-full hover:bg-blue-100" onClick={() => handleEditTask(task)}>
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>)}
            {/* Show empty state when no tasks match the filter */}
            {getSortedTasks().length === 0 && <div className="px-6 py-8 text-center">
                <p className="text-gray-500">
                  No {maintenanceFilter !== 'all' ? maintenanceFilter : ''}{' '}
                  tasks found.
                </p>
              </div>}
          </div>
        </div>
      </CollapsibleSection>
      {/* Service Providers - Collapsible */}
      <CollapsibleSection title="Service Providers" icon={<Phone className="w-6 h-6 text-blue-600 mr-2" />} actions={<button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors" onClick={() => setShowAddProvider(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Provider
          </button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HVAC Provider Card - Enhanced with rating */}
          <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
              <button className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-sm">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-sm">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <div className="bg-red-50 p-3 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold">ABC HVAC Services</h3>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  HVAC
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-current' : ''}`} />)}
                  <span className="text-xs text-gray-600 ml-1">4.0</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span>Last Service: March 2023</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button className="bg-blue-600 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
          {/* Plumbing Provider Card */}
          <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-3 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Droplet className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold">
                    Quality Plumbing Co.
                  </h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Plumbing
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-current' : ''}`} />)}
                  <span className="text-xs text-gray-600 ml-1">5.0</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span>(555) 987-6543</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span>Last Service: May 2023</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button className="bg-blue-600 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
          {/* Electrical Provider Card */}
          <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-yellow-50 p-3 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-semibold">Secure Electric LLC</h3>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Electrical
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-current' : ''}`} />)}
                  <span className="text-xs text-gray-600 ml-1">4.0</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span>(555) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span>Last Service: August 2022</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button className="bg-blue-600 text-white py-1.5 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      {/* Edit Home Profile Modal */}
      {homeProfile && (
        <EditHomeProfileModal
          isOpen={editHomeProfile}
          onClose={() => setEditHomeProfile(false)}
          onSuccess={onProfileUpdate || (() => {})}
          homeProfile={homeProfile}
        />
      )}
      {/* Add Document Modal */}
      <Modal isOpen={showAddDocument} onClose={() => setShowAddDocument(false)} title="Upload New Document" actions={<>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowAddDocument(false)}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowAddDocument(false)}>
              Upload
            </button>
          </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input type="text" placeholder="e.g., Home Warranty" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">
              Drag and drop your file here, or
            </p>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              Browse Files
            </button>
          </div>
        </div>
      </Modal>
      {/* Add System Modal */}
      <Modal
        isOpen={showAddSystem}
        onClose={() => {
          setShowAddSystem(false);
          resetSystemForm();
        }}
        title="Add Home System"
        actions={<>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => {
              setShowAddSystem(false);
              resetSystemForm();
            }}
            disabled={isSubmittingSystem}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSystemSubmit}
            disabled={isSubmittingSystem || !systemForm.name || !systemForm.installed_date}
          >
            {isSubmittingSystem ? 'Adding...' : 'Add System'}
          </button>
        </>}
      >
        <div className="space-y-4">
          {systemError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {systemError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.type}
              onChange={(e) => setSystemForm(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="exterior">Exterior</option>
              <option value="windows">Windows & Doors</option>
              <option value="security">Security & Safety</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Central Air System, Water Heater, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.name}
              onChange={(e) => setSystemForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              placeholder="e.g., Carrier, Rheem, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.brand}
              onChange={(e) => setSystemForm(prev => ({ ...prev, brand: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Install Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.installed_date}
              onChange={(e) => setSystemForm(prev => ({ ...prev, installed_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Service Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.last_service_date}
              onChange={(e) => setSystemForm(prev => ({ ...prev, last_service_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Service Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.next_service_date}
              onChange={(e) => setSystemForm(prev => ({ ...prev, next_service_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details/Notes
            </label>
            <textarea
              placeholder="Any additional information about this system (model, specifications, etc.)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={systemForm.details}
              onChange={(e) => setSystemForm(prev => ({ ...prev, details: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Maintenance Task" actions={<>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowAddTask(false)}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowAddTask(false)}>
              Add Task
            </button>
          </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input type="text" placeholder="e.g., HVAC Filter Replacement" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="exterior">Exterior</option>
              <option value="windows">Windows & Doors</option>
              <option value="security">Security & Safety</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Bi-annual</option>
              <option value="annual">Annual</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Done
            </label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Due
            </label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="on-track">On Track</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea placeholder="Any additional information about this task" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
        </div>
      </Modal>
      {/* Add Provider Modal */}
      <Modal isOpen={showAddProvider} onClose={() => setShowAddProvider(false)} title="Add Service Provider" actions={<>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => setShowAddProvider(false)}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowAddProvider(false)}>
              Add Provider
            </button>
          </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name
            </label>
            <input type="text" placeholder="e.g., ABC HVAC Services" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input type="tel" placeholder="e.g., (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Service Date
            </label>
            <input type="month" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" className="focus:outline-none">
                    <Star className="w-6 h-6" />
                  </button>)}
              </div>
              <span className="text-sm text-gray-500 ml-2">Click to rate</span>
            </div>
          </div>
        </div>
      </Modal>
      {/* Task Editor Modal */}
      <TaskEditorModal isOpen={isTaskEditorOpen} onClose={() => setIsTaskEditorOpen(false)} task={selectedTask} onSave={handleSaveTask} />

      {/* Delete Profile Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Home Profile"
        message="Are you sure you want to delete your home profile? This action cannot be undone and will remove all your home information, systems, and maintenance history."
        onConfirm={handleDeleteProfile}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete Profile"
        confirmClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};