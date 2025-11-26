import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Calendar, Users } from "lucide-react";

export const Hero = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">
            <Brain className="w-4 h-4 text-primary" />
            <span>AI-Powered Clinic Automation</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Your Clinic with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Streamline patient management, automate scheduling, and get AI-powered insights—all in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-card group transition-all hover:shadow-lg hover:scale-105"
              onClick={scrollToPricing}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 hover:bg-secondary/50"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            {[
              { icon: Users, title: "Patient Management", desc: "Effortless record keeping" },
              { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered appointments" },
              { icon: Brain, title: "AI Insights", desc: "Data-driven recommendations" },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-all hover:scale-105"
              >
                <div className="p-3 rounded-xl bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
