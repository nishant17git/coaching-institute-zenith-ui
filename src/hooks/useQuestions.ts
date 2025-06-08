
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  name: string;
  description: string;
  class: number;
  icon: string;
  color: string;
  questions?: number;
  chapters?: number;
  recentActivity?: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimated_time: string;
  progress: number;
  topics?: number;
  questions?: number;
}

export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Conceptual" | "Application" | "Problem Solving" | "Computational" | "Proof-based";
  last_used: string;
  questions?: number;
}

export interface Question {
  id: string;
  topic_id: string;
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "Short Answer" | "Long Answer" | "Numerical";
  marks: number;
  estimated_time: string;
  source: string;
  is_favorite: boolean;
}

export function useSubjects(classId: string) {
  return useQuery({
    queryKey: ["subjects", classId],
    queryFn: async () => {
      const { data: subjects, error } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          description,
          class,
          icon,
          color,
          chapters (
            id,
            topics (
              id,
              questions (count)
            )
          )
        `)
        .eq("class", parseInt(classId));

      if (error) throw error;

      return subjects.map((subject) => ({
        ...subject,
        chapters: subject.chapters?.length || 0,
        questions: subject.chapters?.reduce(
          (total, chapter) => 
            total + (chapter.topics?.reduce(
              (topicTotal, topic) => topicTotal + (topic.questions?.length || 0), 0
            ) || 0), 0
        ) || 0,
        recentActivity: "Updated recently"
      }));
    },
  });
}

export function useChapters(subjectId: string) {
  return useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: async () => {
      const { data: chapters, error } = await supabase
        .from("chapters")
        .select(`
          id,
          subject_id,
          name,
          description,
          difficulty,
          estimated_time,
          progress,
          topics (
            id,
            questions (count)
          )
        `)
        .eq("subject_id", subjectId);

      if (error) throw error;

      return chapters.map((chapter) => ({
        ...chapter,
        difficulty: (chapter.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
        topics: chapter.topics?.length || 0,
        questions: chapter.topics?.reduce(
          (total, topic) => total + (topic.questions?.length || 0), 0
        ) || 0
      }));
    },
  });
}

export function useTopics(chapterId: string) {
  return useQuery({
    queryKey: ["topics", chapterId],
    queryFn: async () => {
      const { data: topics, error } = await supabase
        .from("topics")
        .select(`
          id,
          chapter_id,
          name,
          description,
          difficulty,
          type,
          last_used,
          questions (count)
        `)
        .eq("chapter_id", chapterId);

      if (error) throw error;

      return topics.map((topic) => ({
        ...topic,
        difficulty: (topic.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
        type: (topic.type || "Conceptual") as "Conceptual" | "Application" | "Problem Solving" | "Computational" | "Proof-based",
        questions: topic.questions?.length || 0,
        last_used: new Date(topic.last_used).toLocaleDateString()
      }));
    },
  });
}

export function useQuestions(topicId: string) {
  return useQuery({
    queryKey: ["questions", topicId],
    queryFn: async () => {
      const { data: questions, error } = await supabase
        .from("questions")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      return questions.map((question) => ({
        ...question,
        difficulty: (question.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
        type: (question.type || "MCQ") as "MCQ" | "Short Answer" | "Long Answer" | "Numerical",
        estimated_time: question.estimated_time || "5 min",
        source: question.source || "Unknown",
        is_favorite: question.is_favorite || false
      }));
    },
  });
}

export function useUpdateQuestionFavorite() {
  return async (questionId: string, isFavorite: boolean) => {
    const { error } = await supabase
      .from("questions")
      .update({ is_favorite: isFavorite })
      .eq("id", questionId);

    if (error) throw error;
  };
}
