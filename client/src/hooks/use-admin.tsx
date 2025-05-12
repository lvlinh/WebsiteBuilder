import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AdminContextType {
  admin: Admin | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const { 
    data: admin, 
    isLoading,
    error 
  } = useQuery<Admin | null>({
    queryKey: ['/api/admin/me'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const loginMutation = useMutation<Admin, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/admin/me'], data);
      toast({
        title: t('Đăng nhập thành công', 'Login Successful'),
        description: t(
          `Chào mừng ${data.name} quay trở lại.`,
          `Welcome back, ${data.name}.`
        ),
      });
    },
    onError: (error) => {
      toast({
        title: t('Đăng nhập thất bại', 'Login Failed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/admin/me'], null);
      toast({
        title: t('Đăng xuất thành công', 'Logged Out'),
        description: t(
          'Bạn đã đăng xuất khỏi hệ thống.',
          'You have been logged out of the system.'
        ),
      });
    },
    onError: (error) => {
      toast({
        title: t('Đăng xuất thất bại', 'Logout Failed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AdminContext.Provider
      value={{
        admin: admin ?? null,
        isLoading,
        error: error as Error | null,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}