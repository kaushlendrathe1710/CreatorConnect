import { Button } from "@/components/ui/button";
import { Heart, Zap, TrendingUp, Users } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_creators_in_studio_b6bf1707.png";

export function LandingHero() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Create.<br />
              Share.<br />
              Earn.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
              The subscription platform where creators monetize exclusive content and fans support their favorite creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="text-lg px-8 h-14"
                onClick={handleLogin}
                data-testid="button-start-creating"
              >
                Start Creating
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                onClick={handleLogin}
                data-testid="button-explore-creators"
              >
                Explore Creators
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-sm text-white/70">Creators</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">500K+</p>
                <p className="text-sm text-white/70">Subscribers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">1M+</p>
                <p className="text-sm text-white/70">Posts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">$2M+</p>
                <p className="text-sm text-white/70">Earned</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
