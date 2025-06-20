
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

// Modern professional color palette
const COLORS = {
  primary: [13, 33, 84] as [number, number, number],
  primaryLight: [37, 99, 235] as [number, number, number],
  secondary: [59, 130, 246] as [number, number, number],
  accent: [34, 197, 94] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [71, 85, 105] as [number, number, number],
  textMuted: [148, 163, 184] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number]
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

// Professional header with prominent branding
const addProfessionalHeader = (doc: jsPDF, options: QuestionsPDFOptions) => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Background accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  yPosition += 25;

  // Institute name - highly prominent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text(INSTITUTE_DETAILS.name, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  
  // Tagline
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Excellence in Education Since 2022', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 6;
  
  // Contact info - minimal and clean
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${INSTITUTE_DETAILS.phone} • ${INSTITUTE_DETAILS.email}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Thin separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(25, yPosition, pageWidth - 25, yPosition);
  
  yPosition += 20;
  
  // Document title - prominent but clean
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Question Bank', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Subject and class information
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(25, yPosition, pageWidth - 50, 35, 6, 6, 'F');
  
  yPosition += 12;
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${options.subjectName} - ${options.className}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${options.chapterName} > ${options.topicName}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')} • Questions: ${options.questions.length}`, pageWidth / 2, yPosition, { align: 'center' });
  
  return yPosition + 25;
};

// Professional footer
const addProfessionalFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Footer separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(25, pageHeight - 25, pageWidth - 25, pageHeight - 25);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  
  // Institute name on left
  doc.text(INSTITUTE_DETAILS.name, 25, pageHeight - 12);
  
  // Page number on right
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 25, pageHeight - 12, { align: 'right' });
};

export const exportQuestionsToPDF = (options: QuestionsPDFOptions) => {
  const { questions, topicName } = options;
  const doc = new jsPDF();
  
  let yPosition = addProfessionalHeader(doc, options);
  
  // Process each question
  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Question container with subtle background
    const questionHeight = 25 + (question.options?.length || 0) * 8 + (question.explanation ? 20 : 0);
    doc.setFillColor(250, 251, 255);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPosition - 5, 170, Math.min(questionHeight, 50), 4, 4, 'FD');
    
    // Question number and metadata
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Question ${index + 1}`, 25, yPosition + 5);
    
    // Difficulty and type badges
    const badgeY = yPosition + 5;
    const difficultyColor = question.difficulty === 'Easy' ? COLORS.success : 
                           question.difficulty === 'Medium' ? COLORS.warning : COLORS.danger;
    
    doc.setFillColor(...difficultyColor);
    doc.roundedRect(120, badgeY - 8, 25, 12, 3, 3, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(question.difficulty, 132.5, badgeY - 2, { align: 'center' });
    
    doc.setFillColor(...COLORS.secondary);
    doc.roundedRect(148, badgeY - 8, 20, 12, 3, 3, 'F');
    doc.setTextColor(...COLORS.white);
    doc.text(`${question.marks}m`, 158, badgeY - 2, { align: 'center' });
    
    yPosition += 18;
    
    // Question text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    
    const processedQuestion = processLaTeXForPDF(question.question);
    const questionLines = doc.splitTextToSize(processedQuestion, 160);
    questionLines.forEach((line: string) => {
      if (yPosition > 265) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
    
    // Options for MCQ
    if (question.options && question.options.length > 0) {
      yPosition += 5;
      question.options.forEach((option, optIndex) => {
        if (yPosition > 265) {
          doc.addPage();
          yPosition = 30;
        }
        const optionLabel = String.fromCharCode(65 + optIndex);
        const processedOption = processLaTeXForPDF(option);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text(`${optionLabel}. ${processedOption}`, 30, yPosition);
        yPosition += 7;
      });
    }
    
    yPosition += 8;
    
    // Answer section with professional styling
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFillColor(...COLORS.success);
    doc.roundedRect(25, yPosition - 3, 15, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text('ANS', 32.5, yPosition + 2, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.success);
    const processedAnswer = processLaTeXForPDF(question.answer);
    doc.text(processedAnswer, 45, yPosition + 2);
    
    yPosition += 15;
    
    // Explanation section
    if (question.explanation && question.explanation.trim()) {
      if (yPosition > 245) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFillColor(...COLORS.primaryLight);
      doc.roundedRect(25, yPosition - 3, 20, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.white);
      doc.text('EXPL', 35, yPosition + 2, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      const processedExplanation = processLaTeXForPDF(question.explanation);
      const explanationLines = doc.splitTextToSize(processedExplanation, 130);
      let explanationY = yPosition + 2;
      explanationLines.forEach((line: string, lineIndex: number) => {
        if (explanationY > 265) {
          doc.addPage();
          explanationY = 30;
        }
        doc.text(line, lineIndex === 0 ? 50 : 25, explanationY);
        explanationY += 5;
      });
      
      yPosition = explanationY + 5;
    }
    
    // Question separator
    if (index < questions.length - 1) {
      yPosition += 10;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(25, yPosition, 185, yPosition);
      yPosition += 15;
    }
  });
  
  // Add professional footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addProfessionalFooter(doc, i, pageCount);
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
