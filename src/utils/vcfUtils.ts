
export const generateVCF = (student: any) => {
  // Handle multiple phone numbers separated by comma
  const phoneNumbers = student.phoneNumber ? student.phoneNumber.split(',').map((num: string) => num.trim()) : [];
  const whatsappNumbers = student.whatsappNumber ? student.whatsappNumber.split(',').map((num: string) => num.trim()) : [];
  
  // Generate phone number entries for VCF
  let phoneEntries = '';
  phoneNumbers.forEach((phone: string, index: number) => {
    if (phone) {
      phoneEntries += `TEL;TYPE=CELL:${phone}\n`;
    }
  });
  
  // Add WhatsApp numbers if different from regular phone numbers
  whatsappNumbers.forEach((phone: string, index: number) => {
    if (phone && !phoneNumbers.includes(phone)) {
      phoneEntries += `TEL;TYPE=WHATSAPP:${phone}\n`;
    }
  });

  const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${student.name || student.full_name}
N:${student.name || student.full_name};;;;
${phoneEntries}ADR;TYPE=HOME:;;${student.address || ''};;;;
NOTE:Class: ${student.class}\\nFather: ${student.fatherName || student.father_name}\\nMother: ${student.motherName || student.mother_name || ''}
END:VCARD`;

  return vcfContent;
};

export const downloadVCF = (student: any) => {
  const vcfContent = generateVCF(student);
  const blob = new Blob([vcfContent], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(student.name || student.full_name).replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
