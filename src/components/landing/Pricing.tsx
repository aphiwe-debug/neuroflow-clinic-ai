import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "R500",
    period: "per month",
    description: "Perfect for solo practitioners getting started",
    features: [
      "Up to 25 patients",
      "Basic patient records",
      "Manual appointment scheduling",
      "Email support",
      "30-day data retention",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "R900",
    period: "per month",
    description: "For growing practices that need automation",
    features: [
      "Unlimited patients",
      "AI-powered recommendations",
      "Smart appointment scheduling",
      "Automated SMS & email reminders",
      "Basic analytics dashboard",
      "Priority email support",
      "90-day data retention",
      "Role-based access (3 users)",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "R1,800",
    period: "per month",
    description: "For established clinics needing enterprise features",
    features: [
      "Everything in Pro, plus:",
      "Advanced AI insights & predictions",
      "Custom reports & analytics",
      "Unlimited team members",
      "White-label options",
      "Dedicated account manager",
      "99.9% uptime SLA",
      "Unlimited data retention",
      "Priority phone support",
    ],
    cta: "Start Premium Trial",
    popular: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();

  const handleCTAClick = (planName: string) => {
    // For now, redirect to auth page - will implement plan selection later
    navigate('/auth');
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your clinic. Start free, upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl bg-card border-2 shadow-card hover:shadow-lg transition-all ${
                plan.popular
                  ? "border-primary scale-105 md:scale-110"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-sm font-semibold text-primary-foreground flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.popular
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
                size="lg"
                onClick={() => handleCTAClick(plan.name)}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
