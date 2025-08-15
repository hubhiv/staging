import React, { useState } from 'react';
import { X, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
interface PasswordResetModalProps {
  onClose: () => void;
  onBackToLoginClick: () => void;
}
export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  onClose,
  onBackToLoginClick
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement password reset logic
      console.log('Password reset for:', email);
      // For demo purposes, simulate a successful submission
      setIsSubmitted(true);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-in fade-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          {!isSubmitted ? <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reset your password
                </h2>
                <p className="text-gray-600 mt-1">
                  Enter your email address and we'll send you instructions to
                  reset your password
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="email" name="email" type="email" value={email} onChange={handleChange} className={`block w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`} placeholder="you@example.com" />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </p>}
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Send reset instructions
                </button>
              </form>
              <div className="mt-6 text-center">
                <button type="button" onClick={onBackToLoginClick} className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 text-sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </button>
              </div>
            </> : <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to{' '}
                <span className="font-medium">{email}</span>
              </p>
              <button type="button" onClick={onBackToLoginClick} className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </button>
            </div>}
        </div>
      </div>
    </div>;
};