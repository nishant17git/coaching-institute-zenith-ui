import { useLocation, Link } from "react-router-dom"; import { useEffect } from "react"; import { Button } from "@/components/ui/button";

const NotFound = () => { const location = useLocation();

useEffect(() => { console.error( "404 Error: User attempted to access non-existent route:", location.pathname ); }, [location.pathname]);

return ( <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-apple-indigo to-apple-blue p-4"> <div className="relative w-full max-w-md p-8 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl animate-scale-in"> {/* Ambient gradient glow /} <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-apple-blue to-apple-indigo opacity-60 blur-2xl"></div> <div className="flex flex-col items-center text-center"> {/ 404 Badge /} <div className="h-24 w-24 flex items-center justify-center rounded-xl bg-white/50 shadow-inner mb-6"> <span className="text-4xl font-semibold text-white">404</span> </div> {/ Title /} <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1> {/ Description /} <p className="text-white/90 mb-6 leading-relaxed"> Oops! We can’t seem to find the page you’re looking for. It may have been moved or doesn’t exist. </p> {/ Action Button */} <Button asChild className="shadow-md hover:shadow-lg active:shadow-sm transform hover:scale-105 transition"> <Link to="/dashboard">Return to Dashboard</Link> </Button> </div> </div> </div> ); };

export default NotFound;

