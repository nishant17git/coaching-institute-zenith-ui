import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
export function QuestionsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === "/questions") {
      return {
        title: "Question Bank",
        showBackButton: true,
        onBack: () => navigate("/")
      };
    }
    if (path.includes("/questions/class/")) {
      return {
        title: "Select Subject",
        showBackButton: true,
        onBack: () => navigate("/questions")
      };
    }
    if (path.includes("/questions/subject/")) {
      const classId = new URLSearchParams(location.search).get("class");
      return {
        title: "Select Chapter",
        showBackButton: true,
        onBack: () => navigate(`/questions/class/${classId}`)
      };
    }
    if (path.includes("/questions/chapter/")) {
      const classId = new URLSearchParams(location.search).get("class");
      const subjectId = new URLSearchParams(location.search).get("subject");
      return {
        title: "Select Topic",
        showBackButton: true,
        onBack: () => navigate(`/questions/subject/${subjectId}?class=${classId}`)
      };
    }
    if (path.includes("/questions/topic/")) {
      const classId = new URLSearchParams(location.search).get("class");
      const subjectId = new URLSearchParams(location.search).get("subject");
      const chapterId = new URLSearchParams(location.search).get("chapter");
      return {
        title: "Practice Questions",
        showBackButton: true,
        onBack: () => navigate(`/questions/chapter/${chapterId}?class=${classId}&subject=${subjectId}`)
      };
    }
    return {
      title: "Question Bank",
      showBackButton: true,
      onBack: () => navigate("/")
    };
  };
  const headerConfig = getHeaderConfig();
  return <div className="min-h-screen bg-background">
      <div className="px-0 my-0 md:px-0 py-0">
        <EnhancedPageHeader title={headerConfig.title} showBackButton={headerConfig.showBackButton} onBack={headerConfig.onBack} />
      </div>
      <div className="container mx-auto py-[10px] px-[8px]">
        <Outlet />
      </div>
    </div>;
}
