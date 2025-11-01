import { useLocation } from "wouter";
import { CreatorDashboard } from "@/components/CreatorDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/feed")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <CreatorDashboard />
      </main>
    </div>
  );
}
