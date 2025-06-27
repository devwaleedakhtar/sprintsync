import "./globals.css";
import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";
import Navigation from "./components/Navigation";
import axios from "axios";
import { signOut } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  // Add global Axios interceptor for auth errors
  if (typeof window !== "undefined") {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          signOut({ callbackUrl: "/signin" });
        }
        return Promise.reject(error);
      }
    );
  }

  return (
    <SessionProvider>
      <html lang="en">
        <body className="bg-gray-50 min-h-screen">
          <Navigation />
          <main>{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
}
