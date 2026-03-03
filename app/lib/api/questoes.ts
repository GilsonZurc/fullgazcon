import { supabase } from "@/lib/supabase/client";

export async function getQuestoes(
  concurso: string,
  materia?: string,
  limit = 10
) {
  let query = supabase
    .from("questoes")
    .select("*")
    .order("id", { ascending: true })
    .limit(limit);

  if (concurso && concurso !== "Todos") {
    query = query.or(`concurso.eq.${concurso},concurso.is.null`);
  }
  if (materia) {
    query = query.eq("materia", materia);
  }

  const { data, error } = await query;
  if (error) console.error(error);
  return data || [];
}
