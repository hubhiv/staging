import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Facebook } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginRequest } from '../../types/api';
interface LoginModalProps {
  onClose: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}
export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onRegisterClick,
  onForgotPasswordClick
}) => {
  const {
    login,
    isLoading,
    error: authError
  } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    if (name === 'remember_me') {
      setRememberMe(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user starts typing
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await login(formData.email, formData.password);
        onClose();
      } catch (err) {
        setErrors({
          general: 'Login failed. Please check your credentials and try again.'
        });
      }
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-in fade-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-1">Log in to your HubHiv account</p>
          </div>
          {/* Display error message */}
          {(errors.general || authError) && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{errors.general || authError}</p>
            </div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`} placeholder="you@example.com" disabled={isLoading} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button type="button" onClick={onForgotPasswordClick} className="text-sm font-medium text-blue-600 hover:text-blue-500" disabled={isLoading}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`} placeholder="••••••••" disabled={isLoading} />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>}
            </div>
            <div className="flex items-center">
              <input id="remember_me" name="remember_me" type="checkbox" checked={rememberMe} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" disabled={isLoading} />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
                <svg className="h-5 w-5 text-[#4285F4]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span className="ml-2">Google</span>
              </button>
              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button type="button" onClick={onRegisterClick} className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>;
};