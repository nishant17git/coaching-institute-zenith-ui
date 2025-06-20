import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search, BarChart3, Cog, BookOpen, ChevronRight, User, UserPlus, CreditCard, FileText, HelpCircle, Biohazard, Loader2, X, Command, Calendar, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import StarBorder from "@/components/ui/StarBorder";
import { useDebounce } from "@/hooks/useDebounce";

export default function More() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  const menuItems = [{
    title: "Tests",
    description: "Manage assessments",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/tests",
    color: "bg-purple-500",
    lightBg: "bg-purple-50",
    darkBg: "bg-purple-950/20"
  }, {
    title: "Questions",
    description: "NCERT question bank",
    icon: <BookOpen className="h-5 w-5" />,
    path: "/questions",
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    darkBg: "bg-emerald-950/20"
  }, {
    title: "Reports",
    description: "Performance analytics",
    icon: <FileText className="h-5 w-5" />,
    path: "/reports",
    color: "bg-orange-500",
    lightBg: "bg-orange-50",
    darkBg: "bg-orange-950/20"
  }, {
    title: "Settings",
    description: "App preferences",
    icon: <Cog className="h-5 w-5" />,
    path: "/settings",
    color: "bg-slate-500",
    lightBg: "bg-slate-50",
    darkBg: "bg-slate-950/20"
  }];

  const quickActions = [{
    title: "Spotlight Search",
    icon: <Search className="h-5 w-5" />,
    action: () => setIsSearchOpen(true),
    color: "bg-blue-500",
    featured: true
  }, {
    title: "Add Student",
    icon: <UserPlus className="h-5 w-5" />,
    action: () => {
      navigate('/students');
      setTimeout(() => {
        const addButton = document.querySelector('[data-add-student]') as HTMLButtonElement;
        if (addButton) addButton.click();else toast.error("Couldn't find add student button");
      }, 100);
    },
    color: "bg-green-500"
  }, {
    title: "Record Payment",
    icon: <CreditCard className="h-5 w-5" />,
    action: () => {
      navigate('/fees');
      setTimeout(() => {
        const addButton = document.querySelector('[data-add-payment]') as HTMLButtonElement;
        if (addButton) addButton.click();else toast.error("Couldn't find add payment button");
      }, 100);
    },
    color: "bg-emerald-500"
  }, {
    title: "My Profile",
    icon: <User className="h-5 w-5" />,
    action: () => navigate('/settings/profile'),
    color: "bg-purple-500"
  }];

  // Enhanced comprehensive search function with improved accuracy
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // Check cache first
    if (searchCache.has(searchTerm)) {
      setSearchResults(searchCache.get(searchTerm) || []);
      setSelectedIndex(0);
      return;
    }
    
    setIsSearching(true);
    console.log("Starting comprehensive search for:", query);
    
    try {
      const formattedResults: any[] = [];

      // 1. COMPREHENSIVE STUDENT SEARCH
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .limit(100);

        if (studentsError) {
          console.error("Students search error:", studentsError);
        } else if (studentsData && studentsData.length > 0) {
          const filteredStudents = studentsData.filter(student => {
            const searchFields = [
              student.full_name?.toLowerCase() || '',
              student.father_name?.toLowerCase() || '',
              student.mother_name?.toLowerCase() || '',
              student.guardian_name?.toLowerCase() || '',
              student.contact_number || '',
              student.whatsapp_number || '',
              student.email?.toLowerCase() || '',
              student.address?.toLowerCase() || '',
              student.roll_number?.toString() || '',
              student.class?.toString() || '',
              student.aadhaar_number?.toString() || '',
              student.status?.toLowerCase() || '',
              student.fee_status?.toLowerCase() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          // Sort by relevance - exact name matches first, then partial matches
          filteredStudents.sort((a, b) => {
            const aName = a.full_name?.toLowerCase() || '';
            const bName = b.full_name?.toLowerCase() || '';
            const aExactMatch = aName === searchTerm ? 2 : (aName.startsWith(searchTerm) ? 1 : 0);
            const bExactMatch = bName === searchTerm ? 2 : (bName.startsWith(searchTerm) ? 1 : 0);
            return bExactMatch - aExactMatch;
          });

          filteredStudents.slice(0, 10).forEach(student => {
            formattedResults.push({
              id: student.id,
              title: student.full_name,
              subtitle: `Class ${student.class} • Roll: ${student.roll_number || 'N/A'} • ${student.fee_status || 'No Fee Status'}`,
              description: `📞 ${student.contact_number} • Father: ${student.father_name} • Mother: ${student.mother_name || 'N/A'}`,
              type: 'student',
              icon: <User className="h-5 w-5 text-blue-500" />,
              data: student,
              category: 'Students'
            });
          });
        }
      } catch (error) {
        console.error("Students search error:", error);
      }

      // 2. COMPREHENSIVE FEE TRANSACTIONS SEARCH
      try {
        const { data: feeData, error: feeError } = await supabase
          .from('fee_transactions')
          .select('*, students(full_name, class, roll_number)')
          .limit(50);

        if (feeError) {
          console.error("Fee transactions search error:", feeError);
        } else if (feeData && feeData.length > 0) {
          const filteredFees = feeData.filter(fee => {
            const searchFields = [
              fee.purpose?.toLowerCase() || '',
              fee.payment_mode?.toLowerCase() || '',
              fee.receipt_number?.toLowerCase() || '',
              fee.students?.full_name?.toLowerCase() || '',
              fee.amount?.toString() || '',
              fee.academic_year || '',
              fee.term?.toLowerCase() || '',
              fee.notes?.toLowerCase() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          filteredFees.slice(0, 6).forEach(fee => {
            formattedResults.push({
              id: fee.id,
              title: `₹${fee.amount} Payment - ${fee.students?.full_name || 'Unknown Student'}`,
              subtitle: `${fee.payment_mode} • ${fee.purpose} • Receipt: ${fee.receipt_number}`,
              description: `Class ${fee.students?.class || 'N/A'} • ${new Date(fee.payment_date).toLocaleDateString()} • ${fee.academic_year}`,
              type: 'fee',
              icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
              data: fee,
              category: 'Fee Transactions'
            });
          });
        }
      } catch (error) {
        console.error("Fee transactions search error:", error);
      }

      // 3. COMPREHENSIVE TESTS SEARCH
      try {
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .limit(50);

        if (testsError) {
          console.error("Tests search error:", testsError);
        } else if (testsData && testsData.length > 0) {
          const filteredTests = testsData.filter(test => {
            const searchFields = [
              test.test_name?.toLowerCase() || '',
              test.subject?.toLowerCase() || '',
              test.test_type?.toLowerCase() || '',
              test.class?.toString() || '',
              test.syllabus_covered?.toLowerCase() || '',
              test.instructions?.toLowerCase() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          filteredTests.slice(0, 8).forEach(test => {
            formattedResults.push({
              id: test.id,
              title: test.test_name,
              subtitle: `${test.subject} • Class ${test.class} • ${test.test_type || 'Test'}`,
              description: `📅 ${new Date(test.test_date).toLocaleDateString()} • Total Marks: ${test.total_marks} • Duration: ${test.duration_minutes || 'N/A'} min`,
              type: 'test',
              icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
              data: test,
              category: 'Tests'
            });
          });
        }
      } catch (error) {
        console.error("Tests search error:", error);
      }

      // 4. COMPREHENSIVE QUESTIONS SEARCH
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*, topics(name, chapters(name, subjects(name, class)))')
          .limit(80);

        if (questionsError) {
          console.error("Questions search error:", questionsError);
        } else if (questionsData && questionsData.length > 0) {
          const filteredQuestions = questionsData.filter(question => {
            const searchFields = [
              question.question?.toLowerCase() || '',
              question.answer?.toLowerCase() || '',
              question.explanation?.toLowerCase() || '',
              question.type?.toLowerCase() || '',
              question.difficulty?.toLowerCase() || '',
              question.source?.toLowerCase() || '',
              question.topics?.name?.toLowerCase() || '',
              question.topics?.chapters?.name?.toLowerCase() || '',
              question.topics?.chapters?.subjects?.name?.toLowerCase() || '',
              question.topics?.chapters?.subjects?.class?.toString() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          filteredQuestions.slice(0, 6).forEach(question => {
            const subjectName = question.topics?.chapters?.subjects?.name || 'Unknown Subject';
            const chapterName = question.topics?.chapters?.name || 'Unknown Chapter';
            const topicName = question.topics?.name || 'Unknown Topic';
            const classNum = question.topics?.chapters?.subjects?.class;
            
            formattedResults.push({
              id: question.id,
              title: question.question.length > 80 ? 
                `${question.question.substring(0, 80)}...` : 
                question.question,
              subtitle: `${subjectName}${classNum ? ` (Class ${classNum})` : ''} • ${question.type} • ${question.difficulty}`,
              description: `Chapter: ${chapterName} • Topic: ${topicName} • Answer: ${question.answer?.substring(0, 50)}${question.answer?.length > 50 ? '...' : ''}`,
              type: 'question',
              icon: <BookOpen className="h-5 w-5 text-indigo-500" />,
              data: question,
              category: 'Questions'
            });
          });
        }
      } catch (error) {
        console.error("Questions search error:", error);
      }

      // 5. COMPREHENSIVE ATTENDANCE SEARCH
      try {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*, students(full_name, class, roll_number)')
          .limit(50);

        if (attendanceError) {
          console.error("Attendance search error:", attendanceError);
        } else if (attendanceData && attendanceData.length > 0) {
          const filteredAttendance = attendanceData.filter(record => {
            const searchFields = [
              record.students?.full_name?.toLowerCase() || '',
              record.status?.toLowerCase() || '',
              record.date || '',
              record.students?.class?.toString() || '',
              record.students?.roll_number?.toString() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          // Group by student and get recent records
          const studentAttendanceMap = new Map();
          filteredAttendance.forEach(record => {
            const studentId = record.student_id;
            if (!studentAttendanceMap.has(studentId)) {
              studentAttendanceMap.set(studentId, []);
            }
            studentAttendanceMap.get(studentId).push(record);
          });

          // Add summarized attendance records
          Array.from(studentAttendanceMap.entries()).slice(0, 4).forEach(([studentId, records]) => {
            const latestRecord = records[0];
            const presentCount = records.filter((r: any) => r.status === 'Present').length;
            const totalRecords = records.length;
            
            formattedResults.push({
              id: latestRecord.id,
              title: `${latestRecord.students?.full_name || 'Unknown Student'} - Attendance`,
              subtitle: `Class ${latestRecord.students?.class || 'N/A'} • ${presentCount}/${totalRecords} Present`,
              description: `Latest: ${latestRecord.status} on ${new Date(latestRecord.date).toLocaleDateString()} • Roll: ${latestRecord.students?.roll_number || 'N/A'}`,
              type: 'attendance',
              icon: <ClipboardCheck className="h-5 w-5 text-green-500" />,
              data: { studentId, records, student: latestRecord.students },
              category: 'Attendance'
            });
          });
        }
      } catch (error) {
        console.error("Attendance search error:", error);
      }

      // 6. TEST RESULTS SEARCH
      try {
        const { data: testResultsData, error: testResultsError } = await supabase
          .from('test_results')
          .select('*, students(full_name, class, roll_number), tests(test_name, subject)')
          .limit(50);

        if (testResultsError) {
          console.error("Test results search error:", testResultsError);
        } else if (testResultsData && testResultsData.length > 0) {
          const filteredResults = testResultsData.filter(result => {
            const searchFields = [
              result.students?.full_name?.toLowerCase() || '',
              result.tests?.test_name?.toLowerCase() || '',
              result.tests?.subject?.toLowerCase() || '',
              result.grade?.toLowerCase() || '',
              result.marks_obtained?.toString() || '',
              result.percentage?.toString() || '',
              result.rank?.toString() || ''
            ];
            
            return searchFields.some(field => field.includes(searchTerm));
          });

          filteredResults.slice(0, 5).forEach(result => {
            formattedResults.push({
              id: result.id,
              title: `${result.students?.full_name || 'Unknown'} - ${result.tests?.test_name || 'Test'}`,
              subtitle: `${result.tests?.subject || 'Subject'} • ${result.marks_obtained}/${result.total_marks} • Grade: ${result.grade || 'N/A'}`,
              description: `Class ${result.students?.class || 'N/A'} • Percentage: ${result.percentage || 'N/A'}% • Rank: ${result.rank || 'N/A'}`,
              type: 'test-result',
              icon: <BarChart3 className="h-5 w-5 text-indigo-500" />,
              data: result,
              category: 'Test Results'
            });
          });
        }
      } catch (error) {
        console.error("Test results search error:", error);
      }

      // Cache the results
      searchCache.set(searchTerm, formattedResults);
      setSearchCache(new Map(searchCache));

      console.log(`Search completed. Found ${formattedResults.length} results across all categories`);
      setSearchResults(formattedResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Use debounced search
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
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

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Handle selection of a search result
  const handleSearchResultSelect = (result: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    
    switch (result.type) {
      case 'student':
        navigate(`/students/${result.id}`);
        break;
      case 'test':
        navigate(`/tests`);
        toast.success(`Opening test: ${result.title}`);
        break;
      case 'test-result':
        navigate(`/tests`);
        toast.success(`Opening test results for: ${result.title}`);
        break;
      case 'fee':
        navigate(`/fees`);
        toast.success(`Opening fee transaction: ${result.title}`);
        break;
      case 'attendance':
        if (result.data.student) {
          navigate(`/attendance`);
          toast.success(`Opening attendance for: ${result.data.student.full_name}`);
        }
        break;
      case 'question':
        navigate(`/questions`);
        toast.success(`Opening questions section`);
        break;
      default:
        toast.info(`Found: ${result.title}`);
    }
  };

  // Group results by category for display with memoization
  const groupedResults = useMemo(() => {
    if (!Array.isArray(searchResults)) return {};
    
    return searchResults.reduce((acc, result, index) => {
      const category = result.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...result,
        globalIndex: index
      });
      return acc;
    }, {} as Record<string, any[]>);
  }, [searchResults]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl py-0 px-0">
          <div className="flex items-center justify-between py-0">
            <div>
              <h1 className="font-bold text-inherit text-3xl">More</h1>
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
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
          className="mb-8 mx-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>

          {/* Spotlight Search Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
            className="mb-6"
          >
            <StarBorder as="button" className="w-full" color="#ffffff" speed="7s" onClick={() => setIsSearchOpen(true)}>
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
                  duration: 0.5, 
                  delay: (index + 1) * 0.1, 
                  ease: [0.16, 1, 0.3, 1] 
                }} 
                whileHover={{ 
                  scale: 1.05, 
                  y: -2, 
                  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
                }} 
                whileTap={{ 
                  scale: 0.95, 
                  transition: { duration: 0.1 } 
                }} 
                className="flex-1"
              >
                <button onClick={action.action} className="w-full h-16 group focus:outline-none" title={action.title}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl h-full shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-lg group-active:scale-95 transition-all duration-300 ease-out overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-full flex items-center justify-center">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110", action.color)}>
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
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}>
                <Link to={item.path} className="block group">
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md group-active:scale-[0.98] transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Icon */}
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0", item.color)}>
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
            {[{
            title: "Help & Support",
            subtitle: "Get assistance",
            icon: <HelpCircle className="h-4 w-4" />,
            path: "/settings/help-support"
          }, {
            title: "Privacy Policy",
            subtitle: "Data protection",
            icon: <FileText className="h-4 w-4" />,
            path: "/settings/privacy-security"
          }, {
            title: "Terms of Service",
            subtitle: "Usage guidelines",
            icon: <FileText className="h-4 w-4" />,
            path: "/settings/privacy-security"
          }, {
            title: "About",
            subtitle: "App information",
            icon: <HelpCircle className="h-4 w-4" />,
            path: "/settings/about"
          }].map((option, index) => (
            <motion.div key={option.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: "easeOut" }}>
              <Link to={option.path} className="block group">
                <div className={cn("px-4 py-3 flex items-center space-x-3 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 group-active:bg-gray-100 dark:group-active:bg-gray-700 transition-colors", index !== 3 && "border-b border-gray-200 dark:border-gray-700")}>
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

      {/* Enhanced Spotlight-style Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} 
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-50" 
              onClick={() => setIsSearchOpen(false)} 
            />

            {/* Centered Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              transition={{ 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1] 
              }} 
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="w-full max-w-2xl">
                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  {/* Enhanced Search Bar */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
                    className="px-6 py-5"
                  >
                    <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-inner border border-gray-200/50 dark:border-gray-700/50">
                      <Search className="h-6 w-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <motion.input 
                        ref={searchInputRef} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search students, tests, fees, questions, attendance..." 
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ml-4 text-base font-medium" 
                        initial={{ width: 0 }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                      />
                      <AnimatePresence>
                        {isSearching && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3"
                          >
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsSearchOpen(false)} 
                        className="h-8 w-8 p-0 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 ml-2 rounded-full transition-all duration-200"
                      >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </div>
                  </motion.div>

                  {/* Enhanced Results */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
                    className="max-h-[70vh] overflow-y-auto overscroll-contain px-2" 
                    ref={resultsContainerRef}
                  >
                    {isSearching ? (
                      <div className="py-16 text-center">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" 
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Searching across all data...</p>
                      </div>
                    ) : searchResults.length === 0 && searchQuery ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="py-16 text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">No results found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
                      </motion.div>
                    ) : searchQuery && searchResults.length > 0 ? (
                      <div className="space-y-1 pb-4">
                        {(Object.entries(groupedResults) as [string, any[]][]).map(([category, results]) => (
                          <motion.div 
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <div className="px-4 py-3">
                              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {category}
                              </h3>
                            </div>
                            <div className="space-y-1">
                              {results.map((result, index) => (
                                <motion.div 
                                  key={result.id} 
                                  initial={{ opacity: 0, x: -10 }} 
                                  animate={{ opacity: 1, x: 0 }} 
                                  transition={{ 
                                    duration: 0.3, 
                                    delay: index * 0.05,
                                    ease: [0.16, 1, 0.3, 1] 
                                  }} 
                                  className={cn(
                                    "flex items-center p-4 mx-2 rounded-xl transition-all duration-200 cursor-pointer group",
                                    selectedIndex === result.globalIndex 
                                      ? "bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800" 
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  )} 
                                  onClick={() => handleSearchResultSelect(result)} 
                                  onMouseEnter={() => setSelectedIndex(result.globalIndex)}
                                  whileHover={{ scale: 1.01, x: 2 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <motion.div 
                                    className={cn(
                                      "p-3 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                      selectedIndex === result.globalIndex 
                                        ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                                    )}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {result.icon}
                                  </motion.div>
                                  <div className="ml-4 flex-1 min-w-0">
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
                                  <motion.div
                                    className={cn(
                                      "flex-shrink-0 transition-all duration-200",
                                      selectedIndex === result.globalIndex 
                                        ? "text-blue-500 translate-x-1" 
                                        : "text-gray-300 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                                    )}
                                    whileHover={{
                                      x: 4,
                                      transition: { duration: 0.2 }
                                    }}
                                  >
                                    <ChevronRight className="h-5 w-5" />
                                  </motion.div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : !searchQuery ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="py-16 text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Command className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">Search across everything</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Students, tests, fees, questions, attendance & more</p>
                      </motion.div>
                    ) : null}
                  </motion.div>

                  {/* Enhanced Footer */}
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
                      className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-4"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found across all data</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">↑↓</kbd>
                            <span>Navigate</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">↵</kbd>
                            <span>Select</span>
                          </div>
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
