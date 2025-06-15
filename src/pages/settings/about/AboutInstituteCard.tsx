
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";

export default function AboutInstituteCard() {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-xl border-0 backdrop-blur-xl overflow-hidden mb-7">
      <CardHeader className="pb-4 flex flex-row gap-4 items-center bg-gradient-to-r from-emerald-100/60 via-emerald-50/80 to-green-50/80 dark:from-emerald-950/15 dark:to-green-900/15">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 w-14 h-14 flex items-center justify-center shadow-md">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Infinity Classes</CardTitle>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Our Institution</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-emerald-900/10 dark:to-green-900/10 border border-emerald-100/40 dark:border-emerald-900/20 text-center">
          <blockquote>
            <p className="italic font-medium text-emerald-700 dark:text-emerald-200 text-base">
              "Learn till eternity, with dignity in Infinity."
            </p>
          </blockquote>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 flex items-center justify-center shadow-lg mb-1">
            <Users className="h-9 w-9 text-white" />
          </div>
          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Mr. Nishant Kumar Tiwary</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">Director &amp; Owner, Infinity Classes</span>
        </div>
        <div className="p-4 bg-gray-50/90 dark:bg-gray-800/60 rounded-2xl">
          <div className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Mission Statement</div>
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Providing quality education with innovative teaching methods, comprehensive student management solutions, and fostering academic excellence in every student.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
