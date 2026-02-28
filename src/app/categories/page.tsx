"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TreeView } from "@/components/ui/TreeView";
import { CategoryDialog } from "@/components/transactions/CategoryDialog";
import { useMemo } from "react";
import { Boxes, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryNode } from "@/app/actions";

interface TreeItem extends CategoryNode {
  amount: number;
  budget: number;
  children: TreeItem[];
}

export default function CategoriesPage() {
  const { activeWorkspace, categoriesHierarchical, categoriesHierarchicalTotals } = useApex();

  const treeData = useMemo(() => {
    const map: Record<number, TreeItem> = {};
    const roots: TreeItem[] = [];
    
    categoriesHierarchical.forEach(c => {
      map[c.id] = { 
        ...c, 
        amount: Number(categoriesHierarchicalTotals.find(t => t.category_id === c.id)?.total_amount || 0),
        budget: Number(c.monthly_budget || 0),
        children: [] 
      };
    });
    
    categoriesHierarchical.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    
    return roots;
  }, [categoriesHierarchical, categoriesHierarchicalTotals]);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Por favor, selecciona un workspace para gestionar categorías.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Boxes className="h-8 w-8 text-workspace" />
            Gestión de Categorías
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configura y organiza tu estructura financiera jerárquica.
          </p>
        </div>
        
        <CategoryDialog>
          <Button className="bg-workspace text-white hover:bg-workspace/90 shadow-lg shadow-workspace/20 h-11 px-6">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Categoría Raíz
          </Button>
        </CategoryDialog>
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel border-workspace/10">
          <CardHeader className="border-b border-border/50 pb-6">
             <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-xl flex items-center gap-2">
                     <Target className="h-5 w-5 text-workspace" />
                     Arquitectura de Gastos
                   </CardTitle>
                   <CardDescription className="mt-1">
                     Visualización en tiempo real de cómo se agregan tus gastos a través de la jerarquía.
                   </CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="pt-8">
             <div className="bg-muted/10 rounded-2xl p-8 border border-border/50 shadow-inner">
               {treeData.length > 0 ? (
                 <TreeView 
                   data={treeData} 
                   expandedIds={treeData.map(r => r.id)} 
                   renderActions={(item) => (
                     <CategoryDialog initialParentId={item.id}>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="p-1 hover:bg-workspace/20 rounded text-workspace transition-colors"
                          title="Agregar sub-categoría"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                     </CategoryDialog>
                   )}
                 />
               ) : (
                 <div className="py-20 text-center flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-workspace/10 flex items-center justify-center">
                     <Boxes className="h-8 w-8 text-workspace/40" />
                   </div>
                   <div className="max-w-xs">
                     <p className="text-muted-foreground font-medium">No hay categorías configuradas.</p>
                     <p className="text-xs text-muted-foreground/60 mt-1">
                       Comienza creando tu primera categoría para organizar tus transacciones y proyectos.
                     </p>
                   </div>
                   <CategoryDialog>
                     <Button variant="outline" className="mt-4 border-workspace/30 text-workspace">
                       Crear Categoría
                     </Button>
                   </CategoryDialog>
                 </div>
               )}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 flex flex-col gap-1">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Categorías</span>
                   <span className="text-2xl font-bold">{categoriesHierarchical.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 flex flex-col gap-1">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proyectos Activos</span>
                   <span className="text-2xl font-bold">{categoriesHierarchical.filter(c => c.is_project).length}</span>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 flex flex-col gap-1">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nivel Máximo</span>
                   <span className="text-2xl font-bold">{Math.max(0, ...categoriesHierarchical.map(c => c.level))}</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
