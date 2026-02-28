"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, TrendingUp, Calendar, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { Button } from "@/components/ui/button";

export default function GoalsPage() {
  const { goals, activeWorkspace } = useApex();
  const isProf = activeWorkspace.is_professional;
  const accentColor = isProf ? "bg-blue-500" : "bg-emerald-500";

  if (goals.length === 0) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Objectives</h1>
          <p className="text-muted-foreground mt-1">Track your progress toward key milestones.</p>
        </div>
        <Card className="glass-panel text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No active goals</h3>
          <p className="text-muted-foreground mt-2 mb-6">Create a new financial goal to start tracking.</p>
          <GoalDialog>
            <Button className="bg-workspace hover:bg-workspace/90 text-white mx-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </GoalDialog>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Objectives</h1>
          <p className="text-muted-foreground mt-1">
            {isProf ? "Corporate milestones and runway targets." : "Personal savings and investment goals."}
          </p>
        </div>
        <GoalDialog>
          <Button className="bg-workspace hover:bg-workspace/90 text-white shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </GoalDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progressPercentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
          const isCompleted = progressPercentage >= 100;
          const remainingAmount = goal.target_amount - goal.current_amount;
          
          return (
            <Card key={goal.id} className="glass-panel overflow-hidden relative group">
              {isCompleted && (
                 <div className="absolute top-0 right-0 p-4">
                    <span className="flex h-3 w-3 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${accentColor}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${accentColor}`}></span>
                    </span>
                 </div>
              )}
              
              <div className={`absolute left-0 top-0 h-1 w-full transition-all duration-1000 ${accentColor}`} style={{ width: `${progressPercentage}%` }}></div>
              
              <CardHeader className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-workspace/10`}>
                    <Target className={`h-5 w-5 text-workspace`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold leading-tight">{goal.name}</CardTitle>
                    <CardDescription className="text-xs font-mono mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {progressPercentage}% Completed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>${goal.current_amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">Target: ${goal.target_amount.toLocaleString()}</span>
                  </div>
                  {/* We inject the custom color via a style prop variable or class injection to override internal shadcn bg */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className={`h-full ${accentColor} transition-all duration-1000 ease-in-out`} style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 mt-4">
                  {goal.deadline ? (
                    <div className="flex items-center gap-1.5">
                       <Calendar className="h-3.5 w-3.5" />
                       Due: {format(goal.deadline, "MMM dd, yyyy")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 opacity-60">
                       <AlertCircle className="h-3.5 w-3.5" />
                       No strict deadline
                    </div>
                  )}
                  
                  {!isCompleted && (
                    <div className="font-medium text-foreground">
                      ${remainingAmount.toLocaleString()} left
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
