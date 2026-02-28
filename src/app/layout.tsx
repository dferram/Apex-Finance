import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApexProvider } from "@/context/ApexContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Apex Finance | Intelligence Platform",
  description: "Dual-mode financial intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-workspace/30 selection:text-workspace`}>
        <ApexProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-muted/20">
                <div className="container p-6 pb-24 mx-auto max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ApexProvider>
      </body>
    </html>
  );
}
