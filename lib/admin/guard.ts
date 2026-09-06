import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?proximo=/admin");

  const { data: staff } = await supabase
    .from("users")
    .select("id, name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!staff || !staff.is_active) redirect("/");

  return { supabase, staff };
}

export async function requireAdmin() {
  const { supabase, staff } = await requireStaff();
  if (staff.role !== "admin") redirect("/admin");
  return { supabase, staff };
}
