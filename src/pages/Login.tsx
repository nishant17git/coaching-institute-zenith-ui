import { useState, useEffect } from "react"; import { useNavigate } from "react-router-dom"; import { useAuth } from "@/hooks/useAuth"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; import { Label } from "@/components/ui/label"; import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"; import { motion } from "framer-motion";

export default function Login() { const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false); const { login, isLoading, isAuthenticated } = useAuth(); const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await login(email, password); };

useEffect(() => { if (isAuthenticated) { const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/dashboard"; sessionStorage.removeItem("redirectAfterLogin"); navigate(redirectPath); } }, [isAuthenticated, navigate]);

return ( <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8"> <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-sm" > {/* Logo & Branding */} <div className="text-center mb-8"> <img
src="/icon.png"
alt="Infinity Classes"
className="mx-auto h-20 w-20"
/> <h1 className="mt-4 text-2xl font-semibold text-gray-900"> Infinity Classes </h1> <p className="mt-1 text-sm text-gray-500"> Excellence in Education </p> </div>

{/* Glass-Style Card */}
    <Card className="glass-card border border-white/30 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-center text-xl font-medium text-gray-900">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-sm text-gray-500">
          Enter your admin credentials to access the dashboard
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 h-11 border-gray-300 focus:ring-2 focus:ring-apple-blue focus:border-apple-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10 border-gray-300 focus:ring-2 focus:ring-apple-blue focus:border-apple-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full h-11 apple-button shadow-md"
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
        </CardFooter>
      </form>
    </Card>

    <p className="mt-6 text-center text-sm text-muted-foreground">
      Contact administrator for access credentials
    </p>
  </motion.div>
</div>

); }

