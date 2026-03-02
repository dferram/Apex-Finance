"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeItemProps {
  id: number;
  name: string;
  isProject?: boolean;
  amount?: number;
  budget?: number;
  level: number;
  children?: TreeItemProps[];
}

interface TreeViewProps {
  data: TreeItemProps[];
  expandedIds?: number[];
  renderActions?: (item: TreeItemProps) => React.ReactNode;
  onMove?: (draggedId: number, targetId: number | null) => Promise<void>;
}

export function TreeView({ data, expandedIds = [], renderActions, onMove }: TreeViewProps) {
  const [dragOverId, setDragOverId] = useState<number | null | 'root'>(null);

  return (
    <div
      className={cn(
        "space-y-1 transition-colors rounded-lg",
        dragOverId === 'root' && "ring-2 ring-workspace/50 bg-workspace/5"
      )}
      onDragOver={onMove ? (e) => { e.preventDefault(); setDragOverId('root'); } : undefined}
      onDragLeave={onMove ? () => setDragOverId(null) : undefined}
      onDrop={onMove ? async (e) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('categoryId'));
        if (id) await onMove(id, null);
        setDragOverId(null);
      } : undefined}
    >
      {data.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          defaultExpanded={expandedIds.includes(item.id)}
          renderActions={renderActions}
          onMove={onMove}
          dragOverId={dragOverId}
          setDragOverId={setDragOverId}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  item: TreeItemProps;
  defaultExpanded: boolean;
  renderActions?: (item: TreeItemProps) => React.ReactNode;
  onMove?: (draggedId: number, targetId: number | null) => Promise<void>;
  dragOverId: number | null | 'root';
  setDragOverId: (id: number | null | 'root') => void;
}

function TreeNode({ item, defaultExpanded, renderActions, onMove, dragOverId, setDragOverId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDragging, setIsDragging] = useState(false);
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

  const isDropTarget = dragOverId === item.id;

  return (
    <div className="flex flex-col">
      <div
        draggable={!!onMove}
        onDragStart={onMove ? (e) => {
          e.dataTransfer.setData('categoryId', String(item.id));
          e.dataTransfer.effectAllowed = 'move';
          setIsDragging(true);
        } : undefined}
        onDragEnd={onMove ? () => { setIsDragging(false); setDragOverId(null); } : undefined}
        onDragOver={onMove ? (e) => { e.preventDefault(); e.stopPropagation(); setDragOverId(item.id); } : undefined}
        onDragLeave={onMove ? (e) => {
          e.stopPropagation();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverId(null);
          }
        } : undefined}
        onDrop={onMove ? async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const draggedId = Number(e.dataTransfer.getData('categoryId'));
          if (draggedId && draggedId !== item.id) {
            await onMove(draggedId, item.id);
          }
          setDragOverId(null);
        } : undefined}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-all cursor-pointer group",
          item.isProject && "bg-workspace/5 border border-workspace/10 shadow-sm mb-1",
          isDragging && "opacity-40",
          isDropTarget && "bg-workspace/20 ring-2 ring-workspace/50 scale-[1.01]",
          onMove && "cursor-grab active:cursor-grabbing"
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
            <TreeNode
              key={child.id}
              item={child}
              defaultExpanded={false}
              renderActions={renderActions}
              onMove={onMove}
              dragOverId={dragOverId}
              setDragOverId={setDragOverId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
