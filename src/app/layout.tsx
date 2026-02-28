import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApexProvider } from "@/context/ApexContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

import { getWorkspaces, getTransactions, getApexStats, getCategories, getFinancialGoals } from "@/app/actions";
import { type TransactionWithCategory, type Category, type GoalWithNumbers } from "@/lib/schema";

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
  const activeWorkspace = workspaces.length > 0 ? workspaces[0] : null;
  const goals: GoalWithNumbers[] = await getFinancialGoals(1); // Mock user ID 1

  let transactions: TransactionWithCategory[] = [];
  let categories: Category[] = [];
  let stats = { totalBalance: 0, weeklyExpense: 0, totalIncome: 0, totalExpense: 0 };

  if (activeWorkspace) {
    [transactions, categories, stats] = await Promise.all([
      getTransactions(activeWorkspace.id),
      getCategories(activeWorkspace.id),
      getApexStats(activeWorkspace.id)
    ]);
  }

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-workspace/30 selection:text-workspace`}>
        <ApexProvider 
          initialWorkspaces={workspaces}
          initialActiveWorkspace={activeWorkspace}
          initialTransactions={transactions}
          initialCategories={categories}
          initialStats={stats}
          initialGoals={goals}

        >
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
