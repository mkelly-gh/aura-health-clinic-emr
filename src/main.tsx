import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React from 'react'
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
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "patients",
        element: <PatientsPage />
      },
      {
        path: "patients/:id",
        element: <PatientDetailPage />
      },
      {
        path: "portal",
        element: <PortalPage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      }
    ]
  }
]);
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </QueryClientProvider>
)