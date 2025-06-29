import "./globals.css";
import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";
import Navigation from "./components/Navigation";

export const metadata = {
  title: "SprintSync – Sprint Planning & Daily Reporting",
  description:
    "SprintSync streamlines sprint planning, task management, and daily reporting for modern development teams.",
  openGraph: {
    title: "SprintSync – Sprint Planning & Daily Reporting",
    description:
      "SprintSync streamlines sprint planning, task management, and daily reporting for modern development teams.",
    url: "https://sprintsync.example.com/",
    siteName: "SprintSync",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SprintSync – Sprint Planning & Daily Reporting",
    description:
      "SprintSync streamlines sprint planning, task management, and daily reporting for modern development teams.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <html lang="en">
        <head />
        <body className="bg-gray-50 min-h-screen">
          <Navigation />
          <main>{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
}
