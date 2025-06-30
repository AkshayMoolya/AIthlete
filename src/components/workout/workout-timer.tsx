import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WorkoutTimerProps {
  startTime: Date | null;
  isActive: boolean;
  progress: number;
}

export function WorkoutTimer({
  startTime,
  isActive,
  progress,
}: WorkoutTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isActive) return null;

  return (
    <>
      <div className="hidden sm:flex items-center space-x-3">
        <Badge variant="outline" className="font-mono">
          <Timer className="w-3 h-3 mr-1" />
          {formatTime(elapsedTime)}
        </Badge>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <Progress value={progress} className="w-24 h-2" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </div>
      <div className="sm:hidden">
        <Badge variant="outline" className="font-mono">
          {progress}%
        </Badge>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-mono">{formatTime(elapsedTime)}</span>
          <span>{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </>
  );
}
