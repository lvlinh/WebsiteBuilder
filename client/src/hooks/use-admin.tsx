import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, queryClient, apiRequest } from '@/lib/queryClient';

interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminContextValue {
  admin: Admin | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  admin: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  const {
    data: admin,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  useEffect(() => {
    if (fetchError) {
      setError(fetchError as Error);
    }
  }, [fetchError]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiRequest('POST', '/api/admin/login', { email, password });
      const userData = await response.json();
      queryClient.setQueryData(['/api/admin/me'], userData);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await apiRequest('POST', '/api/admin/logout');
      queryClient.setQueryData(['/api/admin/me'], null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin: admin || null,
        isLoading,
        error,
        login,
        logout,
        isAdmin: !!admin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);