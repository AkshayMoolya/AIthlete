"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  description?: string;
  instructions?: string;
  muscleGroups: string[];
}

interface CreateExerciseDialogProps {
  onExerciseCreated: (exercise: Exercise) => void;
}

const exerciseCategories = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
  "Flexibility",
];

const equipmentTypes = [
  "Barbell",
  "Dumbbell",
  "Bodyweight",
  "Machine",
  "Cable",
  "Resistance Band",
  "Kettlebell",
  "Medicine Ball",
  "TRX",
  "Other",
];

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Obliques",
  "Trapezius",
  "Latissimus Dorsi",
  "Rhomboids",
  "Deltoids",
];

export function CreateExerciseDialog({
  onExerciseCreated,
}: CreateExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const addMuscleGroup = (muscle: string) => {
    if (!selectedMuscles.includes(muscle)) {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const removeMuscleGroup = (muscle: string) => {
    setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setEquipment("");
    setInstructions("");
    setSelectedMuscles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category || !equipment) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          equipment,
          instructions: instructions.trim(),
          targetMuscles: selectedMuscles,
        }),
      });

      if (response.ok) {
        const newExercise = await response.json();
        toast.success("Exercise created successfully!");
        onExerciseCreated(newExercise);
        resetForm();
        setOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create exercise");
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      toast.error("An error occurred while creating the exercise");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise that can be used in your workouts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Exercise Name *</Label>
              <Input
                id="exercise-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Barbell Bench Press"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment *</Label>
            <Select value={equipment} onValueChange={setEquipment} required>
              <SelectTrigger id="equipment">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {eq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exercise..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions for performing the exercise..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Muscle Groups</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {muscleGroups.map((muscle) => (
                <Button
                  key={muscle}
                  type="button"
                  variant={
                    selectedMuscles.includes(muscle) ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    selectedMuscles.includes(muscle)
                      ? removeMuscleGroup(muscle)
                      : addMuscleGroup(muscle)
                  }
                >
                  {muscle}
                </Button>
              ))}
            </div>

            {selectedMuscles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMuscles.map((muscle) => (
                  <div
                    key={muscle}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removeMuscleGroup(muscle)}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Exercise"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
