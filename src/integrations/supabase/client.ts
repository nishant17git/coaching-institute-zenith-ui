// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aouxuucjyytvbznumamr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdXh1dWNqeXl0dmJ6bnVtYW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTg4NDMsImV4cCI6MjA2MDE3NDg0M30.vX_UYp5lcvrDZxkLUJz9Eyv_UIw_BqmnSi6iv0B9cJs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);