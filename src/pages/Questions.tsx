
import React from "react";
import { Routes, Route } from "react-router-dom";
import { QuestionsLayout } from "@/components/questions/QuestionsLayout";
import { QuestionsHome } from "@/components/questions/QuestionsHome";
import { SubjectSelection } from "@/components/questions/SubjectSelection";
import { ChapterSelection } from "@/components/questions/ChapterSelection";
import { TopicSelection } from "@/components/questions/TopicSelection";
import { QuestionBank } from "@/components/questions/QuestionBank";

export default function Questions() {
  return (
    <Routes>
      <Route path="/" element={<QuestionsLayout />}>
        <Route index element={<QuestionsHome />} />
        <Route path="class/:classId" element={<SubjectSelection />} />
        <Route path="subject/:subjectId" element={<ChapterSelection />} />
        <Route path="chapter/:chapterId" element={<TopicSelection />} />
        <Route path="topic/:topicId" element={<QuestionBank />} />
      </Route>
    </Routes>
  );
}
