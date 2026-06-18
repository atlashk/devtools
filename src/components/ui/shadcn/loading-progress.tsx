"use client";

import { Progress } from "./progress";
import { useState, useEffect } from "react";

interface LoadingProgressProps {
  isLoading: boolean;
  loadingText?: string;
  className?: string;
}

/**
 * A hook that manages a progress animation for loading states
 * @param isLoading Boolean indicating if content is loading
 * @returns Current progress value (0-100)
 */
function useProgressAnimation(isLoading: boolean): number {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Reset progress and start incrementing
      setProgressValue(0);
      interval = setInterval(() => {
        setProgressValue((prev) => {
          // Gradually increase up to 95% while loading
          if (prev < 95) {
            return Math.min(prev + Math.random() * 5, 95);
          }
          return prev;
        });
      }, 100);
    } else {
      // Complete the progress and reset
      setProgressValue(100);
      const timeout = setTimeout(() => setProgressValue(0), 500);
      return () => clearTimeout(timeout);
    }

    // Clean up interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  return progressValue;
}

/**
 * A loading progress component that shows a progress bar and optional loading text
 */
export function LoadingProgress({
  isLoading,
  loadingText,
  className = "",
}: LoadingProgressProps) {
  const progressValue = useProgressAnimation(isLoading);

  if (!isLoading && progressValue === 0) {
    return null;
  }

  return (
    <div className={`flex-1 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4 w-full max-w-xs mx-auto">
        <Progress className="mb-6" value={progressValue} />
        {loadingText && <h3 className="text-lg font-semibold">{loadingText}</h3>}
      </div>
    </div>
  );
}