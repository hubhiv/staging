import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, HelpCircle, Settings, ChevronDown, Share2, Menu, X, Calendar, DollarSign, Gift, Home, Info, Filter } from 'lucide-react';
import { useKanban } from './KanbanContext';
import { UserProfileDropdown } from './UserProfileDropdown';
export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView
  } = useKanban();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  // New state for user profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  // Provider types - ideally these would come from a shared data source
  const providerTypes = ['Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Cleaning', 'Carpentry', 'Painting'];
  // Handle clicks outside the profile dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    // Only add the listener when the dropdown is open
    if (isProfileOpen) {
      // Use a slight delay to prevent the event from being caught in the same cycle
      setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick);
      }, 0);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileOpen]); // Add isProfileOpen as a dependency
  const handleViewChange = (view: 'board' | 'calendar' | 'myHome', e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView(view);
    setMobileMenuOpen(false);
  };
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const toggleFilterModal = () => {
    setIsFilterModalOpen(!isFilterModalOpen);
    if (!isFilterModalOpen) {
      // Reset the temporary selections to match applied filters when opening
      setSelectedProviderTypes([...appliedFilters]);
    }
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedProviderTypes(prev => [...prev, value]);
    } else {
      setSelectedProviderTypes(prev => prev.filter(type => type !== value));
    }
  };
  const applyFilters = () => {
    setAppliedFilters([...selectedProviderTypes]);
    // Here you would also apply the filters to your data
    // For example: filterTasks(selectedProviderTypes);
    toggleFilterModal();
  };
  const clearFilters = () => {
    setSelectedProviderTypes([]);
    setAppliedFilters([]);
    // Here you would also clear the filters from your data
    // For example: clearTaskFilters();
    toggleFilterModal();
  };
  // Update profile dropdown toggle to stop propagation
  const toggleProfileDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from bubbling up to document
    setIsProfileOpen(prev => !prev);
  };
  return <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="font-bold text-xl text-blue-600">HubHiv</div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex ml-6 space-x-4">
            <a href="#" className={`font-medium ${currentView === 'myHome' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`} onClick={e => handleViewChange('myHome', e)}>
              My Home
            </a>
            <a href="#" className={`font-medium ${currentView === 'board' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`} onClick={e => handleViewChange('board', e)}>
              My Board
            </a>
            <a href="#" className={`font-medium ${currentView === 'calendar' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`} onClick={e => handleViewChange('calendar', e)}>
              Calendar
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile menu button */}
          <button className="md:hidden p-1 rounded-full hover:bg-gray-100" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          {/* Search input - only visible on board view */}
          {currentView === 'board' && <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>}
          {/* Filter button - only visible on board view */}
          {currentView === 'board' && <button className={`hidden md:flex p-1 rounded-full hover:bg-gray-100 items-center justify-center ${appliedFilters.length > 0 ? 'bg-blue-100 text-blue-600' : ''}`} onClick={toggleFilterModal} title="Filter Providers">
              <Filter className="w-5 h-5 text-gray-600" />
              {appliedFilters.length > 0 && <span className="absolute top-0 right-0 h-2 w-2 bg-blue-600 rounded-full"></span>}
            </button>}
          <button className="hidden sm:block p-1 rounded-full hover:bg-gray-100">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="hidden sm:block p-1 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center relative" ref={profileRef}>
            <button className="flex items-center focus:outline-none" onMouseDown={e => {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event from bubbling
            toggleProfileDropdown(e);
          }} aria-expanded={isProfileOpen} aria-haspopup="true">
              <img src="/image.png" alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
              <ChevronDown className={`w-4 h-4 text-gray-600 ml-1 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {/* User Profile Dropdown */}
            {isProfileOpen && <UserProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
          </div>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && <div className="md:hidden py-2 border-t border-gray-200">
          <nav className="flex flex-col space-y-2 px-4">
            <a href="#" className={`py-2 px-1 font-medium ${currentView === 'board' ? 'text-blue-600' : 'text-gray-600'}`} onClick={e => handleViewChange('board', e)}>
              My Board
            </a>
            <a href="#" className={`py-2 px-1 font-medium ${currentView === 'calendar' ? 'text-blue-600' : 'text-gray-600'}`} onClick={e => handleViewChange('calendar', e)}>
              Calendar
            </a>
            <a href="#" className={`py-2 px-1 font-medium ${currentView === 'myHome' ? 'text-blue-600' : 'text-gray-600'}`} onClick={e => handleViewChange('myHome', e)}>
              My Home
            </a>
            {/* Mobile search - only visible on board view */}
            {currentView === 'board' && <div className="pt-2 flex items-center">
                <input type="text" placeholder="Search..." className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <Search className="absolute left-6 w-4 h-4 text-gray-400" />
              </div>}
          </nav>
        </div>}
      {/* Provider Filter Modal */}
      {isFilterModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={toggleFilterModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">
                Filter by Provider Type
              </h2>
              <div className="space-y-2">
                {providerTypes.map(type => <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" value={type} checked={selectedProviderTypes.includes(type)} onChange={handleFilterChange} />
                    <span>{type}</span>
                  </label>)}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors" onClick={clearFilters}>
                  Clear
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onClick={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>}
    </header>;
};