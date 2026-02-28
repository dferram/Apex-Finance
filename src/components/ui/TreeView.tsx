"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeItemProps {
  id: number;
  name: string;
  isProject?: boolean;
  amount?: number;
  budget?: number;
  level: number;
  children?: TreeItemProps[];
}

export function TreeView({ data, expandedIds = [], renderActions }: { data: TreeItemProps[], expandedIds?: number[], renderActions?: (item: TreeItemProps) => React.ReactNode }) {
  return (
    <div className="space-y-1">
      {data.map((item) => (
        <TreeNode key={item.id} item={item} defaultExpanded={expandedIds.includes(item.id)} renderActions={renderActions} />
      ))}
    </div>
  );
}

function TreeNode({ item, defaultExpanded, renderActions }: { item: TreeItemProps; defaultExpanded: boolean; renderActions?: (item: TreeItemProps) => React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = item.children && item.children.length > 0;

  const toggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  const progress = item.budget && item.budget > 0 
    ? Math.min(100, (Math.abs(item.amount || 0) / item.budget) * 100) 
    : 0;

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group",
          item.isProject && "bg-workspace/5 border border-workspace/10 shadow-sm mb-1"
        )}
        onClick={toggle}
      >
        <div className="flex items-center justify-center w-4 h-4">
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        
        {item.isProject ? (
          <Target className="h-4 w-4 text-workspace" />
        ) : hasChildren ? (
          <Folder className="h-4 w-4 text-workspace/70" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground/50" />
        )}

        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className={cn(
            "text-sm font-medium truncate",
            item.isProject ? "text-workspace" : "text-foreground/90"
          )}>
            {item.name}
          </span>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="hidden group-hover:flex items-center gap-1">
               {renderActions && renderActions(item)}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              {item.budget ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">${Math.abs(item.amount || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground/30">/</span>
                    <span className="font-bold">${item.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        progress > 90 ? "bg-destructive" : "bg-workspace"
                      )} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              ) : (
                <span className="font-bold text-foreground">${Math.abs(item.amount || 0).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 border-l border-border/50 pl-2 mt-1 space-y-1">
          {item.children?.map((child) => (
            <TreeNode key={child.id} item={child} defaultExpanded={false} renderActions={renderActions} />
          ))}
        </div>
      )}
    </div>
  );
}
