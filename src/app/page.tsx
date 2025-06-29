import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-page";

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
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Section } from "../components/layout/section";
import { Container } from "../components/layout/container";
import { FeatureCard } from "../components/marketing/feature-card";
export default async function Home() {
  const session = await auth();

  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // If not authenticated, show the marketing page
  return <MarketingPage />;
}
