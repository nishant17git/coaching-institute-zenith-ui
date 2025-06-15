
import { Users, Monitor, Shield, Code, Zap, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    name: "Student Management",
    icon: Users,
    description: "Complete student lifecycle management with detailed profiles and tracking",
    color: "from-blue-400 to-cyan-400",
  },
  {
    name: "Attendance Tracking",
    icon: Monitor,
    description: "Real-time attendance monitoring with analytics and insights",
    color: "from-green-400 to-emerald-400",
  },
  {
    name: "Fee Management",
    icon: Shield,
    description: "Secure payment processing and comprehensive financial tracking",
    color: "from-purple-400 to-violet-400",
  },
  {
    name: "Question Bank",
    icon: Code,
    description: "Advanced testing system with LaTeX support and automated grading",
    color: "from-orange-400 to-red-400",
  },
  {
    name: "Reports & Analytics",
    icon: Zap,
    description: "Comprehensive insights with beautiful charts and exportable reports",
    color: "from-yellow-400 to-orange-400",
  },
  {
    name: "Mobile-First Design",
    icon: Smartphone,
    description: "Responsive design optimized for all devices and screen sizes",
    color: "from-pink-400 to-rose-400",
  },
];

export default function AboutFeaturesGrid() {
  return (
    <section className="w-full mb-10 px-1">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Built for Excellence</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
          Comprehensive student management with modern technology and intuitive design
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {features.map((feature) => (
          <Card key={feature.name} className="rounded-2xl bg-white/60 dark:bg-gray-900/70 border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass">
            <CardContent className="flex flex-col items-center px-5 py-7">
              <div className={`mb-4 bg-gradient-to-br ${feature.color} rounded-2xl w-12 h-12 flex items-center justify-center shadow-md`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">{feature.name}</h3>
              <p className="text-[0.92rem] text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
