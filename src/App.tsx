import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router'
import { AppShell } from '@/components/layout'
import { Spinner } from '@/components/ui/surface'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/context'
import { useProfile } from '@/features/data'
import { isSupabaseConfigured } from '@/lib/supabase'
import { HomePage } from '@/routes/HomePage'
import { LoginPage } from '@/routes/LoginPage'
import { NotFoundPage, SetupPage } from '@/routes/misc'
import { OnboardingPage } from '@/routes/OnboardingPage'
import { TrainingPage } from '@/routes/TrainingPage'

// Telas fora do Início carregam sob demanda (o Recharts, por exemplo, só vem com a progressão).
// O <Suspense> fica no AppShell, em volta do <Outlet />.
const ExercisePage = lazy(() => import('@/routes/ExercisePage').then((m) => ({ default: m.ExercisePage })))
const WorkoutEditPage = lazy(() => import('@/routes/WorkoutEditPage').then((m) => ({ default: m.WorkoutEditPage })))
const CardioPage = lazy(() => import('@/routes/CardioPage').then((m) => ({ default: m.CardioPage })))
const NutritionDayPage = lazy(() => import('@/routes/NutritionDayPage').then((m) => ({ default: m.NutritionDayPage })))
const DietsPage = lazy(() => import('@/routes/DietsPage').then((m) => ({ default: m.DietsPage })))
const DietEditPage = lazy(() => import('@/routes/DietEditPage').then((m) => ({ default: m.DietEditPage })))
const PantheonPage = lazy(() => import('@/routes/PantheonPage').then((m) => ({ default: m.PantheonPage })))
const ProfilePage = lazy(() => import('@/routes/ProfilePage').then((m) => ({ default: m.ProfilePage })))

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
              { path: 'treino/exercicios/:id', element: <ExercisePage /> },
              { path: 'treino/panteao', element: <PantheonPage /> },
              { path: 'cardio', element: <CardioPage /> },
              { path: 'alimentacao', element: <NutritionDayPage /> },
              { path: 'alimentacao/dietas', element: <DietsPage /> },
              { path: 'alimentacao/dietas/:id', element: <DietEditPage /> },
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
