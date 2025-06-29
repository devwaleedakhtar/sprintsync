import "./globals.css";
import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";
import Navigation from "./components/Navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
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
