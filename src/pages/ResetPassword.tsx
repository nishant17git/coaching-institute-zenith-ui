
import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        if (error.message.includes("Email not found")) {
          toast.error("No account found with this email address.");
        } else {
          toast.error("Failed to send reset email. Please try again.");
        }
      } else {
        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,transparent,black)]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
              <img
                src="/icon.png"
                alt="Infinity Classes Logo"
                className="relative w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=IC';
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
        </motion.div>

        {/* Reset Password Card */}
        <motion.div className="relative" variants={item}>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-70"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Reset Password
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                {emailSent 
                  ? "We've sent you a password reset link"
                  : "Enter your email to receive a password reset link"
                }
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <motion.div className="space-y-2" variants={item}>
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email Address
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
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div variants={item} className="w-full">
                    <Link to="/login">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                  </motion.div>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <motion.div 
                  className="text-center p-6 bg-green-50 rounded-xl border border-green-200"
                  variants={item}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-green-800 font-medium mb-2">
                    Email sent successfully!
                  </p>
                  <p className="text-xs text-green-700">
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                </motion.div>

                <motion.div variants={item} className="w-full">
                  <Link to="/login">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        <motion.p 
          className="mt-6 text-center text-sm text-slate-500"
          variants={item}
        >
          Need help? Contact your administrator
        </motion.p>
      </motion.div>
    </div>
  );
}
