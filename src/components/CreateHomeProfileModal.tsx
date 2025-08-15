import React, { useState } from 'react';
import { X, Save, Home, AlertCircle } from 'lucide-react';
import { HomeProfileService } from '../src/services/homeProfileService';
import { HomeProfile } from '../src/types/api';

interface CreateHomeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: HomeProfile) => void;
  userId: number;
}

interface FormData {
  address: string;
  yearBuilt: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  lotSize: string;
}

interface FormErrors {
  address?: string;
  yearBuilt?: string;
  squareFootage?: string;
  bedrooms?: string;
  bathrooms?: string;
  lotSize?: string;
}

export const CreateHomeProfileModal: React.FC<CreateHomeProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const [formData, setFormData] = useState<FormData>({
    address: '',
    yearBuilt: new Date().getFullYear(),
    squareFootage: 0,
    bedrooms: 1,
    bathrooms: 1,
    lotSize: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear() + 1) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }

    if (formData.squareFootage <= 0) {
      newErrors.squareFootage = 'Square footage must be greater than 0';
    }

    if (formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }

    if (formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }

    if (!formData.lotSize.trim()) {
      newErrors.lotSize = 'Lot size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      const profileData = {
        address: formData.address,
        yearBuilt: formData.yearBuilt,
        squareFootage: formData.squareFootage,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        lotSize: formData.lotSize,
        userId: userId
      };

      const createdProfile = await HomeProfileService.createProfile(profileData);
      onSuccess(createdProfile);
      onClose();
      
      // Reset form
      setFormData({
        address: '',
        yearBuilt: new Date().getFullYear(),
        squareFootage: 0,
        bedrooms: 1,
        bathrooms: 1,
        lotSize: ''
      });
    } catch (error: any) {
      console.error('Failed to create home profile:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Failed to create home profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setErrors({});
      setSubmitError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Home className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Create Home Profile</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{submitError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, City, State 12345"
                disabled={isLoading}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Year Built and Square Footage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built *
                </label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.yearBuilt ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1800"
                  max={new Date().getFullYear() + 1}
                  disabled={isLoading}
                />
                {errors.yearBuilt && (
                  <p className="mt-1 text-sm text-red-600">{errors.yearBuilt}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage *
                </label>
                <input
                  type="number"
                  name="squareFootage"
                  value={formData.squareFootage}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.squareFootage ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                  placeholder="2500"
                  disabled={isLoading}
                />
                {errors.squareFootage && (
                  <p className="mt-1 text-sm text-red-600">{errors.squareFootage}</p>
                )}
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  disabled={isLoading}
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  step="0.5"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  disabled={isLoading}
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
                )}
              </div>
            </div>

            {/* Lot Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Size *
              </label>
              <input
                type="text"
                name="lotSize"
                value={formData.lotSize}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.lotSize ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.25 acres"
                disabled={isLoading}
              />
              {errors.lotSize && (
                <p className="mt-1 text-sm text-red-600">{errors.lotSize}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
