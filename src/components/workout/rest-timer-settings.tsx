import { AlarmClock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface RestTimerSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRestTime: number;
  onRestTimeChange: (time: number) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
}

export function RestTimerSettings({
  isOpen,
  onOpenChange,
  defaultRestTime,
  onRestTimeChange,
  soundEnabled,
  onSoundToggle,
}: RestTimerSettingsProps) {
  return (
    <Card className="border-primary/20">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <AlarmClock className="w-5 h-5 mr-2 text-primary" />
                Rest Timer Settings
              </CardTitle>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Default Rest Time</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onRestTimeChange(Math.max(15, defaultRestTime - 15))
                    }
                    disabled={defaultRestTime <= 15}
                  >
                    -15s
                  </Button>
                  <span className="w-16 text-center font-mono font-semibold">
                    {defaultRestTime}s
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onRestTimeChange(Math.min(300, defaultRestTime + 15))
                    }
                    disabled={defaultRestTime >= 300}
                  >
                    +15s
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="sound-enabled" className="font-medium">
                  Timer Sound
                </Label>
                <Switch
                  id="sound-enabled"
                  checked={soundEnabled}
                  onCheckedChange={onSoundToggle}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
