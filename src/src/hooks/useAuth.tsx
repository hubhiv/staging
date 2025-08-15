import React, { useEffect, useState, createContext, useContext } from 'react';
import { parseApiError } from '../services/api';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types/api';
// Use the UserProfile interface from API types to match Xano structure
type User = UserProfile;
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    // Check if user is already authenticated on app startup
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          // Verify token is valid by getting user profile
          const userProfile = await AuthService.getUser();
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          // No token found, user is not authenticated
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // Token is invalid or expired, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        setUser(null);
        const apiError = parseApiError(err);
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the real Xano login API
      const authResponse = await AuthService.login({
        email,
        password
      });

      // Store the authToken in localStorage
      localStorage.setItem('authToken', authResponse.authToken);
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);

      // Get user profile after successful login
      const userProfile = await AuthService.getUser();
      setUser(userProfile);

    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the real Xano registration API
      const authResponse = await AuthService.register({
        name,
        email,
        password
      });

      // Store the authToken in localStorage
      localStorage.setItem('authToken', authResponse.authToken);
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);

      // Get user profile after successful registration
      const userProfile = await AuthService.getUser();
      setUser(userProfile);

    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Logout function
  const logout = async () => {
    try {
      // Call the auth service logout (client-side only for Xano)
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      setUser(null);
      setError(null);

      // Force a page reload to ensure clean state
      window.location.reload();
    }
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};