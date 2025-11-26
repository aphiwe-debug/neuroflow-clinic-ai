import { Brain, Calendar, Shield, Zap, BarChart3, Bell } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Get intelligent insights and recommendations based on patient history and medical data.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated appointment booking with conflict detection and reminder notifications.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "HIPAA-compliant data storage with role-based access control for your entire team.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for performance with instant access to patient records and clinic data.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive reports and insights to help you make data-driven decisions.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description: "Never miss an appointment with automated SMS and email reminders for patients.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Run Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Clinic
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to streamline your workflow and improve patient care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-all hover:scale-105 hover:border-primary/50"
            >
              <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
