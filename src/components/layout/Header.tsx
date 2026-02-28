"use client";

import { useApex } from "@/context/ApexContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Hexagon, LogOut, Bell } from "lucide-react";

export function Header() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useApex();

  const handleToggle = (checked: boolean) => {
    // True = Professional (xCore), False = Personal
    const nextWorkspace = workspaces.find(w => w.is_professional === checked);
    if (nextWorkspace) {
      setActiveWorkspace(nextWorkspace);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors-all">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight mr-8">
          <Hexagon className="h-6 w-6 text-workspace" strokeWidth={2.5} />
          <span>Apex Finance</span>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-4 bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
            <Label 
              htmlFor="workspace-mode" 
              className={`text-sm cursor-pointer transition-colors ${!activeWorkspace.is_professional ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              Personal
            </Label>
            <Switch
              id="workspace-mode"
              checked={activeWorkspace.is_professional}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-emerald-600 dark:data-[state=unchecked]:bg-emerald-500"
            />
            <Label 
              htmlFor="workspace-mode" 
              className={`text-sm cursor-pointer transition-colors ${activeWorkspace.is_professional ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              xCore
            </Label>
          </div>
          
          <nav className="flex items-center space-x-4 ml-6 pl-6 border-l border-border">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-workspace/20 border border-workspace/30 flex items-center justify-center">
              <span className="text-xs font-bold text-workspace">DF</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
