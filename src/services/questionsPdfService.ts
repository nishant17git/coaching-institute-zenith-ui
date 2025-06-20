
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

// Institute details
const INSTITUTE_DETAILS = {
  name: "INFINITY CLASSES",
  address: "Kandri, Mandar, Ranchi",
  phone: "+91 9905880697",
  email: "theinfinityclasses1208@gmail.com"
};

// Modern minimal color palette
const COLORS = {
  primary: [37, 99, 235], // Blue-600
  secondary: [99, 102, 241], // Indigo-500
  accent: [34, 197, 94], // Green-500
  warning: [251, 191, 36], // Amber-400
  danger: [248, 113, 113], // Red-400
  text: [31, 41, 55], // Gray-800
  muted: [107, 114, 128], // Gray-500
  light: [248, 250, 252], // Slate-50
  white: [255, 255, 255],
  border: [226, 232, 240] // Slate-200
};

// Enhanced LaTeX processing for PDF
const processLaTeXForPDF = (text: string): string => {
  let processed = text;
  
  // Handle inline math expressions
  processed = processed.replace(/\$([^$]+)\$/g, '$1');
  
  // Common mathematical expressions
  processed = processed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  processed = processed.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  processed = processed.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');
  processed = processed.replace(/\\cbrt\{([^}]+)\}/g, '∛($1)');
  
  // Operators and symbols
  processed = processed.replace(/\\times/g, '×');
  processed = processed.replace(/\\cdot/g, '·');
  processed = processed.replace(/\\div/g, '÷');
  processed = processed.replace(/\\pm/g, '±');
  processed = processed.replace(/\\mp/g, '∓');
  
  // Comparison operators
  processed = processed.replace(/\\le/g, '≤');
  processed = processed.replace(/\\ge/g, '≥');
  processed = processed.replace(/\\ne/g, '≠');
  processed = processed.replace(/\\approx/g, '≈');
  processed = processed.replace(/\\equiv/g, '≡');
  
  // Greek letters
  processed = processed.replace(/\\alpha/g, 'α');
  processed = processed.replace(/\\beta/g, 'β');
  processed = processed.replace(/\\gamma/g, 'γ');
  processed = processed.replace(/\\delta/g, 'δ');
  processed = processed.replace(/\\epsilon/g, 'ε');
  processed = processed.replace(/\\theta/g, 'θ');
  processed = processed.replace(/\\lambda/g, 'λ');
  processed = processed.replace(/\\mu/g, 'μ');
  processed = processed.replace(/\\pi/g, 'π');
  processed = processed.replace(/\\sigma/g, 'σ');
  processed = processed.replace(/\\phi/g, 'φ');
  processed = processed.replace(/\\omega/g, 'ω');
  
  // Special symbols
  processed = processed.replace(/\\infty/g, '∞');
  processed = processed.replace(/\\partial/g, '∂');
  processed = processed.replace(/\\nabla/g, '∇');
  processed = processed.replace(/\\int/g, '∫');
  processed = processed.replace(/\\sum/g, '∑');
  processed = processed.replace(/\\prod/g, '∏');
  
  // Superscripts and subscripts (simplified)
  processed = processed.replace(/\^(\d+)/g, '⁺$1');
  processed = processed.replace(/_(\d+)/g, '₊$1');
  
  return processed;
};

// Clean minimal header
const addMinimalHeader = (doc: jsPDF, options: QuestionsPDFOptions) => {
  // Simple header line
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 30, 190, 30);
  
  // Institute name
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(INSTITUTE_DETAILS.name, 20, 25);
  
  // Document type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text('Question Bank', 20, 40);
  
  // Subject and topic info
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${options.subjectName} - ${options.className}`, 20, 50);
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`${options.chapterName} > ${options.topicName}`, 20, 58);
  
  // Metadata on right
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 150, 25);
  doc.text(`Questions: ${options.questions.length}`, 150, 32);
  
  return 70;
};

export const exportQuestionsToPDF = (options: QuestionsPDFOptions) => {
  const { questions, topicName } = options;
  const doc = new jsPDF();
  
  let yPosition = addMinimalHeader(doc, options);
  
  // Process each question
  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Question number and metadata
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Question ${index + 1}`, 20, yPosition);
    
    // Difficulty and type badges (minimal)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(`${question.difficulty} • ${question.type} • ${question.marks} marks`, 20, yPosition + 8);
    
    yPosition += 18;
    
    // Question text with enhanced LaTeX processing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    
    const processedQuestion = processLaTeXForPDF(question.question);
    const questionLines = doc.splitTextToSize(processedQuestion, 160);
    questionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    // Options for MCQ (clean layout)
    if (question.options && question.options.length > 0) {
      yPosition += 5;
      question.options.forEach((option, optIndex) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
        const optionLabel = String.fromCharCode(65 + optIndex);
        const processedOption = processLaTeXForPDF(option);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.text(`${optionLabel}. ${processedOption}`, 25, yPosition);
        yPosition += 7;
      });
    }
    
    yPosition += 8;
    
    // Answer section (minimal design)
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.text('Answer:', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const processedAnswer = processLaTeXForPDF(question.answer);
    const answerLines = doc.splitTextToSize(processedAnswer, 140);
    let answerX = 45;
    answerLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) {
        yPosition += 5;
        answerX = 20;
      }
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
        answerX = 20;
      }
      doc.text(line, answerX, yPosition);
    });
    
    yPosition += 10;
    
    // Explanation section (if available)
    if (question.explanation && question.explanation.trim()) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text('Explanation:', 20, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      const processedExplanation = processLaTeXForPDF(question.explanation);
      const explanationLines = doc.splitTextToSize(processedExplanation, 140);
      let explanationX = 60;
      explanationLines.forEach((line: string, lineIndex: number) => {
        if (lineIndex > 0) {
          yPosition += 5;
          explanationX = 20;
        }
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
          explanationX = 20;
        }
        doc.text(line, explanationX, yPosition);
      });
      
      yPosition += 10;
    }
    
    // Minimal separator
    if (index < questions.length - 1) {
      yPosition += 5;
      doc.setDrawColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
    }
  });
  
  // Add minimal footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageHeight = doc.internal.pageSize.height;
    
    // Simple footer line
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(INSTITUTE_DETAILS.name, 20, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, 180, pageHeight - 12);
  }
  
  // Save the PDF
  const fileName = `questions-${topicName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

// Export individual question as PDF
export const exportSingleQuestionToPDF = (question: Question, options: Partial<QuestionsPDFOptions>) => {
  const singleQuestionOptions: QuestionsPDFOptions = {
    questions: [question],
    topicName: options.topicName || 'Question',
    className: options.className || '',
    subjectName: options.subjectName || '',
    chapterName: options.chapterName || '',
    instituteName: options.instituteName || INSTITUTE_DETAILS.name,
    teacherName: options.teacherName || '',
    logo: options.logo
  };
  
  exportQuestionsToPDF(singleQuestionOptions);
};
