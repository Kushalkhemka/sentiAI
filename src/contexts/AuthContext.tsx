
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, UserProfile } from '@/types/chat';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  signup: (userData: { email: string; password: string; name?: string }) => Promise<User | null>;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock authentication - in a real app this would call a backend API
      // For demo purposes, we'll accept any valid email
      if (!credentials.email || !credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Create or retrieve user profile
      let storedUserProfile = localStorage.getItem(`user_profile_${credentials.email}`);
      let userProfile: UserProfile;
      
      if (storedUserProfile) {
        userProfile = JSON.parse(storedUserProfile) as UserProfile;
      } else {
        userProfile = {
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localStorage.setItem(`user_profile_${credentials.email}`, JSON.stringify(userProfile));
      }
      
      // Create user object
      const loggedInUser: User = {
        id: uuidv4(),
        email: credentials.email,
        profile: userProfile
      };
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      
      return loggedInUser;
    } catch (e: any) {
      setError(e.message || 'Login failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { email: string; password: string; name?: string }): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock signup - in a real app this would call a backend API
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Create user profile
      const userProfile: UserProfile = {
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store profile
      localStorage.setItem(`user_profile_${userData.email}`, JSON.stringify(userProfile));
      
      // Create user object
      const newUser: User = {
        id: uuidv4(),
        email: userData.email,
        name: userData.name,
        profile: userProfile
      };
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return newUser;
    } catch (e: any) {
      setError(e.message || 'Signup failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  const updateUserProfile = (profile: UserProfile) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      profile: {
        ...profile,
        updatedAt: new Date()
      }
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem(`user_profile_${user.email}`, JSON.stringify(updatedUser.profile));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        signup,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
