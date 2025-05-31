
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Settings, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserIconProps {
  username?: string;
  imageUrl?: string;
}

export function UserIcon({
  username,
  imageUrl
}: UserIconProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
  };

  // Get the first letter of the username in uppercase
  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer focus:outline-none">
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-black/5 hover:bg-white/80 dark:hover:bg-black/30 transition-all">
          <Avatar className="h-8 w-8 bg-blue-500 text-white border border-blue-500/20">
            <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
              {getInitial(username)}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <>
              <span className="text-sm font-medium">{username || "User"}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent align="end" className="w-56 mt-1 p-1 bg-white/90 backdrop-blur-lg border-black/5 shadow-lg dark:bg-black/80">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{username || "User"}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer flex items-center gap-2 py-1.5">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer flex items-center gap-2 py-1.5">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 py-1.5">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
