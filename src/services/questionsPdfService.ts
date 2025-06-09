
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

// Modern color palette
const COLORS = {
  primary: [79, 70, 229], // Indigo
  secondary: [99, 102, 241], // Light indigo
  accent: [34, 197, 94], // Green
  warning: [251, 191, 36], // Amber
  danger: [239, 68, 68], // Red
  success: [34, 197, 94], // Green
  text: [31, 41, 55], // Gray-800
  muted: [107, 114, 128], // Gray-500
  light: [249, 250, 251], // Gray-50
  white: [255, 255, 255]
};

// Add modern header for questions PDF
const addQuestionsHeader = (doc: jsPDF, options: QuestionsPDFOptions) => {
  // Header background with gradient effect
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 55, 'F');
  
  // Logo placeholder
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.roundedRect(15, 10, 30, 30, 5, 5, 'F');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(12);
  doc.text('LOGO', 30, 28, { align: 'center' });
  
  // Institute name (using regular font since custom fonts are complex in jsPDF)
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(INSTITUTE_DETAILS.name, 55, 20);
  
  // Contact details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(INSTITUTE_DETAILS.address, 55, 28);
  doc.text(`${INSTITUTE_DETAILS.phone} | ${INSTITUTE_DETAILS.email}`, 55, 35);
  
  // Document title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QUESTION BANK COLLECTION', 55, 45);
  
  // Subject and topic information cards
  let yPos = 70;
  
  // Subject card
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.roundedRect(15, yPos, 85, 25, 5, 5, 'F');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(options.subjectName, 57.5, yPos + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Class ${options.className}`, 57.5, yPos + 18, { align: 'center' });
  
  // Topic card
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.roundedRect(110, yPos, 85, 25, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(options.topicName, 152.5, yPos + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(options.chapterName, 152.5, yPos + 18, { align: 'center' });
  
  // Metadata
  yPos += 35;
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Prepared by: ${options.teacherName}`, 15, yPos);
  doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 15, yPos + 8);
  doc.text(`Total Questions: ${options.questions.length}`, 120, yPos);
  
  return yPos + 20;
};

export const exportQuestionsToPDF = (options: QuestionsPDFOptions) => {
  const { questions, topicName, className, subjectName, chapterName, teacherName } = options;
  const doc = new jsPDF();
  
  let yPosition = addQuestionsHeader(doc, options);
  
  // Summary section with modern cards
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text('Question Summary', 15, yPosition);
  
  yPosition += 10;
  
  // Question types distribution
  const questionTypes = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Difficulty distribution
  const difficultyCount = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Create summary cards
  let cardX = 15;
  let cardY = yPosition;
  const cardWidth = 55;
  const cardHeight = 20;
  
  // Question types cards
  Object.entries(questionTypes).forEach(([type, count], index) => {
    if (index > 0 && index % 3 === 0) {
      cardY += cardHeight + 5;
      cardX = 15;
    }
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(type, cardX + 5, cardY + 8);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFontSize(12);
    doc.text(`${count}`, cardX + 5, cardY + 15);
    
    cardX += cardWidth + 5;
  });
  
  yPosition = cardY + cardHeight + 15;
  
  // Difficulty distribution
  cardX = 15;
  cardY = yPosition;
  
  Object.entries(difficultyCount).forEach(([difficulty, count], index) => {
    const difficultyColors = {
      'Easy': COLORS.success,
      'Medium': COLORS.warning,
      'Hard': COLORS.danger
    };
    const color = difficultyColors[difficulty as keyof typeof difficultyColors] || COLORS.muted;
    
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, 'F');
    
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(difficulty, cardX + 5, cardY + 8);
    doc.setFontSize(12);
    doc.text(`${count}`, cardX + 5, cardY + 15);
    
    cardX += cardWidth + 5;
  });
  
  yPosition = cardY + cardHeight + 25;
  
  // Questions section header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('Questions', 15, yPosition);
  
  yPosition += 15;
  
  // Process each question
  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Question header with modern styling
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(15, yPosition - 5, 180, 25, 5, 5, 'F');
    
    // Question number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(`Q${index + 1}.`, 20, yPosition + 5);
    
    // Badges for difficulty, type, and marks
    const badges = [
      { text: question.difficulty, color: question.difficulty === 'Easy' ? COLORS.success : question.difficulty === 'Medium' ? COLORS.warning : COLORS.danger },
      { text: question.type, color: COLORS.secondary },
      { text: `${question.marks}m`, color: COLORS.primary }
    ];
    
    let badgeX = 40;
    badges.forEach(badge => {
      doc.setFillColor(badge.color[0], badge.color[1], badge.color[2]);
      doc.roundedRect(badgeX, yPosition - 2, 25, 10, 2, 2, 'F');
      doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(badge.text, badgeX + 12.5, yPosition + 3, { align: 'center' });
      badgeX += 30;
    });
    
    // Time estimate
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Time: ${question.estimatedTime}`, 160, yPosition + 3);
    
    yPosition += 20;
    
    // Question text with better formatting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    
    const questionLines = doc.splitTextToSize(question.question, 170);
    questionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    
    // Options for MCQ with improved styling
    if (question.options && question.options.length > 0) {
      yPosition += 3;
      question.options.forEach((option, optIndex) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const optionLabel = String.fromCharCode(65 + optIndex);
        
        // Option background
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(25, yPosition - 3, 165, 8, 2, 2, 'F');
        
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${optionLabel}.`, 28, yPosition + 1);
        doc.setFont('helvetica', 'normal');
        doc.text(option, 35, yPosition + 1);
        yPosition += 10;
      });
    }
    
    yPosition += 8;
    
    // Answer section with modern styling
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Answer card
    doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.roundedRect(20, yPosition, 8, 8, 2, 2, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('A', 24, yPosition + 5, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text('Answer:', 32, yPosition + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const answerLines = doc.splitTextToSize(question.answer, 145);
    let answerX = 55;
    answerLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) {
        yPosition += 4;
        answerX = 20;
      }
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        answerX = 20;
      }
      doc.text(line, answerX, yPosition + 5);
    });
    
    yPosition += 10;
    
    // Explanation section with modern styling
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Explanation card
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.roundedRect(20, yPosition, 8, 8, 2, 2, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('E', 24, yPosition + 5, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text('Explanation:', 32, yPosition + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    const explanationLines = doc.splitTextToSize(question.explanation, 145);
    let explanationX = 70;
    explanationLines.forEach((line: string, lineIndex: number) => {
      if (lineIndex > 0) {
        yPosition += 4;
        explanationX = 20;
      }
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        explanationX = 20;
      }
      doc.text(line, explanationX, yPosition + 5);
    });
    
    // Source information
    yPosition += 8;
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(`Source: ${question.source}`, 20, yPosition);
    
    // Separator with modern design
    yPosition += 5;
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.rect(15, yPosition, 180, 1, 'F');
    
    yPosition += 15;
  });
  
  // Add modern footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer background
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');
    
    // Footer content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(`${INSTITUTE_DETAILS.name} | Generated on ${format(new Date(), 'dd MMM yyyy')}`, 15, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, 180, pageHeight - 12);
    
    // Subject info in footer
    doc.text(`${subjectName} - ${topicName}`, 15, pageHeight - 6);
  }
  
  // Save the PDF
  const fileName = `questions-${topicName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
};
