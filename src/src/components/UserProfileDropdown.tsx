import React, { useEffect } from 'react';
import { LogOut, User, Settings, Edit, Plus, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
interface UserProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}
export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  isOpen,
  onClose
}) => {
  const {
    user,
    logout,
    isLoading
  } = useAuth();
  if (!isOpen || !user) return null;
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('.user-profile-dropdown')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return <div className="user-profile-dropdown absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      {/* User info section */}
      <div className="flex flex-col items-center p-6 border-b border-gray-100">
        <div className="relative mb-3">
          <img src={user.avatar || 'https://via.placeholder.com/80'} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
          <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full">
            <Edit className="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <div className="bg-blue-50 text-blue-600 text-xs px-4 py-1 rounded-full mt-2">
          {user.email}
        </div>
      </div>
      {/* Menu items */}
      <div className="py-2">
        <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
          <Edit className="w-5 h-5 text-blue-600 mr-3" />
          <span>Edit Profile</span>
          <span className="ml-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
          <Plus className="w-5 h-5 text-blue-600 mr-3" />
          <span>Add Pin</span>
          <span className="ml-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5 text-blue-600 mr-3" />
          <span>Settings</span>
          <span className="ml-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5 text-blue-600 mr-3" />
          <span>Invite a friend</span>
          <span className="ml-auto text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
      {/* Logout */}
      <div className="border-t border-gray-100 py-2">
        <button className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-70" onClick={handleLogout} disabled={isLoading}>
          <LogOut className="w-5 h-5 mr-3" />
          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>;
};