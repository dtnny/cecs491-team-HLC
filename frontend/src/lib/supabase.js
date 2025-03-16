import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hnjxnvgjqqqwqwxkcnyt.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuanhudmdqcXFxd3F3eGtjbnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNjI5MzUsImV4cCI6MjA1NzczODkzNX0.ldNvQ4XtX20ZDTOo7TCpIXBr1qewEiy6KFyj6VDwEps";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);