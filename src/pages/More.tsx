import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BarChart3,
  Cog,
  BookOpen,
  ChevronRight,
  User,
  UserPlus,
  CreditCard,
  FileText,
  HelpCircle,
  Biohazard,
  Loader2,
  X,
  Command
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import StarBorder from "@/components/ui/StarBorder";

export default function More() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      title: "Tests",
      description: "Manage assessments",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/tests",
      color: "bg-purple-500",
      lightBg: "bg-purple-50",
      darkBg: "bg-purple-950/20"
    },
    {
      title: "Questions",
      description: "NCERT question bank",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/questions",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      darkBg: "bg-emerald-950/20"
    },
    {
      title: "Reports",
      description: "Performance analytics",
      icon: <FileText className="h-5 w-5" />,
      path: "/reports",
      color: "bg-orange-500",
      lightBg: "bg-orange-50",
      darkBg: "bg-orange-950/20"
    },
    {
      title: "Settings",
      description: "App preferences",
      icon: <Cog className="h-5 w-5" />,
      path: "/settings",
      color: "bg-slate-500",
      lightBg: "bg-slate-50",
      darkBg: "bg-slate-950/20"
    }
  ];

  const quickActions = [
    {
      title: "Spotlight Search",
      icon: <Search className="h-5 w-5" />,
      action: () => setIsSearchOpen(true),
      color: "bg-blue-500",
      featured: true
    },
    {
      title: "Add Student",
      icon: <UserPlus className="h-5 w-5" />,
      action: () => {
        navigate('/students');
        setTimeout(() => {
          const addButton = document.querySelector('[data-add-student]') as HTMLButtonElement;
          if (addButton) addButton.click();
          else toast.error("Couldn't find add student button");
        }, 100);
      },
      color: "bg-green-500"
    },
    {
      title: "Record Payment",
      icon: <CreditCard className="h-5 w-5" />,
      action: () => {
        navigate('/fees');
        setTimeout(() => {
          const addButton = document.querySelector('[data-add-payment]') as HTMLButtonElement;
          if (addButton) addButton.click();
          else toast.error("Couldn't find add payment button");
        }, 100);
      },
      color: "bg-emerald-500"
    },
    {
      title: "My Profile",
      icon: <User className="h-5 w-5" />,
      action: () => navigate('/settings/profile'),
      color: "bg-purple-500"
    }
  ];

  // Universal search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const searchPromises = [];

      searchPromises.push(
        supabase
          .from('students')
          .select('*')
          .or(`full_name.ilike.%${query}%,father_name.ilike.%${query}%,mother_name.ilike.%${query}%,contact_number.ilike.%${query}%,address.ilike.%${query}%`)
          .limit(6)
      );
      searchPromises.push(
        supabase
          .from('tests')
          .select('*')
          .or(`test_name.ilike.%${query}%,subject.ilike.%${query}%,test_type.ilike.%${query}%`)
          .limit(4)
      );
      searchPromises.push(
        supabase
          .from('test_results')
          .select(`
            *,
            students!inner(full_name, class),
            tests!inner(test_name, subject)
          `)
          .limit(4)
      );
      searchPromises.push(
        supabase
          .from('fee_transactions')
          .select(`
            *,
            students!inner(full_name)
          `)
          .or(`purpose.ilike.%${query}%,payment_mode.ilike.%${query}%,receipt_number.ilike.%${query}%`)
          .limit(4)
      );

      const results = await Promise.all(searchPromises);
      const [studentsData, testsData, testResultsData, feeData] = results;
      const formattedResults: any[] = [];

      if (studentsData.data && Array.isArray(studentsData.data)) {
        formattedResults.push(...studentsData.data.map(student => ({
          id: student.id,
          title: student.full_name,
          subtitle: `Class ${student.class} | ${student.father_name}`,
          description: student.contact_number,
          type: 'student',
          icon: <User className="h-5 w-5 text-blue-500" />,
          data: student,
          category: 'Students'
        })));
      }
      if (testsData.data && Array.isArray(testsData.data)) {
        formattedResults.push(...testsData.data.map(test => ({
          id: test.id,
          title: test.test_name,
          subtitle: `${test.subject} | ${test.test_type || 'Test'}`,
          description: new Date(test.test_date).toLocaleDateString(),
          type: 'test',
          icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
          data: test,
          category: 'Tests'
        })));
      }
      if (testResultsData.data && Array.isArray(testResultsData.data)) {
        formattedResults.push(...testResultsData.data.map(result => ({
          id: result.id,
          title: `${result.students.full_name} - ${result.tests.test_name}`,
          subtitle: `${result.tests.subject} | ${result.marks_obtained}/${result.total_marks} marks`,
          description: `Class ${result.students.class}`,
          type: 'test-result',
          icon: <FileText className="h-5 w-5 text-green-500" />,
          data: result,
          category: 'Test Results'
        })));
      }
      if (feeData.data && Array.isArray(feeData.data)) {
        formattedResults.push(...feeData.data.map(fee => ({
          id: fee.id,
          title: `Fee Payment - ${fee.students.full_name}`,
          subtitle: `₹${fee.amount} | ${fee.payment_mode}`,
          description: new Date(fee.fee_date).toLocaleDateString(),
          type: 'fee',
          icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
          data: fee,
          category: 'Fees'
        })));
      }

      setSearchResults(formattedResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSearchResultSelect(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsSearchOpen(false);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchResults, selectedIndex]);

  // Auto-focus
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Select
  const handleSearchResultSelect = (result: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");

    switch (result.type) {
      case 'student':
        navigate(`/students/${result.id}`);
        break;
      case 'test':
        navigate(`/tests`);
        break;
      case 'test-result':
        navigate(`/tests`);
        break;
      case 'fee':
        navigate(`/fees`);
        break;
      case 'attendance':
        navigate(`/attendance`);
        break;
      default:
        toast.info(`Found: ${result.title}`);
    }
    toast.success(`Opening ${result.title}`);
  };

  // Group
  const groupedResults = Array.isArray(searchResults)
    ? searchResults.reduce((acc, result, index) => {
        const category = result.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({ ...result, globalIndex: index });
        return acc;
      }, {} as Record<string, any[]>)
    : {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl py-0 px-0">
          <div className="flex items-center justify-between py-0">
            <div>
              <h1 className="font-bold text-2xl text-inherit">More</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 py-[4px]">Tools & Settings</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF0000] to-[#FF7722] rounded-full flex items-center justify-center">
              <Biohazard className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto py-6 sm:max-w-2xl lg:max-w-4xl px-0 bg-white">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 mx-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>

          {/* Spotlight Search Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-6"
          >
            <StarBorder
              as="button"
              className="w-full"
              color="#ffffff"
              speed="7s"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="flex items-center justify-center space-x-3">
                <Search className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Spotlight Search</span>
                <kbd className="hidden sm:inline-flex h-6 px-2 items-center justify-center rounded bg-gray-100/20 text-xs font-medium text-white">
                  ⌘K
                </kbd>
              </div>
            </StarBorder>
          </motion.div>

          {/* Other Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.filter(action => !action.featured).map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: (index + 1) * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
                className="flex-1"
              >
                <button
                  onClick={action.action}
                  className="w-full h-16 group focus:outline-none"
                  title={action.title}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl h-full shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-lg group-active:scale-95 transition-all duration-300 ease-out overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-full flex items-center justify-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110",
                          action.color
                        )}
                      >
                        {action.icon}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mb-8 mx-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Main Features</h2>
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              >
                <Link to={item.path} className="block group">
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md group-active:scale-[0.98] transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Icon */}
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0",
                          item.color
                        )}>
                          {item.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* More Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mx-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Options</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {[
              {
                title: "Help & Support",
                subtitle: "Get assistance",
                icon: <HelpCircle className="h-4 w-4" />,
                path: "/settings/help-support"
              },
              {
                title: "Privacy Policy",
                subtitle: "Data protection",
                icon: <FileText className="h-4 w-4" />,
                path: "/settings/privacy-security"
              },
              {
                title: "Terms of Service",
                subtitle: "Usage guidelines",
                icon: <FileText className="h-4 w-4" />,
                path: "/settings/privacy-security"
              },
              {
                title: "About",
                subtitle: "App information",
                icon: <HelpCircle className="h-4 w-4" />,
                path: "/settings/about"
              }
            ].map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: "easeOut" }}
              >
                <Link to={option.path} className="block group">
                  <div className={cn(
                    "px-4 py-3 flex items-center space-x-3 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 group-active:bg-gray-100 dark:group-active:bg-gray-700 transition-colors",
                    index !== 3 && "border-b border-gray-200 dark:border-gray-700"
                  )}>
                    <span className="text-lg flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{option.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{option.subtitle}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Infinity ATOM v2.35.1
            </p>
          </div>
        </motion.div>
      </div>

      {/* Spotlight-style Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Centered Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="w-full max-w-xl">
                <div className="relative bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                  {/* Spotlight Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="px-6 py-4"
                  >
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 shadow-inner">
                      <Search className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      <motion.input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for students, tests, fees, attendance..."
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ml-3 text-base"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      {isSearching && (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400 ml-2" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(false)}
                        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-800 ml-2 rounded-full transition-colors duration-200"
                      >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </div>
                  </motion.div>

                  {/* Results */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className="max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain px-2"
                    ref={resultsContainerRef}
                  >
                    {isSearching ? (
                      <div className="py-12 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Searching…</p>
                      </div>
                    ) : searchResults.length === 0 && searchQuery ? (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No results</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Try a different query</p>
                      </div>
                    ) : searchQuery && searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {(Object.entries(groupedResults) as [string, any[]][]).map(([category, results]) => (
                          <div key={category}>
                            <div className="px-4 py-2">
                              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {category}
                              </h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {results.map((result) => (
                                <motion.div
                                  key={result.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className={cn(
                                    "flex items-center p-4 rounded-lg transition-colors duration-200",
                                    selectedIndex === result.globalIndex
                                      ? "bg-blue-50 dark:bg-blue-900/20"
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  )}
                                  onClick={() => handleSearchResultSelect(result)}
                                  onMouseEnter={() => setSelectedIndex(result.globalIndex)}
                                >
                                  <div className={cn(
                                    "p-2 rounded-lg flex items-center justify-center flex-shrink-0",
                                    selectedIndex === result.globalIndex
                                      ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                  )}>
                                    {result.icon}
                                  </div>
                                  <div className="ml-3 flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate mb-1">
                                      {result.title}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-0.5">
                                      {result.subtitle}
                                    </p>
                                    {result.description && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                        {result.description}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                    selectedIndex === result.globalIndex
                                      ? "text-blue-500"
                                      : "text-gray-300 dark:text-gray-500"
                                  )} />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !searchQuery ? (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Command className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Type to search</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Students, tests, fees, and more</p>
                      </div>
                    ) : null}
                  </motion.div>

                  {/* Footer */}
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-3"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{searchResults.length} result(s)</span>
                        <div className="flex items-center gap-2">
                          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↑↓</kbd>
                          <span>Navigate</span>
                          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↵</kbd>
                          <span>Select</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}