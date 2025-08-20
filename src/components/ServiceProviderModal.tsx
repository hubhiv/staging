import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';

// Local ServiceProvider interface to match the component's expectations
interface ServiceProvider {
  id: string | number;
  name: string;
  type: string;
  category?: string;
  phone: string;
  email?: string;
  address?: string;
  rating: number;
  notes?: string;
  lastService?: string;
  last_service?: string;
  user_id?: number;
  created_at?: number;
}

interface ServiceProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: ServiceProvider | null;
  onSave: (providerData: ServiceProviderFormData) => Promise<void>;
}

export interface ServiceProviderFormData {
  name: string;
  type: string;
  phone: string;
  last_service?: string;
  rating?: number;
}

const SERVICE_TYPES = [
  'HVAC',
  'Plumbing', 
  'Electrical',
  'Landscaping',
  'Cleaning',
  'Carpentry',
  'Painting',
  'Roofing',
  'General Contractor',
  'Other'
];

export const ServiceProviderModal: React.FC<ServiceProviderModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSave
}) => {
  const [formData, setFormData] = useState<ServiceProviderFormData>({
    name: '',
    type: '',
    phone: '',
    last_service: '',
    rating: undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or provider changes
  useEffect(() => {
    if (isOpen) {
      if (provider) {
        // Edit mode - populate with existing provider data
        setFormData({
          name: provider.name,
          type: provider.type,
          phone: provider.phone,
          last_service: provider.last_service || '',
          rating: provider.rating || undefined
        });
      } else {
        // Create mode - reset to empty form
        setFormData({
          name: '',
          type: '',
          phone: '',
          last_service: '',
          rating: undefined
        });
      }
      setErrors({});
    }
  }, [isOpen, provider]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Service type is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone validation
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Optional rating validation
    if (formData.rating !== undefined && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save provider:', error);
      setErrors({ submit: 'Failed to save provider. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ServiceProviderFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Wrench className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {provider ? 'Edit Service Provider' : 'Add Service Provider'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Provider Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Austin HVAC Pros"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Service Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select service type</option>
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Last Service Date */}
          <div>
            <label htmlFor="last_service" className="block text-sm font-medium text-gray-700 mb-1">
              Last Service Date
            </label>
            <input
              type="date"
              id="last_service"
              value={formData.last_service}
              onChange={(e) => handleInputChange('last_service', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Rating (1-5)
            </label>
            <select
              id="rating"
              value={formData.rating || ''}
              onChange={(e) => handleInputChange('rating', e.target.value ? parseInt(e.target.value) : undefined)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rating ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">No rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            {errors.rating && <p className="text-red-600 text-sm mt-1">{errors.rating}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (provider ? 'Update Provider' : 'Add Provider')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
