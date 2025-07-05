import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { FeatureCard } from "@/components/marketing/feature-card";
import {
  Target,
  TrendingUp,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  Play,
  Dumbbell,
} from "lucide-react";

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />

      {/* Hero Section */}
      <Section>
        <Container>
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
                Simple Fitness
                <br />
                <span className="text-muted-foreground">Tracking</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Track your workouts, monitor progress, and stay motivated with
                our clean and simple fitness tracking app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button size="lg" className="h-14 px-10 text-lg" asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2"
                  >
                    <span>Start Tracking</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-lg"
                  asChild
                >
                  <Link href="#demo" className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>View Demo</span>
                  </Link>
                </Button>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <Image
                  src="/next.svg"
                  alt="AIthlete App Dashboard"
                  width={900}
                  height={500}
                  className="rounded-2xl shadow-2xl border border-border/50 dark:invert"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section id="features" background="muted">
        <Container>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything you need to
              <span className="text-muted-foreground"> stay fit</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Simple tools to track your fitness journey without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Dumbbell}
              title="Workout Logging"
              description="Easily log your workouts with our intuitive interface. Track exercises, sets, reps, and weights."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Progress Tracking"
              description="Monitor your progress over time with clear charts and statistics to keep you motivated."
            />
            <FeatureCard
              icon={Target}
              title="Goal Setting"
              description="Set and track your fitness goals with our simple goal management system."
            />
            <FeatureCard
              icon={Calendar}
              title="Workout Planning"
              description="Plan your workouts in advance and stay organized with our calendar view."
            />
            <FeatureCard
              icon={Users}
              title="Social Features"
              description="Share your progress and connect with friends to stay motivated together."
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Your data is secure and private. You have full control over your information."
            />
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section>
        <Container>
          <Card className="border-0 bg-foreground text-background overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
                Join thousands of users who are already tracking their fitness
                progress with our simple and effective tools.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8"
                asChild
              >
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
