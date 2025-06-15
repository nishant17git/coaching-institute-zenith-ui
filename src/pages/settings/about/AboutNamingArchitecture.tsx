
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const namingArch = [
  {
    title: "Product Suite — Infinity",
    description:
      "The overarching ecosystem representing the strategic partnership between Molecules and Infinity Classes.",
    color: "from-blue-50/70 to-cyan-50/90 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-200/30 dark:border-blue-900/20",
  },
  {
    title: "Subsystem — ATOM",
    description:
      "Administrative Telemetry & Operations Management. The core engine for data-driven automation of administrative functions.",
    color: "from-purple-50/70 to-violet-50/90 dark:from-purple-900/10 dark:to-violet-900/10 border-purple-200/30 dark:border-purple-900/20",
  },
  {
    title: "Series — U-235",
    description:
      "The model name representing a unified, stable release series with structured iteration tracking.",
    color: "from-orange-50/80 to-amber-50/80 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200/30 dark:border-orange-900/20",
  },
  {
    title: "Version — Mark I",
    description:
      "The inaugural release version of this comprehensive management system.",
    color: "from-green-50/70 to-emerald-50/90 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/30 dark:border-green-900/20",
  },
];

export default function AboutNamingArchitecture() {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-xl border-0 mt-7 mb-7">
      <CardHeader className="text-center py-7">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
            <Info className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Naming Architecture</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-base">
            A modular, scalable, and version-controlled naming system reflecting institutional-grade design and collaborative development
          </p>
        </div>
      </CardHeader>
      <CardContent className="pb-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {namingArch.map((item) => (
            <div
              key={item.title}
              className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border hover:scale-[1.01] transition-all duration-200`}
            >
              <div className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</div>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
