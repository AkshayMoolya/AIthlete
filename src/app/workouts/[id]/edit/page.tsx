"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Workout, Exercise, WorkoutExercise } from "@/lib/types";
import { toast } from "sonner";

interface EditWorkoutProps {
  params: {
    id: string;
  };
}

export default function EditWorkout({ params }: EditWorkoutProps) {
  const router = useRouter();
  const workoutId = params.id;

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
  const [isFetching, setIsFetching] = useState(true);

  // Fetch workout data
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${workoutId}`);
        if (response.ok) {
          const workout = await response.json();

          // Set form data from workout
          setName(workout.name);
          setDescription(workout.description || "");
          setEstimatedDuration(workout.estimatedDuration?.toString() || "");
          setIsPublic(workout.isPublic);
          setTags(workout.tags);
          setWorkoutExercises(workout.exercises);
        } else {
          toast.error("Failed to load workout data");
          router.push("/workouts");
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsFetching(false);
      }
    };

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

    fetchWorkout();
    fetchExercises();
  }, [workoutId, router]);

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
      id: `temp-${Date.now()}`,
      workoutId,
      exerciseId: exercise.id,
      exercise,
      order: workoutExercises.length + 1,
      sets: 3,
      reps: 10, // Single value, not an array
      restTime: 60,
      autoIncrease: false,
      increaseAfterSessions: 1,
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
      toast.error("Please enter a workout name");
      return;
    }

    if (workoutExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PUT",
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
            ({
              exerciseId,
              sets,
              reps,
              weight,
              restTime,
              notes,
              autoIncrease,
              increaseAmount,
              increaseAfterSessions,
            }) => ({
              exerciseId,
              sets,
              reps,
              weight,
              restTime,
              notes,
              autoIncrease,
              increaseAmount,
              increaseAfterSessions,
            })
          ),
        }),
      });

      if (response.ok) {
        toast.success("Workout updated successfully");
        router.push("/workouts");
      } else {
        toast.error("Failed to update workout");
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = availableExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !workoutExercises.some((we) => we.exerciseId === exercise.id)
  );

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading workout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            <Button onClick={handleSave} disabled={isLoading} size="sm">
              <Save className="w-4 h-4 mr-2" />
              <span className="sm:inline hidden">
                {isLoading ? "Saving..." : "Save Changes"}
              </span>
              <span className="sm:hidden">{isLoading ? "..." : "Save"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">
              Edit Workout
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Update your workout details and exercises
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 sm:gap-8">
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
                          key={workoutExercise.id || index}
                          className="p-3 sm:p-4 border rounded-lg space-y-4 overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-2">
                              <h4 className="font-medium truncate">
                                {workoutExercise.exercise.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
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

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
                                value={workoutExercise.reps ?? ""} // Changed from accessing array
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
