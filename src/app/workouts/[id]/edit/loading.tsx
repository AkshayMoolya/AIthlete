import { Dumbbell } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Dumbbell className="w-8 h-8 animate-pulse mx-auto mb-4" />
        <p>Loading workout data...</p>
      </div>
    </div>
  );
}
