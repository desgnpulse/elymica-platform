'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ApiProvider } from './api-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <ApiProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ApiProvider>
    </SessionProvider>
  );
}
