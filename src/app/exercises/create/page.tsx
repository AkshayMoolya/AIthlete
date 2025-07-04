"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

const categories = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Full Body",
];

const equipmentTypes = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Resistance Band",
  "Kettlebell",
  "Other",
];

export default function CreateExercise() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [targetMuscles, setTargetMuscles] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    category?: string;
    equipment?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      name?: string;
      category?: string;
      equipment?: string;
    } = {};

    if (!name.trim()) {
      errors.name = "Exercise name is required";
    }

    if (!category) {
      errors.category = "Category is required";
    }

    if (!equipment) {
      errors.equipment = "Equipment type is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
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
          name,
          description,
          category,
          equipment,
          instructions,
          targetMuscles: targetMuscles
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        toast.success("Exercise created successfully");
        router.push("/exercises");
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
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/exercises">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button onClick={handleSave} disabled={isLoading} size="sm">
              <Save className="w-4 h-4 mr-2" />
              <span className="sm:inline hidden">
                {isLoading ? "Saving..." : "Save Exercise"}
              </span>
              <span className="sm:hidden">{isLoading ? "..." : "Save"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
            Create New Exercise
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Exercise Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center">
                    Exercise Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: undefined });
                      }
                    }}
                    placeholder="e.g., Barbell Bench Press"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the exercise..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="flex items-center">
                      Category <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value) => {
                        setCategory(value);
                        if (formErrors.category) {
                          setFormErrors({ ...formErrors, category: undefined });
                        }
                      }}
                    >
                      <SelectTrigger
                        className={formErrors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="equipment" className="flex items-center">
                      Equipment <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={equipment}
                      onValueChange={(value) => {
                        setEquipment(value);
                        if (formErrors.equipment) {
                          setFormErrors({
                            ...formErrors,
                            equipment: undefined,
                          });
                        }
                      }}
                    >
                      <SelectTrigger
                        className={formErrors.equipment ? "border-red-500" : ""}
                      >
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
                    {formErrors.equipment && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.equipment}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetMuscles">Target Muscles</Label>
                  <Input
                    id="targetMuscles"
                    value={targetMuscles}
                    onChange={(e) => setTargetMuscles(e.target.value)}
                    placeholder="e.g., Chest, Triceps, Shoulders (comma separated)"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Step-by-step instructions for performing the exercise..."
                    rows={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
