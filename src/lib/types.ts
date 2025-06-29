export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  preferredUnit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  description?: string;
  instructions?: string;
  muscleGroups: string[];
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps?: number[];
  weight?: number;
  restTime?: number;
  notes?: string;
  autoIncrease: boolean;
  increaseAmount?: number;
  increaseAfterSessions: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  estimatedDuration?: number;
  difficulty: string;
  tags: string[];
  userId: string;
  user: User;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  duration: number;
  difficulty: string;
  isPublic: boolean;
  tags: string[];
  userId: string;
  user: User;
  workouts: ProgramWorkout[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramWorkout {
  id: string;
  programId: string;
  workoutId: string;
  workout: Workout;
  weekNumber: number;
  dayOfWeek: number;
  order: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  workout: Workout;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
  exerciseLogs: ExerciseLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  sets: number;
  reps: number[];
  weight: number[];
  restTime?: number[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WeightUnit = "kg" | "lbs";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
