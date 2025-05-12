import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Admin interface
interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Admin context type
interface AdminContextType {
  admin: Admin | null;
  isLoading: boolean;
  isError: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export function AdminProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { language } = useI18n();
  const queryClient = useQueryClient();
  
  // Admin data query
  const { 
    data: admin,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch admin data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching admin data:', error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] });
      toast({
        title: language === 'vi' ? 'Đăng nhập thành công' : 'Login successful',
        description: language === 'vi' 
          ? 'Bạn đã đăng nhập vào hệ thống quản trị.' 
          : 'You have successfully logged in to the admin panel.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Logout failed');
      }
      
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] });
      queryClient.clear();
      toast({
        title: language === 'vi' ? 'Đăng xuất thành công' : 'Logout successful',
        description: language === 'vi' 
          ? 'Bạn đã đăng xuất khỏi hệ thống quản trị.' 
          : 'You have been logged out of the admin panel.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'vi' ? 'Đăng xuất thất bại' : 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };
  
  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  // Determine authentication status
  const isAuthenticated = !!admin;
  
  // Context value
  const value = {
    admin,
    isLoading,
    isError,
    login,
    logout,
    isAuthenticated,
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

// Hook to use admin context
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}