
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, Credentials } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

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
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Supabase session found:", session.user);
          setState({ 
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.name || '',
              profile: session.user.user_metadata
            }, 
            isLoading: false, 
            error: null 
          });
          return;
        }
        
        // Fallback to localStorage if no Supabase session
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          console.log("Local storage session found");
          const user = JSON.parse(storedUser);
          setState({ user, isLoading: false, error: null });
        } else {
          console.log("No session found");
          setState({ user: null, isLoading: false, error: null });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setState({ user: null, isLoading: false, error: 'Failed to restore session' });
      }
    };

    checkAuth();
    
    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (session?.user) {
          setState({ 
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.name || '',
              profile: session.user.user_metadata
            }, 
            isLoading: false, 
            error: null 
          });
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, isLoading: false, error: null });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: Credentials): Promise<User | null> => {
    setState({ ...state, isLoading: true });
    
    try {
      console.log("Attempting login with:", credentials.email);
      
      // Try to log in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password || 'defaultpassword123', // fallback for demo
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        
        // Fallback to local storage for development/demo
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.email === credentials.email);
        
        if (user) {
          console.log("Fallback to local storage login");
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
      }
      
      // Successful Supabase login
      if (data.user) {
        console.log("Supabase login successful");
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata.name || '',
          profile: data.user.user_metadata
        };
        
        localStorage.setItem('current_user', JSON.stringify(userData));
        setState({ user: userData, isLoading: false, error: null });
        return userData;
      }
      
      setState({ user: null, isLoading: false, error: 'Login failed' });
      return null;
    } catch (error) {
      console.error("Login error:", error);
      setState({ user: null, isLoading: false, error: 'Login failed' });
      return null;
    }
  };

  const signup = async (credentials: Credentials & { name?: string }): Promise<User | null> => {
    setState({ ...state, isLoading: true });
    
    try {
      console.log("Attempting signup with:", credentials.email);
      
      // Try to sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password || 'defaultpassword123', // fallback for demo
        options: {
          data: {
            name: credentials.name,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      });
      
      if (error) {
        console.error("Supabase signup error:", error);
        
        // Fallback to local storage for development/demo
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: any) => u.email === credentials.email);
        
        if (existingUser) {
          setState({ user: null, isLoading: false, error: 'Email already in use' });
          return null;
        }
        
        const newUser = {
          id: uuidv4(),
          email: credentials.email,
          password: credentials.password || 'defaultpassword123',
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
      }
      
      // Successful Supabase signup
      if (data.user) {
        console.log("Supabase signup successful");
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: credentials.name || '',
          profile: {
            name: credentials.name,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
        
        localStorage.setItem('current_user', JSON.stringify(userData));
        setState({ user: userData, isLoading: false, error: null });
        return userData;
      }
      
      setState({ user: null, isLoading: false, error: 'Signup failed' });
      return null;
    } catch (error) {
      console.error("Signup error:", error);
      setState({ user: null, isLoading: false, error: 'Signup failed' });
      return null;
    }
  };

  const logout = async () => {
    // Logout from Supabase
    await supabase.auth.signOut();
    // Clear local storage
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
    
    // Update in users array (for local storage fallback)
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
