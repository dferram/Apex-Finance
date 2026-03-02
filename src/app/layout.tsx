import type { Metadata } from "next";
import "./globals.css";
import { ApexProvider } from "@/context/ApexContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppLoadingSkeleton } from "@/components/layout/AppLoadingSkeleton";

import { getWorkspaces } from "@/app/actions";

export const metadata: Metadata = {
  title: "Apex Finance | Intelligence Platform",
  description: "Dual-mode financial intelligence platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const workspaces = await getWorkspaces();

  return (
    <html lang="en" className="dark">
      <body className={`min-h-screen bg-background antialiased selection:bg-workspace/30 selection:text-workspace font-sans`}>
        <ApexProvider 
          initialWorkspaces={workspaces}
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-muted/20">
                <div className="container p-6 pb-24 mx-auto max-w-7xl">
                  <AppLoadingSkeleton>
                    {children}
                  </AppLoadingSkeleton>
                </div>
              </main>
            </div>
          </div>
        </ApexProvider>
      </body>
    </html>
  );
}
