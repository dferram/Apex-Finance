'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-destructive/10 p-6 rounded-full ring-8 ring-destructive/5">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">System Error Detected</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          An unexpected error occurred while processing your request. Please try again or return to the dashboard.
        </p>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <Button 
          onClick={() => reset()} 
          variant="default"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Attempt Recovery
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Safety
        </Button>
      </div>
    </div>
  );
}
