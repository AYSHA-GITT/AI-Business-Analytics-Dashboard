import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qqxkhwymhodyguivmiug.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGtod3ltaG9keWd1aXZtaXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDUyMDAsImV4cCI6MjA5ODU4MTIwMH0.9ZZvrhECgKsIsr-IS2_RhqNe5jwM6EWCHkJHptcnUq4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);