import React, { useState, useEffect } from 'react';
import { Home, Calendar, Phone, ChevronDown, ChevronUp, Plus, Wrench, FileText, X, AlertCircle, DollarSign, MapPin, Clipboard, BarChart, Thermometer, Droplet, Zap, Trash2, SquarePen } from 'lucide-react';
import { HomeProfile as APIHomeProfile, ServiceProvider as APIServiceProvider } from '../src/types/api';
import { HomeSystemsSection } from './HomeSystemsSection';
import { EditHomeProfileModal } from './EditHomeProfileModal';
import { ConfirmDialog } from './ConfirmDialog';
import { TaskEditorModal } from './TaskEditorModal';
import { ServiceProviderModal, ServiceProviderFormData } from './ServiceProviderModal';
import { useMaintenanceTasks } from '../hooks/useMaintenanceTasks';
import { ProviderService } from '../src/services/providerService';

// Maintenance Task Interface (keeping local interface for compatibility)
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

// Service Provider Interface - Extended for UI compatibility
interface ServiceProvider {
  id: string | number;
  name: string;
  type: string;
  category?: string; // Alias for type for backward compatibility
  phone: string;
  email?: string; // Optional UI field
  address?: string; // Optional UI field
  rating: number;
  notes?: string; // Optional UI field
  lastService?: string; // Alias for last_service
  last_service?: string; // API field
  user_id?: number;
  created_at?: number;
}

// Circular Progress Component
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  color = '#3B82F6',
  bgColor = '#E5E7EB',
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = percentage * circumference / 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - dash} strokeLinecap="round" />
      </svg>
      {label && <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {label}
      </div>}
    </div>
  );
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className = '',
  actions
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
          <div className="mr-2 text-blue-600 group-hover:text-blue-700 transition-colors">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
            {title}
          </h2>
          <div className="ml-2 text-gray-400 group-hover:text-blue-600 transition-colors">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {isOpen && <div className="transition-all duration-200 ease-in-out">{children}</div>}
    </div>
  );
};

// Main Component Props
interface MyHomeViewProps {
  userId: number;
  homeProfile?: APIHomeProfile | null;
  onProfileUpdate?: (profile: APIHomeProfile) => void;
}

export const MyHomeViewClean: React.FC<MyHomeViewProps> = ({ userId, homeProfile, onProfileUpdate }) => {
  // State for tab selection in home systems
  const [activeSystemTab, setActiveSystemTab] = useState<string>('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState<string>('all');

  // State for maintenance schedule sorting
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for CRUD operations
  const [editHomeProfile, setEditHomeProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);

  // Maintenance task management state
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Use maintenance tasks hook for API integration
  const {
    tasks: maintenanceTasks,
    loading: tasksLoading,
    error: tasksError,
    getFilteredTasks: getFilteredMaintenanceTasks,
    getTaskCounts,
    createTask: createMaintenanceTask,
    updateTask: updateMaintenanceTask,
    deleteTask: deleteMaintenanceTask,
    refreshTasks
  } = useMaintenanceTasks(userId || 2);

  // Service provider management state
  const [isProviderEditorOpen, setIsProviderEditorOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  // Maintenance tasks now loaded via useMaintenanceTasks hook

  // Service providers data - loaded from API
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [providerError, setProviderError] = useState<string | null>(null);

  // Fetch service providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoadingProviders(true);
        setProviderError(null);
        const providers = await ProviderService.getServiceProviders();

        // Transform API data to match UI expectations
        const transformedProviders: ServiceProvider[] = providers.map(provider => ({
          ...provider,
          id: provider.id.toString(), // Convert to string for UI compatibility
          category: provider.type, // Add category alias for backward compatibility
          lastService: provider.last_service, // Add lastService alias
          // Optional UI fields will be undefined but that's okay
        }));

        setServiceProviders(transformedProviders);
      } catch (error) {
        console.error('Failed to fetch service providers:', error);
        setProviderError('Failed to load service providers. Please try again.');
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchProviders();
  }, []);

  // Display data from API homeProfile or fallback values
  const displayProfile = homeProfile ? {
    address: homeProfile.address,
    yearBuilt: homeProfile.year_built,
    squareFootage: homeProfile.square_footage,
    propertyType: homeProfile.property_type,
    bedrooms: homeProfile.bedrooms,
    bathrooms: homeProfile.bathrooms,
    lotSize: homeProfile.lot_size,
    heatingType: homeProfile.heating_type,
    coolingType: homeProfile.cooling_type,
    roofType: homeProfile.roof_type,
    foundationType: homeProfile.foundation_type,
    exteriorMaterial: homeProfile.exterior_material,
    notes: homeProfile.notes
  } : {
    address: '123 Main Street, Anytown, ST 12345',
    yearBuilt: 1995,
    squareFootage: 2500,
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    lotSize: '0.25 acres',
    heatingType: 'Gas',
    coolingType: 'Central Air',
    roofType: 'Asphalt Shingles',
    foundationType: 'Concrete Slab',
    exteriorMaterial: 'Brick',
    notes: 'Well-maintained family home'
  };

  // Helper functions for maintenance tasks
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const getFilteredTasks = () => {
    const filteredTasks = getFilteredMaintenanceTasks(maintenanceFilter);
    return sortTasks(filteredTasks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sorting helper functions
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortTasks = (tasks: any[]) => {
    if (!sortField) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'task':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'system':
          aValue = a.system?.toLowerCase() || '';
          bValue = b.system?.toLowerCase() || '';
          break;
        case 'frequency':
          aValue = a.frequency?.toLowerCase() || '';
          bValue = b.frequency?.toLowerCase() || '';
          break;
        case 'lastDone':
          aValue = new Date(a.lastDone || 0).getTime();
          bValue = new Date(b.lastDone || 0).getTime();
          break;
        case 'nextDue':
          aValue = new Date(a.nextDue || 0).getTime();
          bValue = new Date(b.nextDue || 0).getTime();
          break;
        case 'status':
          // Sort by status priority: overdue, upcoming, on-track, completed
          const statusOrder = { 'overdue': 0, 'upcoming': 1, 'on-track': 2, 'completed': 3 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] ?? 4;
          bValue = statusOrder[b.status as keyof typeof statusOrder] ?? 4;
          break;
        default:
          return 0;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  const getSystemIcon = (system: string) => {
    switch (system.toLowerCase()) {
      case 'hvac': return <Thermometer className="w-4 h-4 text-red-500" />;
      case 'plumbing': return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'electrical': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'exterior': return <Home className="w-4 h-4 text-gray-500" />;
      default: return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleEditTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsTaskEditorOpen(true);
  };

  const handleSaveTask = async (task: MaintenanceTask) => {
    try {
      if (task.id && maintenanceTasks.find(t => t.id === task.id)) {
        // Update existing task
        await updateMaintenanceTask(task.id, task);
      } else {
        // Add new task
        await createMaintenanceTask(task);
      }
      setIsTaskEditorOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to save maintenance task:', error);
      // Error handling is managed by the hook
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskEditorOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteMaintenanceTask(taskToDelete);
        setTaskToDelete(null);
      } catch (error) {
        console.error('Failed to delete maintenance task:', error);
        // Error handling is managed by the hook
      }
    }
  };

  // Service provider helper functions
  const handleEditProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsProviderEditorOpen(true);
  };

  const handleAddProvider = () => {
    setSelectedProvider(null);
    setIsProviderEditorOpen(true);
  };

  const handleDeleteProviderClick = (providerId: string) => {
    setProviderToDelete(providerId);
  };

  const handleConfirmProviderDelete = async () => {
    if (!providerToDelete) return;

    try {
      // Delete the provider via API
      await ProviderService.deleteServiceProvider(providerToDelete);

      // Remove from local state for immediate UI update
      setServiceProviders(prev => prev.filter(provider => provider.id.toString() !== providerToDelete));

      // Close the confirmation modal
      setProviderToDelete(null);
    } catch (error) {
      console.error('Failed to delete service provider:', error);
      // TODO: Show error message to user
      // For now, we'll still close the modal but the provider won't be deleted
      setProviderToDelete(null);
    }
  };

  const handleSaveProvider = async (providerData: ServiceProviderFormData) => {
    try {
      // Get current user ID (you may need to get this from auth context)
      const userId = 3; // Using the test user ID for now

      // Prepare the request data
      const requestData = {
        name: providerData.name,
        type: providerData.type,
        phone: providerData.phone,
        last_service: providerData.last_service || undefined,
        rating: providerData.rating || undefined,
        user_id: userId
      };

      let updatedProvider: ServiceProvider;

      if (selectedProvider && selectedProvider.id) {
        // UPDATE existing provider
        updatedProvider = await ProviderService.updateServiceProvider(selectedProvider.id, requestData);

        // Transform API response to match UI expectations
        const transformedProvider: ServiceProvider = {
          ...updatedProvider,
          id: updatedProvider.id.toString(),
          category: updatedProvider.type,
          lastService: updatedProvider.last_service,
        };

        // Update in local state for immediate UI update
        setServiceProviders(prev => prev.map(p =>
          p.id.toString() === selectedProvider.id.toString() ? transformedProvider : p
        ));
      } else {
        // CREATE new provider
        updatedProvider = await ProviderService.createServiceProvider(requestData);

        // Transform API response to match UI expectations
        const transformedProvider: ServiceProvider = {
          ...updatedProvider,
          id: updatedProvider.id.toString(),
          category: updatedProvider.type,
          lastService: updatedProvider.last_service,
        };

        // Add to local state for immediate UI update
        setServiceProviders(prev => [...prev, transformedProvider]);
      }

    } catch (error) {
      console.error('Failed to save service provider:', error);
      throw error; // Re-throw so the modal can handle the error
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const handleDeleteProfile = async () => {
    // Implementation for profile deletion
    console.log('Delete profile functionality would be implemented here');
    setShowDeleteConfirm(false);
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
            {/* Beta Notice */}
            <div className="bg-orange-100 border border-orange-200 rounded-lg px-3 py-1 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-orange-700 text-sm font-medium">Home Dashboard Coming Soon</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Overall Health Score */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Home Health</div>
              <div className="text-xl font-bold text-gray-800">
                {homeProfile?.health_scores?.overall || 85}%
              </div>
              <div className="text-xs text-blue-600">Good Condition</div>
            </div>
            <CircularProgress percentage={homeProfile?.health_scores?.overall || 85} size={60} color="#3B82F6" label={`${homeProfile?.health_scores?.overall || 85}%`} />
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

      {/* My Home Profile Section */}
      <CollapsibleSection title="My Home Profile" icon={<Home className="w-6 h-6 text-blue-600 mr-2" />} actions={
          <div className="flex items-center space-x-2">
            <button
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
              onClick={() => setEditHomeProfile(true)}
            >
              Edit Profile
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
                <span className="text-gray-600">Property Type:</span>
                <span className="font-medium">{displayProfile.propertyType}</span>
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
                  {displayProfile.squareFootage?.toLocaleString()} sq ft
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
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Lot Size:</span>
                <span className="font-medium">{displayProfile.lotSize}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Exterior Material:</span>
                <span className="font-medium">{displayProfile.exteriorMaterial}</span>
              </div>
            </div>
          </div>
          {/* Property Documents - Enhanced with badges and dates */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                Property Documents
              </div>
              {/* Beta Notice */}
              <div className="bg-orange-100 border border-orange-200 rounded-lg px-2 py-1 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-orange-700 text-xs font-medium">Coming Soon</span>
              </div>
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
              <button
                className="mt-3 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md text-sm font-medium w-full flex items-center justify-center transition-colors"
                onClick={() => setShowAddDocument(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Upload New Document
              </button>
            </div>
          </div>
        </div>
        
        {displayProfile.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
            <p className="text-gray-700">{displayProfile.notes}</p>
          </div>
        )}
      </CollapsibleSection>



      {/* Home Systems Section */}
      <CollapsibleSection title="Home Systems" icon={<Wrench className="w-6 h-6 text-blue-600 mr-2" />}>
        <HomeSystemsSection 
          userId={userId}
          activeSystemTab={activeSystemTab}
          setActiveSystemTab={setActiveSystemTab}
        />
      </CollapsibleSection>

      {/* Maintenance Schedule Section */}
      <CollapsibleSection
        title="Maintenance Schedule"
        icon={<Calendar className="w-6 h-6 text-blue-600 mr-2" />}
        actions={
          <button
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
            onClick={handleAddTask}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </button>
        }
      >
        {/* Filter and sort controls */}
        <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                maintenanceFilter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMaintenanceFilter('all')}
            >
              All Tasks ({getTaskCounts().all})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                maintenanceFilter === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMaintenanceFilter('upcoming')}
            >
              Upcoming ({getTaskCounts().upcoming})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                maintenanceFilter === 'overdue'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMaintenanceFilter('overdue')}
            >
              Overdue ({getTaskCounts().overdue})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                maintenanceFilter === 'on-track'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMaintenanceFilter('on-track')}
            >
              On track ({getTaskCounts()['on-track']})
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                maintenanceFilter === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setMaintenanceFilter('completed')}
            >
              Completed ({getTaskCounts().completed})
            </button>
          </div>
        </div>

        {/* Task table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <button
              className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded transition-colors text-left"
              onClick={() => handleSort('task')}
              title="Sort by Task"
            >
              <span>Task</span>
              {sortField === 'task' && (
                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded transition-colors text-left"
              onClick={() => handleSort('system')}
              title="Sort by System"
            >
              <span>System</span>
              {sortField === 'system' && (
                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <div className="px-2 py-1">Frequency</div>
            <button
              className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded transition-colors text-left"
              onClick={() => handleSort('lastDone')}
              title="Sort by Last Done"
            >
              <span>Last Done</span>
              {sortField === 'lastDone' && (
                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded transition-colors text-left"
              onClick={() => handleSort('nextDue')}
              title="Sort by Next Due"
            >
              <span>Next Due</span>
              {sortField === 'nextDue' && (
                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded transition-colors text-left"
              onClick={() => handleSort('status')}
              title="Sort by Status"
            >
              <span>Status</span>
              {sortField === 'status' && (
                sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <div className="px-2 py-1">Actions</div>
          </div>

          {tasksLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading maintenance tasks...</p>
            </div>
          ) : tasksError ? (
            <div className="p-8 text-center text-red-500">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Tasks</h3>
              <p className="text-red-600 mb-4">{tasksError}</p>
              <button
                onClick={refreshTasks}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : getFilteredTasks().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Tasks</h3>
              <p className="text-gray-600 mb-4">
                {maintenanceFilter === 'all'
                  ? "You haven't added any maintenance tasks yet."
                  : `No ${maintenanceFilter} tasks found.`}
              </p>
              <button
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Task
              </button>
            </div>
          ) : (
            getFilteredTasks().map((task) => (
              <div key={task.id} className="grid grid-cols-7 gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">{task.name}</div>
                <div className="flex items-center">
                  {getSystemIcon(task.system)}
                  <span className="ml-2 text-gray-700">{task.system}</span>
                </div>
                <div className="text-gray-700">{task.frequency}</div>
                <div className="text-gray-700">{formatDate(task.lastDone)}</div>
                <div className="text-gray-700">{formatDate(task.nextDue)}</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status === 'upcoming' ? 'Upcoming' :
                     task.status === 'overdue' ? 'Overdue' :
                     task.status === 'on-track' ? 'On track' : 'Completed'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                    title={`Edit ${task.name} task`}
                    aria-label={`Edit ${task.name} task`}
                  >
                    <SquarePen className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="p-1 rounded-full hover:bg-red-100 transition-colors"
                    title={`Delete ${task.name} task`}
                    aria-label={`Delete ${task.name} task`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CollapsibleSection>

      {/* Service Providers Section */}
      <CollapsibleSection
        title="Service Providers"
        icon={<Wrench className="w-6 h-6 text-blue-600 mr-2" />}
        actions={
          <button
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
            onClick={handleAddProvider}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Provider
          </button>
        }
      >
        {/* Service providers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingProviders ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Service Providers</h3>
              <p className="text-gray-600">Please wait while we fetch your providers...</p>
            </div>
          ) : providerError ? (
            <div className="col-span-full p-8 text-center text-red-500">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Providers</h3>
              <p className="text-gray-600 mb-4">{providerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : serviceProviders.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Providers</h3>
              <p className="text-gray-600 mb-4">
                You haven't added any service providers yet.
              </p>
              <button
                onClick={handleAddProvider}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Provider
              </button>
            </div>
          ) : (
            serviceProviders.map((provider) => (
              <div key={provider.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {provider.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title={`Edit ${provider.name}`}
                      aria-label={`Edit ${provider.name}`}
                    >
                      <SquarePen className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteProviderClick(provider.id.toString())}
                      className="p-1 rounded-full hover:bg-red-100 transition-colors"
                      title={`Delete ${provider.name}`}
                      aria-label={`Delete ${provider.name}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{provider.phone}</span>
                  </div>
                  {provider.email && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{provider.email}</span>
                    </div>
                  )}
                  {provider.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{provider.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                      {renderStars(provider.rating)}
                      <span className="ml-2 text-sm text-gray-600">{provider.rating}</span>
                    </div>
                    {provider.lastService && (
                      <span className="text-xs text-gray-500">
                        Last: {formatDate(provider.lastService)}
                      </span>
                    )}
                  </div>

                  {provider.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {provider.notes}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Home Profile"
        message="Are you sure you want to delete your home profile? This action cannot be undone and will remove all your home information, systems, and maintenance history."
        onConfirm={handleDeleteProfile}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete Profile"
        confirmClass="bg-red-600 hover:bg-red-700"
      />

      {/* Add Document Modal */}
      {showAddDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddDocument(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Upload New Document</h3>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setShowAddDocument(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Home Warranty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Select document type</option>
                  <option>Inspection Report</option>
                  <option>Warranty</option>
                  <option>Insurance</option>
                  <option>Floor Plans</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File
                </label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowAddDocument(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowAddDocument(false)}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Delete Confirmation Modal */}
      {providerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Service Provider</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this service provider? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setProviderToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={handleConfirmProviderDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Editor Modal */}
      <TaskEditorModal
        isOpen={isTaskEditorOpen}
        onClose={() => setIsTaskEditorOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
      />

      {/* Service Provider Modal */}
      <ServiceProviderModal
        isOpen={isProviderEditorOpen}
        onClose={() => setIsProviderEditorOpen(false)}
        provider={selectedProvider}
        onSave={handleSaveProvider}
      />
    </div>
  );
};
