
import { ThemeToggle } from "@/src/components/theme-toggle"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Dumbbell, Search, Filter, Plus, Target, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function Exercises() {
  const exercises = [
    {
      id: 1,
      name: "Bench Press",
      category: "Chest",
      difficulty: "Intermediate",
      equipment: "Barbell",
      lastWeight: "225 lbs",
      bestSet: "225 lbs × 5",
      trend: "+5 lbs",
    },
    {
      id: 2,
      name: "Squat",
      category: "Legs",
      difficulty: "Intermediate",
      equipment: "Barbell",
      lastWeight: "300 lbs",
      bestSet: "300 lbs × 3",
      trend: "+10 lbs",
    },
    {
      id: 3,
      name: "Deadlift",
      category: "Back",
      difficulty: "Advanced",
      equipment: "Barbell",
      lastWeight: "335 lbs",
      bestSet: "335 lbs × 1",
      trend: "+15 lbs",
    },
    {
      id: 4,
      name: "Overhead Press",
      category: "Shoulders",
      difficulty: "Intermediate",
      equipment: "Barbell",
      lastWeight: "145 lbs",
      bestSet: "145 lbs × 6",
      trend: "+5 lbs",
    },
    {
      id: 5,
      name: "Pull-ups",
      category: "Back",
      difficulty: "Intermediate",
      equipment: "Bodyweight",
      lastWeight: "Bodyweight",
      bestSet: "12 reps",
      trend: "+2 reps",
    },
    {
      id: 6,
      name: "Dips",
      category: "Triceps",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      lastWeight: "Bodyweight",
      bestSet: "15 reps",
      trend: "+3 reps",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-semibold text-foreground">FitTracker</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/workouts" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Workouts
            </Link>
            <Link href="/progress" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Progress
            </Link>
            <Link href="/exercises" className="text-foreground font-medium text-sm">
              Exercises
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-3">Exercises</h1>
            <p className="text-muted-foreground text-lg">Track your exercise progress and personal records</p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search exercises..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>

        {/* Exercise Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="border-0 bg-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">{exercise.category}</Badge>
                      <Badge variant="secondary">{exercise.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{exercise.equipment}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-600 font-medium">{exercise.trend}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Weight:</span>
                    <span className="font-medium">{exercise.lastWeight}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Best Set:</span>
                    <span className="font-medium">{exercise.bestSet}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                    <Target className="w-4 h-4 mr-2" />
                    Log Set
                  </Button>
                  <Button variant="outline" size="icon">
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="border-0 bg-card mt-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Clock className="w-6 h-6" />
              <span className="text-2xl">Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Bench Press</div>
                  <div className="text-sm text-muted-foreground">225 lbs × 5 reps</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600">+5 lbs</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Squat</div>
                  <div className="text-sm text-muted-foreground">300 lbs × 3 reps</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600">+10 lbs</div>
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-medium">Pull-ups</div>
                  <div className="text-sm text-muted-foreground">12 reps</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600">+2 reps</div>
                  <div className="text-xs text-muted-foreground">2 days ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
