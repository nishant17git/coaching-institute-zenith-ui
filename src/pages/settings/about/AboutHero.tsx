
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AboutHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative z-10 py-8 md:py-16 text-center"
    >
      <div className="flex justify-center mb-5">
        <div className="bg-gradient-to-br from-[#3F5EFB] to-[#FC466B] rounded-[2.5rem] w-20 h-20 flex items-center justify-center shadow-2xl shadow-blue-400/30 border border-white/10 backdrop-blur-2xl">
          <Smartphone className="w-10 h-10 text-white drop-shadow-xl" />
        </div>
      </div>
      <h1 className="text-[2.1rem] md:text-4xl font-[600] tracking-tight bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-600 dark:from-white dark:to-blue-200 bg-clip-text text-transparent leading-tight mb-3">
        Infinity ATOM U-235 I
      </h1>
      <p className="max-w-md mx-auto mb-8 text-[1rem] md:text-lg text-gray-500 dark:text-gray-300 font-medium">
        Administrative Telemetry &amp; Operations Management System
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-200 tracking-wide mb-2 sm:mb-0">
          Version Mark I
        </span>
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-200 tracking-wide">
          Build 2025.12.08
        </span>
        <button
          className="transition-colors px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-0 sm:ml-4 mt-2 sm:mt-0"
          type="button"
          onClick={() => toast({ title: "You're using the latest version!" })}
        >
          Check Updates
        </button>
      </div>
    </motion.section>
  );
}
