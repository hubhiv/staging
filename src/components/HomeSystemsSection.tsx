import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, Thermometer, Droplet, Zap, Wind, Home, Shield, X } from 'lucide-react';
import { HomeService } from '../src/services/homeService';
import { HomeSystem as APIHomeSystem, HomeSystemRequest } from '../src/types/api';

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

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
        {actions && (
          <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface HomeSystemsSectionProps {
  userId: number;
  activeSystemTab: string;
  setActiveSystemTab: (tab: string) => void;
}

export const HomeSystemsSection: React.FC<HomeSystemsSectionProps> = ({
  userId,
  activeSystemTab,
  setActiveSystemTab
}) => {
  // State management
  const [homeSystems, setHomeSystems] = useState<APIHomeSystem[]>([]);
  const [isLoadingSystems, setIsLoadingSystems] = useState(false);
  const [systemsError, setSystemsError] = useState<string | null>(null);
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [showEditSystem, setShowEditSystem] = useState(false);
  const [editingSystem, setEditingSystem] = useState<APIHomeSystem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSystem, setDeletingSystem] = useState<APIHomeSystem | null>(null);
  const [isDeletingSystem, setIsDeletingSystem] = useState(false);

  // Add/Edit System form state
  const [systemForm, setSystemForm] = useState({
    type: 'hvac' as 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'windows' | 'security',
    name: '',
    brand: '',
    installed_date: '',
    last_service_date: '',
    next_service_date: '',
    details: ''
  });
  const [isSubmittingSystem, setIsSubmittingSystem] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  // Load home systems
  const loadHomeSystems = async () => {
    setIsLoadingSystems(true);
    setSystemsError(null);
    
    try {
      const systems = await HomeService.getHomeSystems();
      setHomeSystems(systems);
    } catch (error) {
      console.error('Error loading home systems:', error);
      setSystemsError('Failed to load home systems');
    } finally {
      setIsLoadingSystems(false);
    }
  };

  // Load systems on component mount
  useEffect(() => {
    loadHomeSystems();
  }, [userId]);

  // Reset system form
  const resetSystemForm = () => {
    setSystemForm({
      type: 'hvac',
      name: '',
      brand: '',
      installed_date: '',
      last_service_date: '',
      next_service_date: '',
      details: ''
    });
    setSystemError(null);
  };

  // Populate form for editing
  const populateFormForEdit = (system: APIHomeSystem) => {
    setSystemForm({
      type: system.type as 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'windows' | 'security',
      name: system.name,
      brand: system.brand || '',
      installed_date: system.installed_date ? new Date(system.installed_date).toISOString().split('T')[0] : '',
      last_service_date: system.last_service_date ? new Date(system.last_service_date).toISOString().split('T')[0] : '',
      next_service_date: system.next_service_date ? new Date(system.next_service_date).toISOString().split('T')[0] : '',
      details: system.details || ''
    });
    setSystemError(null);
  };

  // Handle edit system
  const handleEditSystem = (system: APIHomeSystem) => {
    setEditingSystem(system);
    populateFormForEdit(system);
    setShowEditSystem(true);
  };

  // Handle delete system confirmation
  const handleDeleteSystem = (system: APIHomeSystem) => {
    setDeletingSystem(system);
    setShowDeleteConfirm(true);
  };

  // Confirm delete system
  const confirmDeleteSystem = async () => {
    if (!deletingSystem) return;

    setIsDeletingSystem(true);
    try {
      await HomeService.deleteHomeSystem(deletingSystem.id.toString());

      // Success - close modal and refresh list
      setShowDeleteConfirm(false);
      setDeletingSystem(null);
      await loadHomeSystems();

    } catch (error) {
      console.error('Error deleting home system:', error);
      // You could add error handling here if needed
    } finally {
      setIsDeletingSystem(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingSystem(null);
  };

  // Handle system form submission (CREATE or UPDATE)
  const handleSystemSubmit = async () => {
    if (!systemForm.name || !systemForm.installed_date) {
      setSystemError('Name and Install Date are required');
      return;
    }

    setIsSubmittingSystem(true);
    setSystemError(null);

    try {
      const systemData: HomeSystemRequest = {
        type: systemForm.type,
        name: systemForm.name,
        brand: systemForm.brand || undefined,
        installed_date: systemForm.installed_date,
        last_service_date: systemForm.last_service_date || undefined,
        next_service_date: systemForm.next_service_date || undefined,
        details: systemForm.details || undefined,
        user_id: userId
      };

      if (editingSystem) {
        // UPDATE operation
        await HomeService.updateHomeSystem(editingSystem.id.toString(), systemData);
        setShowEditSystem(false);
        setEditingSystem(null);
      } else {
        // CREATE operation
        await HomeService.createHomeSystem(systemData);
        setShowAddSystem(false);
      }

      // Reset form and refresh the systems list
      resetSystemForm();
      await loadHomeSystems();

    } catch (error) {
      console.error('Error saving home system:', error);
      setSystemError(`Failed to ${editingSystem ? 'update' : 'create'} home system. Please try again.`);
    } finally {
      setIsSubmittingSystem(false);
    }
  };

  // Helper functions for system status
  const getMaintenanceStatus = (system: APIHomeSystem) => {
    if (!system.next_service_date) return 'unknown';
    
    const nextServiceDate = new Date(system.next_service_date);
    const today = new Date();
    const daysUntilService = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilService < 0) return 'overdue';
    if (daysUntilService <= 30) return 'due-soon';
    return 'up-to-date';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'due-soon': return 'text-yellow-600 bg-yellow-50';
      case 'up-to-date': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'overdue': return 'Overdue';
      case 'due-soon': return 'Due Soon';
      case 'up-to-date': return 'Up to Date';
      default: return 'Unknown';
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'hvac': return Thermometer;
      case 'plumbing': return Droplet;
      case 'electrical': return Zap;
      case 'exterior': return Wind;
      case 'windows': return Home;
      case 'security': return Shield;
      default: return Wrench;
    }
  };

  // Filter systems by active tab
  const getFilteredSystems = () => {
    if (activeSystemTab === 'all') return homeSystems;
    return homeSystems.filter(system => system.type === activeSystemTab);
  };

  return (
    <div className="space-y-6">
      {/* System Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'hvac', 'plumbing', 'electrical', 'exterior', 'windows', 'security'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSystemTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSystemTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'all' ? 'All Systems' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add System Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Home Systems</h3>
        <button 
          onClick={() => setShowAddSystem(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add System
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
                {/* Edit/Delete buttons positioned to avoid overlap with health score */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
                  <button
                    className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-200"
                    onClick={() => handleEditSystem(system)}
                    title="Edit System"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-1 bg-white rounded-full hover:bg-gray-100 shadow-sm border border-gray-200"
                    onClick={() => handleDeleteSystem(system)}
                    title="Delete System"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1 mr-3">
                    <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                      <SystemIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{system.name}</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <CircularProgress
                      percentage={system.health_score}
                      size={36}
                      color={system.health_score > 80 ? '#10B981' : system.health_score > 60 ? '#F59E0B' : '#EF4444'}
                      label={`${system.health_score}%`}
                    />
                  </div>
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

      {/* Edit System Modal - Same form content */}
      <Modal
        isOpen={showEditSystem}
        onClose={() => {
          setShowEditSystem(false);
          setEditingSystem(null);
          resetSystemForm();
        }}
        title="Edit Home System"
        actions={<>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => {
              setShowEditSystem(false);
              setEditingSystem(null);
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
            {isSubmittingSystem ? 'Updating...' : 'Update System'}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        title="Delete Home System"
        size="sm"
        actions={<>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={cancelDelete}
            disabled={isDeletingSystem}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={confirmDeleteSystem}
            disabled={isDeletingSystem}
          >
            {isDeletingSystem ? 'Deleting...' : 'Delete'}
          </button>
        </>}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this system?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                You are about to delete <strong>"{deletingSystem?.name}"</strong>. This action cannot be undone.
              </p>
            </div>
          </div>

          {deletingSystem && (
            <div className="bg-gray-50 rounded-md p-3">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{deletingSystem.type}</span>
                </div>
                {deletingSystem.brand && (
                  <div className="flex justify-between">
                    <span>Brand:</span>
                    <span>{deletingSystem.brand}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Install Date:</span>
                  <span>{new Date(deletingSystem.installed_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
