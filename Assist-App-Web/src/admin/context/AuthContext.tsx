
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface AuthContextProps {
  user: AdminUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Mock login function for now - would connect to Firebase Auth in production
  const login = (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@uplift.org' && password === 'admin123') {
        // Mock admin user
        const mockUser: AdminUser = {
          id: 'admin-1',
          email: 'admin@uplift.org',
          name: 'Admin User',
          role: 'admin'
        };
        
        setUser(mockUser);
        localStorage.setItem('admin_user', JSON.stringify(mockUser));
        navigate('/admin');
        toast({
          title: "Login successful",
          description: "Welcome to the Assist App admin dashboard.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
    toast({
      title: "Logged out successfully",
    });
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
