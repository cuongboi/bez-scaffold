import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"

import { GuestOnly, RequireAuth } from "@/components/auth-guard"
import { AuthLayout } from "@/pages/auth/auth-layout"
import { ForgotPasswordPage } from "@/pages/auth/forgot-password"
import { ResetPasswordPage } from "@/pages/auth/reset-password"
import { SignInPage } from "@/pages/auth/sign-in"
import { SignUpPage } from "@/pages/auth/sign-up"
import { HomePage } from "@/pages/home"

/** nuqs reads/writes the URL through the router, so it must sit inside it. */
function RootLayout() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <RequireAuth />,
        children: [{ index: true, element: <HomePage /> }],
      },
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "sign-in", element: <SignInPage /> },
              { path: "sign-up", element: <SignUpPage /> },
              { path: "forgot-password", element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },
      // Reachable whether or not a session exists (the link comes from an email).
      {
        element: <AuthLayout />,
        children: [{ path: "reset-password", element: <ResetPasswordPage /> }],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
