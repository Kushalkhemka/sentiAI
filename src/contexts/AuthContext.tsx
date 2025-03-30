
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, Credentials } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType extends AuthState {
  login: (credentials: Credentials) => Promise<User | null>;
  signup: (credentials: Credentials & { name?: string }) => Promise<User | null>;
  logout: () => void;
  updateUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({ user, isLoading: false, error: null });
        } else {
          setState({ user: null, isLoading: false, error: null });
        }
      } catch (error) {
        setState({ user: null, isLoading: false, error: 'Failed to restore session' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: Credentials): Promise<User | null> => {
    setState({ ...state, isLoading: true });
    
    try {
      // In a real app, you'd validate with a backend
      // For demo purposes, we'll check local storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === credentials.email);
      
      if (user && user.password === credentials.password) {
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile
        };
        
        localStorage.setItem('current_user', JSON.stringify(userData));
        setState({ user: userData, isLoading: false, error: null });
        return userData;
      } else {
        setState({ user: null, isLoading: false, error: 'Invalid email or password' });
        return null;
      }
    } catch (error) {
      setState({ user: null, isLoading: false, error: 'Login failed' });
      return null;
    }
  };

  const signup = async (credentials: Credentials & { name?: string }): Promise<User | null> => {
    setState({ ...state, isLoading: true });
    
    try {
      // In a real app, you'd create a user in your backend
      // For demo purposes, we'll use local storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email === credentials.email);
      
      if (existingUser) {
        setState({ user: null, isLoading: false, error: 'Email already in use' });
        return null;
      }
      
      const newUser = {
        id: uuidv4(),
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        profile: {
          name: credentials.name,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profile: newUser.profile
      };
      
      localStorage.setItem('current_user', JSON.stringify(userData));
      setState({ user: userData, isLoading: false, error: null });
      return userData;
    } catch (error) {
      setState({ user: null, isLoading: false, error: 'Signup failed' });
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    setState({ user: null, isLoading: false, error: null });
  };

  const updateUserProfile = (profile: any) => {
    if (!state.user) return;
    
    const updatedUser = {
      ...state.user,
      profile: { ...state.user.profile, ...profile }
    };
    
    // Update in local storage
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    
    if (userIndex >= 0) {
      users[userIndex] = {
        ...users[userIndex],
        profile: { ...users[userIndex].profile, ...profile }
      };
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    setState({ ...state, user: updatedUser });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
