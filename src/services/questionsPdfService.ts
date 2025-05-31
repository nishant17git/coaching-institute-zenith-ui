
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface Question {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "Short Answer" | "Long Answer" | "Numerical";
  marks: number;
  estimatedTime: string;
  source: string;
  isFavorite?: boolean;
}

interface QuestionsPDFOptions {
  questions: Question[];
  topicName: string;
  className: string;
  subjectName: string;
  chapterName: string;
  instituteName: string;
  teacherName: string;
  logo?: string;
}

export const exportQuestionsToPDF = (options: QuestionsPDFOptions) => {
  const { questions, topicName, className, subjectName, chapterName, instituteName, teacherName, logo } = options;
  const doc = new jsPDF();
  
  // Colors for professional design
  const primaryColor = [79, 70, 229]; // Indigo
  const secondaryColor = [99, 102, 241]; // Light indigo
  const accentColor = [236, 254, 255]; // Very light cyan
  
  // Header section
  let yPosition = 20;
  
  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 15, 25, 25);
  }
  
  // Institute name and title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(instituteName, logo ? 50 : 15, 25);
  
  // Document title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Question Bank Collection', logo ? 50 : 15, 35);
  
  // Topic and class information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Topic: ${topicName}`, 15, 50);
  doc.text(`Class: ${className}`, 15, 58);
  doc.text(`Subject: ${subjectName}`, 100, 50);
  doc.text(`Chapter: ${chapterName}`, 100, 58);
  
  // Date and teacher info
  doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 15, 66);
  doc.text(`Prepared by: ${teacherName}`, 100, 66);
  
  // Add decorative line
  doc.setLineWidth(0.8);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(15, 75, 195, 75);
  
  // Summary section
  yPosition = 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 15, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Total Questions: ${questions.length}`, 15, yPosition);
  
  // Count questions by type
  const questionTypes = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  yPosition += 8;
  doc.text('Question Types:', 15, yPosition);
  let xOffset = 15;
  Object.entries(questionTypes).forEach(([type, count]) => {
    yPosition += 6;
    doc.text(`• ${type}: ${count}`, 20, yPosition);
  });
  
  // Difficulty distribution
  const difficultyCount = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  yPosition += 10;
  doc.text('Difficulty Distribution:', 15, yPosition);
  Object.entries(difficultyCount).forEach(([difficulty, count]) => {
    yPosition += 6;
    doc.text(`• ${difficulty}: ${count}`, 20, yPosition);
  });
  
  // Start questions section
  yPosition += 20;
  
  // Questions header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Questions', 15, yPosition);
  
  yPosition += 15;
  
  // Process each question
  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Question number and difficulty badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Q${index + 1}.`, 15, yPosition);
    
    // Difficulty and type badges
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Difficulty badge
    const difficultyColors = {
      'Easy': [34, 197, 94],
      'Medium': [251, 191, 36],
      'Hard': [239, 68, 68]
    };
    const diffColor = difficultyColors[question.difficulty] || [100, 100, 100];
    
    doc.setFillColor(diffColor[0], diffColor[1], diffColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(35, yPosition - 8, 20, 8, 2, 2, 'F');
    doc.text(question.difficulty, 37, yPosition - 3);
    
    // Type badge
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.roundedRect(58, yPosition - 8, 25, 8, 2, 2, 'F');
    doc.text(question.type, 60, yPosition - 3);
    
    // Marks badge
    doc.setFillColor(100, 100, 100);
    doc.roundedRect(86, yPosition - 8, 18, 8, 2, 2, 'F');
    doc.text(`${question.marks}m`, 88, yPosition - 3);
    
    yPosition += 5;
    
    // Question text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Handle long questions with text wrapping
    const questionLines = doc.splitTextToSize(question.question, 170);
    questionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 25, yPosition);
      yPosition += 5;
    });
    
    // Options for MCQ
    if (question.options && question.options.length > 0) {
      yPosition += 3;
      question.options.forEach((option, optIndex) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const optionLabel = String.fromCharCode(65 + optIndex);
        doc.text(`${optionLabel}. ${option}`, 30, yPosition);
        yPosition += 5;
      });
    }
    
    yPosition += 8;
    
    // Answer section
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74); // Green color
    doc.text('Answer:', 25, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const answerLines = doc.splitTextToSize(question.answer, 150);
    let answerX = 45;
    answerLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) {
        yPosition += 4;
        answerX = 25;
      }
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        answerX = 25;
      }
      doc.text(line, answerX, yPosition);
    });
    
    yPosition += 8;
    
    // Explanation section
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('Explanation:', 25, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const explanationLines = doc.splitTextToSize(question.explanation, 150);
    let explanationX = 55;
    explanationLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) {
        yPosition += 4;
        explanationX = 25;
      }
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        explanationX = 25;
      }
      doc.text(line, explanationX, yPosition);
    });
    
    // Additional info
    yPosition += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Time: ${question.estimatedTime} | Source: ${question.source}`, 25, yPosition);
    
    // Separator line
    yPosition += 5;
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, 195, yPosition);
    
    yPosition += 10;
  });
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(15, 285, 195, 285);
    
    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${instituteName} | Generated on ${format(new Date(), 'dd/MM/yyyy')}`, 15, 290);
    doc.text(`Page ${i} of ${pageCount}`, 180, 290);
  }
  
  // Save the PDF
  const fileName = `questions-${topicName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
};
