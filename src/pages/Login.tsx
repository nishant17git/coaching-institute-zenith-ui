import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Set visibility after component mounts for animation
  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error: any) {
      // Enhanced error handling with proper toast notifications
      console.error("Login error details:", error);
      
      if (error.message?.includes("Invalid login credentials") || 
          error.message?.includes("Invalid email or password") ||
          error.message?.includes("Email not confirmed") ||
          error.message?.includes("Invalid user credentials")) {
        toast.error("Wrong or Invalid Credentials", {
          description: "Please check your email and password and try again.",
          duration: 5000,
        });
      } else if (error.message?.includes("Too many requests")) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email address before signing in.");
      } else {
        toast.error("Wrong or Invalid Credentials", {
          description: "Login failed. Please check your credentials and try again.",
          duration: 5000,
        });
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-white min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Enhanced grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,transparent,black)]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.6'%3E%3Cpath opacity='.7' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true">
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={container}
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
      >
        {/* Logo & Branding */}
        <motion.div className="flex flex-col items-center mb-8 space-y-4" variants={item}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/icon.png"
                alt="Infinity Classes Logo"
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/96x96?text=IC';
                }}
              />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 infinity-title">
                INFINITY CLASSES
              </span>
              <Badge variant="outline" className="mt-1 bg-white text-slate-600 border-slate-200">
                EST. 2022
              </Badge>
            </div>
          </div>
          <p className="text-sm text-slate-600 text-center">
            Learn till eternity, with dignity in Infinity.
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div className="relative" variants={item}>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-70"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Enter your admin credentials to access the dashboard
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <motion.div className="space-y-2" variants={item}>
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 rounded-xl"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={item}>
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <motion.div variants={item} className="w-full">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={item} className="w-full">
                  <Link to="/reset-password">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl"
                    >
                      Forgot Password?
                    </Button>
                  </Link>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.p 
          className="mt-6 text-center text-sm text-slate-500"
          variants={item}
        >
          Contact administrator for access credentials
        </motion.p>
      </motion.div>
    </div>
  );
}
