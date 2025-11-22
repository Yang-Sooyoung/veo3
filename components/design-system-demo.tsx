"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function DesignSystemDemo() {
  const { toast } = useToast();

  return (
    <div className="space-y-8 w-full max-w-4xl">
      {/* Colors Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Discord-Inspired Color Palette</CardTitle>
          <CardDescription>Primary colors and theme variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary" />
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary" />
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent" />
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-destructive" />
              <p className="text-sm font-medium">Destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>All available button styles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Input Fields</CardTitle>
          <CardDescription>Text input with Discord styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Type a message..." />
          <Input placeholder="Disabled input" disabled />
        </CardContent>
      </Card>

      {/* Dialog Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>Modal dialogs for interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example Dialog</DialogTitle>
                <DialogDescription>
                  This is a modal dialog with Discord-inspired styling.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Enter something..." />
                <Button className="w-full">Submit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Toast Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>Show toast messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                toast({
                  title: "Success!",
                  description: "Your action was completed successfully.",
                });
              }}
            >
              Show Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Error",
                  description: "Something went wrong. Please try again.",
                  variant: "destructive",
                });
              }}
            >
              Show Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
