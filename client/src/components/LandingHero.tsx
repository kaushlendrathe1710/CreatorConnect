import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Hero_creators_in_studio_b6bf1707.png";

export function LandingHero() {
  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Turn Your Passion Into Income
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of creators earning through subscriptions. Share exclusive content with your biggest fans.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="default"
            className="text-lg px-8"
            data-testid="button-start-creating"
          >
            Start Creating
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            data-testid="button-explore-creators"
          >
            Explore Creators
          </Button>
        </div>
      </div>
    </section>
  );
}
