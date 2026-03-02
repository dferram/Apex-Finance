"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsCRUD } from "@/components/admin/TransactionsCRUD";
import { CategoriesCRUD } from "@/components/admin/CategoriesCRUD";
import { GoalsCRUD } from "@/components/admin/GoalsCRUD";
import { WorkspacesCRUD } from "@/components/admin/WorkspacesCRUD";
import { Settings, Receipt, Boxes, Target, LayoutGrid } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-workspace" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestiona todos los datos del sistema: transacciones, categorías, metas y workspaces.
        </p>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Workspaces</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="glass-panel rounded-xl border border-workspace/10 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-workspace" />
              Transacciones
            </h2>
            <TransactionsCRUD />
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="glass-panel rounded-xl border border-workspace/10 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Boxes className="h-5 w-5 text-workspace" />
              Categorías
            </h2>
            <CategoriesCRUD />
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="glass-panel rounded-xl border border-workspace/10 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-workspace" />
              Metas Financieras
            </h2>
            <GoalsCRUD />
          </div>
        </TabsContent>

        <TabsContent value="workspaces">
          <div className="glass-panel rounded-xl border border-workspace/10 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-workspace" />
              Workspaces
            </h2>
            <WorkspacesCRUD />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
