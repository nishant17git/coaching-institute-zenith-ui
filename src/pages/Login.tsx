import { useState, useEffect } from "react"; import { useNavigate } from "react-router-dom"; import { useAuth } from "@/hooks/useAuth"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Label } from "@/components/ui/label"; import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"; import { motion } from "framer-motion";

export default function Login() { const [email, setEmail] = useState<string>(""); const [password, setPassword] = useState<string>(""); const [showPassword, setShowPassword] = useState<boolean>(false); const { login, isLoading, isAuthenticated } = useAuth(); const navigate = useNavigate();

useEffect(() => { if (isAuthenticated) { const path = sessionStorage.getItem('redirectAfterLogin') || '/dashboard'; sessionStorage.removeItem('redirectAfterLogin'); navigate(path); } }, [isAuthenticated, navigate]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); await login(email.trim(), password); };

return ( <div className="min-h-screen flex items-center justify-center bg-[url('/bg-light.jpg')] bg-cover dark:bg-[url('/bg-dark.jpg')]"> <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md p-6" > <div className="flex flex-col items-center mb-10"> <motion.img src="/icon.png" alt="Infinity Classes" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="h-24 w-24 object-contain" /> <h1 className="mt-4 text-5xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"> Infinity Classes </h1> <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm"> Excellence in Education </p> </div>

<motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-8 shadow-xl border border-white/30 dark:border-gray-800"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
        Welcome Back
      </h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4"
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </Label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => e.preventDefault()}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </motion.button>
          </div>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Need assistance? Contact your administrator.
      </p>
    </motion.form>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="mt-8 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400"
    >
      <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
      Secure SSL encrypted login
    </motion.div>
  </motion.div>
</div>

); }

