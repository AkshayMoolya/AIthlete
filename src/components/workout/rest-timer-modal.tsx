import { useEffect, useRef, useState } from "react";
import { Timer, Volume2, VolumeX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RestTimerModalProps {
  isActive: boolean;
  remainingTime: number;
  defaultRestTime: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  currentSetInfo?: string;
}

export function RestTimerModal({
  isActive,
  remainingTime,
  defaultRestTime,
  soundEnabled,
  onSoundToggle,
  onSkip,
  onAddTime,
  currentSetInfo,
}: RestTimerModalProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerSound] = useState(() =>
    typeof Audio !== "undefined" ? new Audio("/sounds/timer-end.mp3") : null
  );

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-2 border-primary shadow-2xl animate-in fade-in-0 zoom-in-90">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Rest Time</CardTitle>
          <CardDescription>Take a breather, you've earned it!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="relative mb-8">
            <div className="font-mono text-6xl font-bold text-primary mb-2">
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSetInfo || "Get ready for next set"}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <Progress
              value={
                ((defaultRestTime - remainingTime) / defaultRestTime) * 100
              }
              className="h-3"
            />
            <div className="flex justify-center space-x-3">
              <Button onClick={onSkip} variant="outline">
                Skip Rest
              </Button>
              <Button onClick={() => onAddTime(30)} variant="outline">
                +30s
              </Button>
              <Button variant="ghost" size="icon" onClick={onSoundToggle}>
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
