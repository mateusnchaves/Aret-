import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router'
import { AppShell } from '@/components/layout'
import { Spinner } from '@/components/ui/surface'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/context'
import { useProfile } from '@/features/data'
import { isSupabaseConfigured } from '@/lib/supabase'
import { HomePage } from '@/routes/HomePage'
import { LoginPage } from '@/routes/LoginPage'
import { ComingSoonPage, NotFoundPage, SetupPage } from '@/routes/misc'
import { OnboardingPage } from '@/routes/OnboardingPage'
import { ProfilePage } from '@/routes/ProfilePage'
import { TrainingPage } from '@/routes/TrainingPage'
import { WorkoutEditPage } from '@/routes/WorkoutEditPage'

// A tela de progressão carrega o Recharts: fica num chunk separado.
const ExercisePage = lazy(() => import('@/routes/ExercisePage').then((m) => ({ default: m.ExercisePage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
  },
})

function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Cardio e alimentação dependem do perfil completo: sem onboarding, nada de app. */
function RequireOnboarding() {
  const profile = useProfile()
  if (profile.isPending) return <Spinner />
  if (profile.data && !profile.data.onboarded_at) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        element: <RequireOnboarding />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'treino', element: <TrainingPage /> },
              { path: 'treino/fichas/nova', element: <WorkoutEditPage /> },
              { path: 'treino/fichas/:id', element: <WorkoutEditPage /> },
              {
                path: 'treino/exercicios/:id',
                element: (
                  <Suspense fallback={<Spinner />}>
                    <ExercisePage />
                  </Suspense>
                ),
              },
              {
                path: 'cardio',
                element: (
                  <ComingSoonPage title="Cardio" phase={2}>
                    Registro de cardio com cálculo de calorias e meta semanal.
                  </ComingSoonPage>
                ),
              },
              {
                path: 'alimentacao',
                element: (
                  <ComingSoonPage title="Alimentação" phase={3}>
                    Dietas, diário de refeições e macros com a tabela TACO.
                  </ComingSoonPage>
                ),
              },
              { path: 'perfil', element: <ProfilePage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export default function App() {
  if (!isSupabaseConfigured) return <SetupPage />
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
