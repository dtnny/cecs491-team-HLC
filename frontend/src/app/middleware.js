import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function middleware(req) {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
