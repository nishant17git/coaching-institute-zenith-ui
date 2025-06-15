
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, ExternalLink } from "lucide-react";

const legalLinks = [
  { title: "Privacy Policy", url: "#" },
  { title: "Terms of Service", url: "#" },
  { title: "Cookie Policy", url: "#" },
  { title: "Data Protection", url: "#" },
];

export default function AboutLegal() {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-xl border-0 mt-7 mb-7">
      <CardHeader className="text-center py-7">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Legal &amp; Privacy</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium text-base">
            Your privacy and security are our top priorities
          </p>
        </div>
      </CardHeader>
      <CardContent className="pb-8 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {legalLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/90 dark:bg-gray-800/60 border border-gray-200/30 dark:border-gray-800/30 hover:bg-blue-50/70 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-semibold text-gray-900 dark:text-white">{link.title}</span>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
