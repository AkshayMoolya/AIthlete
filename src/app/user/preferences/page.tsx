"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function PreferencesPage() {
  const { data: session, update } = useSession();
  const [preferences, setPreferences] = useState({
    preferredUnit: "kg",
    theme: "system",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      // @ts-ignore
      setPreferences({
        // @ts-ignore
        preferredUnit: session.user.preferredUnit || "kg",
        theme: "system", // Theme is handled by next-themes, this is a placeholder
      });
      setLoading(false);
    }
  }, [session]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Preferences saved successfully");
        // Update the session with the new preferences
        await update({
          ...session,
          user: {
            // @ts-ignore
            ...session.user,
            preferredUnit: preferences.preferredUnit,
          },
        });
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("An error occurred while saving preferences");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-3">Preferences</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Manage your account settings and preferences.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Workout Settings</CardTitle>
            <CardDescription>
              Customize your workout experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="preferred-unit">Preferred Unit</Label>
              <Select
                value={preferences.preferredUnit}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, preferredUnit: value })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, theme: value })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start-timer">Auto-start rest timer</Label>
              <Switch id="auto-start-timer" />
            </div>
            <Button onClick={handleSave}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}