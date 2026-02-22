import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import PatientsPage from '@/pages/PatientsPage'
import PatientDetailPage from '@/pages/PatientDetailPage'
import PortalPage from '@/pages/PortalPage'
import SettingsPage from '@/pages/SettingsPage'
import { AppLayout } from '@/components/layout/AppLayout'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout><HomePage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/patients",
    element: <AppLayout><PatientsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/patients/:id",
    element: <AppLayout><PatientDetailPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portal",
    element: <AppLayout><PortalPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <AppLayout><SettingsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)