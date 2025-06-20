import React, { createContext, useContext, useState, useEffect } from 'react';
// REMOVE/COMMENT OUT: import { mockUser, User } from '@/data/mockData';

// KEEP User interface or define it here if not elsewhere
export interface User {
  id: string; // Or number, depending on your backend User ID type
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // To store JWT token
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean; // Added for easier checking
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define your API base URL - move to .env file in a real app
const API_BASE_URL = '/api'; // Assuming a proxy or relative path

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true); // Initially true to check stored auth

  useEffect(() => {
    const attemptAutoLogin = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        // OPTIONAL: You might want to verify the token with the backend here
        // For example, by fetching user profile with the token
        // For simplicity, we're trusting the stored token and user for now.
        // In a real app, you'd likely have an endpoint like /api/auth/me to get current user
        // and validate the token simultaneously.
        try {
          // Example: verify token by fetching user profile
          // const response = await fetch(`${API_BASE_URL}/auth/me`, { // Assuming you create this endpoint
          //   headers: { 'Authorization': `Bearer ${savedToken}` }
          // });
          // if (!response.ok) throw new Error('Token validation failed');
          // const userData = await response.json();
          // setUser(userData);

          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (error) {
          console.error("Auto-login failed, clearing stale auth data:", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    attemptAutoLogin();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // You might want to parse error messages from backend if available
        // const errorData = await response.json();
        // console.error('Login failed:', errorData.message || response.statusText);
        setIsLoading(false);
        return false;
      }

      const data = await response.json(); // Expects { token: "...", user: { ... } }

      if (data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoading(false);
        return true;
      } else {
        console.error('Login response did not contain token or user data.');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }

    // REMOVE/COMMENT OUT FROM HERE
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // if (email === mockUser.email && password === 'password') {
    //   setUser(mockUser);
    //   localStorage.setItem('user', JSON.stringify(mockUser));
    //   setIsLoading(false);
    //   return true;
    // }
    // setIsLoading(false);
    // return false;
    // REMOVE/COMMENT OUT UNTIL HERE
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // const errorData = await response.json();
        // console.error('Registration failed:', errorData.message || response.statusText);
        setIsLoading(false);
        return false;
      }

      // Optionally, log the user in directly after registration or redirect to login
      // For now, just return true. The user might need to login separately.
      // Or, if your backend returns a token/user on successful registration:
      // const data = await response.json();
      // if (data.token && data.user) { // If backend logs in user upon registration
      //   setUser(data.user);
      //   setToken(data.token);
      //   localStorage.setItem('authToken', data.token);
      //   localStorage.setItem('user', JSON.stringify(data.user));
      // }
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }

    // REMOVE/COMMENT OUT FROM HERE
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // const newUser = { id: Date.now().toString(), name, email };
    // setUser(newUser);
    // localStorage.setItem('user', JSON.stringify(newUser));
    // setIsLoading(false);
    // return true;
    // REMOVE/COMMENT OUT UNTIL HERE
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Optionally, notify backend about logout if needed
  };

  const isAuthenticated = !!token && !!user; // Determine authentication status

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
