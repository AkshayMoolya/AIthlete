"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Plus, X, Search, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number; // Changed from number[] to number
  weight?: number;
  restTime?: number;
  notes?: string;
}

export default function CreateWorkout() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises");
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exercise,
      sets: 3,
      reps: 10, // Single value, not an array
      restTime: 60,
    };
    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (
    index: number,
    field: keyof WorkoutExercise,
    value: any
  ) => {
    const updated = [...workoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a workout name");
      return;
    }

    if (workoutExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          estimatedDuration: estimatedDuration
            ? parseInt(estimatedDuration)
            : null,
          isPublic,
          tags,
          exercises: workoutExercises.map(
            ({ exerciseId, sets, reps, weight, restTime, notes }) => ({
              exerciseId,
              sets,
              reps,
              weight,
              restTime,
              notes,
            })
          ),
        }),
      });

      if (response.ok) {
        router.push("/workouts");
      } else {
        alert("Failed to create workout");
      }
    } catch (error) {
      console.error("Error creating workout:", error);
      alert("An error occurred while creating the workout");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = availableExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !workoutExercises.some((we) => we.exerciseId === exercise.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">Create New Workout</h1>
            <p className="text-muted-foreground text-lg">
              Build your custom workout routine by adding exercises and setting
              details.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Workout Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Workout Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Upper Body Strength"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your workout..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="45"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                      <Label htmlFor="public">Make this workout public</Label>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex space-x-2 mb-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyDown={(e) => e.key === "Enter" && addTag()}
                        />
                        <Button onClick={addTag} size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                          >
                            {tag}
                            <X
                              className="w-3 h-3 ml-1.5"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Workout Exercises */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Workout Exercises ({workoutExercises.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workoutExercises.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {workoutExercises.map((workoutExercise, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {workoutExercise.exercise.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {workoutExercise.exercise.category} &bull;{" "}
                                {workoutExercise.exercise.equipment}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => removeExercise(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs">Sets</Label>
                              <Input
                                type="number"
                                value={workoutExercise.sets}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "sets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                type="number"
                                value={workoutExercise.reps || ""} // Changed from accessing array element
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "reps",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Weight (kg)</Label>
                              <Input
                                type="number"
                                value={workoutExercise.weight || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "weight",
                                    parseFloat(e.target.value)
                                  )
                                }
                                placeholder="20"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Rest (sec)</Label>
                              <Input
                                type="number"
                                value={workoutExercise.restTime || ""}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "restTime",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="60"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Notes (optional)</Label>
                            <Input
                              value={workoutExercise.notes || ""}
                              onChange={(e) =>
                                updateExercise(index, "notes", e.target.value)
                              }
                              placeholder="Any specific instructions..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Exercises */}
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Add Exercises</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search exercises..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                        {filteredExercises.length > 0 ? (
                          filteredExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-background cursor-pointer bg-background/50"
                              onClick={() => addExercise(exercise)}
                            >
                              <div>
                                <div className="font-medium">
                                  {exercise.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {exercise.category} • {exercise.equipment}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Plus className="w-4 h-4 mr-1" /> Add
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No exercises found.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
