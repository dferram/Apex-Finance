"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createCategory } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CategoryDialog({ children, initialParentId }: { children?: React.ReactNode, initialParentId?: number }) {
  const { activeWorkspace, categories, refreshData } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [parentId, setParentId] = useState<string>(initialParentId?.toString() || "root");
  const [isProject, setIsProject] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !activeWorkspace) return;
    
    setLoading(true);

    try {
      const result = await createCategory({
        workspace_id: activeWorkspace.id,
        name,
        monthly_budget: budget ? Number(budget) : undefined,
        parent_id: parentId === "root" ? undefined : Number(parentId),
        is_project: isProject,
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setBudget("");
        setParentId("root");
        setIsProject(false);
        await refreshData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="bg-background/50 shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your transactions in {activeWorkspace?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Food, Software, Travel" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget (Optional)</Label>
            <Input 
              id="budget" 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="No parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">No parent category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="is-project">Is this a Project?</Label>
              <p className="text-xs text-muted-foreground">Projects allow you to group strategic expenses.</p>
            </div>
            <Switch
              id="is-project"
              checked={isProject}
              onCheckedChange={setIsProject}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
