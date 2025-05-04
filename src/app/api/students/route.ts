import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const studentDataSchema = z.object({
  name: z.string(),
  class_id: z.number(),
  rollNumber: z.number().optional(),
  fatherName: z.string(),
  motherName: z.string().optional(),
  phoneNumber: z.string(),
  whatsappNumber: z.string().optional(),
  address: z.string(),
  totalFees: z.number(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = studentDataSchema.parse(data);
    
    const { data: student, error } = await supabase
      .from('students')
      .insert([validatedData])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create student';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) throw new Error('Student ID is required');
    
    const validatedData = studentDataSchema.partial().parse(updateData);

    const { data: student, error } = await supabase
      .from('students')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update student';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
