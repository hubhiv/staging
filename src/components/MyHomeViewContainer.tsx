import React, { useState, useEffect } from 'react';
import { MyHomeViewClean as MyHomeView } from './MyHomeViewClean';
import { CreateHomeProfileModal } from './CreateHomeProfileModal';
import { HomeProfileService } from '../src/services/homeProfileService';
import { HomeProfile } from '../src/types/api';
import { useAuth } from '../src/hooks/useAuth';
import { AlertCircle, Home } from 'lucide-react';

/**
 * Container component that handles data loading and state management for MyHomeView
 * This component integrates with the API and manages the home profile lifecycle
 */
export const MyHomeViewContainer: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id ?? 2; // fallback demo id

  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // Load home profile on component mount
  useEffect(() => {
    loadHomeProfile();
  }, [userId]);

  const loadHomeProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const profile = await HomeProfileService.getHomeProfileById(Number(userId));
      setHomeProfile(profile);
      setShowCreateProfile(false);
    } catch (err: any) {
      console.log('No home profile found for user:', userId);
      // No profile exists - show create modal
      setHomeProfile(null);
      setShowCreateProfile(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful profile creation
  const handleProfileCreated = (profile: HomeProfile) => {
    setHomeProfile(profile);
    setShowCreateProfile(false);
  };

  // Handle profile updates
  const handleProfileUpdate = (profile: HomeProfile | null) => {
    if (profile === null) {
      // Profile was deleted - show create profile flow
      setHomeProfile(null);
      setShowCreateProfile(true);
    } else {
      // Profile was updated
      setHomeProfile(profile);
    }
  };

  // Handle create profile modal close
  const handleCreateProfileClose = () => {
    // Only allow closing if we have a profile, otherwise user must create one
    if (homeProfile) {
      setShowCreateProfile(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your home profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadHomeProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No profile state - show create modal
  if (!homeProfile && showCreateProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Home className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Your Home Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Let's start by creating your home profile. This will help us provide personalized maintenance recommendations and track your home's health.
          </p>
          <CreateHomeProfileModal
            isOpen={showCreateProfile}
            onClose={handleCreateProfileClose}
            onSuccess={handleProfileCreated}
            userId={Number(userId)}
          />
        </div>
      </div>
    );
  }

  // Main view with profile data
  return (
    <>
      <MyHomeView
        userId={Number(userId)}
        homeProfile={homeProfile}
        onProfileUpdate={handleProfileUpdate}
      />
      
      {/* Create Profile Modal (for manual trigger) */}
      <CreateHomeProfileModal
        isOpen={showCreateProfile}
        onClose={handleCreateProfileClose}
        onSuccess={handleProfileCreated}
        userId={Number(userId)}
      />
    </>
  );
};
