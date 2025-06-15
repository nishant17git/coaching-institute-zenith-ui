
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, Code, Layers, Shield, Info, Sparkles, Cpu } from "lucide-react";

const systemInfo = [
  { label: "Platform", value: "Web Application", icon: Globe },
  { label: "Framework", value: "React 18.3.1", icon: Code },
  { label: "UI Library", value: "Shadcn/UI + Tailwind", icon: Layers },
  { label: "Database", value: "Supabase", icon: Shield },
  { label: "Build Date", value: new Date().toLocaleDateString(), icon: Info },
  { label: "Last Update", value: "December 8, 2025", icon: Sparkles },
];

export default function AboutSystemInfo() {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-xl border-0 backdrop-blur-xl mt-7 mb-7">
      <CardHeader className="text-center py-7">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-gray-600 to-slate-700 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
            <Cpu className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">System Information</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-base">Technical specifications and architecture</p>
        </div>
      </CardHeader>
      <CardContent className="pb-8 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {systemInfo.map((item) => (
            <div key={item.label} className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-gray-50/90 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-all duration-200">
              <item.icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <div className="font-medium text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">{item.label}</div>
                <div className="font-semibold text-gray-900 dark:text-white text-base">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
