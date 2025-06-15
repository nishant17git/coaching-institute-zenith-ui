
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

const teamMembers = [
  { name: "Aman Gupta", role: "Developer - Molecules Team" },
  { name: "Chandan Kumar Tiwary", role: "Developer - Molecules Team" },
  { name: "Amar Raj", role: "Developer - Molecules Team" },
];

export default function AboutTeamCard() {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-xl border-0 backdrop-blur-xl overflow-hidden mb-7">
      <CardHeader className="flex flex-row gap-4 items-center pb-4 bg-gradient-to-r from-pink-100/60 via-purple-50/80 to-purple-100/80 dark:from-pink-950/15 dark:to-purple-900/15">
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 flex items-center justify-center shadow-md">
          <Heart className="h-7 w-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Development Team</CardTitle>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Built with passion</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-purple-100/80 dark:bg-purple-900/30 px-3 py-1 text-xs text-purple-700 dark:text-purple-200 font-semibold mb-2">Powered by</span>
          <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">Molecules</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">for Infinity Classes</div>
        </div>
        <div className="space-y-3 pt-2">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/90 dark:bg-gray-800/70 hover:bg-blue-50/60 dark:hover:bg-gray-700 transition"
            >
              <div className="rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 w-11 h-11 flex items-center justify-center text-white font-bold">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
