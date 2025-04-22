import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Loader2, ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  useEffect(() => {
    // If already authenticated, redirect to saved path or dashboard
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-20 w-20 mb-6 rounded-3xl overflow-hidden shadow-lg"
          >
            <img src="/icon.png" alt="Infinity Classes" className="h-full w-full object-cover" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-apple-blue to-apple-indigo bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Infinity Classes
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="glass-effect border-none shadow-xl overflow-hidden rounded-2xl">
            <form onSubmit={handleSubmit} className="px-1">
              <CardContent className="pt-8 pb-4 px-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-center mb-2"
                >
                  <h2 className="text-2xl font-medium text-foreground">Sign In</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Enter your credentials to access your account
                  </p>
                </motion.div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium pl-1">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-secondary/40 border-0 rounded-xl placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-apple-blue focus:bg-background transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pl-1">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 h-auto text-xs font-normal text-apple-blue hover:text-apple-indigo"
                        onClick={() => {}}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-secondary/40 border-0 rounded-xl pr-10 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-apple-blue focus:bg-background transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full opacity-70 hover:opacity-100 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pt-2 pb-8">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-apple-blue to-apple-indigo text-white font-medium rounded-xl hover:opacity-95 shadow-md transition-all duration-300 hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            Access limited to authorized personnel only
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Contact administrator for support
          </p>
        </motion.div>
      </div>
    </div>
  );
              }
