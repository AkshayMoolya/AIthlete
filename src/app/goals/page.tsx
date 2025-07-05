"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PlusCircle, Trash2, Edit, Target, Check, X } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const goalSchema = z.object({
  name: z.string().min(3, "Goal name must be at least 3 characters"),
  type: z.enum(["weight", "consistency", "performance"]),
  targetValue: z.number().positive("Target must be a positive number"),
  deadline: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface Goal extends GoalFormData {
  id: string;
  currentValue: number;
  status: "active" | "completed" | "abandoned";
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        toast.error("Failed to fetch goals.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching goals.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<GoalFormData> = async (data) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Goal created successfully!");
        fetchGoals(); // Re-fetch goals to update the list
        reset();
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to create goal.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the goal.");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted successfully!");
        fetchGoals(); // Re-fetch goals
      } else {
        toast.error("Failed to delete goal.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the goal.");
    }
  };

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header variant="dashboard" />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
              Your Goals
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
              Set, track, and conquer your fitness ambitions.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-base w-full sm:w-auto">
                <PlusCircle className="w-5 h-5 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Goal Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="type">Goal Type</Label>
                  <Select
                    onValueChange={(value) =>
                      reset({
                        ...getValues(),
                        type: value as "weight" | "consistency" | "performance",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="consistency">Consistency</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm">
                      {errors.type.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    {...register("targetValue", { valueAsNumber: true })}
                  />
                  {errors.targetValue && (
                    <p className="text-red-500 text-sm">
                      {errors.targetValue.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register("deadline", { valueAsDate: true })}
                  />
                  {errors.deadline && (
                    <p className="text-red-500 text-sm">
                      {errors.deadline.message}
                    </p>
                  )}
                </div>
                <Button type="submit">Create Goal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Active Goals
            </h2>
            {isLoading ? (
              <p>Loading goals...</p>
            ) : activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
                {activeGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {goal.name}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {}}
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">
                              Progress
                            </p>
                            <p className="text-sm font-medium">
                              {goal.currentValue} / {goal.targetValue}
                            </p>
                          </div>
                          <Progress
                            value={(goal.currentValue / goal.targetValue) * 100}
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium capitalize">
                            {goal.status}
                          </p>
                        </div>
                        {goal.deadline && (
                          <div className="flex justify-between items-center text-sm">
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-medium">
                              {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No active goals. Set one to get started!</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Completed Goals
            </h2>
            {isLoading ? (
              <p>Loading goals...</p>
            ) : completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-60">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {goal.name}
                        <Check className="w-5 h-5 text-green-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Completed on:{" "}
                        {new Date(goal.deadline!).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No completed goals yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
