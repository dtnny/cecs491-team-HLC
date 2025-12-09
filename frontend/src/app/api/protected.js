import { supabaseServer as supabase } from "@/lib/supabase-server";

export default async function handler(req, res) {
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.status(200).json({ message: "Authorized" });
}
