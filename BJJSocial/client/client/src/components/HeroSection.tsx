import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Medal, Target } from "lucide-react";
import heroImage from "@assets/generated_images/BJJ_training_academy_scene_608a047d.png";

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function HeroSection({ onGetStarted, onLogin }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen">
      {/* Hero Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${heroImage})` 
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Connect Your <span className="text-primary">BJJ Journey</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Track your progress, compete with athletes worldwide, and build lasting connections in the Brazilian Jiu-Jitsu community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              data-testid="button-get-started"
              className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary-border"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onLogin}
              data-testid="button-login"
              className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Sign In
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Track Progress</h3>
                <p className="text-sm text-gray-300">Monitor your belt progression and competition stats</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Connect</h3>
                <p className="text-sm text-gray-300">Find training partners and mentors in your area</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Medal className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Compete</h3>
                <p className="text-sm text-gray-300">Track tournaments and showcase achievements</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Improve</h3>
                <p className="text-sm text-gray-300">Set goals and track your training journey</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}