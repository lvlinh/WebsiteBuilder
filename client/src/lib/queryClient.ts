// This is a temporary implementation until we fully implement the query client

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// A basic API request function with proper error handling
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: unknown
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If parsing JSON fails, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    const error = new Error(errorMessage);
    throw error;
  }

  return response;
}

// Helper function to create query functions
export function getQueryFn({ on401 = 'throw' }: { on401?: 'throw' | 'returnNull' } = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const endpoint = queryKey[0];
      const response = await apiRequest('GET', endpoint);
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      if (on401 === 'returnNull' && error instanceof Response && error.status === 401) {
        return null;
      }
      throw error;
    }
  };
}