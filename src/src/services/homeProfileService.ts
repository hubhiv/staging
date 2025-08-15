import { homeApiClient } from './api';
import { HomeProfile, HomeProfileRequest } from '../types/api';

/**
 * Data transformation utilities for API ↔ Frontend conversion
 */
const transformToApiFormat = (data: any) => {
  return {
    address: data.address,
    year_built: data.yearBuilt || data.year_built,
    square_footage: data.squareFootage || data.square_footage,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    lot_size: data.lotSize || data.lot_size,
    user_id: data.userId || data.user_id,
    // Health scores (optional for create)
    health_scores_overall: data.healthScores?.overall || data.health_scores_overall || 0,
    health_scores_hvac: data.healthScores?.hvac || data.health_scores_hvac || 0,
    health_scores_plumbing: data.healthScores?.plumbing || data.health_scores_plumbing || 0,
    health_scores_electrical: data.healthScores?.electrical || data.health_scores_electrical || 0,
    health_scores_exterior: data.healthScores?.exterior || data.health_scores_exterior || 0,
    health_scores_security: data.healthScores?.security || data.health_scores_security || 0
  };
};

const transformFromApiFormat = (data: any): HomeProfile => {
  return {
    id: data.id?.toString(),
    user_id: data.user_id?.toString(),
    address: data.address,
    year_built: data.year_built,
    square_footage: data.square_footage,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    lot_size: data.lot_size,
    created_at: data.created_at,
    updated_at: data.updated_at,
    health_scores: {
      overall: data.health_scores_overall || 0,
      hvac: data.health_scores_hvac || 0,
      plumbing: data.health_scores_plumbing || 0,
      electrical: data.health_scores_electrical || 0,
      exterior: data.health_scores_exterior || 0,
      security: data.health_scores_security || 0
    }
  };
};

export const HomeProfileService = {
  /**
   * Get home profile by user ID
   */
  getHomeProfileById: async (userId: number): Promise<HomeProfile> => {
    const res = await homeApiClient.get<any[]>(`/home_profile?user_id=${userId}`);
    if (!res.data || res.data.length === 0) {
      throw new Error('No home profile found for this user');
    }

    // Filter client-side since API filtering doesn't work correctly
    const userProfile = res.data.find(profile => profile.user_id === userId);
    if (!userProfile) {
      throw new Error('No home profile found for this user');
    }

    return transformFromApiFormat(userProfile);
  },

  /**
   * Get home profile by profile ID
   */
  getHomeProfileByProfileId: async (profileId: number): Promise<HomeProfile> => {
    const res = await homeApiClient.get<any>(`/home_profile/${profileId}`);
    return transformFromApiFormat(res.data);
  },

  /**
   * Create new home profile
   */
  createProfile: async (data: HomeProfileRequest & { userId: number }): Promise<HomeProfile> => {
    const apiData = transformToApiFormat(data);
    const res = await homeApiClient.post<any>('/home_profile', apiData);
    return transformFromApiFormat(res.data);
  },

  /**
   * Update existing home profile
   */
  updateProfile: async (profileId: number, data: HomeProfileRequest): Promise<HomeProfile> => {
    const apiData = transformToApiFormat(data);
    const res = await homeApiClient.patch<any>(`/home_profile/${profileId}`, apiData);
    return transformFromApiFormat(res.data);
  },

  /**
   * Delete home profile
   */
  deleteProfile: async (profileId: number): Promise<void> => {
    await homeApiClient.delete(`/home_profile/${profileId}`);
  }
};

export default HomeProfileService;

