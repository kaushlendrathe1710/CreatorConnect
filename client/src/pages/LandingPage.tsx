import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/LandingHero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import analyticsImage from "@assets/generated_images/Creator_reviewing_analytics_dashboard_dd86db70.png";
import communityImage from "@assets/generated_images/Community_using_mobile_devices_6265481d.png";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">CreatorHub</h1>
          
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleLogin}
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button
              onClick={handleLogin}
              data-testid="button-signup"
            >
              Sign Up
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <LandingHero />
        <HowItWorks />
        <FeatureShowcase />

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Built for Creators
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Track your performance with detailed analytics, manage your subscribers, and watch your earnings grow month over month.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span>Real-time analytics and insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span>Monthly earnings reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span>Subscriber management tools</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <img
                  src={analyticsImage}
                  alt="Creator analytics"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src={communityImage}
                  alt="Community engagement"
                  className="rounded-lg w-full"
                />
              </div>
              
              <div className="order-1 md:order-2">
                <h2 className="text-4xl font-bold mb-6">
                  Join the Community
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Connect with thousands of creators and fans. Share your passion, build your audience, and create meaningful connections.
                </p>
                <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join CreatorHub today and turn your content into a sustainable income stream.
            </p>
            <Button
              size="lg"
              onClick={handleLogin}
              className="text-lg px-12"
              data-testid="button-join-now"
            >
              Join Now
            </Button>
          </div>
        </section>

        <footer className="border-t py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CreatorHub</h3>
              <p className="text-sm text-muted-foreground">
                Empowering creators to monetize their content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 CreatorHub. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
