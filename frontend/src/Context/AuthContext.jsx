import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('Initializing Auth...');
      console.log('Stored Token:', storedToken);
      console.log('Stored User:', storedUser);

      if (storedToken && storedUser) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Try to fetch the profile using the stored token
          const response = await api.get('/api/users/profile');
          
          // If the request succeeds, update the user state
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          console.log('Authenticated User:', response.data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    isLoading,
    login: async (email, password) => {
      try {
        const response = await api.post('/api/users/login', { email, password });
        const { user: userData, token: authToken } = response.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        setToken(authToken);
        setUser(userData);

        console.log('Login Successful. User:', userData);
        return userData;
      } catch (error) {
        throw error;
      }
    },
    register: async (name, email, password) => {
      try {
        const response = await api.post('/api/users/register', { name, email, password });
        const { user: userData, token: authToken } = response.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        setToken(authToken);
        setUser(userData);

        console.log('Registration Successful. User:', userData);
        return userData;
      } catch (error) {
        throw error;
      }
    },
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
