"use client";

import { useApex } from "@/context/ApexContext";
import { useEffect, useState } from "react";

export function AppLoadingSkeleton({ children }: { children: React.ReactNode }) {
  const { isInitializing } = useApex();
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isInitializing) {
      const timer = setTimeout(() => setShowSkeleton(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isInitializing]);

  if (!showSkeleton) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-md bg-muted/50 animate-pulse" />
        <div className="h-4 w-48 rounded-md bg-muted/50 animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/50 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  );
}
